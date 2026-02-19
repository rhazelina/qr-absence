import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Data.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import InputSuratModal from '../../components/WaliKelas/InputDispensasiModal';
import apiService from '../../utils/api';

const Data = () => {
  const navigate = useNavigate();
  const [editingIndex, setEditingIndex] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // ✅ MODIFIED: Hapus filterType 'hari', hanya ada 'all' dan 'mapel'
  const [filterType, setFilterType] = useState('all'); // 'all', 'mapel'
  const [selectedMapel, setSelectedMapel] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

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

  const [kelasInfo, setKelasInfo] = useState({
    nama: 'Memuat...',
  });

  const [daftarMapel, setDaftarMapel] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get Homeroom Class Info (Indirectly via students or specific endpoint if needed)
      // For now we get class info from the first student or separate endpoint if available.
      // Actually teacher profile has homeroom class.
      // Let's assume we can get class name from student list or another call.
      // apiService.getHomeroomStudents() returns student list.
      const students = await apiService.getHomeroomStudents();

      // 2. Get Today's Attendance
      const today = new Date().toISOString().split('T')[0];
      const attendance = await apiService.getHomeroomAttendance({
        from: today,
        to: today
      });

      // 3. Map Data
      const attendanceMap = {};
      attendance.forEach(record => {
        attendanceMap[record.student_id] = record;
      });

      const mappedStudents = students.map(student => {
        const record = attendanceMap[student.id];
        return {
          id: student.id,
          nisn: student.nis || student.nisn || '-',
          nama: student.user.name,
          status: record ? record.status : 'Belum Absen', // Default status
          keterangan: record ? (record.remarks || '-') : '-',
          suratFile: null, // TODO: Fetch document if exists
          suratFileName: null,
          jamMasuk: record && record.checked_in_at ? record.checked_in_at.substring(11, 16) : null,
          wasTerlambat: record ? record.status === 'late' : false, // Check if logic needs adjustment
          mapel: '-', // Mapel context might be missing in daily view unless filtered by schedule
        };
      });

      setStudentList(mappedStudents);

      if (students.length > 0 && students[0].class_room) {
        setKelasInfo({ nama: students[0].class_room.name });
      } else {
        // Fallback or fetch profile?
        const profile = await apiService.getProfile();
        if (profile && profile.teacher && profile.teacher.homeroom_class) {
          setKelasInfo({ nama: profile.teacher.homeroom_class.name });
        }
      }

    } catch (error) {
      console.error("Failed to fetch data", error);
      // alert("Gagal mengambil data homeroom.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ MODIFIED: Hapus filter berdasarkan tanggal
  const getFilteredStudents = () => {
    let filtered = [...studentList];

    if (filterType === 'mapel' && selectedMapel) {
      filtered = filtered.filter(s => s.mapel === selectedMapel);
    }

    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  const stats = {
    Hadir: filteredStudents.filter((s) => ['present', 'late', 'Hadir'].includes(s.status)).length,
    Izin: filteredStudents.filter((s) => ['izin', 'excused', 'Izin'].includes(s.status)).length,
    Sakit: filteredStudents.filter((s) => ['sick', 'Sakit'].includes(s.status)).length,
    Alfa: filteredStudents.filter((s) => ['absent', 'Alfa', 'Belum Absen'].includes(s.status)).length, // Treat Belum Absen as alpha for stats? Or separate?
    Pulang: filteredStudents.filter((s) => ['return', 'Pulang'].includes(s.status)).length,
    Terlambat: filteredStudents.filter((s) => ['late', 'Terlambat'].includes(s.status) || s.wasTerlambat).length,
  };

  // Helper to map backend status to frontend display
  const getDisplayStatus = (status) => {
    const map = {
      'present': 'Hadir',
      'late': 'Terlambat',
      'sick': 'Sakit',
      'medicine': 'Sakit', // In case
      'excused': 'Izin',
      'izin': 'Izin',
      'absent': 'Alfa',
      'return': 'Pulang',
      'Belum Absen': 'Belum Absen'
    };
    return map[status] || status;
  };

  const handleStatusChange = async (index, value) => {
    // Optimistic update
    const updated = [...studentList];
    const student = filteredStudents[index];
    const actualIndex = studentList.findIndex(s => s.id === student.id);

    const oldStatus = updated[actualIndex].status;
    updated[actualIndex].status = value;

    if (value !== 'Terlambat') {
      updated[actualIndex].jamMasuk = null;
    }

    setStudentList(updated);
    setEditingIndex(null);

    // Call API to update status
    try {
      // Need to find attendance ID or create new manual attendance?
      // If we list students, we might not have attendance ID if they are 'Belum Absen'.
      // So we might need to hit 'manual' attendance endpoint or 'update' endpoint.
      // For simplicity now, we assume we just update state or use an API if available.
      // apiService.updateAttendanceStatus(...)
      console.log("Status updated locally. API implementation required for persistence.");
    } catch (e) {
      console.error("Failed to update status", e);
      // Revert
      updated[actualIndex].status = oldStatus;
      setStudentList(updated);
    }
  };

  const handleViewSurat = (student) => {
    // ✅ REVISI: Semua file surat sekarang adalah gambar
    const fileType = 'image';
    setPreviewModal({
      open: true,
      file: student.suratFile,
      type: fileType,
      studentName: student.nama,
      fileName: student.suratFileName,
      nisn: student.nisn,
      status: getDisplayStatus(student.status),
      keterangan: student.keterangan || (student.wasTerlambat ? `Terlambat - Masuk jam ${student.jamMasuk}` : ''),
      isTerlambat: student.wasTerlambat
    });
  };

  const handleDownloadSurat = () => {
    const link = document.createElement('a');
    link.href = previewModal.file;
    link.download = previewModal.fileName;
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
    const rawStatus = status; // Assuming status passed here is display status or raw?
    // Let's map display status to color
    const colors = {
      'Hadir': '#4caf50',
      'present': '#4caf50',
      'Izin': '#ffc107',
      'excused': '#ffc107',
      'izin': '#ffc107',
      'Sakit': '#9c27b0',
      'sick': '#9c27b0',
      'Pulang': '#ff6a1a',
      'return': '#ff6a1a',
      'Terlambat': '#ff9800',
      'late': '#ff9800',
      'Alfa': '#f44336',
      'absent': '#f44336',
      'Belum Absen': '#64748b'
    };
    return colors[status] || '#64748b';
  };

  const handleSuratUploaded = (suratData) => {
    console.log('Surat diterima:', suratData);

    const updatedList = studentList.map(student => {
      // Logic to update student list after upload
      // In real app, we should refetch data or update optimistically
      return student;
    });

    fetchData(); // Refetch to be safe
    // setStudentList(updatedList);
  };

  const needsSurat = (student) => {
    const s = getDisplayStatus(student.status);
    const statusButuhSurat = ['Izin', 'Sakit', 'Pulang'].includes(s);
    const terlambatDenganSurat = s === 'Hadir' && student.wasTerlambat && student.suratFile;
    return statusButuhSurat || terlambatDenganSurat;
  };

  const needsUploadWarning = (student) => {
    const s = getDisplayStatus(student.status);
    return ['Izin', 'Sakit', 'Pulang'].includes(s) && !student.suratFile;
  };

  const getKeteranganText = (student) => {
    if (student.wasTerlambat && student.jamMasuk) {
      return `Terlambat - Masuk jam ${student.jamMasuk}`;
    }
    const displayStatus = getDisplayStatus(student.status);
    if (displayStatus === 'Terlambat' && student.jamMasuk) {
      return `Masuk jam ${student.jamMasuk}`;
    }
    return student.keterangan || '-';
  };

  if (loading) {
    return <div className="loading-state">Memuat data...</div>;
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
              <div className="kelas-nama">{kelasInfo.nama}</div>
            </div>
          </div>

          <div className="header-right">
            <div className="header-actions">
              {/* ✅ MODIFIED: Filter dengan tampilan statis untuk mapel */}
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

                    {/* ✅ FIXED: Select selalu tampil, tidak bergantung pada filterType */}
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

            {/* ✅ MODIFIED: Hapus tampilan info tanggal */}
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
                          value={getDisplayStatus(s.status)}
                          onChange={(e) => handleStatusChange(i, e.target.value)}
                          onBlur={() => setEditingIndex(null)}
                          autoFocus
                        >
                          <option
                            value="Hadir"
                            disabled={getDisplayStatus(s.status) === 'Terlambat'}
                            style={{ color: getDisplayStatus(s.status) === 'Terlambat' ? '#999' : 'inherit' }}
                          >
                            Hadir {getDisplayStatus(s.status) === 'Terlambat' ? '(upload surat dulu)' : ''}
                          </option>
                          <option value="Izin">Izin</option>
                          <option value="Sakit">Sakit</option>
                          <option value="Alfa">Alfa</option>
                          <option value="Pulang">Pulang</option>
                          <option disabled style={{ color: '#999' }}>
                            Terlambat (dari guru)
                          </option>
                        </select>
                      ) : (
                        <div className="status-cell">
                          <span className={`status ${getDisplayStatus(s.status).toLowerCase().replace(' ', '-')}`} style={{ backgroundColor: getStatusColor(s.status), color: 'white', padding: '4px 8px', borderRadius: '4px' }}>
                            {getDisplayStatus(s.status)}
                            {s.wasTerlambat && getDisplayStatus(s.status) === 'Hadir' && (
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
                    {loading ? 'Memuat data...' : 'Tidak ada data untuk filter yang dipilih'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                    Nama Siswa
                  </span>
                  <span className="preview-info-value">{previewModal.studentName}</span>
                </div>
                <div className="preview-info-item">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                    NISN
                  </span>
                  <span className="preview-info-value">{previewModal.nisn}</span>
                </div>
                <div className="preview-info-item">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
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
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z" /></svg>
                    Keterangan
                  </span>
                  <span className="preview-info-value preview-keterangan-text">
                    {previewModal.keterangan}
                  </span>
                </div>
              )}
            </div>

            <div className="preview-modal-body">
              {/* ✅ REVISI: Semua preview sekarang adalah gambar */}
              {previewModal.file ? (
                <img src={previewModal.file} alt="Preview Surat" className="image-preview" />
              ) : (
                <div className="no-preview">File tidak tersedia</div>
              )}
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