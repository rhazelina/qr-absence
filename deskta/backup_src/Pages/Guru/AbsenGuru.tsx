  import { useState, useEffect, useRef } from 'react';
import GuruLayout from '../../component/Guru/GuruLayout';
import { QrCode, RotateCcw } from 'lucide-react';

// ==================== INTERFACES ====================
interface ScanAbsenGuruProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

interface Student {
  id: number;
  name: string;
  nis: string;
  time: string;
  status: 'Hadir' | 'Terlambat';
}

// ==================== DUMMY DATA ====================
const DUMMY_STUDENTS: Student[] = [
  { id: 1, name: "IBU SOPIAH", nis: "2024001", time: "07:05", status: 'Hadir' },
  { id: 2, name: "Budi KARANGPLOSO", nis: "2024002", time: "07:06", status: 'Hadir' },
  { id: 3, name: "Citra Rasa", nis: "2024003", time: "07:08", status: 'Hadir' },
  { id: 4, name: "Dimas Ganteng", nis: "2024004", time: "07:15", status: 'Terlambat' },
  { id: 5, name: "Eka sewajarnya", nis: "2024005", time: "07:16", status: 'Terlambat' },
  { id: 6, name: "Fajar wajar", nis: "2024006", time: "07:18", status: 'Terlambat' },
];

