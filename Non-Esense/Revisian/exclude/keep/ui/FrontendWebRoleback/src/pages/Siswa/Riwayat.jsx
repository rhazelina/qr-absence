import React, { useState, useEffect } from 'react';
import { Calendar, Eye, X, ZoomIn } from 'lucide-react';
import './Riwayat.css';
import NavbarSiswa from '../../components/Siswa/NavbarSiswa';
import { dummyAttendanceRecords } from '../../data/attendanceData';

// Profile siswa yang login (sama dengan DashboardSiswa.jsx)
const currentStudent = {
  studentId: 3,  // Budi Santoso
  name: 'Budi Santoso',
  nis: '2024003'
};

function Riwayat({ attendanceRecords = dummyAttendanceRecords }) {
  // Set default tanggal awal bulan dan hari ini
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Format tanggal untuk ditampilkan dengan format dd/mm/yy
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Handle start date change dengan validasi
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

  // Filter records berdasarkan rentang tanggal DAN siswa yang login
  const filterRecords = (records) => {
    return records.filter(record => {
      if (!record.recordDate) return false;
      
      // Filter berdasarkan studentId
      if (record.studentId !== currentStudent.studentId) return false;
      
      const recordDate = new Date(record.recordDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Set waktu ke 00:00:00 untuk perbandingan yang akurat
      recordDate.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      return recordDate >= start && recordDate <= end;
    });
  };

  const filteredRecords = filterRecords(attendanceRecords);

  // Hitung statistik berdasarkan data yang difilter
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

  // Cek apakah status memerlukan bukti
  const requiresProof = (status) => {
    return ['Izin', 'Sakit', 'Pulang'].includes(status);
  };

  return (
    <div className="riwayat-page">
      <NavbarSiswa />
      <main className="riwayat-main">
        {/* Date Range Filter */}
        <div className="date-range-filter">
          <div className="date-inputt-group">
            <label htmlFor="startDate">
              <Calendar size={18} />
              Dari Tanggal
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={handleStartDateChange}
              className="date-inputt"
            />
          </div>
          
          <div className="date-separator">—</div>
          
          <div className="date-inputt-group">
            <label htmlFor="endDate">
              <Calendar size={18} />
              Sampai Tanggal
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              min={startDate}
              onChange={handleEndDateChange}
              className="date-inputt"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="riwayat-stats-wrapper">
          <div className="riwayat-stats-grid">
            <div className="riwayat-stat-box box-hadir">
              <div className="riwayat-stat-title">Hadir</div>
              <div className="riwayat-stat-number">{stats.hadir}</div>
            </div>
            <div className="riwayat-stat-box box-terlambat">
              <div className="riwayat-stat-title">Terlambat</div>
              <div className="riwayat-stat-number">{stats.terlambat}</div>
            </div>
            <div className="riwayat-stat-box box-izin">
              <div className="riwayat-stat-title">Izin</div>
              <div className="riwayat-stat-number">{stats.izin}</div>
            </div>
            <div className="riwayat-stat-box box-sakit">
              <div className="riwayat-stat-title">Sakit</div>
              <div className="riwayat-stat-number">{stats.sakit}</div>
            </div>
            <div className="riwayat-stat-box box-alpha">
              <div className="riwayat-stat-title">Alpha</div>
              <div className="riwayat-stat-number">{stats.alpha}</div>
            </div>
            <div className="riwayat-stat-box box-pulang">
              <div className="riwayat-stat-title">Pulang</div>
              <div className="riwayat-stat-number">{stats.pulang}</div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        {filteredRecords.length > 0 ? (
          <div className="table-card">
            {/* Table Header */}
            <div className="table-header">
              <div>No</div>
              <div>Tanggal</div>
              <div>Jam Pelajaran</div>
              <div>Mata Pelajaran</div>
              <div>Guru</div>
              <div>Status</div>
              <div>Detail</div>
            </div>

            {/* Table Rows */}
            {filteredRecords.map((record, index) => (
              <div key={index} className="table-row">
                <div className="table-cell">{index + 1}</div>
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
            <p>untuk periode {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}</p>
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