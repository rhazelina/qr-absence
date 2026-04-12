import { useEffect, useState, useRef } from 'react';
import { Modal } from '../Shared/Modal';
import { attendanceService } from '../../services/attendanceService';
import { scheduleService } from '../../services/scheduleService';
import EditIcon from '../../assets/Icon/Edit.png';

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

interface Schedule {
    id: string;
    subject: string;
    startTime: string;
    endTime: string;
    guru: string;
}

const LEAVE_TYPES = [
    { value: 'izin', label: 'Izin' },
    { value: 'sakit', label: 'Sakit' },
    { value: 'dispen', label: 'Dispensasi' },
    { value: 'pulang', label: 'Pulang Awal' },
];

export function LeaveRequestModal({
    isOpen,
    onClose,
    onSuccess,
    onError,
}: LeaveRequestModalProps) {
    const [loading, setLoading] = useState(false);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [leaveType, setLeaveType] = useState('izin');
    const [reason, setReason] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchTodaySchedules();
        }
    }, [isOpen]);

    const fetchTodaySchedules = async () => {
        try {
            const response = await scheduleService.getTodaySchedules();
            // Adjusting to common data structure
            const formatted = (response.data || []).map((s: any) => ({
                id: String(s.id),
                subject: s.subject_name || s.subject?.name || 'Mapel',
                startTime: s.start_time,
                endTime: s.end_time,
                guru: s.teacher_name || s.teacher?.user?.name || '-'
            }));
            setSchedules(formatted);
        } catch (error) {
            console.error('Failed to fetch schedules:', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async () => {
        if (!selectedScheduleId) {
            onError('Silakan pilih mata pelajaran.');
            return;
        }

        if (!file) {
            onError('Unggah bukti foto terlebih dahulu.');
            return;
        }

        if (!reason.trim()) {
            onError('Alasan / keterangan wajib diisi.');
            return;
        }

        if (leaveType === 'pulang') {
            onError('Kategori pulang awal belum tersedia untuk perizinan siswa.');
            return;
        }

        setLoading(true);
        try {
            const typeMap: Record<string, string> = {
                izin: 'permit',
                sakit: 'sick',
                dispen: 'dispensation'
            };

            const today = new Date().toISOString().split('T')[0];

            await attendanceService.createAbsenceRequest({
                type: typeMap[leaveType] || 'permit',
                start_date: today,
                end_date: today,
                reason: reason.trim(),
                file: file
            });
            onSuccess('Pengajuan perizinan berhasil dikirim.');
            handleClose();
        } catch (error: any) {
            console.error('Error submitting leave:', error);
            onError(error.message || 'Gagal mengirim pengajuan.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedScheduleId('');
        setLeaveType('izin');
        setReason('');
        setFile(null);
        setPreview(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div style={{
                border: '3px solid #1e40af',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: 'white',
                maxWidth: '500px',
                width: '100%'
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: '#0f172a',
                    color: 'white',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#7C3AED',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <img src={EditIcon} alt="Icon" style={{ width: '18px', height: '18px', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Ajukan Perizinan</h2>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {/* Select Schedule */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            Pilih Mata Pelajaran *
                        </label>
                        <select
                            value={selectedScheduleId}
                            onChange={(e) => setSelectedScheduleId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #cbd5e1',
                                borderRadius: '10px',
                                fontSize: '14px',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="">Pilih Sesi/Mapel</option>
                            {schedules.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.startTime} - {s.endTime} | {s.subject} ({s.guru})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Select Type */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            Kategori Izin *
                        </label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {LEAVE_TYPES.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setLeaveType(t.value)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: '2px solid',
                                        borderColor: leaveType === t.value ? '#1e40af' : '#cbd5e1',
                                        backgroundColor: leaveType === t.value ? '#eff6ff' : 'white',
                                        color: leaveType === t.value ? '#1e40af' : '#64748b',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reason */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            Alasan / Keterangan *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="Tulis alasan lengkap..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #cbd5e1',
                                borderRadius: '10px',
                                fontSize: '14px',
                                resize: 'none'
                            }}
                        />
                    </div>

                    {/* File Upload */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            Bukti Foto (Surat/Lainnya)
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%',
                                height: preview ? '200px' : '100px',
                                border: '2px dashed #cbd5e1',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                backgroundColor: '#F9FAFB'
                            }}
                        >
                            {preview ? (
                                <img src={preview} alt="Bukti" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '24px' }}>+</div>
                                    <div style={{ fontSize: '12px' }}>Upload Foto</div>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={handleClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '10px',
                                border: '2px solid #cbd5e1',
                                backgroundColor: 'white',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: '#1e40af',
                                color: 'white',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
