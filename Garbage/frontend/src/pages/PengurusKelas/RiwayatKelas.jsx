import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Eye, X, Users, ZoomIn } from 'lucide-react';
import NavbarPengurus from "../../components/PengurusKelas/NavbarPengurus";
import './RiwayatKelas.css';

// Data siswa kelas 12 RPL 2
const studentList = [
  { id: 1, name: 'Ahmad Fauzi', nis: '2024001' },
  { id: 2, name: 'Siti Nurhaliza', nis: '2024002' },
  { id: 3, name: 'Budi Santoso', nis: '2024003' },
  { id: 4, name: 'Dewi Lestari', nis: '2024004' },
  { id: 5, name: 'Eko Prasetyo', nis: '2024005' },
  { id: 6, name: 'Fitri Handayani', nis: '2024006' },
  { id: 7, name: 'Gilang Ramadan', nis: '2024007' },
  { id: 8, name: 'Hana Permata', nis: '2024008' },
  { id: 9, name: 'Indra Kusuma', nis: '2024009' },
  { id: 10, name: 'Joko Widodo', nis: '2024010' }
];

// Data dummy dengan nama siswa, proof image, dan status Terlambat
const dummyAttendanceRecords = [
  // Ahmad Fauzi
  {
    recordDate: '2026-01-25',
    date: '25/01/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-01-26',
    date: '26/01/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Izin',
    statusColor: 'status-izin',
    reason: 'Keperluan keluarga mendadak',
    proofDocument: 'Surat izin orang tua',
    proofImage: 'https://via.placeholder.com/400x600/3b82f6/ffffff?text=Surat+Izin+Orang+Tua',
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  // Siti Nurhaliza
  {
    recordDate: '2026-01-25',
    date: '25/01/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Terlambat',
    statusColor: 'status-terlambat',
    reason: 'Terjebak macet di jalan',
    proofDocument: null,
    proofImage: null,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-01-27',
    date: '27/01/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Sakit',
    statusColor: 'status-sakit',
    reason: 'Demam dan flu',
    proofDocument: 'Surat keterangan dokter',
    proofImage: 'https://via.placeholder.com/400x600/22c55e/ffffff?text=Surat+Keterangan+Dokter',
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  // Budi Santoso
  {
    recordDate: '2026-01-28',
    date: '28/01/26',
    period: '5-8',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Pulang',
    statusColor: 'status-pulang',
    reason: 'Merasa tidak enak badan saat jam pelajaran ke-6',
    proofDocument: 'Surat izin dari guru BK',
    proofImage: 'https://via.placeholder.com/400x600/a855f7/ffffff?text=Surat+Izin+Guru+BK',
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  {
    recordDate: '2026-01-29',
    date: '29/01/26',
    period: '1-4',
    subject: 'Sejarah',
    teacher: 'Ahmad Fauzi S.pd',
    status: 'Alpha',
    statusColor: 'status-alpha',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  // Dewi Lestari
  {
    recordDate: '2026-01-31',
    date: '31/01/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 4,
    studentName: 'Dewi Lestari',
    nis: '2024004'
  },
  {
    recordDate: '2026-02-01',
    date: '01/02/26',
    period: '5-8',
    subject: 'Pemrograman Web',
    teacher: 'Eko Prasetyo S.Kom',
    status: 'Terlambat',
    statusColor: 'status-terlambat',
    reason: 'Bangun kesiangan',
    proofDocument: null,
    proofImage: null,
    studentId: 4,
    studentName: 'Dewi Lestari',
    nis: '2024004'
  },
  // Eko Prasetyo
  {
    recordDate: '2026-03-15',
    date: '15/03/26',
    period: '1-4',
    subject: 'Basis Data',
    teacher: 'Linda Wijaya S.Kom',
    status: 'Izin',
    statusColor: 'status-izin',
    reason: 'Mengikuti lomba olimpiade matematika tingkat provinsi',
    proofDocument: 'Surat tugas dari sekolah',
    proofImage: 'https://via.placeholder.com/400x600/f97316/ffffff?text=Surat+Tugas+Sekolah',
    studentId: 5,
    studentName: 'Eko Prasetyo',
    nis: '2024005'
  },
  {
    recordDate: '2026-05-10',
    date: '10/05/26',
    period: '5-8',
    subject: 'Bahasa Inggris',
    teacher: 'Sarah Johnson M.pd',
    status: 'Sakit',
    statusColor: 'status-sakit',
    reason: 'Sakit perut akut',
    proofDocument: 'Surat keterangan dokter RS Saiful Anwar',
    proofImage: 'https://via.placeholder.com/400x600/ef4444/ffffff?text=Surat+Dokter+RS',
    studentId: 5,
    studentName: 'Eko Prasetyo',
    nis: '2024005'
  },
  // Fitri Handayani
  {
    recordDate: '2026-01-25',
    date: '25/01/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 6,
    studentName: 'Fitri Handayani',
    nis: '2024006'
  },
  {
    recordDate: '2026-01-26',
    date: '26/01/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 6,
    studentName: 'Fitri Handayani',
    nis: '2024006'
  },
  // Gilang Ramadan
  {
    recordDate: '2026-01-27',
    date: '27/01/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Alpha',
    statusColor: 'status-alpha',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 7,
    studentName: 'Gilang Ramadan',
    nis: '2024007'
  },
  // Hana Permata
  {
    recordDate: '2026-01-28',
    date: '28/01/26',
    period: '5-8',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Izin',
    statusColor: 'status-izin',
    reason: 'Urusan keluarga penting',
    proofDocument: 'Surat izin orang tua',
    proofImage: 'https://via.placeholder.com/400x600/fbbf24/ffffff?text=Surat+Izin+Orang+Tua',
    studentId: 8,
    studentName: 'Hana Permata',
    nis: '2024008'
  },
  // Indra Kusuma
  {
    recordDate: '2026-01-29',
    date: '29/01/26',
    period: '1-4',
    subject: 'Sejarah',
    teacher: 'Ahmad Fauzi S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 9,
    studentName: 'Indra Kusuma',
    nis: '2024009'
  },
  // Joko Widodo
  {
    recordDate: '2026-01-31',
    date: '31/01/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Sakit',
    statusColor: 'status-sakit',
    reason: 'Flu berat',
    proofDocument: 'Surat dokter',
    proofImage: 'https://via.placeholder.com/400x600/10b981/ffffff?text=Surat+Dokter',
    studentId: 10,
    studentName: 'Joko Widodo',
    nis: '2024010'
  }
];

function Riwayat({ attendanceRecords = dummyAttendanceRecords }) {
  // Set default tanggal awal bulan dan hari ini
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(0); // 0 = Semua Siswa
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Handle start date change dengan auto-adjust end date jika perlu
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // Jika tanggal akhir lebih kecil dari tanggal awal yang baru, update tanggal akhir
    if (new Date(endDate) < new Date(newStartDate)) {
      setEndDate(newStartDate);
    }
  };

  // Handle end date change dengan validasi
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    // Hanya update jika tanggal akhir >= tanggal awal
    if (new Date(newEndDate) >= new Date(startDate)) {
      setEndDate(newEndDate);
    }
  };

  const filterRecords = (records) => {
    return records.filter(record => {
      if (!record.recordDate) return false;
      
      const recordDate = new Date(record.recordDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Set time to 00:00:00 for proper date comparison
      recordDate.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      const matchDate = recordDate >= start && recordDate <= end;
      const matchStudent = selectedStudent === 0 || record.studentId === selectedStudent;
      
      return matchDate && matchStudent;
    });
  };

  const filteredRecords = filterRecords(attendanceRecords);

  const calculateStats = () => {
    const stats = {
      hadir: 0,
      terlambat: 0,
      izin: 0,
      sakit: 0,
      alpha: 0,
      pulang: 0
    };

    filteredRecords.forEach(record => {
      const status = record.status.toLowerCase();
      if (stats.hasOwnProperty(status)) {
        stats[status]++;
      }
    });

    return stats;
  };

  const stats = calculateStats();

  const handleDateApply = () => {
    // Validasi tanggal
    if (new Date(startDate) > new Date(endDate)) {
      alert('Tanggal mulai tidak boleh lebih besar dari tanggal akhir!');
      return;
    }
    setShowDatePicker(false);
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId);
    setShowStudentPicker(false);
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  const handleImageZoom = (imageUrl) => {
    setZoomedImage(imageUrl);
  };

  const closeImageZoom = () => {
    setZoomedImage(null);
  };

  const getSelectedStudentName = () => {
    if (selectedStudent === 0) return 'Semua Siswa';
    const student = studentList.find(s => s.id === selectedStudent);
    return student ? student.name : 'Semua Siswa';
  };

  // Cek apakah status memerlukan bukti
  const requiresProof = (status) => {
    return ['Izin', 'Sakit', 'Pulang'].includes(status);
  };

  return (
    <div className="riwayat-page">
      <NavbarPengurus />
      
      <main className="riwayat-main">
        {/* Top Controls */}
        <div className="top-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Date Range Picker */}
          <div className="riwayat-month-picker">
            <button 
              className="riwayat-month-picker-button"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="#000000" />
                <span>Periode: {formatDateDisplay(startDate)} - {formatDateDisplay(endDate)}</span>
              </div>
              <ChevronDown 
                size={24}
                color="#000000"
                style={{ 
                  transform: showDatePicker ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }} 
              />
            </button>

            {showDatePicker && (
              <div className="riwayat-month-picker-dropdown riwayat-animate-slideUp">
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem' }}>
                  Pilih Rentang Tanggal
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: 600, 
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Dari Tanggal:
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background:'#ffffff',
                        border: '2px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        cursor: 'pointer'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: 600, 
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Sampai Tanggal:
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={handleEndDateChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#ffffff',
                        border: '2px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        cursor: 'pointer'
                      }}
                    />
                  </div>

                  <button
                    onClick={handleDateApply}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#1e3a8a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#1e3a8a'}
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Student Picker */}
          <div className="riwayat-month-picker">
            <button 
              className="riwayat-month-picker-button"
              onClick={() => setShowStudentPicker(!showStudentPicker)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} color="#000000" />
                <span>Siswa: {getSelectedStudentName()}</span>
              </div>
              <ChevronDown 
                size={24}
                color="#000000"
                style={{ 
                  transform: showStudentPicker ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }} 
              />
            </button>

            {showStudentPicker && (
              <div className="riwayat-month-picker-dropdown riwayat-animate-slideUp" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem' }}>
                  Pilih Siswa
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleStudentSelect(0)}
                    style={{
                      padding: '0.75rem',
                      border: 'none',
                      borderRadius: '0.5rem',
                      background: selectedStudent === 0 ? '#1e3a8a' : '#f3f4f6',
                      color: selectedStudent === 0 ? 'white' : '#374151',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    Semua Siswa
                  </button>
                  {studentList.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleStudentSelect(student.id)}
                      style={{
                        padding: '0.75rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        background: selectedStudent === student.id ? '#1e3a8a' : '#f3f4f6',
                        color: selectedStudent === student.id ? 'white' : '#374151',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {student.name} ({student.nis})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards - FIXED dengan class name baru */}
        <div className="pengurus-stats-wrapper">
          <div className="pengurus-stats-grid">
            <div className="pengurus-stat-box box-hadir">
              <div className="pengurus-stat-title">Hadir</div>
              <div className="pengurus-stat-number">{stats.hadir}</div>
            </div>
            <div className="pengurus-stat-box box-terlambat">
              <div className="pengurus-stat-title">Terlambat</div>
              <div className="pengurus-stat-number">{stats.terlambat}</div>
            </div>
            <div className="pengurus-stat-box box-izin">
              <div className="pengurus-stat-title">Izin</div>
              <div className="pengurus-stat-number">{stats.izin}</div>
            </div>
            <div className="pengurus-stat-box box-sakit">
              <div className="pengurus-stat-title">Sakit</div>
              <div className="pengurus-stat-number">{stats.sakit}</div>
            </div>
            <div className="pengurus-stat-box box-alpha">
              <div className="pengurus-stat-title">Alpha</div>
              <div className="pengurus-stat-number">{stats.alpha}</div>
            </div>
            <div className="pengurus-stat-box box-pulang">
              <div className="pengurus-stat-title">Pulang</div>
              <div className="pengurus-stat-number">{stats.pulang}</div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        {filteredRecords.length > 0 ? (
          <div className="table-card">
            {/* Table Header */}
            <div className="table-header" style={{ gridTemplateColumns: '60px 200px 130px 150px 1fr 1.5fr 150px 100px' }}>
              <div>No</div>
              <div>Nama Siswa</div>
              <div>Tanggal</div>
              <div>Jam Pelajaran</div>
              <div>Mata Pelajaran</div>
              <div>Guru</div>
              <div>Status</div>
              <div>Detail</div>
            </div>

            {/* Table Rows */}
            {filteredRecords.map((record, index) => (
              <div key={index} className="table-row" style={{ gridTemplateColumns: '60px 200px 130px 150px 1fr 1.5fr 150px 100px' }}>
                <div className="table-cell">{index + 1}</div>
                <div className="table-cell" style={{ fontWeight: '600' }}>{record.studentName}</div>
                <div className="table-cell">{record.date}</div>
                <div className="table-cell">{record.period}</div>
                <div className="table-cell">{record.subject}</div>
                <div className="table-cell">{record.teacher}</div>
                <div className="table-cell">
                  <span className={`status-badge ${record.statusColor}`}>
                    {record.status}
                  </span>
                </div>
                <div className="table-cell">
                  <button 
                    className="view-btn" 
                    onClick={() => handleViewDetail(record)}
                    title="Lihat Detail"
                  >
                    <Eye size={28} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>Tidak ada data kehadiran</h3>
            <p>untuk {getSelectedStudentName()} - {formatDateDisplay(startDate)} sampai {formatDateDisplay(endDate)}</p>
          </div>
        )}
      </main>

      {/* Modal Detail */}
      {showModal && selectedRecord && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Detail Kehadiran</h3>
              <button className="close-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Nama Siswa:</span>
                <span className="detail-value">{selectedRecord.studentName}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">NIS:</span>
                <span className="detail-value">{selectedRecord.nis}</span>
              </div>

              <div className="detail-divider"></div>

              <div className="detail-row">
                <span className="detail-label">Tanggal:</span>
                <span className="detail-value">{selectedRecord.date}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Jam Pelajaran:</span>
                <span className="detail-value">{selectedRecord.period}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Mata Pelajaran:</span>
                <span className="detail-value">{selectedRecord.subject}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Guru:</span>
                <span className="detail-value">{selectedRecord.teacher}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${selectedRecord.statusColor}`}>
                  {selectedRecord.status}
                </span>
              </div>

              {selectedRecord.reason && (
                <>
                  <div className="detail-divider"></div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Alasan:</span>
                    <span className="detail-value">{selectedRecord.reason}</span>
                  </div>
                </>
              )}

              {/* Bukti Foto Section */}
              {requiresProof(selectedRecord.status) && (
                <>
                  <div className="detail-divider"></div>
                  <div className="detail-row">
                    <span className="detail-label">Bukti Foto:</span>
                    <div className="detail-value">
                      {selectedRecord.proofImage ? (
                        <div className="proof-image-container">
                          <div 
                            className="proof-image-wrapper"
                            onClick={() => handleImageZoom(selectedRecord.proofImage)}
                          >
                            <img 
                              src={selectedRecord.proofImage} 
                              alt="Bukti dokumen"
                              className="proof-image"
                            />
                            <p className="proof-image-hint">
                              <ZoomIn size={14} style={{ display: 'inline', marginRight: '4px' }} />
                              Klik untuk memperbesar foto
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="no-proof-text">
                          Bukti foto belum diunggah oleh wali kelas
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {!selectedRecord.reason && !requiresProof(selectedRecord.status) && (
                <>
                  <div className="detail-divider"></div>
                  <p className="no-reason-text">
                    {selectedRecord.status === 'Hadir' 
                      ? 'Siswa hadir tepat waktu' 
                      : selectedRecord.status === 'Terlambat'
                      ? 'Siswa datang terlambat'
                      : 'Tidak ada keterangan tambahan'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div className="image-zoom-overlay" onClick={closeImageZoom}>
          <div className="image-zoom-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-zoom-close" onClick={closeImageZoom}>
              <X size={24} />
            </button>
            <img 
              src={zoomedImage} 
              alt="Bukti dokumen (diperbesar)"
              className="zoomed-image"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Riwayat;