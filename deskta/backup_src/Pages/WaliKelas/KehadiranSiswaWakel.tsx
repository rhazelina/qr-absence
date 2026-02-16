import { useState, useEffect, useMemo } from 'react';
import WalikelasLayout from '../../component/Walikelas/layoutwakel';
import { StatusBadge } from '../../component/Shared/StatusBadge';
import { Button } from '../../component/Shared/Button';
import { FormModal } from '../../component/Shared/FormModal';
import { Select } from '../../component/Shared/Select';
import { Table } from '../../component/Shared/Table';
import { Calendar, BookOpen, FileText, ClipboardList, ClipboardPlus, ArrowLeft } from 'lucide-react';

type StatusType = 'hadir' | 'terlambat' | 'tidak-hadir' | 'sakit' | 'izin' | 'tanpa-keterangan' | 'pulang';

interface KehadiranRow {
  id: string;
  nisn: string;
  namaSiswa: string;
  mataPelajaran: string;
  tanggal: string;
  status: StatusType;
}

interface Dispensasi {
  id: string;
  nisn: string;
  namaSiswa: string;
  alasan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface KehadiranSiswaWakelProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

export function KehadiranSiswaWakel({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: KehadiranSiswaWakelProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMapel, setSelectedMapel] = useState('all');

  const kelasInfo = {
    namaKelas: 'X Mekatronika 1',
  };

  const [rows, setRows] = useState<KehadiranRow[]>([
    { id: '1', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', tanggal: '2026-01-25', status: 'hadir' },
    { id: '2', nisn: '1348576393', namaSiswa: 'Ahmad Fauzi', mataPelajaran: 'Matematika', tanggal: '2026-01-25', status: 'hadir' },
    { id: '3', nisn: '1348576394', namaSiswa: 'Siti Nurhaliza', mataPelajaran: 'Matematika', tanggal: '2026-01-26', status: 'izin' },
    { id: '4', nisn: '1348576395', namaSiswa: 'Budi Santoso', mataPelajaran: 'Matematika', tanggal: '2026-01-26', status: 'sakit' },
    { id: '5', nisn: '1348576396', namaSiswa: 'Dewi Sartika', mataPelajaran: 'Matematika', tanggal: '2026-01-27', status: 'tidak-hadir' },
    { id: '6', nisn: '1348576397', namaSiswa: 'Rizki Ramadhan', mataPelajaran: 'Matematika', tanggal: '2026-01-27', status: 'tanpa-keterangan' },
    { id: '7', nisn: '1348576398', namaSiswa: 'Budi Raharjo', mataPelajaran: '-', tanggal: '2026-01-27', status: 'pulang' },
  ]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mapelOptions = useMemo(() => {
    const mapelSet = new Set(
      rows.map((r) => r.mataPelajaran).filter((v) => v && v !== '-')
    );
    return [
      { label: 'Semua Mapel', value: 'all' },
      ...Array.from(mapelSet).map((mapel) => ({
        label: mapel,
        value: mapel,
      })),
    ];
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!startDate || !endDate) return rows;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return rows;
    const startTime = Math.min(start.getTime(), end.getTime());
    const endTime = Math.max(start.getTime(), end.getTime());
    return rows.filter((r) => {
      const rowDate = new Date(r.tanggal);
      if (Number.isNaN(rowDate.getTime())) return false;
      const time = rowDate.getTime();
      const matchDate = time >= startTime && time <= endTime;
      const matchMapel =
        selectedMapel === 'all' || r.mataPelajaran === selectedMapel;
      return matchDate && matchMapel;
    });
  }, [rows, startDate, endDate, selectedMapel]);

  const totalIzin = filteredRows.filter((r) => r.status === 'izin').length;
  const totalSakit = filteredRows.filter((r) => r.status === 'sakit').length;
  const totalTanpaKeterangan = filteredRows.filter((r) => r.status === 'tanpa-keterangan' || r.status === 'tidak-hadir').length;

  const columns = useMemo(() => [
    { key: 'nisn', label: 'NISN' },
    { key: 'namaSiswa', label: 'Nama Siswa' },
    { key: 'mataPelajaran', label: 'Mata Pelajaran' },
    {
      key: 'status',
      label: 'Status',
      render: (value: StatusType) => {
        // Filter out 'pulang' status for StatusBadge
        const displayStatus = value === 'pulang' ? 'hadir' : value;
        return <StatusBadge status={displayStatus as 'hadir' | 'terlambat' | 'tidak-hadir' | 'sakit' | 'izin' | 'tanpa-keterangan'} />;
      },
    },
  ], []);

  // Modal State
  const [editingRow, setEditingRow] = useState<KehadiranRow | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<StatusType>('hadir');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rekap Modal State
  // Rekap Modal State Removed

  // Dispensasi Modal State
  const [isDispensasiOpen, setIsDispensasiOpen] = useState(false);
  const [dispensasiList, setDispensasiList] = useState<Dispensasi[]>([]);
  const [dispensasiData, setDispensasiData] = useState({
    nisn: '',
    namaSiswa: '',
    alasan: '',
    tanggalMulai: '',
    tanggalSelesai: '',
  });
  const [isDispensasiListOpen, setIsDispensasiListOpen] = useState(false);

  const statusOptions = [
    { label: 'Hadir', value: 'hadir' as StatusType },
    { label: 'Sakit', value: 'sakit' as StatusType },
    { label: 'Izin', value: 'izin' as StatusType },
    { label: 'Tanpa Keterangan', value: 'tanpa-keterangan' as StatusType },
    { label: 'Pulang', value: 'pulang' as StatusType },
  ];

  const handleOpenEdit = (row: KehadiranRow) => {
    setEditingRow(row);
    setEditStatus(row.status);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingRow(null);
    setIsSubmitting(false);
  };

  const handleSubmitEdit = () => {
    if (!editingRow) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingRow.id ? { ...r, status: editStatus } : r
        )
      );
      setIsSubmitting(false);
      setIsEditOpen(false);
      setEditingRow(null);
      alert('✅ Status kehadiran berhasil diperbarui!');
    }, 300);
  };

  // fitur otewe


   // fitur otewe
  const handleBuatDispensasi = () => {
    setIsDispensasiOpen(true);
  };
  
  
  const handleBack = () => {
      onMenuClick("dashboard");
  }

  const handleTableEdit = (row: KehadiranRow) => {
    handleOpenEdit(row);
  };



  const handleCloseDispensasi = () => {
    setIsDispensasiOpen(false);
    setDispensasiData({
      nisn: '',
      namaSiswa: '',
      alasan: '',
      tanggalMulai: '',
      tanggalSelesai: '',
    });
  };

  const handleSubmitDispensasi = () => {
    if (!dispensasiData.nisn || !dispensasiData.alasan || !dispensasiData.tanggalMulai) {
      alert('⚠️ Mohon isi semua field yang diperlukan');
      return;
    }
    const newDispensasi: Dispensasi = {
      id: Date.now().toString(),
      nisn: dispensasiData.nisn,
      namaSiswa: dispensasiData.namaSiswa,
      alasan: dispensasiData.alasan,
      tanggalMulai: dispensasiData.tanggalMulai,
      tanggalSelesai: dispensasiData.tanggalSelesai || dispensasiData.tanggalMulai,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('id-ID'),
    };
    
    setTimeout(() => {
      setDispensasiList([...dispensasiList, newDispensasi]);
      alert(`✅ Dispensasi untuk ${dispensasiData.namaSiswa} berhasil dibuat!\n\nAlasan: ${dispensasiData.alasan}\nPeriode: ${dispensasiData.tanggalMulai} - ${dispensasiData.tanggalSelesai || dispensasiData.tanggalMulai}`);
      handleCloseDispensasi();
    }, 300);
  };

  const handleDeleteDispensasi = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus dispensasi ini?')) {
      setDispensasiList(dispensasiList.filter((d) => d.id !== id));
      alert('✅ Dispensasi berhasil dihapus');
    }
  };

  const handleUpdateDispensasiStatus = (id: string, status: Dispensasi['status']) => {
    setDispensasiList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  };

  const handleExportRekap = () => {
    const hadir = filteredRows.filter((r) => r.status === 'hadir').length;
    const sakit = filteredRows.filter((r) => r.status === 'sakit').length;
    const izin = filteredRows.filter((r) => r.status === 'izin').length;
    const tanpaKeterangan = filteredRows.filter((r) => r.status === 'tanpa-keterangan' || r.status === 'tidak-hadir').length;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'REKAP KEHADIRAN SISWA\n';
    csvContent += `Periode: ${startDate} - ${endDate}\n\n`;
    csvContent += 'RINGKASAN,\n';
    csvContent += `Hadir,${hadir}\n`;
    csvContent += `Sakit,${sakit}\n`;
    csvContent += `Izin,${izin}\n`;
    csvContent += `Tanpa Keterangan,${tanpaKeterangan}\n`;
    csvContent += `Total Siswa,${filteredRows.length}\n\n`;
    csvContent += 'DETAIL KEHADIRAN\n';
    csvContent += 'Tanggal,NISN,Nama Siswa,Mata Pelajaran,Status\n';
    
    filteredRows.forEach((row) => {
      csvContent += `${row.tanggal},${row.nisn},"${row.namaSiswa}",${row.mataPelajaran},${row.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Kehadiran_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('✅ Rekap kehadiran berhasil diunduh');
  };

  const styles = {
    container: {
      position: 'relative' as const,
      minHeight: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      overflow: 'hidden',
      padding: isMobile ? '16px' : '32px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
    headerWrapper: {
      position: 'relative' as const,
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 24,
    },
    topBar: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: 16,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftActions: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: 12,
      alignItems: 'center',
    },
    dateInputWrapper: {
      position: 'relative' as const,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      background: '#F9FAFB',
      color: '#1F2937',
      border: '1px solid #E5E7EB',
      borderRadius: 8,
      padding: '0 16px',
      height: '48px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      minWidth: '200px',
    },
    dateInput: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      opacity: 0,
      cursor: 'pointer',
      zIndex: 10,
    },
    rightActions: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: 8,
      justifyContent: 'flex-end',
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? 'repeat(2, minmax(0, 1fr))'
        : 'repeat(4, minmax(0, 1fr))',
      gap: 16,
    },
  };

  return (
    <WalikelasLayout
      pageTitle="Kehadiran Siswa"
      currentPage={currentPage as any}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={styles.container}>
        <div style={styles.headerWrapper}>
          {/* Period Filter Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 20px',
              backgroundColor: '#1E3A8A',
              borderRadius: '12px',
              flexWrap: 'wrap',
              marginBottom: '24px',
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '0.5px',
              }}
            >
              Periode :
            </span>

            {/* Start Date */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '10px 14px',
                border: '1px solid #E5E7EB',
              }}
            >
              <Calendar size={18} color="#1F2937" strokeWidth={1.5} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Separator */}
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: '300',
              }}
            >
              --
            </span>

            {/* End Date */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '10px 14px',
                border: '1px solid #E5E7EB',
              }}
            >
              <Calendar size={18} color="#1F2937" strokeWidth={1.5} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Summary Cards in Header */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginLeft: 'auto',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  minWidth: '80px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6B7280',
                  }}
                >
                  Pulang
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#111827',
                  }}
                >
                  {filteredRows.filter((r) => r.status === 'pulang').length}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  minWidth: '80px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6B7280',
                  }}
                >
                  Izin
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#111827',
                  }}
                >
                  {totalIzin}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  minWidth: '80px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6B7280',
                  }}
                >
                  Sakit
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#111827',
                  }}
                >
                  {totalSakit}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  minWidth: '100px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6B7280',
                  }}
                >
                  Tanpa Ket.
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#111827',
                  }}
                >
                  {totalTanpaKeterangan}
                </span>
              </div>
            </div>
          </div>

          {/* Bar atas: tombol aksi */}
          <div style={styles.topBar}>
            <div style={styles.leftActions}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  backgroundColor: '#0B2A55',
                  color: '#FFFFFF',
                  minWidth: isMobile ? '100%' : '320px',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255, 255, 255, 0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <BookOpen size={18} color="#FFFFFF" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>
                    {kelasInfo.namaKelas}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.9 }}>
                    Pilih Mapel
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <Select
                    value={selectedMapel}
                    onChange={(val) => setSelectedMapel(val)}
                    options={mapelOptions}
                    placeholder="Pilih mapel"
                  />
                </div>
              </div>
            </div>

            {/* Tombol aksi kanan */}
            <div style={styles.rightActions}>
              <Button
                label="Export CSV"
                onClick={handleExportRekap}
                icon={<FileText size={16} />}
              />
              {dispensasiList.length > 0 && (
                <Button
                  label={`Daftar Dispensasi (${dispensasiList.length})`}
                  onClick={() => setIsDispensasiListOpen(true)}
                  icon={<ClipboardList size={16} />}
                />
              )}
              <Button
                label="Buat Dispensasi"
                variant="secondary"
                onClick={handleBuatDispensasi}
                icon={<ClipboardPlus size={16} />}
              />
               <Button
                  label="Kembali"
                  variant="secondary"
                  onClick={handleBack}
                  icon={<ArrowLeft size={16} />}
                />
            </div>
          </div>

          {/* Tabel kehadiran */}
          <Table
            columns={columns}
            data={filteredRows}
            onEdit={handleTableEdit}
            keyField="id"
            emptyMessage="Belum ada data kehadiran siswa."
          />
        </div>
      </div>

      {/* Modal Edit Kehadiran (pakai FormModal + Select) */}
      <FormModal
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        title="Edit Kehadiran"
        onSubmit={handleSubmitEdit}
        submitLabel="Simpan"
        isSubmitting={isSubmitting}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p
              style={{
                margin: 0,
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Pilih Kehadiran
            </p>
            <Select
              value={editStatus}
              onChange={(val) => setEditStatus(val as StatusType)}
              options={statusOptions}
              placeholder="Pilih status kehadiran"
            />
          </div>
        </div>
      </FormModal>


      {/* Modal Buat Dispensasi */}
      <FormModal
        isOpen={isDispensasiOpen}
        onClose={handleCloseDispensasi}
        title="Buat Dispensasi"
        onSubmit={handleSubmitDispensasi}
        submitLabel="Buat Dispensasi"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Pilih Siswa */}
          <div>
            <p
              style={{
                margin: 0,
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Pilih Siswa
            </p>
            <Select
              value={dispensasiData.nisn}
              onChange={(val) => {
                const selectedStudent = rows.find((r) => r.nisn === val);
                setDispensasiData((prev) => ({
                  ...prev,
                  nisn: val,
                  namaSiswa: selectedStudent?.namaSiswa || '',
                }));
              }}
              options={rows.map((r) => ({
                label: `${r.namaSiswa} (${r.nisn})`,
                value: r.nisn,
              }))}
              placeholder="Pilih siswa"
            />
          </div>

          {/* Alasan Dispensasi */}
          <div>
            <p
              style={{
                margin: 0,
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Alasan Dispensasi
            </p>
            <textarea
              value={dispensasiData.alasan}
              onChange={(e) =>
                setDispensasiData((prev) => ({
                  ...prev,
                  alasan: e.target.value,
                }))
              }
              placeholder="Masukkan alasan dispensasi (sakit, izin, keluarga, dll)"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: '80px',
              }}
            />
          </div>

          {/* Tanggal Mulai */}
          <div>
            <p
              style={{
                margin: 0,
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Tanggal Mulai
            </p>
            <input
              type="date"
              value={dispensasiData.tanggalMulai}
              onChange={(e) =>
                setDispensasiData((prev) => ({
                  ...prev,
                  tanggalMulai: e.target.value,
                }))
              }
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Tanggal Selesai */}
          <div>
            <p
              style={{
                margin: 0,
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Tanggal Selesai (opsional)
            </p>
            <input
              type="date"
              value={dispensasiData.tanggalSelesai}
              onChange={(e) =>
                setDispensasiData((prev) => ({
                  ...prev,
                  tanggalSelesai: e.target.value,
                }))
              }
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </FormModal>

      {/* Modal Daftar Dispensasi */}
      <FormModal
        isOpen={isDispensasiListOpen}
        onClose={() => setIsDispensasiListOpen(false)}
        title="Daftar Dispensasi"
        showSubmitButton={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {dispensasiList.length === 0 ? (
            <div style={{ 
              padding: '30px 20px', 
              textAlign: 'center', 
              backgroundColor: '#F3F4F6', 
              borderRadius: '8px' 
            }}>
              <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
                📝 Belum ada dispensasi yang dibuat
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {dispensasiList.map((dispensasi) => (
                <div
                  key={dispensasi.id}
                  style={{
                    padding: '14px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                        {dispensasi.namaSiswa} ({dispensasi.nisn})
                      </p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6B7280' }}>
                        <strong>Alasan:</strong> {dispensasi.alasan}
                      </p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6B7280' }}>
                        <strong>Periode:</strong> {dispensasi.tanggalMulai} - {dispensasi.tanggalSelesai}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: 
                              dispensasi.status === 'approved' ? '#ECFDF5' :
                              dispensasi.status === 'rejected' ? '#FEE2E2' : '#FFFBEB',
                            color:
                              dispensasi.status === 'approved' ? '#047857' :
                              dispensasi.status === 'rejected' ? '#991B1B' : '#B45309',
                          }}
                        >
                          {dispensasi.status === 'pending' ? '⏳ Menunggu' : 
                           dispensasi.status === 'approved' ? '✅ Disetujui' : '❌ Ditolak'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                          {dispensasi.createdAt}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => handleUpdateDispensasiStatus(dispensasi.id, 'approved')}
                        disabled={dispensasi.status !== 'pending'}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: dispensasi.status === 'pending' ? '#ECFDF5' : '#F3F4F6',
                          color: '#047857',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: dispensasi.status === 'pending' ? 'pointer' : 'not-allowed',
                          fontSize: '12px',
                          fontWeight: 600,
                          transition: 'all 0.2s',
                        }}
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => handleUpdateDispensasiStatus(dispensasi.id, 'rejected')}
                        disabled={dispensasi.status !== 'pending'}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: dispensasi.status === 'pending' ? '#FEE2E2' : '#F3F4F6',
                          color: '#991B1B',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: dispensasi.status === 'pending' ? 'pointer' : 'not-allowed',
                          fontSize: '12px',
                          fontWeight: 600,
                          transition: 'all 0.2s',
                        }}
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleDeleteDispensasi(dispensasi.id)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#FEE2E2',
                          color: '#991B1B',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
            Total dispensasi: <strong>{dispensasiList.length}</strong>
          </p>
        </div>
      </FormModal>
    </WalikelasLayout>
  );
}

/// ====== LEGACY CODE - DO NOT DELETE ======
// import { useState, useEffect, useMemo } from 'react';
// import WalikelasLayout from '../../component/Walikelas/layoutwakel';
// import { FilterBar, FilterItem } from '../../component/Shared/FilterBar';
// import { StatusBadge } from '../../component/Shared/StatusBadge';
// import { Button } from '../../component/Shared/Button';
// import { FormModal } from '../../component/Shared/FormModal';
// import { Select } from '../../component/Shared/Select';
// import { Table } from '../../component/Shared/Table';
// import calendarIcon from '../../assets/Icon/calender.png';
// import chalkboardIcon from '../../assets/Icon/Chalkboard.png';

// type StatusType = 'hadir' | 'terlambat' | 'tidak-hadir' | 'sakit' | 'izin' | 'alpha' | 'pulang';

// interface KehadiranRow {
//   id: string;
//   nisn: string;
//   namaSiswa: string;
//   mataPelajaran: string;
//   status: StatusType;
// }

// interface KehadiranSiswaWakelProps {
//   user: { name: string; role: string };
//   onLogout: () => void;
//   currentPage: string;
//   onMenuClick: (page: string) => void;
// }

// export default function KehadiranSiswaWakel({
//   user,
//   onLogout,
//   currentPage,
//   onMenuClick,
// }: KehadiranSiswaWakelProps) {
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

//   const formattedDate = useMemo(() => {
//     return new Date(selectedDate).toLocaleDateString('id-ID', {
//       weekday: 'long',
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric',
//     });
//   }, [selectedDate]);

//   // Info kelas dummy
//   const kelasInfo = {
//     namaKelas: 'X Mekatronika 1',
//     mapel: 'Matematika (1-4)',
//   };

//   const [rows, setRows] = useState<KehadiranRow[]>([
//     { id: '1', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', status: 'hadir' },
//     { id: '2', nisn: '1348576393', namaSiswa: 'Ahmad Fauzi', mataPelajaran: 'Matematika', status: 'hadir' },
//     { id: '3', nisn: '1348576394', namaSiswa: 'Siti Nurhaliza', mataPelajaran: 'Matematika', status: 'izin' },
//     { id: '4', nisn: '1348576395', namaSiswa: 'Budi Santoso', mataPelajaran: 'Matematika', status: 'sakit' },
//     { id: '5', nisn: '1348576396', namaSiswa: 'Dewi Sartika', mataPelajaran: 'Matematika', status: 'tidak-hadir' },
//     { id: '6', nisn: '1348576397', namaSiswa: 'Rizki Ramadhan', mataPelajaran: 'Matematika', status: 'alpha' },
//     { id: '7', nisn: '1348576398', namaSiswa: 'Budi Raharjo', mataPelajaran: '-', status: 'pulang' },
//   ]);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 768);
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const totalHadir = rows.filter((r) => r.status === 'hadir').length;
//   const totalIzin = rows.filter((r) => r.status === 'izin').length;
//   const totalSakit = rows.filter((r) => r.status === 'sakit').length;
//   const totalAlpha = rows.filter((r) => r.status === 'alpha' || r.status === 'tidak-hadir').length;

//   const columns = useMemo(() => [
//     { key: 'nisn', label: 'NISN' },
//     { key: 'namaSiswa', label: 'Nama Siswa' },
//     { key: 'mataPelajaran', label: 'Mata Pelajaran' },
//     {
//       key: 'status',
//       label: 'Status',
//       render: (value: StatusType) => <StatusBadge status={value} />,
//     },
//   ], []);

//   // Modal State
//   const [editingRow, setEditingRow] = useState<KehadiranRow | null>(null);
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [editStatus, setEditStatus] = useState<StatusType>('hadir');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const statusOptions = [
//     { label: 'Hadir', value: 'hadir' as StatusType },
//     { label: 'Sakit', value: 'sakit' as StatusType },
//     { label: 'Izin', value: 'izin' as StatusType },
//     { label: 'Alpha', value: 'alpha' as StatusType },
//     { label: 'Pulang', value: 'pulang' as StatusType },
//   ];

//   const handleOpenEdit = (row: KehadiranRow) => {
//     setEditingRow(row);
//     setEditStatus(row.status);
//     setIsEditOpen(true);
//   };

//   const handleCloseEdit = () => {
//     setIsEditOpen(false);
//     setEditingRow(null);
//     setIsSubmitting(false);
//   };

//   const handleSubmitEdit = () => {
//     if (!editingRow) return;
//     setIsSubmitting(true);
//     setTimeout(() => {
//       setRows((prev) =>
//         prev.map((r) =>
//           r.id === editingRow.id ? { ...r, status: editStatus } : r
//         )
//       );
//       setIsSubmitting(false);
//       setIsEditOpen(false);
//       setEditingRow(null);
//       alert('✅ Status kehadiran berhasil diperbarui!');
//     }, 300);
//   };

//   const handleViewRekap = () => {
//     alert('Lihat rekap kehadiran (belum diimplementasikan)');
//   };

//   const handleBuatDispensasi = () => {
//     alert('Buat dispensasi (belum diimplementasikan)');
//   };
  
//   const handleBack = () => {
//       onMenuClick("dashboard");
//   }

//   const handleTableEdit = (row: KehadiranRow) => {
//     handleOpenEdit(row);
//   };

//   const styles = {
//     container: {
//       position: 'relative' as const,
//       minHeight: '100%',
//       backgroundColor: '#FFFFFF',
//       borderRadius: '12px',
//       overflow: 'hidden',
//       padding: isMobile ? '16px' : '32px',
//       border: '1px solid #E5E7EB',
//       boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
//     },
//     headerWrapper: {
//       position: 'relative' as const,
//       zIndex: 1,
//       display: 'flex',
//       flexDirection: 'column' as const,
//       gap: 24,
//     },
//     topBar: {
//       display: 'flex',
//       flexWrap: 'wrap' as const,
//       gap: 16,
//       alignItems: 'center',
//       justifyContent: 'space-between',
//     },
//     leftActions: {
//       display: 'flex',
//       flexWrap: 'wrap' as const,
//       gap: 12,
//       alignItems: 'center',
//     },
//     dateInputWrapper: {
//       position: 'relative' as const,
//       display: 'inline-flex',
//       alignItems: 'center',
//       gap: 10,
//       background: '#F9FAFB',
//       color: '#1F2937',
//       border: '1px solid #E5E7EB',
//       borderRadius: 8,
//       padding: '0 16px',
//       height: '48px',
//       cursor: 'pointer',
//       transition: 'all 0.2s',
//       minWidth: '200px',
//     },
//     dateInput: {
//       position: 'absolute' as const,
//       left: 0,
//       top: 0,
//       width: '100%',
//       height: '100%',
//       opacity: 0,
//       cursor: 'pointer',
//       zIndex: 10,
//     },
//     rightActions: {
//       display: 'flex',
//       flexWrap: 'wrap' as const,
//       gap: 8,
//       justifyContent: 'flex-end',
//     },
//     summaryGrid: {
//       display: 'grid',
//       gridTemplateColumns: isMobile
//         ? 'repeat(2, minmax(0, 1fr))'
//         : 'repeat(4, minmax(0, 1fr))',
//       gap: 16,
//     },
//   };

//   return (
//     <WalikelasLayout
//       pageTitle="Kehadiran Siswa"
//       currentPage={currentPage as any}
//       onMenuClick={onMenuClick}
//       user={user}
//       onLogout={onLogout}
//     >
//       <div style={styles.container}>
//         <div style={styles.headerWrapper}>
//           {/* Bar atas: tanggal + kelas + tombol aksi */}
//           <div style={styles.topBar}>
//             <div style={styles.leftActions}>
//               {/* Custom Date Picker */}
//               <div style={styles.dateInputWrapper}>
//                 <img
//                   src={calendarIcon}
//                   alt="Calendar"
//                   style={{ width: 20, height: 20, opacity: 0.8 }}
//                 />
//                 <span style={{ fontSize: '14px', fontWeight: 600 }}>
//                   {formattedDate}
//                 </span>
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   style={styles.dateInput}
//                 />
//               </div>

//               {/* Kelas + Mapel */}
//               <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <FilterItem
//                   icon=""
//                   iconComponent={
//                     <img
//                       src={chalkboardIcon}
//                       alt="Class"
//                       style={{ width: 24, height: 24, objectFit: 'contain' }}
//                     />
//                   }
//                   label={kelasInfo.namaKelas}
//                   value={kelasInfo.mapel}
//                 />
//               </div>
//             </div>

//             {/* Tombol aksi kanan */}
//             <div style={styles.rightActions}>
//               <Button label="Lihat Rekap" onClick={handleViewRekap} />
//               <Button
//                 label="Buat Dispensasi"
//                 variant="secondary"
//                 onClick={handleBuatDispensasi}
//               />
//                <Button
//                   label="Kembali"
//                   variant="secondary"
//                   onClick={handleBack}
//                 />
//             </div>
//           </div>

//           {/* Kartu ringkasan Hadir / Izin / Sakit / Alpha */}
//           <div style={styles.summaryGrid}>
//             <SummaryCard
//               label="Hadir"
//               value={totalHadir.toString()}
//               color="#10B981"
//               bgColor="#ECFDF5"
//             />
//             <SummaryCard
//               label="Izin"
//               value={totalIzin.toString()}
//               color="#F59E0B"
//               bgColor="#FFFBEB"
//             />
//             <SummaryCard
//               label="Sakit"
//               value={totalSakit.toString()}
//               color="#3B82F6"
//               bgColor="#EFF6FF"
//             />
//             <SummaryCard
//               label="Alpha / Tdk Hadir"
//               value={totalAlpha.toString()}
//               color="#EF4444"
//               bgColor="#FEF2F2"
//             />
//           </div>

//           {/* Tabel kehadiran */}
//           <Table
//             columns={columns}
//             data={rows}
//             onEdit={handleTableEdit}
//             keyField="id"
//             emptyMessage="Belum ada data kehadiran siswa."
//           />
//         </div>
//       </div>

//       {/* Modal Edit Kehadiran (pakai FormModal + Select) */}
//       <FormModal
//         isOpen={isEditOpen}
//         onClose={handleCloseEdit}
//         title="Edit Kehadiran"
//         onSubmit={handleSubmitEdit}
//         submitLabel="Simpan"
//         isSubmitting={isSubmitting}
//       >
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//           <div>
//             <p
//               style={{
//                 margin: 0,
//                 marginBottom: 8,
//                 fontSize: 14,
//                 fontWeight: 600,
//                 color: '#111827',
//               }}
//             >
//               Pilih Kehadiran
//             </p>
//             <Select
//               value={editStatus}
//               onChange={(val) => setEditStatus(val as StatusType)}
//               options={statusOptions}
//               placeholder="Pilih status kehadiran"
//             />
//           </div>
//         </div>
//       </FormModal>
//     </WalikelasLayout>
//   );
// }

// function SummaryCard({
//   label,
//   value,
//   color,
//   bgColor,
// }: {
//   label: string;
//   value: string;
//   color: string;
//   bgColor?: string;
// }) {
//   return (
//     <div
//       style={{
//         backgroundColor: bgColor || '#FFFFFF',
//         borderRadius: 12,
//         padding: '16px 20px',
//         border: `1px solid ${color}30`, 
//         boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'center',
//       }}
//     >
//       <div
//         style={{
//           fontSize: 13,
//           color: '#4B5563',
//           marginBottom: 4,
//           fontWeight: 600,
//           textTransform: 'uppercase',
//           letterSpacing: '0.5px',
//         }}
//       >
//         {label}
//       </div>
//       <div
//         style={{
//           fontSize: 24,
//           fontWeight: 800,
//           color,
//           lineHeight: 1.2,
//         }}
//       >
//         {value}
//       </div>
//     </div>
//   );
// }
