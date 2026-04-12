import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardWakel.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';

// ============================================================
// ⚙️  DUMMY DATA & MOCK (untuk testing) — hapus saat production
// ============================================================
const _STORAGE_KEY = 'absensi_history';

const isJadwalCompleted = (jadwalId, tanggal) => {
  try {
    const stored = localStorage.getItem(_STORAGE_KEY);
    const history = stored ? JSON.parse(stored) : {};
    return !!history[`${jadwalId}_${tanggal}`];
  } catch { return false; }
};

// 🧪 Dummy data wali kelas — ganti dengan data dari API/backend saat production
const _DUMMY_WAKEL = {
  nama: 'Nama Wali Kelas',
  nip: '198001012005012001',
  role: 'Wali Kelas XII RPL 1',
};

// 🧪 Dummy jadwal — ganti dengan data dari API/backend saat production
const _DUMMY_JADWAL = [
  {
    id: 'jadwal_wk_001',
    mataPelajaran: 'Pemrograman Web',
    kelas: 'XII RPL 1',
    jamKe: '3',
    waktu: '08:30 - 09:15',
  },
  {
    id: 'jadwal_wk_002',
    mataPelajaran: 'Basis Data',
    kelas: 'XII RPL 1',
    jamKe: '5',
    waktu: '10:15 - 11:00',
  },
  {
    id: 'jadwal_wk_003',
    mataPelajaran: 'Pemrograman Mobile',
    kelas: 'XII RPL 1',
    jamKe: '7',
    waktu: '12:30 - 13:15',
  },
];

// 🧪 Dummy siswa per kelas — ganti dengan data dari API/backend saat production
const _DUMMY_SISWA = {
  'XII RPL 1': [
    { nisn: '7115/1006.063', nama: 'Abrory Akbar Al Batami' },
    { nisn: '7116/1007.063', nama: 'Afif Firmansyah' },
    { nisn: '7117/1008.063', nama: 'Agies Widyawati' },
    { nisn: '7118/1009.063', nama: 'Agil Rifatul Haq' },
    { nisn: '7119/1010.063', nama: 'Akh. Septian Ramadhan' },
    { nisn: '7120/1011.063', nama: 'Alya Fitri Larasati' },
    { nisn: '7122/1013.063', nama: 'Anastasya Dyah Ayu Proboningrum' },
    { nisn: '7123/1014.063', nama: 'Anisa Puspitasari' },
    { nisn: '7124/1015.063', nama: 'Anissa Prisilvia Tahara' },
    { nisn: '7125/1016.063', nama: 'Aqilla Maulidyah' },
    { nisn: '7126/1017.063', nama: 'Aqlina Failia Lifara Aizani' },
    { nisn: '7127/1018.063', nama: 'Aristia Faren Rafaela' },
    { nisn: '7128/1019.063', nama: 'Asyharli Kahfi Dewanda' },
    { nisn: '7129/1020.063', nama: 'Athaar Putra Ruhenda' },
    { nisn: '7130/1021.063', nama: 'Avriliana Anjani' },
    { nisn: '7131/1022.063', nama: 'Azhar Anisatul Jannah' },
    { nisn: '7132/1023.063', nama: 'Bintang Firman Ardana' },
    { nisn: '7133/1024.063', nama: 'Callista Shafa Ramadhani' },
    { nisn: '7134/1025.063', nama: 'Chevy Aprilia Hutabarat' },
    { nisn: '7135/1026.063', nama: 'Cindi Tri Prasetyo' },
    { nisn: '7136/1027.063', nama: 'Cintya Karina Putri' },
    { nisn: '7137/1028.063', nama: 'Dhia Mirza Fandhiono' },
    { nisn: '7138/1029.063', nama: 'Diandhika Dwi Pranata' },
    { nisn: '7139/1030.063', nama: 'Fairuz Quds Zahran Firdaus' },
    { nisn: '7140/1031.063', nama: 'Fardan Rasyah Islami' },
    { nisn: '7141/1032.063', nama: 'Fatchur Rohman Rofian' },
    { nisn: '7142/1033.063', nama: 'Fidatul Avina' },
    { nisn: '7143/1034.063', nama: 'Firil Zulfa Azzahra' },
    { nisn: '7144/1035.063', nama: 'Hapsari Ismartoyo' },
    { nisn: '7145/1036.063', nama: 'Havid Abdilah Surahmad' },
    { nisn: '7146/1037.063', nama: 'Ignacia Zandra' },
    { nisn: '7147/1038.063', nama: 'Iqbal Lazuardi' },
    { nisn: '7148/1039.063', nama: 'Iqlimahda Tanzilla Finan Diva' },
    { nisn: '7149/1040.063', nama: 'Irdina Marsya Mazarina' },
    { nisn: '7150/1041.063', nama: 'Isabel Cahaya Hati' },
    { nisn: '7151/1042.063', nama: "Khoirun Ni'Mah Nurul Hidayah" },
  ],
  'XII RPL 2': [
    { nisn: '7152/1043.063', nama: 'Laura Lavida Loca' },
    { nisn: '7153/1044.063', nama: 'Lely Sagita' },
    { nisn: '7154/1045.063', nama: 'Maya Mellinda Wijayanti' },
    { nisn: '7156/1047.063', nama: 'Moch. Abyl Gustian' },
    { nisn: '7157/1048.063', nama: 'Muhammad Aminullah' },
    { nisn: '7158/1049.063', nama: 'Muhammad Azka Fadli Atthaya' },
    { nisn: '7159/1050.063', nama: 'Muhammad Hadi Firmansyah' },
    { nisn: '7160/1051.063', nama: 'Muhammad Harris Maulana Saputra' },
    { nisn: '7161/1052.063', nama: 'Muhammad Ibnu Raffi Ahdan' },
    { nisn: '7162/1053.063', nama: 'Muhammad Reyhan Alhadiansyah' },
    { nisn: '7163/1054.063', nama: 'Muhammad Wisnu Dewandaru' },
    { nisn: '7164/1055.063', nama: 'Nabila Ramadhani' },
    { nisn: '7165/1056.063', nama: 'Nadia Sinta Devi Oktavia' },
    { nisn: '7166/1057.063', nama: 'Nadjwa Kirana Firdaus' },
    { nisn: '7167/1058.063', nama: 'Nindi Narita Maulidya' },
    { nisn: '7168/1059.063', nama: 'Niswatul Khoiriyah' },
    { nisn: '7169/1060.063', nama: 'Noverita Pascalia Rahma' },
    { nisn: '7170/1061.063', nama: 'Novita Andriani' },
    { nisn: '7171/1062.063', nama: 'Novita Azzahra' },
    { nisn: '7172/1063.063', nama: 'Nurul Khasanah' },
    { nisn: '7173/1064.063', nama: 'Rachel Aluna Meizha' },
    { nisn: '7174/1065.063', nama: 'Raena Westi Dheanofa Herliani' },
    { nisn: '7175/1066.063', nama: 'Rayhanun' },
    { nisn: '7176/1067.063', nama: 'Rayyan Daffa Al Affani' },
    { nisn: '7177/1068.063', nama: 'Rhameyzha Alea Chalila Putri Edward' },
    { nisn: '7178/1069.063', nama: 'Rheisya Mauliddiva Putri' },
    { nisn: '7179/1070.063', nama: 'Rheyyan Ramadhan I.P' },
    { nisn: '7180/1071.063', nama: 'Risky Ramadhani' },
    { nisn: '7181/1072.063', nama: 'Rita Aura Agustina' },
    { nisn: '7182/1073.063', nama: 'Rizky Ramadhani' },
    { nisn: '7184/1075.063', nama: "Sa'idhatul Hasana" },
    { nisn: '7185/1076.063', nama: 'Shisilia Ismu Putri' },
    { nisn: '7186/1077.063', nama: 'Suci Ramadani Indriansyah' },
    { nisn: '7187/1078.063', nama: 'Talitha Nudia Rismatullah' },
  ],
};
// ============================================================
// 🔚 AKHIR DUMMY DATA
// ============================================================

