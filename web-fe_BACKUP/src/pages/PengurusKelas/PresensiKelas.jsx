import { useState, useEffect } from 'react';
import { Calendar, BookOpen, X, QrCode, Eye, Clock } from 'lucide-react';
import NavbarPengurus from "../../components/PengurusKelas/NavbarPengurus";
import './PresensiKelas.css';

// ============================================================
// DATA SISWA ASLI - XII RPL 2
// ============================================================
const dataSiswaAsli = [
  { nama: 'LAURA LAVIDA LOCA',               nisn: '0074182519' },
  { nama: 'LELY SAGITA',                      nisn: '0074320819' },
  { nama: 'MAYA MELINDA WIJAYANTI',           nisn: '0078658367' },
  { nama: 'MOCH. ABYL GUSTIAN',              nisn: '0079292238' },
  { nama: 'MUHAMMAD AMINULLAH',              nisn: '0084421457' },
  { nama: 'Muhammad Azka Fadli Atthaya',     nisn: '0089104721' },
  { nama: 'MUHAMMAD HADI FIRMANSYAH',        nisn: '0087917739' },
  { nama: 'MUHAMMAD HARRIS MAULANA SAPUTRA', nisn: '0074704843' },
  { nama: 'MUHAMMAD IBNU RAFFI AHDAN',       nisn: '0077192596' },
  { nama: 'MUHAMMAD REYHAN ATHADIANSYAH',    nisn: '0075024492' },
  { nama: 'MUHAMMAD WISNU DEWANDARU',        nisn: '0141951182' },
  { nama: 'NABILA RAMADHAN',                 nisn: '0072504970' },
  { nama: 'NADIA SINTA DEVI OKTAVIA',        nisn: '0061631562' },
  { nama: 'NADJWA KIRANA FIRDAUS',           nisn: '0081112175' },
  { nama: 'NINDI NARITA MAULIDYA',           nisn: '0089965810' },
  { nama: 'NISWATUL KHOIRIYAH',              nisn: '0085834363' },
  { nama: 'NOVERITA PASCALIA RAHMA',         nisn: '0087884391' },
  { nama: 'NOVITA ANDRIANI',                 nisn: '0078285764' },
  { nama: 'NOVITA AZZAHRA',                  nisn: '0078980482' },
  { nama: 'NURUL KHASANAH',                  nisn: '0078036100' },
  { nama: 'RACHEL ALUNA MEIZHA',             nisn: '0081838771' },
  { nama: 'RAENA WESTI DHEANOFA HERLIANI',   nisn: '0079312790' },
  { nama: 'RAYHANUN',                         nisn: '0084924963' },
  { nama: 'RAYYAN DAFFA AL AFFANI',          nisn: '0077652198' },
  { nama: 'RHAMEYZHA ALEA CHALILA PUTRI EDWA', nisn: '0087959211' },
  { nama: 'RHEISYA MAULIDDIVA PUTRI',        nisn: '0089530132' },
  { nama: 'RHEYVAN RAMADHAN I.P',            nisn: '0089479412' },
  { nama: 'RISKY RAMADHANI',                 nisn: '0073540571' },
  { nama: 'RITA AURA AGUSTINA',              nisn: '0076610748' },
  { nama: 'RIZKY RAMADHANI',                 nisn: '0077493253' },
  { nama: "SA'IDHATUL HASANA",               nisn: '0076376703' },
  { nama: 'SHISILIA ISMU PUTRI',             nisn: '0072620559' },
  { nama: 'SUCI RAMADANI INDRIANSYAH',       nisn: '0072336597' },
  { nama: 'TALITHA NUDIA RISMATULLAH',       nisn: '0075802873' },
];

// ============================================================
// HELPER: Buat kehadiran default dari data siswa asli
// ============================================================
const buildDefaultAttendance = () =>
  dataSiswaAsli.map((s) => ({
    nisn: s.nisn,
    nama: s.nama,
    status: 'Hadir',   // default
    waktu: `07:0${Math.floor(Math.random() * 9)}`,
    keterangan: null,
  }));

// ============================================================
// CONTOH: surat dispensasi yang sudah diunggah hari ini
// (Dalam implementasi nyata, data ini berasal dari API/state global)
// ============================================================
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const suratDispensiHariIni = [
  // Format: { nisn, keterangan, tanggal }
  { nisn: '0078658367', keterangan: 'Mengikuti lomba tingkat provinsi', tanggal: getTodayString() },
  { nisn: '0089104721', keterangan: 'Kegiatan OSIS',                    tanggal: getTodayString() },
];

