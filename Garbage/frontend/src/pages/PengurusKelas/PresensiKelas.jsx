import { useState, useEffect } from 'react';
import { Calendar, BookOpen, X, QrCode, Eye, Clock } from 'lucide-react';
import NavbarPengurus from "../../components/PengurusKelas/NavbarPengurus";
import './PresensiKelas.css';

const scheduleData = [
  {
    id: 1,
    subject: 'Matematika',
    class: 'XII RPL 2',
    period: 'Jam ke 1 - 2',
    time: '07:00-08:30',
    teacher: 'Drs. Ahmad Sudrajat, M.Pd',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MTK-XII-RPL2-001'
  },
  {
    id: 2,
    subject: 'MPKK',
    class: 'XII RPL 2',
    period: 'Jam ke 3 - 4',
    time: '08:30-10:00',
    teacher: 'Dr. Siti Nurhaliza, S.Kom, M.T',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MPKK-XII-RPL2-002'
  },
  {
    id: 3,
    subject: 'Bahasa Indonesia',
    class: 'XII RPL 2',
    period: 'Jam ke 5 - 6',
    time: '10:15-11:45',
    teacher: 'Sri Wahyuni, S.Pd, M.Pd',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BIND-XII-RPL2-003'
  },
  {
    id: 4,
    subject: 'PAI',
    class: 'XII RPL 2',
    period: 'Jam ke 7 - 8',
    time: '12:30-14:00',
    teacher: 'H. Abdullah Rahman, S.Ag, M.Pd.I',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAI-XII-RPL2-004'
  },
  {
    id: 5,
    subject: 'PKDK',
    class: 'XII RPL 2',
    period: 'Jam ke 1 - 2',
    time: '07:00-08:30',
    teacher: 'Ir. Bambang Sugiarto, M.T',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PKDK-XII-RPL2-005'
  },
  {
    id: 6,
    subject: 'MPP',
    class: 'XII RPL 2',
    period: 'Jam ke 3 - 4',
    time: '08:30-10:00',
    teacher: 'Dewi Lestari, S.Pd, M.Pd',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MPP-XII-RPL2-006'
  },
  {
    id: 7,
    subject: 'Bahasa Inggris',
    class: 'XII RPL 2',
    period: 'Jam ke 5 - 6',
    time: '10:15-11:45',
    teacher: 'Maria Ulfah, S.Pd, M.TESOL',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BING-XII-RPL2-007'
  },
  {
    id: 8,
    subject: 'Bahasa Jawa',
    class: 'XII RPL 2',
    period: 'Jam ke 7 - 8',
    time: '12:30-14:00',
    teacher: 'Pak Paijo Sunarto, S.Pd',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BJAWA-XII-RPL2-008'
  },
  {
    id: 9,
    subject: 'Bahasa Jawa',
    class: 'XII RPL 2',
    period: 'Jam ke 7 - 8',
    time: '12:30-19:00',
    teacher: 'Pak Paijo Sunarto, S.Pd',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BJAWA-XII-RPL2-008'
  }
];

// Dummy attendance data
const dummyAttendance = {
  totalStudents: 36,
  present: 32,
  late: 2,
  absent: 2,
  students: [
    { name: 'Ahmad Fauzi', status: 'Hadir', time: '07:05' },
    { name: 'Siti Aminah', status: 'Hadir', time: '07:03' },
    { name: 'Budi Santoso', status: 'Hadir', time: '07:02' },
    { name: 'Dewi Ratnasari', status: 'Terlambat', time: '07:25' },
    { name: 'Eko Prasetyo', status: 'Hadir', time: '07:01' },
    { name: 'Fitri Handayani', status: 'Hadir', time: '07:04' },
    { name: 'Gilang Ramadhan', status: 'Alpha', time: '-' },
    { name: 'Hana Wijaya', status: 'Hadir', time: '07:06' },
  ]
};

