import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import NavbarPengurus from '../../components/PengurusKelas/NavbarPengurus';
import apiService from '../../utils/api';
import offlineStorage from '../../utils/offlineStorage';

function QrScanResult() {
  const { scheduleId } = useParams();
  const location = useLocation();
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const schedule = location.state?.schedule;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    fetchScanData();
    
    const interval = setInterval(() => {
      if (navigator.onLine) {
        fetchScanData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [scheduleId]);

  const fetchScanData = async () => {
    try {
      const response = await apiService.getMyClassAttendance();
      const relevantAttendance = response.filter(a => 
        a.schedule && a.schedule.id === parseInt(scheduleId)
      );

      const scannedStudents = relevantAttendance.map(a => ({
        id: a.student?.id,
        name: a.student?.user?.name || 'Siswa',
        nisn: a.student?.nisn,
        status: a.status,
        statusLabel: a.status_label || a.status,
        time: a.created_at ? new Date(a.created_at).toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '-'
      }));

      setScanData({
        total: response[0]?.schedule?.class?.total_students || scannedStudents.length,
        scanned: scannedStudents.length,
        students: scannedStudents
      });
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching scan data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      present: '#10b981',
      late: '#f59e0b',
      absent: '#ef4444',
      sick: '#8b5cf6',
      excused: '#3b82f6',
    };
    return colors[status] || '#6b7280';
  };

  const pendingCount = scanData ? scanData.total - scanData.scanned : 0;

  if (loading && !scanData) {
    return (
      <div className="jadwal-page">
        <NavbarPengurus />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div className="spin-loader"></div>
          <p style={{ marginLeft: '12px' }}>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="jadwal-page">
      <NavbarPengurus />

      <div className="jadwal-containerr">
        <div style={{ padding: '20px' }}>
          {/* Header */}
          <div style={{
            background: isOnline ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            color: 'white',
            padding: '20px 24px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Hasil Scan QR</h2>
              <p style={{ margin: '4px 0 0', opacity: 0.9 }}>{schedule?.subject || 'Mata Pelajaran'} - {schedule?.class || 'Kelas'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {isOnline ? '🟢 Live' : '🔴 Offline'}
              </div>
              {lastUpdated && (
                <div style={{ fontSize: '11px', opacity: 0.7 }}>
                  Update: {lastUpdated.toLocaleTimeString('id-ID')}
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#374151' }}>
                {scanData?.total || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Siswa</div>
            </div>
            
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                {scanData?.scanned || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Sudah Scan</div>
            </div>
            
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: pendingCount > 0 ? '#f59e0b' : '#10b981' }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Belum Scan</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            background: '#e5e7eb',
            borderRadius: '8px',
            height: '8px',
            marginBottom: '24px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #10b981, #34d399)',
              height: '100%',
              width: `${scanData ? (scanData.scanned / scanData.total) * 100 : 0}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Student List */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: '600',
              color: '#374151'
            }}>
              Daftar Siswa
            </div>
            
            {scanData?.students?.length > 0 ? (
              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                {scanData.students.map((student, index) => (
                  <div
                    key={student.id || index}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#6b7280'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', color: '#111827' }}>{student.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{student.nisn}</div>
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: getStatusColor(student.status) + '20',
                      color: getStatusColor(student.status)
                    }}>
                      {student.statusLabel}
                      {student.time && <span style={{ marginLeft: '8px', opacity: 0.7 }}>{student.time}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                {isOnline ? 'Belum ada siswa yang scan QR' : 'Tidak ada data (offline)'}
              </div>
            )}
          </div>

          {/* Auto-refresh indicator */}
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#9ca3af' }}>
            🔄 Data akan otomatis diperbarui setiap 5 detik
          </div>
        </div>
      </div>
    </div>
  );
}

export default QrScanResult;