// ============================================================
// LOGIC: Override status menjadi DISPEN jika ada surat dispensasi
// ============================================================
const applyDispensiOverride = (kehadiran, tanggalPresensi) => {
  return kehadiran.map((siswa) => {
    const dispen = suratDispensiHariIni.find(
      (s) => s.nisn === siswa.nisn && s.tanggal === tanggalPresensi
    );
    if (dispen) {
      return {
        ...siswa,
        status: 'Dispen',
        waktu: '-',
        keterangan: `Dispensasi${dispen.keterangan ? ` – ${dispen.keterangan}` : ''}`,
      };
    }
    return siswa;
  });
};

// ============================================================
// REKAP: Hitung dari array kehadiran
// ============================================================
const hitungRekap = (kehadiran) => ({
  hadir:     kehadiran.filter((s) => s.status === 'Hadir').length,
  terlambat: kehadiran.filter((s) => s.status === 'Terlambat').length,
  alpha:     kehadiran.filter((s) => s.status === 'Alpha').length,
  dispen:    kehadiran.filter((s) => s.status === 'Dispen').length,
  total:     kehadiran.length,
});

// ============================================================
// DATA JADWAL
// ============================================================
const scheduleData = [
  { id: 1, subject: 'Matematika',    class: 'XII RPL 2', period: 'Jam ke 1 - 2', time: '07:00-08:30', teacher: 'Drs. Ahmad Sudrajat, M.Pd',       qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MTK-XII-RPL2-001' },
  { id: 2, subject: 'MPKK',          class: 'XII RPL 2', period: 'Jam ke 3 - 4', time: '08:30-10:00', teacher: 'Dr. Siti Nurhaliza, S.Kom, M.T',   qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MPKK-XII-RPL2-002' },
  { id: 3, subject: 'Bahasa Indonesia', class: 'XII RPL 2', period: 'Jam ke 5 - 6', time: '10:15-11:45', teacher: 'Sri Wahyuni, S.Pd, M.Pd',      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BIND-XII-RPL2-003' },
  { id: 4, subject: 'PAI',            class: 'XII RPL 2', period: 'Jam ke 7 - 8', time: '12:30-14:00', teacher: 'H. Abdullah Rahman, S.Ag, M.Pd.I', qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAI-XII-RPL2-004' },
  { id: 5, subject: 'PKDK',           class: 'XII RPL 2', period: 'Jam ke 1 - 2', time: '07:00-08:30', teacher: 'Ir. Bambang Sugiarto, M.T',       qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PKDK-XII-RPL2-005' },
  { id: 6, subject: 'MPP',            class: 'XII RPL 2', period: 'Jam ke 3 - 4', time: '08:30-10:00', teacher: 'Dewi Lestari, S.Pd, M.Pd',        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MPP-XII-RPL2-006' },
  { id: 7, subject: 'Bahasa Inggris', class: 'XII RPL 2', period: 'Jam ke 5 - 6', time: '10:15-11:45', teacher: 'Maria Ulfah, S.Pd, M.TESOL',      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BING-XII-RPL2-007' },
  { id: 8, subject: 'Bahasa Jawa',    class: 'XII RPL 2', period: 'Jam ke 7 - 8', time: '12:30-14:00', teacher: 'Pak Paijo Sunarto, S.Pd',          qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BJAWA-XII-RPL2-008' },
];

// ============================================================
// BADGE STATUS CONFIG
// ============================================================
const STATUS_CONFIG = {
  Hadir:     { label: 'HADIR',     className: 'student-status hadir'     },
  Terlambat: { label: 'TERLAMBAT', className: 'student-status terlambat' },
  Alpha:     { label: 'ALPHA',     className: 'student-status alpha'      },
  Dispen:    { label: 'DISPEN',    className: 'student-status dispen'     },
};

// ============================================================
// KOMPONEN UTAMA
// ============================================================
function PresensiKelas() {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showModal, setShowModal]               = useState(false);
  const [modalType, setModalType]               = useState('qr'); // 'qr' | 'detail'
  const [currentDate, setCurrentDate]           = useState('');
  const [currentTime, setCurrentTime]           = useState('');
  const [todayString, setTodayString]           = useState('');
  const [scannedSchedules, setScannedSchedules] = useState({});
  const [qrOpenTime, setQrOpenTime]             = useState(null);

  // Kehadiran per jadwal (diinisialisasi saat scan berhasil)
  const [kehadiranPerJadwal, setKehadiranPerJadwal] = useState({});

  // ── Update jam & tanggal ──────────────────────────────────
  useEffect(() => {
    const updateDateTime = () => {
      const now   = new Date();
      const day   = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year  = now.getFullYear();
      setCurrentDate(`${day}-${month}-${year}`);
      setTodayString(`${year}-${month}-${day}`);

      const hours   = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Auto-mark scanned setelah 10 detik ───────────────────
  useEffect(() => {
    if (qrOpenTime && modalType === 'qr') {
      const checkTime = setInterval(() => {
        const elapsed = (Date.now() - qrOpenTime) / 1000;
        if (elapsed >= 10) {
          handleMarkAsScanned();
          clearInterval(checkTime);
        }
      }, 1000);
      return () => clearInterval(checkTime);
    }
  }, [qrOpenTime, modalType]);

  // ── Helpers ───────────────────────────────────────────────
  const isSchedulePassed = (timeRange) => {
    if (!currentTime) return false;
    const endTime = timeRange.split('-')[1];
    return currentTime > endTime;
  };

  // ── Saat QR di-scan: buat kehadiran + apply override dispen ──
  const handleMarkAsScanned = () => {
    if (!selectedSchedule) return;

    const baseKehadiran    = buildDefaultAttendance();
    const finalKehadiran   = applyDispensiOverride(baseKehadiran, todayString);
    const rekap            = hitungRekap(finalKehadiran);

    setKehadiranPerJadwal((prev) => ({
      ...prev,
      [selectedSchedule.id]: { kehadiran: finalKehadiran, rekap },
    }));

    setScannedSchedules((prev) => ({
      ...prev,
      [selectedSchedule.id]: {
        scanned:   true,
        scannedAt: new Date().toISOString(),
      },
    }));

    closeModal();
  };

  const handleButtonClick = (schedule) => {
    const isScanned = scannedSchedules[schedule.id]?.scanned;
    setSelectedSchedule(schedule);

    if (isScanned) {
      setModalType('detail');
    } else {
      setModalType('qr');
      setQrOpenTime(Date.now());
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSchedule(null);
    setModalType('qr');
    setQrOpenTime(null);
  };

  const getButtonState = (schedule) => {
    const isScanned = scannedSchedules[schedule.id]?.scanned;
    const isPassed  = isSchedulePassed(schedule.time);
    return {
      icon:      isScanned ? Eye : QrCode,
      disabled:  isPassed && !isScanned,
      className: isPassed && !isScanned ? 'qr-button disabled' : 'qr-button',
    };
  };

  // ── Data detail untuk modal ───────────────────────────────
  const currentDetailData = selectedSchedule
    ? kehadiranPerJadwal[selectedSchedule.id]
    : null;

  return (
    <div className="jadwal-page">
      <NavbarPengurus />

      <div className="jadwal-containerr">
        {/* ── Sidebar ── */}
        <div className="jadwal-sidebarr">
          <div className="sidebar-icon">
            <BookOpen size={60} strokeWidth={2} />
          </div>
          <div>
            <h2 className="sidebar-title">XII Rekayasa Perangkat Lunak 2</h2>
            <p className="sidebar-subtitle">Triana Ardianie S.Pd</p>
          </div>
          <div className="sidebar-divider"></div>
        </div>

        {/* ── Content ── */}
        <div className="jadwal-content">
          {/* Date & Time Header */}
          <div className="date-header">
            <Calendar size={20} />
            <span>{currentDate}</span>
            <div className="date-separator"></div>
            <Clock size={20} />
            <span>{currentTime}</span>
          </div>

          {/* Schedule Grid */}
          <div className="schedule-grid">
            {scheduleData.map((schedule) => {
              const buttonState = getButtonState(schedule);
              const ButtonIcon  = buttonState.icon;
              const isScanned   = scannedSchedules[schedule.id]?.scanned;

              return (
                <div key={schedule.id} className="schedule-card">
                  <div className="schedule-info">
                    <div className="schedule-icon-wrapper">
                      <BookOpen size={24} />
                    </div>
                    <div className="schedule-text">
                      <div className="schedule-left">
                        <h3>{schedule.subject}</h3>
                        <p className="schedule-period">{schedule.period}</p>
                      </div>
                      <div className="schedule-right">
                        <p className="schedule-class">{schedule.class}</p>
                        <p className="schedule-time">{schedule.time}</p>
                      </div>
                    </div>
                  </div>
                  <div className="schedule-actions">
                    <button
                      className={buttonState.className}
                      onClick={() => !buttonState.disabled && handleButtonClick(schedule)}
                      title={isScanned ? 'Lihat Detail Kehadiran' : buttonState.disabled ? 'Waktu telah berlalu' : 'Scan QR Code'}
                      disabled={buttonState.disabled}
                    >
                      <ButtonIcon size={32} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && selectedSchedule && (
        <div className="qr-modal-overlay" onClick={closeModal}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
              <h3>{modalType === 'qr' ? 'Scan Kode QR' : 'Detail Kehadiran'}</h3>
              <button className="qr-close-btn" onClick={closeModal}>
                <X size={24} strokeWidth={2} />
              </button>
            </div>

            {/* ── QR Modal ── */}
            {modalType === 'qr' && (
              <div className="qr-modal-body">
                <div className="qr-info">
                  <h4>{selectedSchedule.subject}</h4>
                  <p>{selectedSchedule.class}</p>
                  <p className="qr-period-info">{selectedSchedule.period} • {selectedSchedule.time}</p>
                  <p className="qr-teacher-info">{selectedSchedule.teacher}</p>
                </div>
                <div className="qr-code-container">
                  <img src={selectedSchedule.qrCode} alt="QR Code" className="qr-code-image" />
                </div>
                <p className="qr-instruction">Scan kode QR di atas untuk melakukan presensi</p>
                <p className="qr-timer">QR Code akan otomatis ditandai sebagai ter-scan dalam 10 detik</p>
              </div>
            )}

            {/* ── Detail Modal ── */}
            {modalType === 'detail' && currentDetailData && (
              <div className="detail-modal-body">
                {/* Header Info */}
                <div className="detail-header-info">
                  <div className="detail-subject">
                    <h4>{selectedSchedule.subject}</h4>
                    <p>{selectedSchedule.class}</p>
                  </div>
                  <div className="detail-schedule">
                    <p className="detail-period">{selectedSchedule.period}</p>
                    <p className="detail-time">{selectedSchedule.time}</p>
                  </div>
                </div>

                <div className="detail-teacher">
                  <strong>Guru:</strong> {selectedSchedule.teacher}
                </div>

                {/* ── REKAP: Hadir | Terlambat | Alpha | Dispen ── */}
                <div className="attendance-summary">
                  <div className="summary-card present">
                    <div className="summary-number">{currentDetailData.rekap.hadir}</div>
                    <div className="summary-label">Hadir</div>
                  </div>
                  <div className="summary-card late">
                    <div className="summary-number">{currentDetailData.rekap.terlambat}</div>
                    <div className="summary-label">Terlambat</div>
                  </div>
                  <div className="summary-card absent">
                    <div className="summary-number">{currentDetailData.rekap.alpha}</div>
                    <div className="summary-label">Alpha</div>
                  </div>
                  {/* ✅ Rekap Dispen */}
                  <div className="summary-card dispen">
                    <div className="summary-number">{currentDetailData.rekap.dispen}</div>
                    <div className="summary-label">Dispen</div>
                  </div>
                </div>

                {/* ── Daftar Kehadiran Siswa ── */}
                <div className="attendance-list">
                  <h5>
                    Daftar Kehadiran
                    <span className="attendance-count">{currentDetailData.kehadiran.length} siswa</span>
                  </h5>
                  <div className="attendance-table">
                    {currentDetailData.kehadiran.map((siswa, idx) => {
                      const badgeCfg = STATUS_CONFIG[siswa.status] || STATUS_CONFIG.Hadir;
                      return (
                        <div key={siswa.nisn} className="attendance-row">
                          <div className="student-info">
                            <span className="student-number">{idx + 1}.</span>
                            <div className="student-name-block">
                              <span className="student-name">{siswa.nama}</span>
                              {/* ✅ Keterangan Dispen di bawah nama */}
                              {siswa.keterangan && (
                                <span className="student-keterangan">{siswa.keterangan}</span>
                              )}
                            </div>
                          </div>
                          <div className="student-status-group">
                            <span className={badgeCfg.className}>{badgeCfg.label}</span>
                            <span className="student-time">{siswa.waktu}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scan Info */}
                <div className="scanned-info">
                  <p>✓ QR Code telah di-scan oleh guru</p>
                  <p className="scan-time">
                    Waktu scan: {new Date(scannedSchedules[selectedSchedule.id]?.scannedAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PresensiKelas;