function PresensiKelas() {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('qr'); // 'qr' or 'detail'
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [scannedSchedules, setScannedSchedules] = useState({});
  const [qrOpenTime, setQrOpenTime] = useState(null);

  useEffect(() => {
    // Function to format date and time
    const updateDateTime = () => {
      const now = new Date();
      
      // Format date
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      setCurrentDate(`${day}-${month}-${year}`);
      
      // Format time
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    // Set initial date and time
    updateDateTime();

    // Update every second for realtime
    const interval = setInterval(() => {
      updateDateTime();
    }, 1000);

    // Cleanup interval
    return () => clearInterval(interval);
  }, []);

  // Check if QR modal has been open for more than 10 seconds
  useEffect(() => {
    if (qrOpenTime && modalType === 'qr') {
      const checkTime = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - qrOpenTime) / 1000; // seconds
        
        if (elapsed >= 10) {
          // Mark as scanned after 10 seconds
          handleMarkAsScanned();
          clearInterval(checkTime);
        }
      }, 1000);

      return () => clearInterval(checkTime);
    }
  }, [qrOpenTime, modalType]);

  // Function to check if schedule time has passed
  const isSchedulePassed = (timeRange) => {
    if (!currentTime) return false;
    
    // Extract end time from range (e.g., "07:00-08:30" -> "08:30")
    const endTime = timeRange.split('-')[1];
    
    return currentTime > endTime;
  };

  // Function to mark schedule as scanned
  const handleMarkAsScanned = () => {
    if (selectedSchedule) {
      setScannedSchedules(prev => ({
        ...prev,
        [selectedSchedule.id]: {
          scanned: true,
          scannedAt: new Date().toISOString(),
          attendance: dummyAttendance
        }
      }));
      closeModal();
    }
  };

  const handleButtonClick = (schedule) => {
    const isScanned = scannedSchedules[schedule.id]?.scanned;
    
    setSelectedSchedule(schedule);
    
    if (isScanned) {
      // Show attendance detail
      setModalType('detail');
      setShowModal(true);
    } else {
      // Show QR code
      setModalType('qr');
      setQrOpenTime(Date.now());
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSchedule(null);
    setModalType('qr');
    setQrOpenTime(null);
  };

  // Function to get button icon and state
  const getButtonState = (schedule) => {
    const isScanned = scannedSchedules[schedule.id]?.scanned;
    const isPassed = isSchedulePassed(schedule.time);
    
    return {
      icon: isScanned ? Eye : QrCode,
      disabled: isPassed && !isScanned,
      className: isPassed && !isScanned ? 'qr-button disabled' : 'qr-button'
    };
  };

  return (
    <div className="jadwal-page">
      <NavbarPengurus />

      <div className="jadwal-containerr">
        {/* Left Sidebar */}
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

        {/* Right Content */}
        <div className="jadwal-content">
          {/* Date Header */}
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
              const ButtonIcon = buttonState.icon;
              const isScanned = scannedSchedules[schedule.id]?.scanned;
              
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
                      title={isScanned ? "Lihat Detail Kehadiran" : buttonState.disabled ? "Waktu telah berlalu" : "Scan QR Code"}
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

      {/* Modal */}
      {showModal && selectedSchedule && (
        <div className="qr-modal-overlay" onClick={closeModal}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
              <h3>{modalType === 'qr' ? 'Scan Kode QR' : 'Detail Kehadiran'}</h3>
              <button className="qr-close-btn" onClick={closeModal}>
                <X size={24} strokeWidth={2} />
              </button>
            </div>
            
            {modalType === 'qr' ? (
              // QR Code Modal
              <div className="qr-modal-body">
                <div className="qr-info">
                  <h4>{selectedSchedule.subject}</h4>
                  <p>{selectedSchedule.class}</p>
                  <p className="qr-period-info">{selectedSchedule.period} • {selectedSchedule.time}</p>
                  <p className="qr-teacher-info">{selectedSchedule.teacher}</p>
                </div>
                <div className="qr-code-container">
                  <img
                    src={selectedSchedule.qrCode}
                    alt="QR Code"
                    className="qr-code-image"
                  />
                </div>
                <p className="qr-instruction">
                  Scan kode QR di atas untuk melakukan presensi
                </p>
                <p className="qr-timer">
                  QR Code akan otomatis ditandai sebagai ter-scan dalam 10 detik
                </p>
              </div>
            ) : (
              // Attendance Detail Modal
              <div className="detail-modal-body">
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

                <div className="attendance-summary">
                  <div className="summary-card present">
                    <div className="summary-number">{dummyAttendance.present}</div>
                    <div className="summary-label">Hadir</div>
                  </div>
                  <div className="summary-card late">
                    <div className="summary-number">{dummyAttendance.late}</div>
                    <div className="summary-label">Terlambat</div>
                  </div>
                  <div className="summary-card absent">
                    <div className="summary-number">{dummyAttendance.absent}</div>
                    <div className="summary-label">Alpha</div>
                  </div>
                </div>

                <div className="attendance-list">
                  <h5>Daftar Kehadiran</h5>
                  <div className="attendance-table">
                    {dummyAttendance.students.map((student, idx) => (
                      <div key={idx} className="attendance-row">
                        <div className="student-info">
                          <span className="student-number">{idx + 1}.</span>
                          <span className="student-name">{student.name}</span>
                        </div>
                        <div className="student-status-group">
                          <span className={`student-status ${student.status.toLowerCase()}`}>
                            {student.status}
                          </span>
                          <span className="student-time">{student.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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