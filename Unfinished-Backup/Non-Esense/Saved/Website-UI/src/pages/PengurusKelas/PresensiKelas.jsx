import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, X, QrCode, Eye, Clock } from 'lucide-react';
import NavbarPengurus from "../../components/PengurusKelas/NavbarPengurus";
import './PresensiKelas.css';
import api from '../../utils/api';

// ==================== UTILITY FUNCTIONS ====================
const getTimeRange = (period) => {
  const timeMap = {
    '1-2': '07:00-08:30',
    '3-4': '08:30-10:00',
    '5-6': '10:15-11:45',
    '7-8': '12:30-14:00',
    '7-10': '12:30-15:00',
    '1-4': '07:00-10:00',
    '5-10': '10:15-15:00',
    '3-6': '08:30-11:45',
    '7': '12:30-13:15',
    '8-10': '13:15-15:00',
    '9-10': '14:00-15:00'
  };
  return timeMap[period] || '07:00-08:30';
};

function PresensiKelas() {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('qr'); // 'qr' or 'detail'
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [scannedSchedules, setScannedSchedules] = useState({});
  const [qrOpenTime, setQrOpenTime] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch schedule data from API
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const schedules = await api.get('/me/class/schedules', { date: today });

        // Format schedule data
        const formattedSchedule = (Array.isArray(schedules) ? schedules : []).map((item, index) => ({
          id: item.id || index + 1,
          subject: item.subject_name || item.name || '',
          class: item.class_name || item.class?.name || '',
          period: item.time_slot ? `Jam ke ${item.time_slot}` : (item.period ? `Jam ke ${item.period}` : ''),
          time: item.start_time && item.end_time
            ? `${item.start_time.substring(0, 5)}-${item.end_time.substring(0, 5)}`
            : getTimeRange(item.period),
          teacher: item.teacher_name || item.teacher?.user?.name || item.teacher?.name || '',
          qrCode: item.qr_code_url || item.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(item.subject_name || item.name || 'schedule')}-${item.id || index + 1}`
        }));

        setScheduleData(formattedSchedule);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Load scanned schedules dari localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`scannedSchedules_${today}`);
    if (saved) {
      try {
        setScannedSchedules(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing scanned schedules:', error);
      }
    }
  }, []);

  // Save scanned schedules ke localStorage
  useEffect(() => {
    if (Object.keys(scannedSchedules).length > 0) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`scannedSchedules_${today}`, JSON.stringify(scannedSchedules));
    }
  }, [scannedSchedules]);

  // Update date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      setCurrentDate(`${day}-${month}-${year}`);

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateDateTime();
    const interval = setInterval(() => {
      updateDateTime();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check if QR modal has been open for more than 10 seconds
  useEffect(() => {
    if (qrOpenTime && modalType === 'qr') {
      const checkTime = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - qrOpenTime) / 1000;

        if (elapsed >= 10) {
          handleMarkAsScanned();
          clearInterval(checkTime);
        }
      }, 1000);

      return () => clearInterval(checkTime);
    }
  }, [qrOpenTime, modalType]);

  const isSchedulePassed = (timeRange) => {
    if (!currentTime || !timeRange) return false;
    const endTime = timeRange.split('-')[1];
    return currentTime > endTime;
  };

  const handleMarkAsScanned = async () => {
    if (!selectedSchedule) return;

    try {
      // TODO: Call API to mark as scanned
      // await apiService.markAsScanned(selectedSchedule.id);

      // Fetch attendance detail from API
      // const attendanceDetail = await apiService.getAttendanceDetail(selectedSchedule.id);

      // For now, use default attendance structure
      const defaultAttendance = {
        totalStudents: 30,
        present: 0,
        late: 0,
        absent: 0,
        students: []
      };

      setScannedSchedules(prev => ({
        ...prev,
        [selectedSchedule.id]: {
          scanned: true,
          scannedAt: new Date().toISOString(),
          attendance: defaultAttendance
        }
      }));

      setAttendanceData(prev => ({
        ...prev,
        [selectedSchedule.id]: defaultAttendance
      }));

      closeModal();
    } catch (error) {
      console.error('Error marking as scanned:', error);
      // Tetap tutup modal meskipun error
      closeModal();
    }
  };

  const handleButtonClick = async (schedule) => {
    const isScanned = scannedSchedules[schedule.id]?.scanned;

    setSelectedSchedule(schedule);

    if (isScanned) {
      // Fetch attendance detail jika belum ada
      if (!attendanceData[schedule.id]) {
        try {
          const today = new Date().toISOString().split('T')[0];
          const result = await api.get('/me/class/attendance', { from: today, to: today });
          const records = Array.isArray(result) ? result : (result.data || []);

          // Filter records for this schedule
          const filteredRecords = records.filter(r =>
            (r.schedule_id === schedule.id) ||
            (r.schedule?.id === schedule.id)
          );

          const mappedAttendance = {
            totalStudents: filteredRecords.length > 0 ? filteredRecords[0].class_total || 30 : 30, // Fallback
            present: filteredRecords.filter(r => (r.status || '').toLowerCase().includes('hadir')).length,
            late: filteredRecords.filter(r => (r.status || '').toLowerCase().includes('lambat')).length,
            absent: filteredRecords.filter(r => (r.status || '').toLowerCase().includes('alpha')).length,
            students: filteredRecords.map(r => ({
              name: r.student_name || r.student?.user?.name || '',
              status: r.status_label || r.status || '',
              time: r.checked_in_at || (r.date ? r.date.substring(11, 16) : '')
            }))
          };

          setAttendanceData(prev => ({
            ...prev,
            [schedule.id]: mappedAttendance
          }));
        } catch (error) {
          console.error('Error fetching attendance detail:', error);
          // Use cached data or default
          setAttendanceData(prev => ({
            ...prev,
            [schedule.id]: scannedSchedules[schedule.id]?.attendance || {
              totalStudents: 30,
              present: 0,
              late: 0,
              absent: 0,
              students: []
            }
          }));
        }
      }

      setModalType('detail');
      setShowModal(true);
    } else {
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

  const getButtonState = (schedule) => {
    const isScanned = scannedSchedules[schedule.id]?.scanned;
    const isPassed = isSchedulePassed(schedule.time);

    return {
      icon: isScanned ? Eye : QrCode,
      disabled: isPassed && !isScanned,
      className: isPassed && !isScanned ? 'qr-button disabled' : 'qr-button'
    };
  };

  const currentAttendance = selectedSchedule && attendanceData[selectedSchedule.id]
    ? attendanceData[selectedSchedule.id]
    : scannedSchedules[selectedSchedule?.id]?.attendance || {
      totalStudents: 30,
      present: 0,
      late: 0,
      absent: 0,
      students: []
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

          {/* Loading State */}
          {isLoading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 20px',
              background: '#f9fafb',
              borderRadius: '16px',
              border: '2px dashed #d1d5db'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e5e7eb',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{
                marginTop: '16px',
                fontSize: '16px',
                color: '#6b7280',
                fontWeight: '600'
              }}>Memuat jadwal...</p>
            </div>
          )}

          {/* Info Card - jika ada jadwal */}
          {!isLoading && scheduleData.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Jadwal Hari Ini
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>
                  {scheduleData.length} Mata Pelajaran
                </div>
              </div>
              <BookOpen size={48} style={{ opacity: 0.8 }} />
            </div>
          )}

          {/* Schedule Grid or Empty State */}
          {!isLoading && scheduleData.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 20px',
              background: '#f9fafb',
              borderRadius: '16px',
              border: '2px dashed #d1d5db'
            }}>
              <BookOpen size={64} color="#9ca3af" style={{ marginBottom: '20px' }} />
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Tidak Ada Jadwal Hari Ini
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                Hari ini adalah akhir pekan atau belum ada jadwal yang tersedia.
              </p>
            </div>
          ) : !isLoading && (
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
          )}
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
                    <div className="summary-number">{currentAttendance.present}</div>
                    <div className="summary-label">Hadir</div>
                  </div>
                  <div className="summary-card late">
                    <div className="summary-number">{currentAttendance.late}</div>
                    <div className="summary-label">Terlambat</div>
                  </div>
                  <div className="summary-card absent">
                    <div className="summary-number">{currentAttendance.absent}</div>
                    <div className="summary-label">Alpha</div>
                  </div>
                </div>

                <div className="attendance-list">
                  <h5>Daftar Kehadiran</h5>
                  {currentAttendance.students.length > 0 ? (
                    <div className="attendance-table">
                      {currentAttendance.students.map((student, idx) => (
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
                  ) : (
                    <div style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      border: '2px dashed #d1d5db'
                    }}>
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                        Belum ada data kehadiran siswa
                      </p>
                    </div>
                  )}
                </div>

                <div className="scanned-info">
                  <p>✓ QR Code telah di-scan oleh guru</p>
                  <p className="scan-time">
                    Waktu scan: {scannedSchedules[selectedSchedule.id]?.scannedAt
                      ? new Date(scannedSchedules[selectedSchedule.id].scannedAt).toLocaleString('id-ID')
                      : '-'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PresensiKelas;