export default function ScanAbsenGuru({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: ScanAbsenGuruProps) {
  // ==================== STATE ==================
  const [isScanning, setIsScanning] = useState(true); // Default scan
  const [hadirList, setHadirList] = useState<Student[]>([]);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [timer, setTimer] = useState(0); // Durasi sesi scan
  
  const scanIndexRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ==================== EFFECTS ====================
  
  // 1. Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isScanning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  // 2. Simulation Effect (Live Scan)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isScanning) {
      interval = setInterval(() => {
        if (scanIndexRef.current < DUMMY_STUDENTS.length) {
          const student = DUMMY_STUDENTS[scanIndexRef.current];
          
          setHadirList(prev => {
            if (prev.find(s => s.id === student.id)) return prev;
            return [student, ...prev];
          });

          setLastScanned(student.name);
          setTimeout(() => setLastScanned(null), 2000);

          scanIndexRef.current += 1;
        }
      }, 2500); // Simulasi scan tiap 2.5 detik
    }

    return () => clearInterval(interval);
  }, [isScanning]);

  //  Auto Scroll 
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [hadirList]);

  // ==================== HANDLERS ====================
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleScan = () => {
    setIsScanning(!isScanning);
  };

  const handleRefreshQR = () => {
    // Simulasi refresh QR
    const wasScanning = isScanning;
    setIsScanning(false);
    setTimeout(() => setIsScanning(wasScanning), 200);
  };

  const handleSimpan = () => {
    if (window.confirm(`Simpan data absensi untuk ${hadirList.length} siswa?`)) {
      // Logic simpan ke DB bisa disini
      alert("Data berhasil disimpan!");
      onMenuClick('dashboard');
    }
  };

  const handleInputManual = () => {
    // Pause scan sebelum pindah
    setIsScanning(false);
    onMenuClick('input-manual');
  };

  // ==================== RENDER ====================
  return (
    <GuruLayout
      pageTitle="Live Monitoring Absensi"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        height: 'calc(100vh - 140px)',
      }}>
        
        {/*  Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          <div style={styles.statCard('#3B82F6', '#EFF6FF')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <span style={styles.statLabel}>Total Terdaftar</span>
                <div style={styles.statValue}>32 <span style={{fontSize: '14px', fontWeight: '500', color: '#6B7280'}}>Siswa</span></div>
              </div>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#DBEAFE', color: '#2563EB' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
            </div>
          </div>
          <div style={styles.statCard('#10B981', '#ECFDF5')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <span style={styles.statLabel}>Hadir</span>
                <div style={styles.statValue} className="text-emerald-600">{hadirList.length} <span style={{fontSize: '14px', fontWeight: '500', color: '#6B7280'}}>Siswa</span></div>
              </div>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#D1FAE5', color: '#059669' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
          <div style={styles.statCard('#F59E0B', '#FFFBEB')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <span style={styles.statLabel}>Belum Hadir</span>
                <div style={styles.statValue}>{32 - hadirList.length} <span style={{fontSize: '14px', fontWeight: '500', color: '#6B7280'}}>Siswa</span></div>
              </div>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
          <div style={styles.statCard('#6366F1', '#EEF2FF')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <span style={styles.statLabel}>Durasi Sesi</span>
                <div style={styles.statValue}>{formatTime(timer)}</div>
              </div>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#E0E7FF', color: '#4F46E5' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '350px 1fr',
          gap: '24px',
          flex: 1,
          minHeight: 0, 
        }}>
          
          {/* LeftQR  */}
          <div style={styles.card}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              alignItems: 'center',
              // justifyContent: 'space-between',
              padding: '24px'
            }}>
              {/* Header QR */}
              <div style={{ textAlign: 'center', width: '100%', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px' }}>
                <h3 style={{ margin: '0 0 4px 0', color: '#111827', fontSize: '18px', fontWeight: '700' }}>Scan QR Code</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
                  Arahkan kamera siswa ke QR di bawah
                </p>
              </div>

              {/* QR Image */}
              <div style={{
                position: 'relative',
                width: '260px',
                height: '260px',
                margin: '24px 0',
                padding: '16px',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QrCode
                  size={200}
                  color={isScanning ? '#1F2937' : '#D1D5DB'}
                  strokeWidth={2}
                  style={{
                    opacity: isScanning ? 1 : 0.3,
                    transition: 'all 0.3s',
                    filter: isScanning ? 'none' : 'blur(4px)'
                  }}
                />
                {!isScanning && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(4px)',
                    color: '#EF4444',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: '800',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #FECACA',
                    letterSpacing: '1px'
                  }}>
                    PAUSED
                  </div>
                )}
              </div>

              {/* Jeda controler */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  onClick={handleToggleScan}
                  style={{
                    ...styles.button,
                    backgroundColor: isScanning ? '#EF4444' : '#10B981',
                    boxShadow: isScanning ? '0 4px 0 #DC2626' : '0 4px 0 #059669',
                  }}
                >
                  {isScanning ? 'Jeda Scan (Pause)' : 'Lanjutkan Scan'}
                </button>
                
                <button 
                  onClick={handleRefreshQR}
                  style={{
                    ...styles.button,
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    boxShadow: '0 4px 0 #E5E7EB',
                  }}
                >
                  <RotateCcw size={16} style={{ marginRight: 8 }} strokeWidth={2} />
                  Refresh QR Code
                </button>
              </div>
            </div>
          </div>

          {/* Live Feed */}
          <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#111827' }}>Live Feed Kehadiran</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ 
                    width: 8, height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: isScanning ? '#10B981' : '#9CA3AF',
                    display: 'inline-block' 
                  }} />
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>
                    {isScanning ? 'Menunggu scan masuk...' : 'Sesi dijed'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleInputManual}
                style={{
                  fontSize: '13px',
                  color: '#4B5563',
                  background: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9CA3AF';
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Input Manual
              </button>
            </div>

            <div 
              ref={scrollRef}
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {hadirList.length === 0 ? (
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#9CA3AF',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <QrCode size={48} color="#D1D5DB" strokeWidth={1} style={{ opacity: 0.2 }} />
                  <p>Belum ada data masuk</p>
                </div>
              ) : (
                hadirList.map((student, idx) => (
                  <div key={student.id} className="animate-slide-in" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: idx === 0 ? '#F0FDF4' : '#FFFFFF',
                    borderLeft: idx === 0 ? '4px solid #10B981' : '4px solid transparent',
                    borderBottom: '1px solid #F3F4F6',
                    boxShadow: idx === 0 ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
                    borderRadius: idx === 0 ? '8px' : '0',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{
                      width: 42, height: 42,
                      borderRadius: '12px',
                      backgroundColor: idx === 0 ? '#DCFCE7' : '#F3F4F6',
                      color: idx === 0 ? '#15803D' : '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px',
                      marginRight: '16px',
                      boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
                    }}>
                      {student.name.substring(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ margin: '0', fontSize: '15px', fontWeight: '600', color: '#1F2937' }}>{student.name}</h4>
                        {idx === 0 && (
                          <span style={{ fontSize: '10px', backgroundColor: '#10B981', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>BARU</span>
                        )}
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6B7280', fontFamily: 'monospace' }}>{student.nis}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                        {student.time}
                      </div>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: student.status === 'Hadir' ? '#DCFCE7' : '#FEF3C7',
                        color: student.status === 'Hadir' ? '#166534' : '#92400E',
                        fontWeight: '600',
                        marginTop: '4px',
                        display: 'inline-block'
                      }}>
                        {student.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              <button
                onClick={handleSimpan}
                style={{
                  ...styles.button,
                  backgroundColor: '#2563EB',
                  boxShadow: '0 4px 0 #1D4ED8',
                }}
              >
                Selesai & Simpan Data
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Toast Notification */}
      {lastScanned && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          backgroundColor: '#10B981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 100,
          animation: 'slideIn 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '4px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Scan Berhasil!</p>
            <p style={{ margin: 0, fontSize: '14px' }}>{lastScanned} baru saja absen.</p>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}

// ==================== STYLES ====================
const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E5E7EB',
    overflow: 'hidden'
  },
  statCard: (color: string, bg: string) => ({
    backgroundColor: bg,
    padding: '20px',
    borderRadius: '16px',
    borderLeft: `5px solid ${color}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
  }),
  statLabel: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '4px',
    display: 'block'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827',
    lineHeight: '1.2'
  },
  button: {
    width: '100%',
    padding: '14px',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '0.3px'
  }
};



// ======= LEGACY CODE - DO NOT DELETE =======
//   import { useState, useEffect, useRef } from 'react';
// import GuruLayout from '../../component/Guru/GuruLayout';
// import QRCodeIcon from '../../assets/Icon/qr_code.png';
// import RefreshIcon from '../../assets/Icon/refresh.png';
// import DummyQRIcon from '../../assets/Icon/dumyqr.png';

// // ==================== INTERFACES ====================
// interface ScanAbsenGuruProps {
//   user: { name: string; role: string };
//   onLogout: () => void;
//   currentPage: string;
//   onMenuClick: (page: string) => void;
// }

// interface Student {
//   id: number;
//   name: string;
//   nis: string;
//   time: string;
//   status: 'Hadir' | 'Terlambat';
// }

// // ==================== DUMMY DATA ====================
// const DUMMY_STUDENTS: Student[] = [
//   { id: 1, name: "IBU SOPIAH", nis: "2024001", time: "07:05", status: 'Hadir' },
//   { id: 2, name: "Budi KARANGPLOSO", nis: "2024002", time: "07:06", status: 'Hadir' },
//   { id: 3, name: "Citra Rasa", nis: "2024003", time: "07:08", status: 'Hadir' },
//   { id: 4, name: "Dimas Ganteng", nis: "2024004", time: "07:15", status: 'Terlambat' },
//   { id: 5, name: "Eka sewajarnya", nis: "2024005", time: "07:16", status: 'Terlambat' },
//   { id: 6, name: "Fajar wajar", nis: "2024006", time: "07:18", status: 'Terlambat' },
// ];

// export default function ScanAbsenGuru({
//   user,
//   onLogout,
//   currentPage,
//   onMenuClick,
// }: ScanAbsenGuruProps) {
//   // ==================== STATE ==================
//   const [isScanning, setIsScanning] = useState(true); // Default scan
//   const [hadirList, setHadirList] = useState<Student[]>([]);
//   const [lastScanned, setLastScanned] = useState<string | null>(null);
//   const [timer, setTimer] = useState(0); // Durasi sesi scan
  
//   const scanIndexRef = useRef(0);
//   const scrollRef = useRef<HTMLDivElement>(null);

//   // ==================== EFFECTS ====================
  
//   // 1. Timer Effect
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (isScanning) {
//       interval = setInterval(() => {
//         setTimer(prev => prev + 1);
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [isScanning]);

//   // 2. Simulation Effect (Live Scan)
//   useEffect(() => {
//     let interval: NodeJS.Timeout;

//     if (isScanning) {
//       interval = setInterval(() => {
//         if (scanIndexRef.current < DUMMY_STUDENTS.length) {
//           const student = DUMMY_STUDENTS[scanIndexRef.current];
          
//           setHadirList(prev => {
//             if (prev.find(s => s.id === student.id)) return prev;
//             return [student, ...prev];
//           });

//           setLastScanned(student.name);
//           setTimeout(() => setLastScanned(null), 2000);

//           scanIndexRef.current += 1;
//         }
//       }, 2500); // Simulasi scan tiap 2.5 detik
//     }

//     return () => clearInterval(interval);
//   }, [isScanning]);

//   //  Auto Scroll 
//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = 0;
//     }
//   }, [hadirList]);

//   // ==================== HANDLERS ====================
//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const handleToggleScan = () => {
//     setIsScanning(!isScanning);
//   };

//   const handleRefreshQR = () => {
//     // Simulasi refresh QR
//     const wasScanning = isScanning;
//     setIsScanning(false);
//     setTimeout(() => setIsScanning(wasScanning), 200);
//   };

//   const handleSimpan = () => {
//     if (window.confirm(`Simpan data absensi untuk ${hadirList.length} siswa?`)) {
//       // Logic simpan ke DB bisa disini
//       alert("Data berhasil disimpan!");
//       onMenuClick('dashboard');
//     }
//   };

//   const handleInputManual = () => {
//     // Pause scan sebelum pindah
//     setIsScanning(false);
//     onMenuClick('input-manual');
//   };

//   // ==================== RENDER ====================
//   return (
//     <GuruLayout
//       pageTitle="Live Monitoring Absensi"
//       currentPage={currentPage}
//       onMenuClick={onMenuClick}
//       user={user}
//       onLogout={onLogout}
//     >
//       <div style={{
//         maxWidth: '1200px',
//         margin: '0 auto',
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '24px',
//         height: 'calc(100vh - 140px)',
//       }}>
        
//         {/*  Stats Bar */}
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//           gap: '16px',
//         }}>
//           <div style={styles.statCard('#3B82F6', '#EFF6FF')}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//               <div>
//                 <span style={styles.statLabel}>Total Terdaftar</span>
//                 <div style={styles.statValue}>32 <span style={{fontSize: '14px', fontWeight: '500', color: '#6B7280'}}>Siswa</span></div>
//               </div>
//               <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#DBEAFE', color: '#2563EB' }}>
//                 <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
//               </div>
//             </div>
//           </div>
//           <div style={styles.statCard('#10B981', '#ECFDF5')}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//               <div>
//                 <span style={styles.statLabel}>Hadir</span>
//                 <div style={styles.statValue} className="text-emerald-600">{hadirList.length} <span style={{fontSize: '14px', fontWeight: '500', color: '#6B7280'}}>Siswa</span></div>
//               </div>
//               <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#D1FAE5', color: '#059669' }}>
//                 <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
//               </div>
//             </div>
//           </div>
//           <div style={styles.statCard('#F59E0B', '#FFFBEB')}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//               <div>
//                 <span style={styles.statLabel}>Belum Hadir</span>
//                 <div style={styles.statValue}>{32 - hadirList.length} <span style={{fontSize: '14px', fontWeight: '500', color: '#6B7280'}}>Siswa</span></div>
//               </div>
//               <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706' }}>
//                 <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
//               </div>
//             </div>
//           </div>
//           <div style={styles.statCard('#6366F1', '#EEF2FF')}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//               <div>
//                 <span style={styles.statLabel}>Durasi Sesi</span>
//                 <div style={styles.statValue}>{formatTime(timer)}</div>
//               </div>
//               <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#E0E7FF', color: '#4F46E5' }}>
//                 <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Area */}
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: '350px 1fr',
//           gap: '24px',
//           flex: 1,
//           minHeight: 0, 
//         }}>
          
//           {/* LeftQR  */}
//           <div style={styles.card}>
//             <div style={{
//               display: 'flex',
//               flexDirection: 'column',
//               height: '100%',
//               alignItems: 'center',
//               // justifyContent: 'space-between',
//               padding: '24px'
//             }}>
//               {/* Header QR */}
//               <div style={{ textAlign: 'center', width: '100%', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px' }}>
//                 <h3 style={{ margin: '0 0 4px 0', color: '#111827', fontSize: '18px', fontWeight: '700' }}>Scan QR Code</h3>
//                 <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
//                   Arahkan kamera siswa ke QR di bawah
//                 </p>
//               </div>

//               {/* QR Image */}
//               <div style={{
//                 position: 'relative',
//                 width: '260px',
//                 height: '260px',
//                 margin: '24px 0',
//                 padding: '16px',
//                 background: 'white',
//                 borderRadius: '20px',
//                 boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//                 border: '1px solid #F3F4F6'
//               }}>
//                 <img 
//                   src={DummyQRIcon} 
//                   alt="QR Code" 
//                   style={{ 
//                     width: '100%', 
//                     height: '100%', 
//                     objectFit: 'contain',
//                     opacity: isScanning ? 1 : 0.3,
//                     transition: 'all 0.3s',
//                     filter: isScanning ? 'none' : 'blur(4px)'
//                   }} 
//                 />
//                 {!isScanning && (
//                   <div style={{
//                     position: 'absolute',
//                     top: '50%',
//                     left: '50%',
//                     transform: 'translate(-50%, -50%)',
//                     background: 'rgba(255,255,255,0.9)',
//                     backdropFilter: 'blur(4px)',
//                     color: '#EF4444',
//                     padding: '12px 24px',
//                     borderRadius: '50px',
//                     fontSize: '16px',
//                     fontWeight: '800',
//                     boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
//                     border: '1px solid #FECACA',
//                     letterSpacing: '1px'
//                   }}>
//                     PAUSED
//                   </div>
//                 )}
//               </div>

//               {/* Jeda controler */}
//               <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                 <button 
//                   onClick={handleToggleScan}
//                   style={{
//                     ...styles.button,
//                     backgroundColor: isScanning ? '#EF4444' : '#10B981',
//                     boxShadow: isScanning ? '0 4px 0 #DC2626' : '0 4px 0 #059669',
//                   }}
//                 >
//                   {isScanning ? 'Jeda Scan (Pause)' : 'Lanjutkan Scan'}
//                 </button>
                
//                 <button 
//                   onClick={handleRefreshQR}
//                   style={{
//                     ...styles.button,
//                     backgroundColor: '#F3F4F6',
//                     color: '#374151',
//                     boxShadow: '0 4px 0 #E5E7EB',
//                   }}
//                 >
//                   <img src={RefreshIcon} alt="" style={{ width: 16, marginRight: 8 }} />
//                   Refresh QR Code
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Live Feed */}
//           <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//             <div style={{
//               padding: '20px',
//               borderBottom: '1px solid #E5E7EB',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center'
//             }}>
//               <div>
//                 <h3 style={{ margin: '0 0 4px 0', color: '#111827' }}>Live Feed Kehadiran</h3>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                   <span style={{ 
//                     width: 8, height: 8, 
//                     borderRadius: '50%', 
//                     backgroundColor: isScanning ? '#10B981' : '#9CA3AF',
//                     display: 'inline-block' 
//                   }} />
//                   <span style={{ fontSize: '12px', color: '#6B7280' }}>
//                     {isScanning ? 'Menunggu scan masuk...' : 'Sesi dijed'}
//                   </span>
//                 </div>
//               </div>
              
//               <button
//                 onClick={handleInputManual}
//                 style={{
//                   fontSize: '13px',
//                   color: '#4B5563',
//                   background: '#FFFFFF',
//                   border: '1px solid #D1D5DB',
//                   padding: '8px 16px',
//                   borderRadius: '8px',
//                   cursor: 'pointer',
//                   fontWeight: '600',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '6px',
//                   transition: 'all 0.2s',
//                   boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.borderColor = '#9CA3AF';
//                   e.currentTarget.style.backgroundColor = '#F9FAFB';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.borderColor = '#D1D5DB';
//                   e.currentTarget.style.backgroundColor = '#FFFFFF';
//                 }}
//               >
//                 <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                 </svg>
//                 Input Manual
//               </button>
//             </div>

//             <div 
//               ref={scrollRef}
//               style={{ 
//                 flex: 1, 
//                 overflowY: 'auto', 
//                 padding: '20px',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 gap: '12px'
//               }}
//             >
//               {hadirList.length === 0 ? (
//                 <div style={{ 
//                   flex: 1, 
//                   display: 'flex', 
//                   alignItems: 'center', 
//                   justifyContent: 'center',
//                   color: '#9CA3AF',
//                   flexDirection: 'column',
//                   gap: '12px'
//                 }}>
//                   <img src={QRCodeIcon} alt="" style={{ width: 48, opacity: 0.2 }} />
//                   <p>Belum ada data masuk</p>
//                 </div>
//               ) : (
//                 hadirList.map((student, idx) => (
//                   <div key={student.id} className="animate-slide-in" style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     padding: '16px',
//                     backgroundColor: idx === 0 ? '#F0FDF4' : '#FFFFFF',
//                     borderLeft: idx === 0 ? '4px solid #10B981' : '4px solid transparent',
//                     borderBottom: '1px solid #F3F4F6',
//                     boxShadow: idx === 0 ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
//                     borderRadius: idx === 0 ? '8px' : '0',
//                     transition: 'all 0.3s'
//                   }}>
//                     <div style={{
//                       width: 42, height: 42,
//                       borderRadius: '12px',
//                       backgroundColor: idx === 0 ? '#DCFCE7' : '#F3F4F6',
//                       color: idx === 0 ? '#15803D' : '#6B7280',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       fontWeight: '700',
//                       fontSize: '16px',
//                       marginRight: '16px',
//                       boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
//                     }}>
//                       {student.name.substring(0,2).toUpperCase()}
//                     </div>
//                     <div style={{ flex: 1 }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                         <h4 style={{ margin: '0', fontSize: '15px', fontWeight: '600', color: '#1F2937' }}>{student.name}</h4>
//                         {idx === 0 && (
//                           <span style={{ fontSize: '10px', backgroundColor: '#10B981', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>BARU</span>
//                         )}
//                       </div>
//                       <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6B7280', fontFamily: 'monospace' }}>{student.nis}</p>
//                     </div>
//                     <div style={{ textAlign: 'right' }}>
//                       <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>
//                         {student.time}
//                       </div>
//                       <span style={{
//                         fontSize: '11px',
//                         padding: '2px 8px',
//                         borderRadius: '6px',
//                         backgroundColor: student.status === 'Hadir' ? '#DCFCE7' : '#FEF3C7',
//                         color: student.status === 'Hadir' ? '#166534' : '#92400E',
//                         fontWeight: '600',
//                         marginTop: '4px',
//                         display: 'inline-block'
//                       }}>
//                         {student.status}
//                       </span>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>

//             <div style={{ padding: '20px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB' }}>
//               <button
//                 onClick={handleSimpan}
//                 style={{
//                   ...styles.button,
//                   backgroundColor: '#2563EB',
//                   boxShadow: '0 4px 0 #1D4ED8',
//                 }}
//               >
//                 Selesai & Simpan Data
//               </button>
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* Toast Notification */}
//       {lastScanned && (
//         <div style={{
//           position: 'fixed',
//           bottom: '32px',
//           right: '32px',
//           backgroundColor: '#10B981',
//           color: 'white',
//           padding: '16px 24px',
//           borderRadius: '12px',
//           boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
//           zIndex: 100,
//           animation: 'slideIn 0.3s ease-out',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '12px'
//         }}>
//           <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '4px' }}>
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//               <polyline points="20 6 9 17 4 12"></polyline>
//             </svg>
//           </div>
//           <div>
//             <p style={{ margin: 0, fontWeight: 'bold' }}>Scan Berhasil!</p>
//             <p style={{ margin: 0, fontSize: '14px' }}>{lastScanned} baru saja absen.</p>
//           </div>
//         </div>
//       )}
//     </GuruLayout>
//   );
// }

// // ==================== STYLES ====================
// const styles = {
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: '20px',
//     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
//     border: '1px solid #E5E7EB',
//     overflow: 'hidden'
//   },
//   statCard: (color: string, bg: string) => ({
//     backgroundColor: '#FFFFFF',
//     padding: '20px',
//     borderRadius: '16px',
//     borderLeft: `5px solid ${color}`,
//     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
//     display: 'flex',
//     flexDirection: 'column' as const,
//     gap: '4px'
//   }),
//   statLabel: {
//     fontSize: '12px',
//     color: '#6B7280',
//     fontWeight: '700',
//     textTransform: 'uppercase' as const,
//     letterSpacing: '0.5px',
//     marginBottom: '4px',
//     display: 'block'
//   },
//   statValue: {
//     fontSize: '28px',
//     fontWeight: '800',
//     color: '#111827',
//     lineHeight: '1.2'
//   },
//   button: {
//     width: '100%',
//     padding: '14px',
//     color: 'white',
//     border: 'none',
//     borderRadius: '14px',
//     fontSize: '15px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     letterSpacing: '0.3px'
//   }
// };
