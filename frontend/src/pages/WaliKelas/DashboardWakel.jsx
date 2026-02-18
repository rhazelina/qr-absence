import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardWakel.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import apiService from '../../utils/api';

const DashboardWakel = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);

  const [waliKelas, setWaliKelas] = useState({
    nama: "",
    nip: "",
    role: ""
  });

  const [siswaPerKelas, setSiswaPerKelas] = useState({});

  const [scheduleData, setScheduleData] = useState([]);

  const [stats, setStats] = useState({
    totalKelas: 0,
    totalSiswa: 0
  });

  const [completedAbsensi, setCompletedAbsensi] = useState(new Set());

  // REMOVED checkTodayAttendanceStatus as we will implement better status check later
  // or rely on API to tell us if attendance is taken (not yet implemented in backend strictly)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Profile
        const profile = await apiService.getProfile();
        setWaliKelas({
          nama: profile.name,
          nip: profile.nip || '-', // Assuming API returns 'nip' or in teacherProfile
          role: profile.role || 'Wali Kelas' // Adjust based on API response
        });

        // Fetch Schedules
        // Pass current date to get today's schedules
        const today = new Date().toISOString().split('T')[0];
        const schedules = await apiService.getHomeroomSchedules({ date: today }); // Passing date as query param if supported or just filter in frontend
        // Currently apiService.getHomeroomSchedules() takes no args in definition, 
        // need to update apiService definition OR pass query params manualy in api.js? 
        // api.js define getHomeroomSchedules() { return this.get('/me/homeroom/schedules'); } - no args.
        // But TeacherController accepts ?date=...
        // So I should update apiService too, OR just append query here? 
        // I cannot change apiService from here. I will just call it and filter in frontend if needed, 
        // OR rely on API to return all and filter by day name.
        
        // Wait, apiService definition for getHomeroomSchedules in step 442 DOES NOT take params.
        // I should probably fix apiService to accept params or just filter frontend for now. 
        // TeacherController filters by day if date is passed.
        // Let's rely on frontend filtering if apiService doesn't support params yet, 
        // OR I can use `apiService.get('/me/homeroom/schedules?date=' + today)` directly? No, use service ref if possible.
        // I'll stick to default call and filter day in frontend if needed.
        // Actually, let's assume getHomeroomSchedules returns all for the week? Or just today?
        // TeacherController says: "if ($request->filled('date')) ... else return all?"
        // If I call without date, it returns ALL schedules for the class.
        
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayName = days[new Date().getDay()];

        const todaySchedules = schedules.filter(s => s.day === dayName || s.hari === dayName);

        const mappedSchedules = todaySchedules.map(s => ({
            id: s.id,
            mataPelajaran: s.subject?.name || s.mata_pelajaran || 'Mapel',
            kelas: s.class_name || (s.class_schedule?.class?.name) || 'Kelas', // Need to check response structure
            jamKe: s.period || s.jam_ke || '-',
            waktu: `${s.start_time?.substring(0,5)} - ${s.end_time?.substring(0,5)}`
        }));
        
        setScheduleData(mappedSchedules);
        
        // Fetch Students for this class (Homeroom)
        // We need this for "Total Siswa" and for "Mulai Absen" payload (temporarily until Presensi.jsx fetches it)
        const students = await apiService.getHomeroomStudents();
        setStats(prev => ({ ...prev, totalSiswa: students.length }));
        
        // Populate siswaPerKelas for the "Mulai Absen" handler
        // Since it's homeroom, we assume only ONE class. 
        // We can map mappedSchedules[0].kelas to students if needed.
        if (mappedSchedules.length > 0) {
            setSiswaPerKelas({
                [mappedSchedules[0].kelas]: students
            });
            setStats(prev => ({ ...prev, totalKelas: mappedSchedules.length })); // 'total mengajar' -> total schedules today
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    fetchData();
    
    // Timer
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleIconClick = (jadwal) => {
    const isCompleted = completedAbsensi.has(jadwal.id);

    if (isCompleted) {
      navigate('/walikelas/presensi');
    } else {
      setSelectedSchedule(jadwal);
      setScanSuccess(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedSchedule(null);
    setScanSuccess(false);
  };

  const handleScanSuccess = () => {
    setScanSuccess(true);
  };

  const handleMulaiAbsen = () => {
    if (!selectedSchedule) return;

    if (!scanSuccess) {
      alert('⚠️ Harap scan QR Code terlebih dahulu!');
      return;
    }

    const daftarSiswaYangDipilih = siswaPerKelas[selectedSchedule.kelas] || [];

    const dataToSend = {
      jadwalId: selectedSchedule.id, // Add ID for API
      mataPelajaran: selectedSchedule.mataPelajaran,
      jamKe: selectedSchedule.jamKe,
      kelas: selectedSchedule.kelas,
      waktu: selectedSchedule.waktu,
      tanggal: formatDate(currentTime),
      namaGuru: waliKelas.nama,
      nipGuru: waliKelas.nip,
      daftarSiswa: daftarSiswaYangDipilih,
      totalSiswa: daftarSiswaYangDipilih.length
    };

    setCompletedAbsensi((prev) => new Set([...prev, selectedSchedule.id]));
    sessionStorage.setItem('presensiData', JSON.stringify(dataToSend));

    handleCloseModal();

    setTimeout(() => {
      navigate('/walikelas/presensi', { state: dataToSend });
    }, 100);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');

    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      navigate('/login');
      alert('Anda telah berhasil logout');
    }
  };

  const renderStatusIcon = (jadwalId) => {
    const isCompleted = completedAbsensi.has(jadwalId);

    if (isCompleted) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="action-icon eye-icon" style={{ width: '22px', height: '22px', color: '#0066cc' }}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    }

    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="action-icon">
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
                    <p className="datetime-label">{formatDate(currentTime)}</p>
                    <p className="datetime-static">07:00 - 15:00</p>
                  </div>
                </div>

                <div className="datetime-right">
                  <p className="datetime-clock">{formatTime(currentTime)}</p>
                </div>
              </div>

              <div className="stats-card">
                <p className="stats-label">Total Mengajar Hari Ini</p>
                <p className="stats-value">{stats.totalKelas} Kelas</p>
              </div>

              <div
                className="stats-card clickable"
                onClick={() => navigate('/walikelas/datasiswa')}
              >
                <p className="stats-label">Total Siswa Kelas {waliKelas.role.split(' ').slice(-2).join(' ')}</p>
                <p className="stats-value">{stats.totalSiswa}</p>
              </div>
            </div>
          </div>

          <div className="jadwal-section">
            <h3 className="jadwal-titlee">Jadwal Hari Ini</h3>

            <div className="schedule-list">
              {scheduleData.length > 0 ? (
                scheduleData.map((item) => (
                  <div key={item.id} className="schedule-item" onClick={() => handleIconClick(item)}>
                    <div className="schedule-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
                      </svg>
                    </div>
                    <div className="schedule-info">
                      <p className="schedule-subject">{item.mataPelajaran}</p>
                      <p className="schedule-details">
                        {item.kelas} | Jam ke {item.jamKe} | {item.waktu}
                      </p>
                    </div>
                    <button className="schedule-action">
                      {renderStatusIcon(item.id)}
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-schedule">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                  </svg>
                  <p>Tidak ada jadwal mengajar hari ini</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL - TAHAP 1: SCAN QR */}
      {selectedSchedule && !scanSuccess && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-absen-scan" onClick={(e) => e.stopPropagation()}>
            <div className="modal-simple-header">
              <button className="back-btn" onClick={handleCloseModal}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
              </button>
              <h3>Scan QR Code</h3>
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
                <button onClick={handleScanSuccess} className="btn-simulasi">
                  Simulasi Scan Berhasil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - TAHAP 2: DETAIL JADWAL */}
      {selectedSchedule && scanSuccess && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-absen-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-subject-header">
              <div className="subject-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              </div>
              <div className="subject-title">
                <h2>{selectedSchedule.mataPelajaran}</h2>
              </div>
              <div className="subject-class">{selectedSchedule.kelas}</div>
            </div>

            <div className="schedule-info-section">
              <h3>Keterangan</h3>
              <div className="info-table">
                <div className="info-row">
                  <span className="label">Mata Pelajaran</span>
                  <span className="value">{selectedSchedule.mataPelajaran}</span>
                </div>
                <div className="info-row">
                  <span className="label">Kelas/Jurusan</span>
                  <span className="value">{selectedSchedule.kelas}</span>
                </div>
                <div className="info-row">
                  <span className="label">Jam ke-</span>
                  <span className="value">{selectedSchedule.waktu} (Jam ke {selectedSchedule.jamKe})</span>
                </div>
                <div className="info-row">
                  <span className="label">Jumlah Siswa</span>
                  <span className="value">
                    {(siswaPerKelas[selectedSchedule.kelas] || []).length} Siswa
                  </span>
                </div>
              </div>
            </div>

            <div className="guru-status-section">
              <div className="info-row">
                <span className="label">Status Guru</span>
                <span className="status-badge hadir">Hadir</span>
              </div>

              <button
                className="btn-mulai-absensi"
                onClick={handleMulaiAbsen}
              >
                Mulai Absen ({(siswaPerKelas[selectedSchedule.kelas] || []).length} Siswa)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardWakel;
