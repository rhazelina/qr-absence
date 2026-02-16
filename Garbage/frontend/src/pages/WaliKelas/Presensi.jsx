import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Presensi.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import attendanceService from '../../services/attendance';
import Swal from 'sweetalert2';

function Presensi() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  // Expecting scheduleId from navigation
  // If navigated from DashboardWakel, we should have schedule info
  const scheduleId = state.scheduleId;
  const initialClassId = state.classId; 
  
  const [loading, setLoading] = useState(true);
  const [scheduleInfo, setScheduleInfo] = useState({
      mapel: state.mataPelajaran || '',
      kelas: state.kelas || '',
      jamKe: state.jamKe || '',
      date: state.tanggal || new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  });

  const [siswaList, setSiswaList] = useState([]);
  const [mode, setMode] = useState('input'); // 'input' or 'view'
  
  const [showKeteranganModal, setShowKeteranganModal] = useState(false);
  const [showDokumenModal, setShowDokumenModal] = useState(false);
  const [currentSiswaIndex, setCurrentSiswaIndex] = useState(null);
  const [keteranganTipe, setKeteranganTipe] = useState('');
  const [keteranganForm, setKeteranganForm] = useState({
    alasan: '',
    jam: '',
    jamKe: '' 
  });

  const daftarJamKe = [
    { value: '1', label: 'Jam Ke-1 (07:00 - 07:45)' },
    { value: '2', label: 'Jam Ke-2 (07:45 - 08:30)' },
    { value: '3', label: 'Jam Ke-3 (08:30 - 09:15)' },
    { value: '4', label: 'Jam Ke-4 (09:15 - 10:00)' },
    { value: '5', label: 'Jam Ke-5 (10:15 - 11:00)' },
    { value: '6', label: 'Jam Ke-6 (11:00 - 11:45)' },
    { value: '7', label: 'Jam Ke-7 (12:30 - 13:15)' },
    { value: '8', label: 'Jam Ke-8 (13:15 - 14:00)' },
  ];

  useEffect(() => {
    if (!scheduleId && !initialClassId) {
        // Fallback for direct access without state (demo purpose or error)
        // In real app, redirect back or show error
        console.warn("No schedule ID provided");
    }
    fetchData();
  }, [scheduleId]);

  const fetchData = async () => {
    try {
        setLoading(true);

        // 1. Fetch Schedule Detail if we have ID
        let currentClassId = initialClassId;
        if (scheduleId) {
            try {
                // Determine if we are fetching by schedule. 
                // We might need to fetch students for the class of this schedule.
                // Assuming we can get class_id from schedule detail or passed state.
                // If we don't have an endpoint for schedule detail that returns class_id, we rely on state.
                const existingAttendance = await attendanceService.getAttendanceBySchedule(scheduleId);
                
                if (existingAttendance && existingAttendance.length > 0) {
                    setMode('view');
                    // Process existing attendance
                    const processed = existingAttendance.map((a, i) => ({
                        id: a.student_id,
                        no: i + 1,
                        nisn: a.student?.nis || '-',
                        nama: a.student?.user?.name || '-',
                        status: mapBackendStatusToUi(a.status),
                        keterangan: parseNotes(a.notes),
                        dokumen: a.attachment_url ? { type: 'file', url: a.attachment_url } : null,
                        originalStatus: a.status
                    }));
                    setSiswaList(processed);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                // If 404, it means no attendance yet, so we stay in input mode
                console.log("No existing attendance found, defaulting to input mode");
            }
        }

        // 2. Fetch Students for the Class
        // We need class_id. If missing, we might fail.
        // For Wali Kelas specific page, we can assume 'my class'.
        
        let students = [];
        let leaves = [];

        if (currentClassId) {
             const [studentsData, leavesData] = await Promise.all([
                 // If we have generic endpoint for class students
                 attendanceService.getHomeroomStudents(), // Assuming this is the homeroom page
                 attendanceService.getStudentsOnLeave(currentClassId)
             ]);
             students = studentsData;
             leaves = leavesData.students_on_leave;
        } else {
            // Fallback: Fetch homeroom students and hope it matches
            const homeroom = await attendanceService.getHomeroom();
            currentClassId = homeroom.id;
             const [studentsData, leavesData] = await Promise.all([
                 attendanceService.getHomeroomStudents(),
                 attendanceService.getStudentsOnLeave(currentClassId)
             ]);
             students = studentsData;
             leaves = leavesData.students_on_leave;
             // Update schedule info class name if empty
             if (!scheduleInfo.kelas) {
                 setScheduleInfo(prev => ({...prev, kelas: homeroom.name}));
             }
        }

        // 3. Merge Data
        const getLeave = (studentId) => leaves.find(l => l.student.id === studentId);

        const processedStudents = students.map((s, i) => {
            const leave = getLeave(s.id);
            let status = 'hadir';
            let dokumen = null;
            let notes = null;

            if (leave) {
                switch(leave.type) {
                    case 'sakit': status = 'sakit'; break;
                    case 'izin': status = 'izin'; break;
                    case 'izin_pulang': status = 'pulang'; break;
                    default: status = 'izin';
                }
                dokumen = leave.attachment_url ? { type: 'file', url: leave.attachment_url, keterangan: leave.reason } : null;
                notes = leave.reason ? { alasan: leave.reason } : null;
            }

            return {
                id: s.id,
                no: i + 1,
                nisn: s.nis,
                nama: s.user.name,
                status: status,
                keterangan: notes,
                dokumen: dokumen,
                isLeave: !!leave // Mark if locked by leave
            };
        });

        setSiswaList(processedStudents);

    } catch (err) {
        console.error("Error loading presensi data:", err);
        Swal.fire("Error", "Gagal memuat data siswa.", "error");
    } finally {
        setLoading(false);
    }
  };

  const mapBackendStatusToUi = (status) => {
      const map = {
          'present': 'hadir',
          'late': 'terlambat',
          'sick': 'sakit',
          'permission': 'izin',
          'absent': 'alpha',
          'leave_early': 'pulang'
      };
      return map[status] || 'hadir';
  };

  const mapUiStatusToBackend = (status) => {
      const map = {
          'hadir': 'present',
          'terlambat': 'late',
          'sakit': 'sick',
          'izin': 'permission',
          'alpha': 'absent',
          'pulang': 'leave_early'
      };
      return map[status] || 'present';
  };

  const parseNotes = (notes) => {
      if (!notes) return null;
      // Simple usage: assume notes is string. 
      // If we saved JSON string, we could parse it, but for compatibility let's treat as text.
      return { alasan: notes };
  };

  const handleStatusChange = (index, newStatus) => {
    const student = siswaList[index];
    
    // Prevent changing status if student is on verified leave (Sakit/Izin from DB)
    if (student.isLeave && (student.status === 'sakit' || student.status === 'izin')) {
         // return; // Uncomment to strict prevent
    }

    const requiresModal = ['terlambat', 'pulang', 'sakit', 'izin'].includes(newStatus);

    if (requiresModal) {
      setCurrentSiswaIndex(index);
      setKeteranganTipe(newStatus);
      setShowKeteranganModal(true);
      setKeteranganForm({ alasan: '', jam: '', jamKe: '', file: null });
    } else {
      const updated = [...siswaList];
      updated[index].status = newStatus;
      
      // Auto-text logic
      if (newStatus === 'hadir') {
        updated[index].keterangan = { auto: true, alasan: 'Hadir tepat waktu' };
      } else if (newStatus === 'alpha') {
        updated[index].keterangan = { auto: true, alasan: 'Tanpa keterangan' };
      } else {
        updated[index].keterangan = null;
      }
      
      updated[index].dokumen = null; // Reset document if changing to non-doc status
      setSiswaList(updated);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setKeteranganForm({ ...keteranganForm, file: e.target.files[0] });
    }
  };

  const handleSimpanKeterangan = () => {
    // Validasi
    if (keteranganTipe === 'terlambat') {
      if (!keteranganForm.jam) {
        alert('Mohon lengkapi jam masuk!');
        return;
      }
    } else if (keteranganTipe === 'pulang') {
      if (!keteranganForm.jamKe) {
        alert('Mohon lengkapi jam ke-!');
        return;
      }
    } else if (keteranganTipe === 'sakit' || keteranganTipe === 'izin') {
        if (!keteranganForm.alasan) {
            alert('Mohon lengkapi alasan!');
            return;
        }
    }

    const updated = [...siswaList];
    updated[currentSiswaIndex].status = keteranganTipe;
    updated[currentSiswaIndex].dokumen = keteranganForm.file;
    
    let reason = keteranganForm.alasan; 

    if (keteranganTipe === 'terlambat') {
        updated[currentSiswaIndex].keterangan = {
            alasan: reason,
            jam: keteranganForm.jam,
            formatted: `Terlambat ${keteranganForm.jam}: ${reason}`
        };
    } else if (keteranganTipe === 'pulang') {
        const jamLabel = daftarJamKe.find(j => j.value === keteranganForm.jamKe)?.label || '';
        updated[currentSiswaIndex].keterangan = {
            alasan: reason,
            jamKe: keteranganForm.jamKe,
            jamKeLabel: jamLabel,
            formatted: `Pulang Jam Ke-${keteranganForm.jamKe}: ${reason}`
        };
    } else {
         updated[currentSiswaIndex].keterangan = {
            alasan: reason,
            formatted: reason
        };
    }
    
    setSiswaList(updated);
    setShowKeteranganModal(false);
    setCurrentSiswaIndex(null);
    setKeteranganForm({ alasan: '', jam: '', jamKe: '', file: null });
  };

  const handleBatalKeterangan = () => {
    setShowKeteranganModal(false);
    setCurrentSiswaIndex(null);
    setKeteranganForm({ alasan: '', jam: '', jamKe: '', file: null });
  };

  const handleSimpan = async () => {
      // confirm
    const result = await Swal.fire({
        title: 'Simpan Presensi?',
        text: "Pastikan data sudah benar.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Simpan',
        cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    try {
        setLoading(true);
        const attendanceData = siswaList.map(s => {
            let reason = s.keterangan ? (s.keterangan.alasan) : null;
             // Append details to reason for backend storage consistency
            if (s.keterangan && s.keterangan.jam) {
                reason = `${reason} (Jam: ${s.keterangan.jam})`;
            }
            if (s.keterangan && s.keterangan.jamKeLabel) {
                 reason = `${reason} (${s.keterangan.jamKeLabel})`;
            }

            return {
                student_id: s.id,
                status: mapUiStatusToBackend(s.status),
                reason: reason
            };
        });

        const response = await attendanceService.bulkManualAttendance({
            schedule_id: scheduleId,
            date: new Date().toISOString().split('T')[0], // Ensure date is sent
            items: attendanceData
        });

        // Upload Documents
        const savedData = response.data; // Array of saved attendance models
        if (savedData && Array.isArray(savedData)) {
             const attendanceMap = savedData.reduce((acc, curr) => ({ ...acc, [curr.student_id]: curr.id }), {});
             const studentsWithFiles = siswaList.filter(s => s.dokumen && s.dokumen instanceof File);

             if (studentsWithFiles.length > 0) {
                 // We could show a progress alert here
                 for (const student of studentsWithFiles) {
                     const attendanceId = attendanceMap[student.id];
                     if (attendanceId) {
                         try {
                            await attendanceService.uploadDocument(attendanceId, student.dokumen);
                         } catch (uploadErr) {
                             console.error(`Failed upload for ${student.nama}`, uploadErr);
                         }
                     }
                 }
             }
        }

        Swal.fire('Berhasil', 'Data presensi berhasil disimpan.', 'success');
        fetchData(); // Refresh to switch to view mode cleanly
    } catch (err) {
        console.error("Save failure:", err);
        Swal.fire('Gagal', 'Gagal menyimpan presensi: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleEdit = () => {
    setMode('input');
  };

  const handleBackToDashboard = () => {
    navigate('/walikelas/dashboard'); 
  };

  const handleLihatDokumen = (siswa) => {
    // If it's a file object (newly uploaded but not saved), create preview
    if (siswa.dokumen instanceof File) {
         const url = URL.createObjectURL(siswa.dokumen);
         // We need to modify how Modal shows it or just open in new tab?
         // The modal expects logic to match.
         // Let's reuse existing logic but handle different structure.
         // Current logic: uses siswaList[current].dokumen.url
         // We'll adapt it in the render or here.
         // Actually, let's keep simple: view mode uses URLs. Input mode might view preview?
         // For now, view mode is where "Lihat Surat" usually appears.
         // Input mode has "File selected".
         // Let's assume this is for View Mode mainly.
    }
    
    // For view mode
    setCurrentSiswaIndex(siswaList.findIndex(s => s.id === siswa.id));
    setShowDokumenModal(true);
  };

  const handleCloseDokumen = () => {
    setShowDokumenModal(false);
    setCurrentSiswaIndex(null);
  };

  const getStatusBadge = (siswa) => {
    const status = siswa.status;
    const hasDokumen = !!siswa.dokumen;
    
    if (status === 'hadir') return <span className="status-badge hadir">Hadir</span>;
    if (status === 'alpha') return <span className="status-badge alpha">Alpha</span>;
    if (status === 'terlambat') return <span className="status-badge terlambat">Terlambat</span>;
    if (status === 'pulang') return <span className="status-badge pulang">Pulang</span>;
    
    if (status === 'sakit' || status === 'izin') {
        const badgeClass = status; 
        const badgeLabel = status.charAt(0).toUpperCase() + status.slice(1);
        
        return (
            <div className="status-with-dokumen">
                <span className={`status-badge ${badgeClass}`}>{badgeLabel}</span>
                {hasDokumen ? (
                    <button className="btn-lihat-dokumen" onClick={() => handleLihatDokumen(siswa)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        Lihat Surat
                    </button>
                ) : (
                    <span className="no-dokumen-label">Belum upload</span>
                )}
            </div>
        );
    }
    
    return null;
  };

  if (!scheduleId && !loading && siswaList.length === 0) {
    return (
      <div className="presensi-container">
        <NavbarWakel />
        <div className="no-schedule-wrapper">
          <div className="no-schedule-card">
            <h2>Tidak Ada Jadwal Dipilih</h2>
            <p>Silakan pilih jadwal dari dashboard terlebih dahulu.</p>
            <button className="btn-back-dashboard" onClick={handleBackToDashboard}>
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="presensi-container">
      <NavbarWakel />
      <div className="kehadiran-header-bar">
        <div className="header-left-section">
          <div className="class-icon-wrapper">
             <span style={{fontSize: '24px', color:'white'}}>🏫</span>
          </div>
          <div className="class-info">
            <h2 className="class-title">{scheduleInfo.kelas}</h2>
            <p className="class-subtitle">{scheduleInfo.jamKe ? `Jam Ke-${scheduleInfo.jamKe}` : 'Jadwal Hari Ini'}</p>
          </div>
        </div>

        <div className="kelas-and-action">
          <div className="kelas-pill">
            {scheduleInfo.mapel}
          </div>

          <div className="tanggal-pill">
            {scheduleInfo.date}
          </div>

          {mode === 'input' && (
            <button className="btn-simpan-presensi" onClick={handleSimpan} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          )}
        </div>
      </div>

      {loading && siswaList.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px'}}>Memuat Data...</div>
      ) : (
        <>
            {/* Mode Input Absensi */}
            {mode === 'input' && (
                <div className="presensi-table-wrapper">
                <table className="presensi-table">
                    <thead>
                    <tr>
                        <th>No</th>
                        <th>NISN</th>
                        <th>Nama Siswa</th>
                        <th>Hadir</th>
                        <th>Sakit</th>
                        <th>Izin</th>
                        <th>Alpha</th>
                        <th>Terlambat</th>
                        <th>Pulang</th>
                    </tr>
                    </thead>
                    <tbody>
                    {siswaList.map((siswa, index) => (
                        <tr key={index}>
                        <td>{siswa.no}.</td>
                        <td>{siswa.nisn}</td>
                        <td>{siswa.nama}</td>
                        <td className="radio-cell">
                            <input type="radio" name={`status-${index}`} checked={siswa.status === 'hadir'} onChange={() => handleStatusChange(index, 'hadir')} />
                        </td>
                        <td className="radio-cell">
                            <input type="radio" name={`status-${index}`} checked={siswa.status === 'sakit'} onChange={() => handleStatusChange(index, 'sakit')} />
                        </td>
                        <td className="radio-cell">
                            <input type="radio" name={`status-${index}`} checked={siswa.status === 'izin'} onChange={() => handleStatusChange(index, 'izin')} />
                        </td>
                        <td className="radio-cell">
                            <input type="radio" name={`status-${index}`} checked={siswa.status === 'alpha'} onChange={() => handleStatusChange(index, 'alpha')} />
                        </td>
                        <td className="radio-cell">
                            <input type="radio" name={`status-${index}`} checked={siswa.status === 'terlambat'} onChange={() => handleStatusChange(index, 'terlambat')} />
                        </td>
                        <td className="radio-cell">
                            <input type="radio" name={`status-${index}`} checked={siswa.status === 'pulang'} onChange={() => handleStatusChange(index, 'pulang')} />
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}

            {/* Mode View Kehadiran */}
            {mode === 'view' && (
                <div className="kehadiran-view-wrapper">
                    <table className="kehadiran-view-table">
                    <thead>
                        <tr>
                        <th>No</th>
                        <th>NISN</th>
                        <th>Nama Siswa</th>
                        <th>Status</th>
                        <th>Keterangan</th>
                        <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {siswaList.map((siswa, index) => (
                        <tr key={index}>
                            <td>{siswa.no}.</td>
                            <td>{siswa.nisn}</td>
                            <td>{siswa.nama}</td>
                            <td>{getStatusBadge(siswa)}</td>
                            <td>
                                {siswa.keterangan ? (
                                    <span className="keterangan-text">
                                        {siswa.keterangan.formatted || siswa.keterangan.alasan}
                                    </span>
                                ) : '-'}
                            </td>
                            <td className="aksi-cell">
                            <button className="btn-edit" onClick={handleEdit}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        </>
      )}

      {/* MODAL KETERANGAN */}
      {showKeteranganModal && (
        <div className="modal-overlay" onClick={handleBatalKeterangan}>
          <div className="modal-keterangan" onClick={(e) => e.stopPropagation()}>
            <div className="modal-keterangan-header">
              <h2>Input Keterangan {keteranganTipe.charAt(0).toUpperCase() + keteranganTipe.slice(1)}</h2>
              <button className="close-btn" onClick={handleBatalKeterangan}>×</button>
            </div>
            <div className="keterangan-form">
              <div className="siswa-info-box">
                <strong>{siswaList[currentSiswaIndex]?.nama}</strong>
                <span className="siswa-nisn">{siswaList[currentSiswaIndex]?.nisn}</span>
              </div>
              
              {keteranganTipe === 'terlambat' && (
                <div className="form-group">
                  <label>Jam Masuk</label>
                  <input type="time" value={keteranganForm.jam} onChange={(e) => setKeteranganForm({...keteranganForm, jam: e.target.value})} />
                </div>
              )}

              {keteranganTipe === 'pulang' && (
                <div className="form-group">
                  <label>Pulang di Jam Ke-</label>
                  <select className="input-select" value={keteranganForm.jamKe} onChange={(e) => setKeteranganForm({...keteranganForm, jamKe: e.target.value})}>
                    <option value="">Pilih jam...</option>
                    {daftarJamKe.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label>Alasan</label>
                <textarea className="input-textarea" rows="4" value={keteranganForm.alasan} onChange={(e) => setKeteranganForm({...keteranganForm, alasan: e.target.value})}></textarea>
              </div>

               {(keteranganTipe === 'sakit' || keteranganTipe === 'izin') && (
                  <div className="form-group">
                      <label>Upload Surat/Bukti (Opsional)</label>
                      <input 
                          type="file" 
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="input-file"
                          style={{width:'100%', padding:'10px', border:'1px solid #ddd', borderRadius:'12px'}}
                      />
                      <small style={{color:'#666', marginTop:'5px', display:'block'}}>Format: JPG, PNG, PDF</small>
                  </div>
              )}

              <div className="modal-buttons">
                <button className="btn-batal-keterangan" onClick={handleBatalKeterangan}>Batal</button>
                <button className="btn-simpan-keterangan" onClick={handleSimpanKeterangan}>Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DOKUMEN */}
      {showDokumenModal && currentSiswaIndex !== null && siswaList[currentSiswaIndex]?.dokumen && (
        <div className="modal-overlay" onClick={handleCloseDokumen}>
          <div className="modal-dokumen" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dokumen-header">
               <h2>Dokumen Surat</h2>
               <button className="close-btn" onClick={handleCloseDokumen}>×</button>
            </div>
            <div className="dokumen-content">
               <img src={siswaList[currentSiswaIndex].dokumen.url} alt="Surat" style={{maxWidth:'100%', maxHeight:'60vh'}} />
               <p>{siswaList[currentSiswaIndex].dokumen.keterangan}</p>
               <a href={siswaList[currentSiswaIndex].dokumen.url} target="_blank" rel="noopener noreferrer" className="btn-download" style={{display:'inline-block', marginTop:'10px', padding:'8px 16px', backgroundColor:'#007bff', color:'white', textDecoration:'none', borderRadius:'4px'}}>Buka di Tab Baru</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Presensi;