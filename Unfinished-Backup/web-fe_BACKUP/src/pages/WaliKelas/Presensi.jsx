import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Presensi.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';

// ============================================================
// ⚙️  DUMMY DATA & MOCK FUNCTIONS (untuk testing)
// ============================================================

const _siswaDummy = {
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

const _STORAGE_KEY = 'absensi_history';

const generateSiswaList = (kelas, jadwalId, tanggal, daftarSiswaFromState) => {
  const stored = localStorage.getItem(_STORAGE_KEY);
  const history = stored ? JSON.parse(stored) : {};
  const key = `${jadwalId}_${tanggal}`;
  if (history[key]) return history[key].dataAbsensi;
  // Gunakan daftarSiswa dari state jika ada, fallback ke dummy
  const siswaDasar = daftarSiswaFromState && daftarSiswaFromState.length > 0
    ? daftarSiswaFromState
    : (_siswaDummy[kelas] || []);
  return siswaDasar.map((siswa, index) => ({
    no: index + 1,
    nisn: siswa.nisn,
    nama: siswa.nama,
    status: '',
    keterangan: null,
    dokumen: null,
  }));
};

const saveAbsensi = (jadwalId, tanggal, kelas, mataPelajaran, jamKe, dataAbsensi) => {
  try {
    const stored = localStorage.getItem(_STORAGE_KEY);
    const history = stored ? JSON.parse(stored) : {};
    const key = `${jadwalId}_${tanggal}`;
    history[key] = { jadwalId, tanggal, kelas, mataPelajaran, jamKe, dataAbsensi, updatedAt: new Date().toISOString() };
    localStorage.setItem(_STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (e) {
    return false;
  }
};

// ============================================================
// 🔚 AKHIR DUMMY DATA
// ============================================================

// Angka jam ke- 1–10
const JAM_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Dropdown angka sederhana (reusable)
const JamSelect = ({ id, value, onChange, placeholder }) => (
  <select id={id} className="input-select jam-angka-select" value={value} onChange={onChange}>
    <option value="">{placeholder || '–'}</option>
    {JAM_OPTIONS.map((n) => (
      <option key={n} value={String(n)}>{n}</option>
    ))}
  </select>
);

function Presensi() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const hasScheduleData = state.mataPelajaran && state.kelas;

  const jadwalId      = state.jadwalId      || null;
  const mataPelajaran = state.mataPelajaran  || '';
  const jamKe         = state.jamKe          || '';
  const kelas         = state.kelas          || '';
  const waktu         = state.waktu          || '';
  const tanggal       = state.tanggal        || '';
  const isEdit        = state.isEdit         || false;

  const [mode, setMode] = useState(isEdit ? 'view' : 'input');
  const [showKeteranganModal, setShowKeteranganModal] = useState(false);
  const [showDokumenModal, setShowDokumenModal]       = useState(false);
  const [currentSiswaIndex, setCurrentSiswaIndex]     = useState(null);
  const [keteranganTipe, setKeteranganTipe]           = useState('');

  const _emptyForm = { alasan: '', jamDari: '', jamSampai: '', file: null, fileName: '' };
  const [keteranganForm, setKeteranganForm] = useState(_emptyForm);

  const [siswaList, setSiswaList] = useState([]);

  useEffect(() => {
    if (kelas && jadwalId && tanggal) {
      const data = generateSiswaList(kelas, jadwalId, tanggal, state.daftarSiswa);
      setSiswaList(data);
    }
  }, [kelas, jadwalId, tanggal, isEdit]);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const getStatusColor = (status) => {
    const colors = { izin: '#fac629', sakit: '#9c27b0', pulang: '#123cd3', terlambat: '#FF5F1A', dispen: '#e91e8c' };
    return colors[status?.toLowerCase()] || '#64748b';
  };

  const getSuratTitle = (jenisSurat) => {
    const map = {
      'Surat Dokter': 'Surat Keterangan Sakit',
      'Surat Izin Orang Tua': 'Surat Izin Orang Tua / Wali',
      'Surat Keterangan Pulang': 'Surat Keterangan Pulang Cepat',
      'Surat Izin Telat': 'Surat Keterangan Keterlambatan',
      'Surat Dispensasi': 'Surat Dispensasi',
    };
    return map[jenisSurat] || 'Surat Keterangan';
  };

  // ─── Buka modal ─────────────────────────────────────────────────────────────
  const handleStatusChange = (index, newStatus) => {
    if (newStatus === 'terlambat' || newStatus === 'pulang' || newStatus === 'dispen') {
      setCurrentSiswaIndex(index);
      setKeteranganTipe(newStatus);
      setShowKeteranganModal(true);
      setKeteranganForm(_emptyForm);
    } else {
      const updated = [...siswaList];
      updated[index].status = newStatus;
      updated[index].keterangan =
        newStatus === 'hadir' ? { auto: true, text: 'Hadir tepat waktu' } :
        newStatus === 'alfa'  ? { auto: true, text: 'Tidak hadir tanpa keterangan' } :
        null;
      setSiswaList(updated);
    }
  };

  // ─── Validasi & simpan keterangan ──────────────────────────────────────────
  const handleSimpanKeterangan = () => {
    const { alasan, jamDari, jamSampai } = keteranganForm;

    if (!alasan.trim()) {
      alert('Mohon isi alasan!');
      return;
    }
    if (!jamDari) {
      alert('Mohon pilih jam mulai (Dari)!');
      return;
    }
    if ((keteranganTipe === 'pulang' || keteranganTipe === 'dispen') && !jamSampai) {
      alert('Mohon pilih jam selesai (Sampai)!');
      return;
    }
    if (jamSampai && parseInt(jamSampai) < parseInt(jamDari)) {
      alert('Jam Sampai tidak boleh lebih kecil dari jam Dari!');
      return;
    }

    const updated = [...siswaList];
    const siswa   = updated[currentSiswaIndex];

    const rangeText = jamSampai
      ? `Jam Ke-${jamDari} s/d Jam Ke-${jamSampai}`
      : `Jam Ke-${jamDari}`;

    const labelPrefix = { terlambat: 'Terlambat', pulang: 'Pulang', dispen: 'Dispensasi' };
    const suratJenis  = { terlambat: 'Surat Izin Telat', pulang: 'Surat Keterangan Pulang', dispen: 'Surat Dispensasi' };

    siswa.status = keteranganTipe;
    siswa.keterangan = {
      alasan,
      jamDari,
      jamSampai: jamSampai || null,
      text: `${labelPrefix[keteranganTipe]} ${rangeText}`,
    };
    siswa.dokumen = keteranganForm.file
      ? {
          jenis: suratJenis[keteranganTipe],
          tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          file: keteranganForm.fileName,
          fileUrl: URL.createObjectURL(keteranganForm.file),
          keterangan: alasan,
        }
      : null;

    setSiswaList(updated);
    setShowKeteranganModal(false);
    setCurrentSiswaIndex(null);
    setKeteranganForm(_emptyForm);
  };

  const handleBatalKeterangan = () => {
    setShowKeteranganModal(false);
    setCurrentSiswaIndex(null);
    setKeteranganForm(_emptyForm);
  };

  // ─── Simpan presensi ────────────────────────────────────────────────────────
  const handleSimpan = () => {
    const belum = siswaList.filter((s) => !s.status || s.status === '');
    if (belum.length > 0) {
      alert(`⚠️ Masih ada ${belum.length} siswa yang belum dipresensi!\n\nSilakan lengkapi presensi untuk semua siswa.`);
      return;
    }
    const saved = saveAbsensi(jadwalId, tanggal, kelas, mataPelajaran, jamKe, siswaList);
    if (saved) {
      const s = siswaList;
      alert(
        `✅ PRESENSI BERHASIL DISIMPAN!\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Kelas: ${kelas}\nMata Pelajaran: ${mataPelajaran}\nTanggal: ${tanggal}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📊 RINGKASAN KEHADIRAN:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `✓ Hadir         : ${s.filter(x => x.status === 'hadir').length} siswa\n` +
        `🏥 Sakit         : ${s.filter(x => x.status === 'sakit').length} siswa\n` +
        `📄 Izin          : ${s.filter(x => x.status === 'izin').length} siswa\n` +
        `❌ Alfa          : ${s.filter(x => x.status === 'alfa').length} siswa\n` +
        `⏰ Terlambat     : ${s.filter(x => x.status === 'terlambat').length} siswa\n` +
        `🏃 Pulang Cepat  : ${s.filter(x => x.status === 'pulang').length} siswa\n` +
        `📋 Dispensasi    : ${s.filter(x => x.status === 'dispen').length} siswa\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTotal: ${s.length} siswa`
      );
      setMode('view');
      setTimeout(() => navigate('/walikelas/dashboard'), 2000);
    } else {
      alert('❌ Gagal menyimpan presensi!\n\nSilakan coba lagi atau hubungi administrator.');
    }
  };

  const handleEdit            = () => setMode('input');
  const handleBackToDashboard = () => navigate('/walikelas/dashboard');

  const handleLihatDokumen = (siswa) => {
    setCurrentSiswaIndex(siswaList.findIndex((s) => s.nisn === siswa.nisn));
    setShowDokumenModal(true);
  };
  const handleCloseDokumen = () => {
    setShowDokumenModal(false);
    setCurrentSiswaIndex(null);
  };
  const handleDownloadSurat = () => {
    const dok = siswaList[currentSiswaIndex]?.dokumen;
    if (dok) {
      const link = document.createElement('a');
      link.href = dok.fileUrl;
      link.download = dok.file;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ─── Badge helpers ──────────────────────────────────────────────────────────
  const getStatusBadge = (siswa) => {
    const map = { hadir: 'Hadir', alfa: 'Alfa', terlambat: 'Terlambat', pulang: 'Pulang', sakit: 'Sakit', izin: 'Izin', dispen: 'Dispen' };
    if (!map[siswa.status]) return null;
    return <span className={`status-badge ${siswa.status}`}>{map[siswa.status]}</span>;
  };

  const getDokumenBadge = (siswa) => {
    if (!['sakit', 'izin', 'pulang', 'terlambat', 'dispen'].includes(siswa.status)) return null;
    if (siswa.dokumen) {
      return (
        <button className="btn-lihat-dokumen" onClick={() => handleLihatDokumen(siswa)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          Lihat Surat
        </button>
      );
    }
    return <span className="no-dokumen-label">Belum unggah</span>;
  };

  const renderKeteranganText = (siswa) => {
    const { keterangan, status } = siswa;
    if (!keterangan) return null;
    if (keterangan.auto) {
      return (
        <div className="keterangan-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          {keterangan.text}
        </div>
      );
    }
    if (keterangan.text) {
      const cls =
        status === 'dispen' ? 'keterangan-terlambat keterangan-dispen' :
        status === 'pulang' ? 'keterangan-terlambat keterangan-pulang' :
        'keterangan-terlambat';
      return (
        <div className={cls}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {keterangan.text}
        </div>
      );
    }
    return null;
  };

  // ─── Guard ──────────────────────────────────────────────────────────────────
  if (!hasScheduleData) {
    return (
      <div className="presensi-container">
        <NavbarWakel />
        <div className="no-schedule-wrapper">
          <div className="no-schedule-card">
            <div className="no-schedule-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
              </svg>
            </div>
            <h2>Tidak Ada Jadwal Dipilih</h2>
            <p>Silakan pilih jadwal dari dashboard terlebih dahulu untuk melakukan presensi.</p>
            <button className="btn-back-dashboard" onClick={handleBackToDashboard}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render utama ────────────────────────────────────────────────────────────
  return (
    <div className="presensi-container">
      <NavbarWakel />

      {/* ============ HEADER BAR ============ */}
      <div className="kehadiran-header-bar">
        <div className="header-left-section">
          <div className="class-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
            </svg>
          </div>
          <div className="class-info">
            <h2 className="class-title">{kelas}</h2>
            <p className="class-subtitle">Jam Ke-{jamKe}</p>
          </div>
        </div>

        <div className="kelas-and-action">
          <div className="kelas-pill">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            {mataPelajaran} ({jamKe})
          </div>
          <div className="tanggal-pill">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {tanggal}
          </div>
          {mode === 'input' && (
            <button className="btn-simpan-presensi" onClick={handleSimpan}>Simpan</button>
          )}
        </div>
      </div>

      {/* ============ MODE INPUT ============ */}
      {mode === 'input' && (
        <div className="presensi-table-wrapper">
          <table className="presensi-table2">
            <thead>
              <tr>
                <th>No</th><th>NISN</th><th>Nama Siswa</th>
                <th>Hadir</th><th>Sakit</th><th>Izin</th><th>Alfa</th>
                <th>Terlambat</th><th>Pulang</th><th>Dispen</th>
              </tr>
            </thead>
            <tbody>
              {siswaList.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <strong>Tidak ada data siswa</strong>
                      <p style={{ fontSize: '14px', marginTop: '5px' }}>Pastikan data siswa sudah tersedia</p>
                    </div>
                  </td>
                </tr>
              ) : (
                siswaList.map((siswa, index) => (
                  <tr key={index}>
                    <td>{siswa.no}.</td>
                    <td>{siswa.nisn}</td>
                    <td>{siswa.nama}</td>
                    {['hadir', 'sakit', 'izin', 'alfa', 'terlambat', 'pulang', 'dispen'].map((st) => (
                      <td key={st} className="radio-cell">
                        <input type="radio" name={`status-${index}`}
                          checked={siswa.status === st}
                          onChange={() => handleStatusChange(index, st)} />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ============ MODE VIEW ============ */}
      {mode === 'view' && (
        <div className="kehadiran-view-wrapper">
          <table className="kehadiran-view-table">
            <thead>
              <tr>
                <th>No</th><th>NISN</th><th>Nama Siswa</th>
                <th>Mata Pelajaran</th><th>Status</th><th>Keterangan</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {siswaList.map((siswa, index) => (
                <tr key={index}>
                  <td>{siswa.no}.</td>
                  <td>{siswa.nisn}</td>
                  <td>{siswa.nama}</td>
                  <td>{mataPelajaran}</td>
                  <td>{getStatusBadge(siswa)}</td>
                  <td>
                    <div className="keterangan-wrapper">
                      {getDokumenBadge(siswa)}
                      {siswa.keterangan ? (
                        <div className="keterangan-detail">{renderKeteranganText(siswa)}</div>
                      ) : (
                        !getDokumenBadge(siswa) && <span className="no-keterangan">-</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={handleEdit}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ============ MODAL KETERANGAN ============ */}
      {showKeteranganModal && (
        <div className="modal-overlay" onClick={handleBatalKeterangan}>
          <div className="modal-keterangan" onClick={(e) => e.stopPropagation()}>
            <div className="modal-keterangan-header">
              <h2>
                {keteranganTipe === 'terlambat' && 'Keterangan Terlambat'}
                {keteranganTipe === 'pulang'    && 'Keterangan Pulang'}
                {keteranganTipe === 'dispen'    && 'Keterangan Dispensasi'}
              </h2>
              <button className="close-btn" onClick={handleBatalKeterangan}>×</button>
            </div>

            <div className="keterangan-form">
              <div className="siswa-info-box">
                <strong>{siswaList[currentSiswaIndex]?.nama}</strong>
                <span className="siswa-nisn">{siswaList[currentSiswaIndex]?.nisn}</span>
              </div>

              {/* ── Jam Ke- Dari & Sampai ─────────────────────────────── */}
              <div className="form-group">
                <label>
                  Jam Ke- <span className="label-required">*</span>
                  {keteranganTipe === 'terlambat' && (
                    <span className="label-optional"> (Sampai opsional)</span>
                  )}
                </label>
                <div className="jam-range-wrapper">
                  <div className="jam-range-item">
                    <span className="jam-range-label">Dari</span>
                    <JamSelect
                      id="jam-dari"
                      value={keteranganForm.jamDari}
                      onChange={(e) => setKeteranganForm({ ...keteranganForm, jamDari: e.target.value })}
                    />
                  </div>
                  <span className="jam-range-sep">s/d</span>
                  <div className="jam-range-item">
                    <span className="jam-range-label">Sampai</span>
                    <JamSelect
                      id="jam-sampai"
                      value={keteranganForm.jamSampai}
                      onChange={(e) => setKeteranganForm({ ...keteranganForm, jamSampai: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* ── Upload surat ─────────────────────────────────────── */}
              <div className="form-group">
                <label>
                  {keteranganTipe === 'terlambat' && 'Unggah Surat Keterlambatan (Opsional)'}
                  {keteranganTipe === 'pulang'    && 'Unggah Surat Perizinan Pulang'}
                  {keteranganTipe === 'dispen'    && 'Unggah Surat Dispensasi (Opsional)'}
                </label>
                <div className="file-upload-wrapper">
                  <input type="file" id={`file-upload-${keteranganTipe}`} accept="image/jpg, image/png"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setKeteranganForm({ ...keteranganForm, file, fileName: file.name });
                    }}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor={`file-upload-${keteranganTipe}`} className="file-upload-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    {keteranganForm.fileName || 'Unggah Dokumen'}
                  </label>
                  {keteranganForm.fileName && (
                    <button type="button" className="btn-remove-file"
                      onClick={() => setKeteranganForm({ ...keteranganForm, file: null, fileName: '' })}>
                      ✕
                    </button>
                  )}
                </div>
                <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  Format: JPG/JPEG, PNG (Maks. 5MB)
                </small>
              </div>

              {/* ── Alasan ─────────────────────────────────────────────── */}
              <div className="form-group">
                <label>Alasan <span className="label-required">*</span></label>
                <textarea
                  placeholder={
                    keteranganTipe === 'terlambat' ? 'Masukkan alasan terlambat...' :
                    keteranganTipe === 'pulang'    ? 'Masukkan alasan pulang cepat...' :
                    'Masukkan alasan dispensasi...'
                  }
                  className="input-textarea"
                  rows="4"
                  value={keteranganForm.alasan}
                  onChange={(e) => setKeteranganForm({ ...keteranganForm, alasan: e.target.value })}
                  required
                />
              </div>

              <div className="modal-buttons">
                <button className="btn-batal-keterangan" onClick={handleBatalKeterangan}>Batal</button>
                <button className="btn-simpan-keterangan" onClick={handleSimpanKeterangan}>Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL LIHAT DOKUMEN ============ */}
      {showDokumenModal && currentSiswaIndex !== null && siswaList[currentSiswaIndex]?.dokumen && (
        <div className="preview-modal-overlay" onClick={handleCloseDokumen}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <div>
                <h3>{getSuratTitle(siswaList[currentSiswaIndex]?.dokumen.jenis)}</h3>
                <p className="file-name">{siswaList[currentSiswaIndex]?.dokumen.file}</p>
              </div>
              <button className="close-preview" onClick={handleCloseDokumen} title="Tutup">✕</button>
            </div>

            <div className="preview-info-card">
              <div className="preview-info-row">
                <div className="preview-info-item">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    Nama Siswa
                  </span>
                  <span className="preview-info-value">{siswaList[currentSiswaIndex]?.nama}</span>
                </div>
                <div className="preview-info-item">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    NISN
                  </span>
                  <span className="preview-info-value">{siswaList[currentSiswaIndex]?.nisn}</span>
                </div>
                <div className="preview-info-item">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    Jenis Surat
                  </span>
                  <span className="preview-info-value">
                    <span className="preview-status-badge"
                      style={{ backgroundColor: getStatusColor(siswaList[currentSiswaIndex]?.status) }}>
                      {siswaList[currentSiswaIndex]?.status.charAt(0).toUpperCase() +
                        siswaList[currentSiswaIndex]?.status.slice(1)}
                    </span>
                  </span>
                </div>
              </div>
              {siswaList[currentSiswaIndex]?.dokumen.keterangan && (
                <div className="preview-info-keterangan">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"/></svg>
                    Keterangan
                  </span>
                  <span className="preview-info-value preview-keterangan-text">
                    {siswaList[currentSiswaIndex]?.dokumen.keterangan}
                  </span>
                </div>
              )}
            </div>

            <div className="preview-modal-body">
              <img src={siswaList[currentSiswaIndex]?.dokumen.fileUrl} alt="Surat.jpg" className="image-preview" />
            </div>

            <div className="preview-modal-footer">
              <button className="btn-download" onClick={handleDownloadSurat}>📥 Unduh Surat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Presensi;