const DashboardWakel = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentFormattedDate, setCurrentFormattedDate] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [qrVerified, setQrVerified] = useState(false);

  // 🧪 Gunakan dummy data — ganti dengan data dari API saat production
  const waliKelas = _DUMMY_WAKEL;
  const allJadwal = _DUMMY_JADWAL;
  const siswaPerKelas = _DUMMY_SISWA;

  const totalSiswa = (siswaPerKelas[waliKelas.role.split(' ').slice(-2).join(' ')] || []).length;

  // State untuk melacak jadwal yang sudah selesai absensi
  const [completedAbsensi, setCompletedAbsensi] = useState(new Set());

  // Load completed absensi saat mount dan saat kembali dari presensi
  useEffect(() => {
    const loadCompletedAbsensi = () => {
      const completed = new Set();
      allJadwal.forEach(jadwal => {
        if (isJadwalCompleted(jadwal.id, currentFormattedDate)) {
          completed.add(jadwal.id);
        }
      });
      setCompletedAbsensi(completed);
    };

    if (currentFormattedDate) {
      loadCompletedAbsensi();
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && currentFormattedDate) {
        loadCompletedAbsensi();
      }
    };

    const handleFocus = () => {
      if (currentFormattedDate) {
        loadCompletedAbsensi();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentFormattedDate]);

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
      const isCompleted = isJadwalCompleted(selectedSchedule.id, currentFormattedDate);
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
          isEdit: isCompleted,
        }
      });
    }
  };

  const simulateScanSuccess = () => handleQrVerified();

  const handleLogout = () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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