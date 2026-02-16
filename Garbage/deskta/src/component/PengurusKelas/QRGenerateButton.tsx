import { useState } from 'react';
import { Modal } from '../Shared/Modal';
import QRCodeDisplay from '../Shared/QRCodeDisplay';
import { dashboardService } from '../../services/dashboard';
import { usePopup } from '../Shared/Popup/PopupProvider';
import type { Schedule, QrCode } from '../../types/api';

interface QRGenerateButtonProps {
    schedules: Schedule[];
}

export default function QRGenerateButton({ schedules }: QRGenerateButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
    const [qrData, setQrData] = useState<QrCode | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { alert: popupAlert } = usePopup();

    const handleGenerateQR = async (scheduleId: number) => {
        try {
            setIsGenerating(true);
            const result: QrCode = await dashboardService.generateQRCode({
                schedule_id: scheduleId,
                type: 'student',
                expires_in_minutes: 30, // 30 minutes validity
            });

            setQrData(result);
            setIsSelectModalOpen(false);
            setIsModalOpen(true);
        } catch (error: any) {
            popupAlert(error.response?.data?.message || 'Terjadi kesalahan saat membuat QR code', {
                title: '❌ Gagal Generate QR',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const todaySchedules = schedules.filter((s) => {
        const now = new Date();
        const scheduleTime = new Date();
        const [hours, minutes] = (s.start_time || '00:00').split(':');
        scheduleTime.setHours(parseInt(hours), parseInt(minutes));

        // Show schedules within 1 hour before start time
        const oneHourBefore = new Date(scheduleTime.getTime() - 60 * 60 * 1000);
        return now >= oneHourBefore;
    });

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsSelectModalOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    zIndex: 1000,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.4)';
                }}
            >
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <path d="M12 8v8m-4-4h8" />
                </svg>
            </button>

            {/* Schedule Selection Modal */}
            <Modal
                isOpen={isSelectModalOpen}
                onClose={() => setIsSelectModalOpen(false)}
            >
                <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: '16px' }}>
                        📋 Pilih Jadwal untuk Generate QR
                    </div>
                    {todaySchedules.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#666',
                        }}>
                            <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>📅</p>
                            <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                                Tidak ada jadwal tersedia
                            </p>
                            <p style={{ fontSize: '14px' }}>
                                QR code hanya bisa dibuat 1 jam sebelum jadwal dimulai
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {todaySchedules.map((schedule: any) => (
                                <button
                                    key={schedule.id}
                                    onClick={() => handleGenerateQR(schedule.id)}
                                    disabled={isGenerating}
                                    style={{
                                        padding: '16px',
                                        background: '#FFF',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '12px',
                                        cursor: isGenerating ? 'not-allowed' : 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                        opacity: isGenerating ? 0.6 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isGenerating) {
                                            e.currentTarget.style.borderColor = '#059669';
                                            e.currentTarget.style.background = '#F0FDF4';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                        e.currentTarget.style.background = '#FFF';
                                    }}
                                >
                                    <div style={{ fontWeight: 700, color: '#0B2948', marginBottom: '4px' }}>
                                        {schedule.subject_name || schedule.mapel || 'Mata Pelajaran'}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        {schedule.teacher_name || schedule.guru || 'Guru'} • {' '}
                                        {(schedule.start_time || schedule.start || '00:00').substring(0, 5)} - {' '}
                                        {(schedule.end_time || schedule.end || '00:00').substring(0, 5)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            {/* QR Code Display Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setQrData(null);
                }}
            >
                <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: '16px' }}>
                        ✅ QR Code Berhasil Dibuat
                    </div>
                    {qrData && (
                        <QRCodeDisplay
                            value={qrData.token}
                            title="QR Code Absensi"
                            expiresAt={qrData.expires_at}
                        />
                    )}
                </div>
            </Modal>
        </>
    );
}
