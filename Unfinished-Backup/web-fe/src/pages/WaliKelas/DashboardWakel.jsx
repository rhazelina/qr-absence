import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardWakel.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import api from '../../utils/api';
import { clearAuth } from '../../utils/auth';

const DashboardWakel = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentFormattedDate, setCurrentFormattedDate] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [qrVerified, setQrVerified] = useState(false);
  const [waliKelas, setWaliKelas] = useState({ nama: '-', nip: '-', role: 'Wali Kelas -' });
  const [allJadwal, setAllJadwal] = useState([]);
  const [siswaPerKelas, setSiswaPerKelas] = useState({});
  const [completedAbsensi, setCompletedAbsensi] = useState(new Set());
  const currentClassName = waliKelas.role.replace('Wali Kelas ', '');
  const totalSiswa = (siswaPerKelas[currentClassName] || []).length;

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);

      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

      const dayName = days[now.getDay()];
      const date = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();

      setCurrentDate(`${dayName}, ${date} ${monthName} ${year}`);

      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const formattedDate = `${day}-${month}-${year} (${dayName})`;
      setCurrentFormattedDate(formattedDate);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const [me, homeroom, schedulesRes, studentsRes] = await Promise.all([
          api.get('/me'),
          api.get('/me/homeroom'),
          api.get('/me/homeroom/schedules', { date: today }),
          api.get('/me/homeroom/students'),
        ]);

        const className = homeroom?.name || '-';
        setWaliKelas({
          nama: me?.name || '-',
          nip: me?.teacher?.nip || '-',
          role: `Wali Kelas ${className}`,
        });

        const mappedStudents = (Array.isArray(studentsRes) ? studentsRes : (studentsRes?.data || [])).map((s) => ({
          id: s.id,
          nisn: s.nisn || s.nis || '-',
          nama: s.name || s.user?.name || '-',
        }));
        setSiswaPerKelas({ [className]: mappedStudents });

        const rawSchedules = Array.isArray(schedulesRes) ? schedulesRes : (schedulesRes?.data || []);
        const mappedSchedules = rawSchedules.map((s) => ({
          id: s.id,
          mataPelajaran: s.subject_name || s.subject?.name || '-',
          kelas: s.class_name || className || '-',
          jamKe: s.session || '-',
          waktu: `${(s.start_time || '-').slice(0, 5)} - ${(s.end_time || '-').slice(0, 5)}`,
        }));
        setAllJadwal(mappedSchedules);

        const completionChecks = await Promise.all(
          mappedSchedules.map(async (item) => {
            try {
              const rows = await api.get(`/attendance/schedules/${item.id}`, { date: today, per_page: 1 });
              const count = Array.isArray(rows?.data) ? rows.data.length : (Array.isArray(rows) ? rows.length : 0);
              return count > 0 ? item.id : null;
            } catch {
              return null;
            }
          })
        );
        setCompletedAbsensi(new Set(completionChecks.filter(Boolean)));
      } catch (error) {
        console.error('Gagal memuat dashboard wali kelas:', error);
      }
    };
    load();
  }, []);

  const handleIconClick = (jadwal) => {
    setSelectedSchedule(jadwal);
    setQrVerified(false);
  };

  const handleCloseModal = () => {
    setSelectedSchedule(null);
    setQrVerified(false);
  };

  const handleQrVerified = () => setQrVerified(true);

  const handleAbsensiSelesai = () => {
    if (selectedSchedule) {
      const daftarSiswaYangDipilih = siswaPerKelas[selectedSchedule.kelas] || [];
      handleCloseModal();
      navigate('/walikelas/presensi', {
        state: {
          jadwalId: selectedSchedule.id,
          mataPelajaran: selectedSchedule.mataPelajaran,
          jamKe: selectedSchedule.jamKe,
          kelas: selectedSchedule.kelas,
          waktu: selectedSchedule.waktu,
          tanggal: currentFormattedDate,
          namaGuru: waliKelas.nama,
          nipGuru: waliKelas.nip,
          daftarSiswa: daftarSiswaYangDipilih,
          totalSiswa: daftarSiswaYangDipilih.length,
          isEdit: completedAbsensi.has(selectedSchedule.id),
        }
      });
    }
  };

  const simulateScanSuccess = () => handleQrVerified();

  const handleLogout = () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    if (confirmLogout) {
      clearAuth();
      sessionStorage.clear();
      navigate('/login');
      alert('Anda telah berhasil keluar');
    }
  };

  const renderStatusIcon = (jadwalId) => {
    const isCompleted = completedAbsensi.has(jadwalId);
    if (isCompleted) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="status-icon eye-icon">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C23.27 7.61 19 4.5 12 4.5zm0 13c-3.5 0-6.5-2.5-6.5-5.5S8.5 6.5 12 6.5s6.5 2.5 6.5 5.5-3 5.5-6.5 5.5zm0-8c-1.38 0-2.5.67-2.5 1.5S10.62 13 12 13s2.5-.67 2.5-1.5S13.38 9.5 12 9.5z"/>
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="status-icon qr-icon">
        <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM19 19h2v2h-2z"/>
      </svg>
    );
  };

  return (
    <div className="dashboard-page">
      <NavbarWakel />
      <div className="circle-decoration left-bottom"></div>
      <div className="circle-decoration right-top"></div>

      <div className="dashboard-containerr">

        {/* ============ SIDEBAR KIRI ============ */}
        <div className="left-section">
          <div className="profile-section">
            <div className="profile-content">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{waliKelas.nama}</h2>
                <p className="profile-nip">{waliKelas.nip}</p>
                <p className="profile-role">{waliKelas.role}</p>
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Keluar
              </button>
            </div>
          </div>
        </div>

        {/* ============ KONTEN KANAN ============ */}
        <div className="right-section">
          <div className="header-sectionn">
            <h2 className="header-title">Kehadiran Siswa</h2>

            <div className="top-cards-grid">
              <div className="datetime-card figma-style">
                <div className="datetime-left">
                  <svg className="datetime-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                  <div>
                    <p className="datetime-label">{currentDate}</p>
                    <p className="datetime-static">07:00 - 15:00</p>
                  </div>
                </div>
                <div className="datetime-right">
                  <p className="datetime-clock">{currentTime}</p>
                </div>
              </div>

              <div className="stats-card">
                <p className="stats-label">Total Mengajar Hari Ini</p>
                <p className="stats-value">{allJadwal.length} Kelas</p>
              </div>

              <div
                className="stats-card clickable"
                onClick={() => navigate('/walikelas/datasiswa')}
              >
                <p className="stats-label">Total Siswa Kelas {waliKelas.role.split(' ').slice(-2).join(' ')}</p>
                <p className="stats-value">{totalSiswa}</p>
              </div>
            </div>
          </div>

          {/* ============ JADWAL HARI INI ============ */}
          <div className="jadwal-section">
            <h3 className="jadwal-titlee">
              Jadwal Hari Ini
              <span className="bell-icon">🔔</span>
            </h3>

            <div className="schedule-list">
              {allJadwal.length === 0 ? (
                <div className="empty-schedule">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                  </svg>
                  <p>Tidak ada jadwal mengajar hari ini</p>
                </div>
              ) : (
                allJadwal.map((jadwal) => (
                  <div
                    key={jadwal.id}
                    className={`schedule-card-compact${completedAbsensi.has(jadwal.id) ? ' completed' : ''}`}
                  >
                    <div className="card-content">
                      <div className="schedule-icon-compact">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
                      </div>
                      <div className="schedule-info-compact">
                        <div className="schedule-name">{jadwal.mataPelajaran}</div>
                        <div className="schedule-class">{jadwal.kelas} &nbsp;·&nbsp; Jam Ke-{jadwal.jamKe} &nbsp;·&nbsp; {jadwal.waktu}</div>
                        {completedAbsensi.has(jadwal.id) && (
                          <span className="absen-done-chip">✓ Presensi selesai</span>
                        )}
                      </div>
                      <button className="btn-qr-compact" onClick={() => handleIconClick(jadwal)}>
                        {renderStatusIcon(jadwal.id)}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============ MODAL - Scan & Detail ============ */}
      {selectedSchedule && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className={qrVerified ? 'modal-absen-detail' : 'modal-absen-scan'}
            onClick={(e) => e.stopPropagation()}
          >
            {/* TAHAP 1: SCAN QR */}
            {!qrVerified && (
              <>
                <div className="modal-simple-header">
                  <button className="back-btn" onClick={handleCloseModal}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                  </button>
                  <h3>Scan QR Code - {selectedSchedule.kelas}</h3>
                  <button className="close-btn" onClick={handleCloseModal}>×</button>
                </div>

                <div className="tab-content-dotted">
                  <div className="scan-area">
                    <div className="qr-box-large">
                      <div className="qr-frame">
                        <svg viewBox="0 0 200 200" className="qr-pattern">
                          <rect x="20" y="20" width="50" height="50" fill="#000" rx="5"/>
                          <rect x="130" y="20" width="50" height="50" fill="#000" rx="5"/>
                          <rect x="20" y="130" width="50" height="50" fill="#000" rx="5"/>
                          <rect x="30" y="30" width="30" height="30" fill="#fff" rx="3"/>
                          <rect x="140" y="30" width="30" height="30" fill="#fff" rx="3"/>
                          <rect x="30" y="140" width="30" height="30" fill="#fff" rx="3"/>
                          <rect x="40" y="40" width="10" height="10" fill="#000" rx="2"/>
                          <rect x="150" y="40" width="10" height="10" fill="#000" rx="2"/>
                          <rect x="40" y="150" width="10" height="10" fill="#000" rx="2"/>
                          <rect x="85" y="30" width="10" height="10" fill="#000"/>
                          <rect x="100" y="30" width="10" height="10" fill="#000"/>
                          <rect x="85" y="45" width="10" height="10" fill="#000"/>
                          <rect x="30" y="85" width="10" height="10" fill="#000"/>
                          <rect x="45" y="85" width="10" height="10" fill="#000"/>
                          <rect x="30" y="100" width="10" height="10" fill="#000"/>
                          <rect x="150" y="85" width="10" height="10" fill="#000"/>
                          <rect x="165" y="85" width="10" height="10" fill="#000"/>
                          <rect x="150" y="100" width="10" height="10" fill="#000"/>
                          <rect x="85" y="150" width="10" height="10" fill="#000"/>
                          <rect x="100" y="150" width="10" height="10" fill="#000"/>
                          <rect x="85" y="165" width="10" height="10" fill="#000"/>
                          <rect x="80" y="80" width="15" height="15" fill="#000"/>
                          <rect x="105" y="80" width="15" height="15" fill="#000"/>
                          <rect x="80" y="105" width="15" height="15" fill="#000"/>
                          <rect x="105" y="105" width="15" height="15" fill="#000"/>
                        </svg>
                        <div className="magnify-icon">
                          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="40" cy="40" r="25" stroke="#000" strokeWidth="6" fill="none"/>
                            <line x1="58" y1="58" x2="85" y2="85" stroke="#000" strokeWidth="8" strokeLinecap="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p style={{ marginTop: '20px', color: '#666', textAlign: 'center' }}>
                      Scan QR Code untuk kelas <strong>{selectedSchedule.kelas}</strong>
                    </p>
                    <button onClick={simulateScanSuccess} className="btn-simulasi">
                      Simulasi Scan Berhasil
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAHAP 2: DETAIL JADWAL */}
            {qrVerified && (
              <>
                <div className="modal-detail-header">
                  <div className="header-left">
                    <div className="header-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                      </svg>
                    </div>
                    <h2>{selectedSchedule.mataPelajaran}</h2>
                  </div>
                  <div className="header-class">{selectedSchedule.kelas}</div>
                </div>

                <div className="modal-detail-body">
                  <h3 className="section-title">Keterangan</h3>
                  <div className="detail-row">
                    <span className="detail-label">Mata Pelajaran</span>
                    <span className="detail-value">{selectedSchedule.mataPelajaran}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Kelas/Jurusan</span>
                    <span className="detail-value">{selectedSchedule.kelas}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Jam ke-</span>
                    <span className="detail-value">{selectedSchedule.waktu} (Jam ke {selectedSchedule.jamKe})</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Jumlah Siswa</span>
                    <span className="detail-value">
                      {(siswaPerKelas[selectedSchedule.kelas] || []).length} Siswa
                    </span>
                  </div>
                  <h3 className="section-title status-title">Status Guru</h3>
                  <div className="detail-row">
                    <span className="detail-label">Hadir</span>
                    <span className="status-badge-green">Hadir</span>
                  </div>
                  <p className="status-description">Anda terjadwal mengajar kelas ini</p>
                  <button className="btn-mulai-absen-full" onClick={handleAbsensiSelesai}>
                    {completedAbsensi.has(selectedSchedule.id) ? 'Lihat/Edit Presensi' : `Mulai Presensi (${(siswaPerKelas[selectedSchedule.kelas] || []).length} Siswa)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardWakel;
