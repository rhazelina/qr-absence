import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PresensiSiswa.css';
import NavbarGuru from '../../components/Guru/NavbarGuru';
import attendanceService, { bulkManualAttendance } from '../../services/attendance';

function PresensiSiswa() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const hasScheduleData = state.scheduleId && state.kelas;
  const scheduleId = state.scheduleId;

  const mataPelajaran = state.mataPelajaran || '';
  const jamKe = state.jamKe || '';
  const kelas = state.kelas || '';
  const waktu = state.waktu || '';
  const tanggal = state.tanggal || '';

  const [mode, setMode] = useState('input');
  const [showKeteranganModal, setShowKeteranganModal] = useState(false);
  const [showDokumenModal, setShowDokumenModal] = useState(false);
  const [currentSiswaIndex, setCurrentSiswaIndex] = useState(null);
  const [keteranganTipe, setKeteranganTipe] = useState('');
  const [keteranganForm, setKeteranganForm] = useState({
    alasan: '',
    jam: '',
    jamKe: '', // Untuk pulang
    file: null
  });

  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Daftar jam pelajaran (8 jam per hari)
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
    if (hasScheduleData) {
      fetchSiswa();
    } else {
      setLoading(false);
    }
  }, [scheduleId]);

  const fetchSiswa = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getScheduleDetail(scheduleId);
      
      // Map API data to component state
      const mappedSiswa = data.students.map((student, index) => {
        let status = 'hadir'; // Default to hadir
        let keterangan = null;
        let dokumenUrl = null;

        if (student.attendance) {
           status = student.attendance.status;
           if (student.attendance.reason) {
             keterangan = { alasan: student.attendance.reason };
           }
           if (student.attendance.attachments && student.attendance.attachments.length > 0) {
             dokumenUrl = student.attendance.attachments[0].url; // Assuming backend returns signed URL or path
           }
        }
        
        return {
          id: student.id, // student_id
          no: index + 1,
          nisn: student.nisn || student.nis || '-',
          nama: student.name,
          status: status,
          keterangan: keterangan,
          dokumen: null, // File object for upload
          dokumenUrl: dokumenUrl // Existing document URL
        };
      });

      setSiswaList(mappedSiswa);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Gagal mengambil data siswa.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (index, newStatus) => {
    const requiresModal = ['terlambat', 'pulang', 'sakit', 'izin'].includes(newStatus);

    if (requiresModal) {
      setCurrentSiswaIndex(index);
      setKeteranganTipe(newStatus);
      setShowKeteranganModal(true);
      setKeteranganForm({ alasan: '', jam: '', jamKe: '', file: null });
    } else {
      const updated = [...siswaList];
      updated[index].status = newStatus;
      
      // Auto-text logic from revision
      if (newStatus === 'hadir' || newStatus === 'present') {
        updated[index].keterangan = { auto: true, alasan: 'Hadir tepat waktu' };
      } else if (newStatus === 'alpha' || newStatus === 'absent') {
        updated[index].keterangan = { auto: true, alasan: 'Tanpa keterangan' };
      } else {
        updated[index].keterangan = null;
      }
      
      updated[index].dokumen = null;
      setSiswaList(updated);
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
    
    // Simpan data sesuai tipe
    // reason starts with explicit reason from form
    let reason = keteranganForm.alasan; 

    if (keteranganTipe === 'terlambat') {
        // For display in frontend
        updated[currentSiswaIndex].keterangan = {
            alasan: reason,
            jam: keteranganForm.jam
        };
    } else if (keteranganTipe === 'pulang') {
        const jamLabel = daftarJamKe.find(j => j.value === keteranganForm.jamKe)?.label || '';
         updated[currentSiswaIndex].keterangan = {
            alasan: reason,
            jamKe: keteranganForm.jamKe,
            jamKeLabel: jamLabel
        };
    } else {
         updated[currentSiswaIndex].keterangan = {
            alasan: reason
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setKeteranganForm({ ...keteranganForm, file: e.target.files[0] });
    }
  };

  const handleSimpan = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menyimpan presensi ini?')) return;

    setSaving(true);
    try {
      const payload = {
        schedule_id: scheduleId,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        items: siswaList.map(siswa => {
            let reason = siswa.keterangan ? siswa.keterangan.alasan : null;
            // Append explicit details to reason string for consistency
            if (siswa.keterangan && siswa.keterangan.jam) {
                reason = `${reason} (Jam: ${siswa.keterangan.jam})`;
            }
            if (siswa.keterangan && siswa.keterangan.jamKeLabel) {
                 reason = `${reason} (${siswa.keterangan.jamKeLabel})`;
            }

            return {
                student_id: siswa.id,
                status: siswa.status,
                reason: reason
            };
        })
      };
      
      const response = await bulkManualAttendance(payload);
      
      // Now Upload Documents
      const attendanceData = response.data; // Array of saved attendance objects
      if (attendanceData && Array.isArray(attendanceData)) {
         const attendanceMap = attendanceData.reduce((acc, curr) => ({ ...acc, [curr.student_id]: curr.id }), {});
         
         const studentsWithFiles = siswaList.filter(s => s.dokumen);
         if (studentsWithFiles.length > 0) {
             setUploading(true);
             for (const student of studentsWithFiles) {
                 const attendanceId = attendanceMap[student.id];
                 if (attendanceId) {
                     try {
                        await attendanceService.uploadDocument(attendanceId, student.dokumen);
                     } catch (uploadErr) {
                         console.error(`Failed to upload document for student ${student.id}`, uploadErr);
                     }
                 }
             }
             setUploading(false);
         }
      }

      alert('Absensi berhasil disimpan!');
      setMode('view');
      fetchSiswa(); // Refresh data to get URLs and latest status
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert('Gagal menyimpan absensi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleEdit = () => {
    setMode('input');
  };

  const handleBackToDashboard = () => {
    navigate('/guru/dashboard');
  };

  const handleLihatDokumen = async (docUrl) => {
    if (!docUrl) return;
    try {
        // If it's a proxy URL, we might need to handle auth, but browser should handle it if cookie based or token.
        // If it returns a signed URL, open it.
        window.open(docUrl, '_blank');
    } catch (e) {
        alert("Gagal membuka dokumen.");
    }
  };

  const getStatusBadge = (siswa) => {
    const status = siswa.status;
    
    if (status === 'hadir') return <span className="status-badge hadir">Hadir</span>;
    if (status === 'alpha' || status === 'absent') return <span className="status-badge alpha">Alpha</span>;
    if (status === 'terlambat' || status === 'late') return <span className="status-badge terlambat">Terlambat</span>;
    if (status === 'pulang' || status === 'return') return <span className="status-badge pulang">Pulang</span>;
    if (status === 'sakit' || status === 'sick') return <span className="status-badge sakit">Sakit</span>;
    if (status === 'izin' || status === 'excused') return <span className="status-badge izin">Izin</span>;
    
    return <span className="status-badge">{status}</span>;
  };

  if (!hasScheduleData) {
    return (
      <div className="presensi-container">
        <NavbarGuru />
        <div className="no-schedule-wrapper">
          <div className="no-schedule-card">
            <div className="no-schedule-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <h2>Tidak Ada Jadwal Dipilih</h2>
            <p>Silakan pilih jadwal dari dashboard terlebih dahulu untuk melakukan presensi.</p>
            <button className="btn-back-dashboard" onClick={handleBackToDashboard}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
     return <div className="loading-container">Memuat data siswa...</div>;
  }

  return (
    <div className="presensi-container">
      <NavbarGuru />
      <div className="kehadiran-header-bar">
        <div className="header-left-section">
          <div className="class-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
          </div>
          <div className="class-info">
            <h2 className="class-title">{kelas}</h2>
            <p className="class-subtitle">{jamKe ? `Jam Ke-${jamKe}` : waktu}</p>
          </div>
        </div>

        <div className="kelas-and-action">
          <div className="kelas-pill">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            {mataPelajaran}
          </div>

          <div className="tanggal-pill">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {tanggal}
          </div>

          {mode === 'input' && (
            <button className="btn-simpan-presensi" onClick={handleSimpan} disabled={saving || uploading}>
              {saving ? 'Menyimpan...' : (uploading ? 'Mengupload Dokumen...' : 'Simpan')}
            </button>
          )}
        </div>
      </div>

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
                <th>Ket</th>
              </tr>
            </thead>
            <tbody>
              {siswaList.map((siswa, index) => (
                <tr key={siswa.id}>
                  <td>{siswa.no}.</td>
                  <td>{siswa.nisn}</td>
                  <td>{siswa.nama}</td>
                  <td className="radio-cell">
                    <input type="radio" name={`status-${index}`} checked={siswa.status === 'hadir' || siswa.status === 'present'} onChange={() => handleStatusChange(index, 'hadir')} />
                  </td>
                  <td className="radio-cell">
                    <input type="radio" name={`status-${index}`} checked={siswa.status === 'sakit' || siswa.status === 'sick'} onChange={() => handleStatusChange(index, 'sakit')} />
                  </td>
                  <td className="radio-cell">
                    <input type="radio" name={`status-${index}`} checked={siswa.status === 'izin' || siswa.status === 'excused'} onChange={() => handleStatusChange(index, 'izin')} />
                  </td>
                  <td className="radio-cell">
                    <input type="radio" name={`status-${index}`} checked={siswa.status === 'alpha' || siswa.status === 'absent'} onChange={() => handleStatusChange(index, 'alpha')} />
                  </td>
                  <td className="radio-cell">
                    <input type="radio" name={`status-${index}`} checked={siswa.status === 'terlambat' || siswa.status === 'late'} onChange={() => handleStatusChange(index, 'terlambat')} />
                  </td>
                  <td className="radio-cell">
                    <input type="radio" name={`status-${index}`} checked={siswa.status === 'pulang' || siswa.status === 'return'} onChange={() => handleStatusChange(index, 'pulang')} />
                  </td>
                  <td>
                    {siswa.dokumen && (
                        <span title="Dokumen akan diupload" style={{color: 'green'}}>📄</span>
                    )}
                    {siswa.keterangan && (
                        <span title={siswa.keterangan.alasan} style={{marginLeft: '5px'}}>📝</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mode View Kehadiran */}
      {mode === 'view' && (
        <>
          <div className="kehadiran-view-wrapper">
            <table className="kehadiran-view-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>NISN</th>
                  <th>Nama Siswa</th>
                  <th>Mata Pelajaran</th>
                  <th>Status</th>
                  <th>Keterangan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {siswaList.map((siswa, index) => (
                  <tr key={siswa.id}>
                    <td>{siswa.no}.</td>
                    <td>{siswa.nisn}</td>
                    <td>{siswa.nama}</td>
                    <td>{mataPelajaran}</td>
                    <td>{getStatusBadge(siswa)}</td>
                    <td>
                      {(siswa.keterangan || siswa.dokumenUrl) ? (
                        <div className="keterangan-detail">
                             {siswa.keterangan && (
                                <div className="keterangan-alasan">
                                    {siswa.keterangan.alasan || JSON.stringify(siswa.keterangan)}
                                </div>
                             )}
                             {siswa.dokumenUrl && (
                                <button className="btn-lihat-dokumen" onClick={() => handleLihatDokumen(siswa.dokumenUrl)}>
                                    Lihat Surat
                                </button>
                             )}
                        </div>
                      ) : (
                        <span className="no-keterangan">-</span>
                      )}
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
        </>
      )}

      {/* MODAL KETERANGAN */}
      {showKeteranganModal && (
        <div className="modal-overlay" onClick={handleBatalKeterangan}>
          <div className="modal-keterangan" onClick={(e) => e.stopPropagation()}>
            <div className="modal-keterangan-header">
              <h2>
                {['sakit', 'izin', 'sick', 'excused'].includes(keteranganTipe) ? 'Keterangan Sakit/Izin' : 
                 (keteranganTipe === 'terlambat' ? 'Keterangan Terlambat' : 'Keterangan Pulang')}
              </h2>
              <button className="close-btn" onClick={handleBatalKeterangan}>×</button>
            </div>

            <div className="keterangan-form">
              <div className="siswa-info-box">
                <strong>{siswaList[currentSiswaIndex]?.nama}</strong>
                <span className="siswa-nisn">{siswaList[currentSiswaIndex]?.nisn}</span>
              </div>

              {/* Form Content based on Type */}
              {keteranganTipe === 'terlambat' && (
                <div className="form-group">
                  <label>Jam Masuk</label>
                  <div className="input-icon">
                    <input
                      type="time"
                      value={keteranganForm.jam}
                      onChange={(e) => setKeteranganForm({...keteranganForm, jam: e.target.value})}
                      required
                    />
                  </div>
                </div>
              )}

              {keteranganTipe === 'pulang' && (
                <div className="form-group">
                  <label>Pulang di Jam Ke-</label>
                  <select
                    className="input-select"
                    value={keteranganForm.jamKe}
                    onChange={(e) => setKeteranganForm({...keteranganForm, jamKe: e.target.value})}
                    required
                  >
                    <option value="">Pilih jam ke-...</option>
                    {daftarJamKe.map((jam) => (
                      <option key={jam.value} value={jam.value}>
                        {jam.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Alasan</label>
                <textarea
                  placeholder="Masukkan alasan..."
                  className="input-textarea"
                  rows="3"
                  value={keteranganForm.alasan}
                  onChange={(e) => setKeteranganForm({...keteranganForm, alasan: e.target.value})}
                  required={['sakit', 'izin', 'terlambat', 'pulang'].includes(keteranganTipe)}
                ></textarea>
              </div>

              {['sakit', 'izin', 'sick', 'excused'].includes(keteranganTipe) && (
                  <div className="form-group">
                    <label>Upload Bukti / Surat (Opsional)</label>
                    <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="input-file"
                    />
                    <small>Format: JPG, PNG, PDF. Maks 5MB.</small>
                  </div>
              )}

              <div className="modal-buttons">
                <button className="btn-batal-keterangan" onClick={handleBatalKeterangan}>
                  Batal
                </button>
                <button className="btn-simpan-keterangan" onClick={handleSimpanKeterangan}>
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PresensiSiswa;