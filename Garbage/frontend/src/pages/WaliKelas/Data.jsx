import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHelpers } from '../../utils/authHelpers';
import './Data.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import InputSuratModal from '../../components/WaliKelas/InputDispensasiModal';
import attendanceService from '../../services/attendance';
import Swal from 'sweetalert2';

const Data = () => {
  const navigate = useNavigate();
  const [editingIndex, setEditingIndex] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [filterType, setFilterType] = useState('all'); // 'all', 'mapel'
  const [selectedMapel, setSelectedMapel] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [classInfo, setClassInfo] = useState({ nama: '' });
  const [studentList, setStudentList] = useState([]);

  const [previewModal, setPreviewModal] = useState({ 
    open: false, 
    file: null, 
    type: null,
    studentName: '',
    fileName: '',
    nisn: '',
    status: '',
    keterangan: '',
    isTerlambat: false
  });

  const daftarMapel = [ // TODO: Fetch from API schedule if needed
    'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 
    'Pemrograman Web', 'Basis Data', 'Jaringan Komputer', 'Sistem Operasi'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get User Role
      const role = authHelpers.getRole();
      let homeroom, studentsData, attendanceData;

      // 2. Fetch data based on role
      if (role === 'student' || role === 'class_officer') {
         homeroom = await attendanceService.getStudentClassDashboard();
         studentsData = await attendanceService.getMyClassStudents();
         attendanceData = await attendanceService.getMyClassAttendance({ params: { from: today, to: today } });
      } else {
         homeroom = await attendanceService.getHomeroom();
         studentsData = await attendanceService.getHomeroomStudents();
         attendanceData = await attendanceService.getHomeroomAttendance({ params: { from: today, to: today } });
      }

      setClassInfo({ nama: homeroom.name || `${homeroom.grade} ${homeroom.major?.code || ''} ${homeroom.label}` });

      // 3. Get leaves (same endpoint for both usually, using classId)
      const leavesData = await attendanceService.getStudentsOnLeave(homeroom.id);

      // 3. Process Data
      processData(studentsData, attendanceData, leavesData.students_on_leave);

    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Gagal memuat data. " + (err.response?.data?.message || ""));
      if (err.response?.status === 404) {
          setError("Anda belum ditugaskan sebagai Wali Kelas.");
      }
    } finally {
      setLoading(false);
    }
  };

  const processData = (students, attendanceRecords, leaves) => {
    // Helper to find active leave for a student
    const getLeave = (studentId) => leaves.find(l => l.student.id === studentId);
    
    // Helper to find attendance records
    const getAttendance = (studentId) => attendanceRecords.filter(a => a.student_id === studentId);

    const processed = students.map(student => {
      const studentId = student.id;
      const leave = getLeave(studentId);
      const attendances = getAttendance(studentId);
      
      let status = 'Hadir'; // Default until marked otherwise
      let keterangan = '';
      let suratFile = null;
      let suratFileName = null;
      let wasTerlambat = false;
      let jamMasuk = null;
      let mapel = ''; 

      // Determine Status Priority
      if (leave) {
        // Map backend type to UI status
        switch (leave.type) {
            case 'sakit': status = 'Sakit'; break;
            case 'izin': status = 'Izin'; break;
            case 'izin_pulang': status = 'Pulang'; break;
            case 'dispensasi': status = 'Izin'; keterangan = 'Dispensasi'; break;
            default: status = 'Izin';
        }
        keterangan = leave.reason || keterangan;
        suratFile = leave.attachment_url;
        suratFileName = 'Bukti Surat'; 
      } else if (attendances.length > 0) {
        // Check for specific statuses in attendance records
        const hasAlpha = attendances.some(a => a.status === 'absent');
        const hasLate = attendances.some(a => a.status === 'late');
        const hasSick = attendances.some(a => a.status === 'sick');
        const hasPermission = attendances.some(a => a.status === 'permission');

        if (hasSick) status = 'Sakit';
        else if (hasPermission) status = 'Izin';
        else if (hasAlpha) status = 'Alpha';
        else if (hasLate) {
            status = 'Terlambat'; 
            wasTerlambat = true;
            // Get time from created_at
            const lateRecord = attendances.find(a => a.status === 'late');
            if (lateRecord) {
                jamMasuk = new Date(lateRecord.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});
            }
        } else {
            status = 'Hadir';
        }

        mapel = attendances[0]?.schedule?.subject?.name || '-';
      } else {
          status = 'Belum Absen'; 
      }

      return {
        id: student.id,
        nisn: student.nis, 
        nama: student.user.name,
        status: status === 'Belum Absen' ? 'Hadir' : status, 
        keterangan: keterangan,
        jamMasuk: jamMasuk,
        suratFile: suratFile,
        suratFileName: suratFileName,
        wasTerlambat: wasTerlambat,
        mapel: mapel,
        tanggal: new Date().toISOString().split('T')[0]
      };
    });

    setStudentList(processed);
  };

  const getFilteredStudents = () => {
    let filtered = [...studentList];

    if (filterType === 'mapel' && selectedMapel) {
      filtered = filtered.filter(s => s.mapel === selectedMapel);
    }

    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  const stats = {
    Hadir: studentList.filter((s) => s.status === 'Hadir').length,
    Izin: studentList.filter((s) => s.status === 'Izin').length,
    Sakit: studentList.filter((s) => s.status === 'Sakit').length,
    Alpha: studentList.filter((s) => s.status === 'Alpha').length,
    Pulang: studentList.filter((s) => s.status === 'Pulang').length,
    Terlambat: studentList.filter((s) => s.status === 'Terlambat' || s.wasTerlambat).length,
  };

  const handleStatusChange = (index, value) => {
    // If selecting Sakit/Izin/Pulang, open modal
    if (['Sakit', 'Izin', 'Pulang'].includes(value)) {
        setOpenModal(true);
        return;
    }
    
    Swal.fire({
        icon: 'info',
        title: 'Info',
        text: 'Saat ini perubahan status langsung hanya didukung melalui unggah surat (Sakit/Izin/Pulang). Untuk perubahan ke Hadir/Alpha, silakan hubungi Admin atau Piket.'
    });
    
    setEditingIndex(null);
  };

  const handleViewSurat = (student) => {
    const fileType = 'image'; 
    setPreviewModal({
      open: true,
      file: student.suratFile,
      type: fileType,
      studentName: student.nama,
      fileName: 'Dokumen Pendukung',
      nisn: student.nisn,
      status: student.status,
      keterangan: student.keterangan || (student.wasTerlambat ? `Terlambat - Masuk jam ${student.jamMasuk}` : ''),
      isTerlambat: student.wasTerlambat
    });
  };

  const handleDownloadSurat = () => {
    const link = document.createElement('a');
    link.href = previewModal.file;
    link.download = previewModal.fileName || 'dokumen.jpg';
    link.target = '_blank'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closePreview = () => {
    setPreviewModal({ 
      open: false, 
      file: null, 
      type: null,
      studentName: '',
      fileName: '',
      nisn: '',
      status: '',
      keterangan: '',
      isTerlambat: false
    });
  };

  const getSuratTitle = (status, isTerlambat) => {
    if (isTerlambat) return 'Surat Keterangan Terlambat';
    const map = {
      Izin: 'Surat Izin Orang Tua / Wali',
      Sakit: 'Surat Keterangan Sakit',
      Pulang: 'Surat Izin Pulang Lebih Awal',
    };
    return map[status] || 'Surat Keterangan';
  };

  const getStatusColor = (status) => {
    const colors = {
      Izin: '#ffc107',
      Sakit: '#9c27b0',
      Pulang: '#ff6a1a',
      Terlambat: '#ff9800',
    };
    return colors[status] || '#64748b';
  };

  const handleSuratUploaded = async (suratData) => {
    // Find student ID
    const student = studentList.find(s => s.nama === suratData.namaSiswa);
    if (!student) {
        Swal.fire('Error', 'Siswa tidak ditemukan', 'error');
        return;
    }

    try {
        setLoading(true);
        // Map UI type to Backend type
        let backendType = 'izin';
        if (suratData.jenisSurat === 'Sakit') backendType = 'sakit';
        else if (suratData.jenisSurat === 'Pulang') backendType = 'izin_pulang';
        else if (suratData.jenisSurat === 'Izin') backendType = 'izin';

        const payload = {
            student_id: student.id,
            type: backendType,
            start_time: '07:00', // Default start time
            reason: suratData.keterangan || 'Izin via Wali Kelas'
        };

        if (suratData.jenisSurat === 'Pulang') {
            payload.start_time = new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}); // Now?
            // "Pulang" applies from now until end of day
        }

        await attendanceService.submitLeavePermission(payload, suratData.uploadFile);
        
        Swal.fire('Berhasil', 'Surat berhasil diunggah dan status diperbarui', 'success');
        setOpenModal(false);
        fetchData(); // Refresh data

    } catch (err) {
        console.error("Upload failed", err);
        let msg = err.response?.data?.message || 'Gagal mengunggah surat';
        if (err.response?.data?.errors) {
            msg = Object.values(err.response.data.errors).join('\n');
        }
        Swal.fire('Gagal', msg, 'error');
    } finally {
        setLoading(false);
    }
  };

  const needsSurat = (student) => {
    const statusButuhSurat = ['Izin', 'Sakit', 'Pulang'].includes(student.status);
    const terlambatDenganSurat = student.status === 'Hadir' && student.wasTerlambat && student.suratFile;
    return statusButuhSurat || terlambatDenganSurat;
  };

  const needsUploadWarning = (student) => {
    return ['Izin', 'Sakit', 'Pulang'].includes(student.status) && !student.suratFile;
  };

  const getKeteranganText = (student) => {
    if (student.wasTerlambat && student.jamMasuk) {
      return `Terlambat - Masuk jam ${student.jamMasuk}`;
    }
    if (student.status === 'Terlambat' && student.jamMasuk) {
      return `Masuk jam ${student.jamMasuk}`;
    }
    return student.keterangan || '-';
  };

  if (error) {
    return (
        <div className="kehadiran-siswa-page">
            <NavbarWakel />
            <div className="error-container" style={{padding: '2rem', textAlign: 'center'}}>
                <h3>Terjadi Kesalahan</h3>
                <p>{error}</p>
                <button className="btn-primary" onClick={fetchData}>Coba Lagi</button>
            </div>
        </div>
    );
  }

  return (
    <div className="kehadiran-siswa-page">
      <NavbarWakel />
      <div className="page-header">
        <h1>Kehadiran Siswa</h1>
      </div>

      <div className="page-content">
        <div className="header-box">
          <div className="kelas-info">
            <div className="kelas-icon">🏫</div>
            <div>
              <div className="kelas-nama">
                  {loading ? 'Memuat...' : (classInfo.nama || 'Kelas Tidak Ditemukan')}
              </div>
            </div>
          </div>

          <div className="header-right">
            <div className="header-actions">
              <div className="filter-wrapper">
                <button 
                  className="btn-primary btn-filter" 
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  🔍 Filter {filterType !== 'all' && '●'}
                </button>
                
                {showFilterDropdown && (
                  <div className="filter-dropdown">
                    <div className="filter-option">
                      <label>
                        <input 
                          type="radio" 
                          name="filterType" 
                          value="all"
                          checked={filterType === 'all'}
                          onChange={(e) => {
                            setFilterType(e.target.value);
                            setSelectedMapel('');
                          }}
                        />
                        Semua Data
                      </label>
                    </div>

                    <div className="filter-option">
                      <label>
                        <input 
                          type="radio" 
                          name="filterType" 
                          value="mapel"
                          checked={filterType === 'mapel'}
                          onChange={(e) => setFilterType(e.target.value)}
                        />
                        Per Mata Pelajaran
                      </label>
                    </div>
                    
                    <div className="filter-select-wrapper">
                      <select 
                        value={selectedMapel} 
                        onChange={(e) => {
                          setSelectedMapel(e.target.value);
                          setFilterType('mapel');
                        }}
                        className="filter-select"
                      >
                        <option value="">Pilih Mapel</option>
                        {daftarMapel.map(mapel => (
                          <option key={mapel} value={mapel}>{mapel}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      className="filter-apply-btn"
                      onClick={() => setShowFilterDropdown(false)}
                    >
                      Terapkan
                    </button>
                  </div>
                )}
              </div>

              <button className="btn-primary" onClick={() => navigate('/walikelas/riwayatkehadiran')}>
                Lihat Rekap
              </button>
              <button className="btn-primary" onClick={() => setOpenModal(true)}>
                📄 Unggah Surat
              </button>
            </div>

            {filterType === 'mapel' && selectedMapel && (
              <div className="filter-info">
                <span>📚 {selectedMapel}</span>
              </div>
            )}

            <div className="stat-boxes">
              {Object.keys(stats).map((key) => (
                <div key={key} className="stat-item">
                  <span>{key}</span>
                  <strong>{stats[key]}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="table-wrapperr">
          {loading ? (
             <div style={{textAlign: 'center', padding: '2rem'}}>Memuat data kehadiran...</div>
          ) : (
          <table>
            <thead>
              <tr>
                <th className="col-no">No</th>
                <th className="col-nisn">NISN</th>
                <th className="col-nama">Nama</th>
                <th className="col-status">Status</th>
                <th className="col-keterangan">Keterangan</th>
                <th className="col-aksi">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, i) => (
                  <tr key={s.id || i}>
                    <td className="col-no">{i + 1}</td>
                    <td className="col-nisn">{s.nisn}</td>
                    <td className="col-nama">{s.nama}</td>
                    <td className="col-status">
                      {editingIndex === i ? (
                        <select
                          value={s.status}
                          onChange={(e) => handleStatusChange(i, e.target.value)}
                          onBlur={() => setEditingIndex(null)}
                          autoFocus
                        >
                          <option 
                            value="Hadir"
                            disabled={s.status === 'Terlambat'}
                            style={{color: s.status === 'Terlambat' ? '#999' : 'inherit'}}
                          >
                            Hadir {s.status === 'Terlambat' ? '(upload surat dulu)' : ''}
                          </option>
                          <option value="Izin">Izin</option>
                          <option value="Sakit">Sakit</option>
                          <option value="Alpha">Alpha</option>
                          <option value="Pulang">Pulang</option>
                          <option disabled style={{color: '#999'}}>
                            Terlambat (dari guru)
                          </option>
                        </select>
                      ) : (
                        <div className="status-cell">
                          <span className={`status ${s.status.toLowerCase().replace(' ', '-')}`}>
                            {s.status}
                            {s.wasTerlambat && s.status === 'Hadir' && (
                              <span className="terlambat-indicator" title="Terlambat">⏱</span>
                            )}
                          </span>
                          {needsUploadWarning(s) && (
                            <span className="surat-belum">Surat belum diunggah</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="col-keterangan">
                      <span className="keterangan-text">{getKeteranganText(s)}</span>
                    </td>
                    <td className="col-aksi">
                      <div className="aksi-icons">
                        <button
                          title="Edit Status"
                          onClick={() => setEditingIndex(i)}
                          className="btn-icon btn-edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          title="Lihat Surat"
                          onClick={() => needsSurat(s) && s.suratFile ? handleViewSurat(s) : null}
                          className={`btn-icon btn-view ${needsSurat(s) && s.suratFile ? 'visible' : 'invisible'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Tidak ada data untuk filter yang dipilih
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      <InputSuratModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSuratUploaded={handleSuratUploaded}
        studentList={studentList}
      />

      {previewModal.open && (
        <div className="preview-modal-overlay" onClick={closePreview}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <div>
                <h3>{getSuratTitle(previewModal.status, previewModal.isTerlambat)}</h3>
                <p className="file-name">{previewModal.fileName}</p>
              </div>
              <button className="close-preview" onClick={closePreview} title="Tutup">✕</button>
            </div>

            <div className="preview-info-card">
              <div className="preview-info-row">
                <div className="preview-info-item">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    Nama Siswa
                  </span>
                  <span className="preview-info-value">{previewModal.studentName}</span>
                </div>
                <div className="preview-info-item">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    NISN
                  </span>
                  <span className="preview-info-value">{previewModal.nisn}</span>
                </div>
                <div className="preview-info-item">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    Jenis Surat
                  </span>
                  <span className="preview-info-value">
                    <span 
                      className="preview-status-badge"
                      style={{ backgroundColor: previewModal.isTerlambat ? '#ff9800' : getStatusColor(previewModal.status) }}
                    >
                      {previewModal.isTerlambat ? 'Terlambat' : previewModal.status}
                    </span>
                  </span>
                </div>
              </div>
              {previewModal.keterangan && (
                <div className="preview-info-keterangan">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"/></svg>
                    Keterangan
                  </span>
                  <span className="preview-info-value preview-keterangan-text">
                    {previewModal.keterangan}
                  </span>
                </div>
              )}
            </div>

            <div className="preview-modal-body">
              <img src={previewModal.file} alt="Preview Surat" className="image-preview" />
            </div>

            <div className="preview-modal-footer">
              <button className="btn-download" onClick={handleDownloadSurat}>
                📥 Download Surat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Data;