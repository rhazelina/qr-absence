import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Data.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import InputSuratModal from '../../components/WaliKelas/InputDispensasiModal';

const Data = () => {
  const navigate = useNavigate();
  const [editingIndex, setEditingIndex] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [filterType, setFilterType] = useState('all');
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

  const kelasInfo = {
    nama: 'XII Rekayasa Perangkat Lunak 2',
  };

  const daftarMapel = [
    'Matematika',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Pemrograman Web',
    'Basis Data',
    'Jaringan Komputer',
    'Sistem Operasi'
  ];

  const [studentList, setStudentList] = useState([
    { nisn: '0074182519', nama: 'LAURA LAVIDA LOCA', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Matematika', tanggal: '2026-02-04' },
    { nisn: '0074320819', nama: 'LELY SAGITA', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Matematika', tanggal: '2026-02-04' },
    { nisn: '0078658367', nama: 'MAYA MELINDA WIJAYANTI', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Matematika', tanggal: '2026-02-04' },
    { nisn: '0079292238', nama: 'MOCH. ABYL GUSTIAN', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Matematika', tanggal: '2026-02-04' },
    { nisn: '0084421457', nama: 'MUHAMMAD AMINULLAH', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Bahasa Indonesia', tanggal: '2026-02-04' },
    { nisn: '0089104721', nama: 'Muhammad Azka Fadli Atthaya', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Bahasa Indonesia', tanggal: '2026-02-04' },
    { nisn: '0087917739', nama: 'MUHAMMAD HADI FIRMANSYAH', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Bahasa Indonesia', tanggal: '2026-02-04' },
    { nisn: '0074704843', nama: 'MUHAMMAD HARRIS MAULANA SAPUTRA', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Pemrograman Web', tanggal: '2026-02-04' },
    { nisn: '0077192596', nama: 'MUHAMMAD IBNU RAFFI AHDAN', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Pemrograman Web', tanggal: '2026-02-04' },
    { nisn: '0075024492', nama: 'MUHAMMAD REYHAN ATHADIANSYAH', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Pemrograman Web', tanggal: '2026-02-04' },
    { nisn: '0141951182', nama: 'MUHAMMAD WISNU DEWANDARU', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Basis Data', tanggal: '2026-02-04' },
    { nisn: '0072504970', nama: 'NABILA RAMADHAN', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Basis Data', tanggal: '2026-02-04' },
    { nisn: '0061631562', nama: 'NADIA SINTA DEVI OKTAVIA', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Basis Data', tanggal: '2026-02-04' },
    { nisn: '0081112175', nama: 'NADJWA KIRANA FIRDAUS', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Jaringan Komputer', tanggal: '2026-02-04' },
    { nisn: '0089965810', nama: 'NINDI NARITA MAULIDYA', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Jaringan Komputer', tanggal: '2026-02-04' },
    { nisn: '0085834363', nama: 'NISWATUL KHOIRIYAH', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Jaringan Komputer', tanggal: '2026-02-04' },
    { nisn: '0087884391', nama: 'NOVERITA PASCALIA RAHMA', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Sistem Operasi', tanggal: '2026-02-04' },
    { nisn: '0078285764', nama: 'NOVITA ANDRIANI', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Sistem Operasi', tanggal: '2026-02-04' },
    { nisn: '0078980482', nama: 'NOVITA AZZAHRA', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Sistem Operasi', tanggal: '2026-02-04' },
    { nisn: '0078036100', nama: 'NURUL KHASANAH', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Matematika', tanggal: '2026-02-04' },
    { nisn: '0081838771', nama: 'RACHEL ALUNA MEIZHA', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Matematika', tanggal: '2026-02-04' },
    { nisn: '0079312790', nama: 'RAENA WESTI DHEANOFA HERLIANI', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Bahasa Inggris', tanggal: '2026-02-04' },
    { nisn: '0084924963', nama: 'RAYHANUN', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Bahasa Inggris', tanggal: '2026-02-04' },
    { nisn: '0077652198', nama: 'RAYYAN DAFFA AL AFFANI', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Bahasa Inggris', tanggal: '2026-02-04' },
    { nisn: '0087959211', nama: 'RHAMEYZHA ALEA CHALILA PUTRI EDWA', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Pemrograman Web', tanggal: '2026-02-04' },
    { nisn: '0089530132', nama: 'RHEISYA MAULIDDIVA PUTRI', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Pemrograman Web', tanggal: '2026-02-04' },
    { nisn: '0089479412', nama: 'RHEYVAN RAMADHAN I.P', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Basis Data', tanggal: '2026-02-04' },
    { nisn: '0073540571', nama: 'RISKY RAMADHANI', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Basis Data', tanggal: '2026-02-04' },
    { nisn: '0076610748', nama: 'RITA AURA AGUSTINA', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Basis Data', tanggal: '2026-02-04' },
    { nisn: '0077493253', nama: 'RIZKY RAMADHANI', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Jaringan Komputer', tanggal: '2026-02-04' },
    { nisn: '0076376703', nama: "SA'IDHATUL HASANA", status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Jaringan Komputer', tanggal: '2026-02-04' },
    { nisn: '0072620559', nama: 'SHISILIA ISMU PUTRI', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Sistem Operasi', tanggal: '2026-02-04' },
    { nisn: '0072336597', nama: 'SUCI RAMADANI INDRIANSYAH', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Sistem Operasi', tanggal: '2026-02-04' },
    { nisn: '0075802873', nama: 'TALITHA NUDIA RISMATULLAH', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null, wasTerlambat: false, mapel: 'Sistem Operasi', tanggal: '2026-02-04' },
  ]);

  const getFilteredStudents = () => {
    let filtered = [...studentList];
    if (filterType === 'mapel' && selectedMapel) {
      filtered = filtered.filter(s => s.mapel === selectedMapel);
    }
    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  const stats = {
    Hadir: filteredStudents.filter((s) => s.status === 'Hadir').length,
    Izin: filteredStudents.filter((s) => s.status === 'Izin').length,
    Sakit: filteredStudents.filter((s) => s.status === 'Sakit').length,
    Alpha: filteredStudents.filter((s) => s.status === 'Alpha').length,
    Pulang: filteredStudents.filter((s) => s.status === 'Pulang').length,
    Terlambat: filteredStudents.filter((s) => s.status === 'Terlambat' || s.wasTerlambat).length,
    Dispen: filteredStudents.filter((s) => s.status === 'Dispen').length,
  };

  const handleStatusChange = (index, value) => {
    const updated = [...studentList];
    const actualIndex = studentList.findIndex(s => s.nisn === filteredStudents[index].nisn);
    updated[actualIndex].status = value;
    if (value !== 'Terlambat') {
      updated[actualIndex].jamMasuk = null;
    }
    setStudentList(updated);
    setEditingIndex(null);
  };

  const handleViewSurat = (student) => {
    setPreviewModal({
      open: true,
      file: student.suratFile,
      type: 'image',
      studentName: student.nama,
      fileName: student.suratFileName,
      nisn: student.nisn,
      status: student.status,
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
      open: false, file: null, type: null,
      studentName: '', fileName: '', nisn: '',
      status: '', keterangan: '', isTerlambat: false
    });
  };

  const getSuratTitle = (status, isTerlambat) => {
    if (isTerlambat) return 'Surat Keterangan Terlambat';
    const map = {
      Izin: 'Surat Izin Orang Tua / Wali',
      Sakit: 'Surat Keterangan Sakit',
      Pulang: 'Surat Izin Pulang Lebih Awal',
      Dispen: 'Surat Dispensasi',
    };
    return map[status] || 'Surat Keterangan';
  };

  const getStatusColor = (status) => {
    const colors = {
      Izin: '#ffc107',
      Sakit: '#9c27b0',
      Pulang: '#ff6a1a',
      Terlambat: '#ff9800',
      Dispen: '#C2185B',
    };
    return colors[status] || '#64748b';
  };

  const handleSuratUploaded = (suratData) => {
    const updatedList = studentList.map(student => {
      if (student.nama === suratData.namaSiswa) {
        const suratFile = suratData.uploadFile ? URL.createObjectURL(suratData.uploadFile) : student.suratFile;
        const suratFileName = suratData.uploadFile ? suratData.uploadFile.name : student.suratFileName;

        if (suratData.jenisSurat === 'Dispen') {
          return {
            ...student,
            status: 'Dispen',
            keterangan: suratData.keterangan || 'Dispen',
            suratFile,
            suratFileName
          };
        }

        if (student.status === 'Terlambat' && suratData.jenisSurat === 'Izin') {
          return {
            ...student,
            status: 'Hadir',
            wasTerlambat: true,
            keterangan: `Terlambat - Masuk jam ${student.jamMasuk}`,
            suratFile,
            suratFileName
          };
        }

        return {
          ...student,
          status: suratData.jenisSurat,
          keterangan: suratData.keterangan,
          suratFile,
          suratFileName
        };
      }
      return student;
    });
    setStudentList(updatedList);
  };

  const needsSurat = (student) => {
    const statusButuhSurat = ['Izin', 'Sakit', 'Pulang', 'Dispen'].includes(student.status);
    const terlambatDenganSurat = student.status === 'Hadir' && student.wasTerlambat && student.suratFile;
    return statusButuhSurat || terlambatDenganSurat;
  };

  const needsUploadWarning = (student) => {
    return ['Izin', 'Sakit', 'Pulang', 'Dispen'].includes(student.status) && !student.suratFile;
  };

  const getKeteranganText = (student) => {
    if (student.wasTerlambat && student.jamMasuk) return `Terlambat - Masuk jam ${student.jamMasuk}`;
    if (student.status === 'Terlambat' && student.jamMasuk) return `Masuk jam ${student.jamMasuk}`;
    if (student.status === 'Dispen') return student.keterangan || 'Dispen';
    return student.keterangan || '-';
  };

  return (
    <div className="kehadiran-siswa-page">
      <NavbarWakel />

      {/* ✅ Judul "Kehadiran Siswa" dikembalikan */}
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
                        <input type="radio" name="filterType" value="all"
                          checked={filterType === 'all'}
                          onChange={(e) => { setFilterType(e.target.value); setSelectedMapel(''); }}
                        />
                        Semua Data
                      </label>
                    </div>
                    <div className="filter-option">
                      <label>
                        <input type="radio" name="filterType" value="mapel"
                          checked={filterType === 'mapel'}
                          onChange={(e) => setFilterType(e.target.value)}
                        />
                        Per Mata Pelajaran
                      </label>
                    </div>
                    <div className="filter-select-wrapper">
                      <select
                        value={selectedMapel}
                        onChange={(e) => { setSelectedMapel(e.target.value); setFilterType('mapel'); }}
                        className="filter-select"
                      >
                        <option value="">Pilih Mapel</option>
                        {daftarMapel.map(mapel => (
                          <option key={mapel} value={mapel}>{mapel}</option>
                        ))}
                      </select>
                    </div>
                    <button className="filter-apply-btn" onClick={() => setShowFilterDropdown(false)}>
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

            {/* ✅ Stat boxes — semua sama putih, Dispen tidak pink */}
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
                  <tr key={i}>
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
                          <option value="Hadir" disabled={s.status === 'Terlambat'}
                            style={{ color: s.status === 'Terlambat' ? '#999' : 'inherit' }}>
                            Hadir {s.status === 'Terlambat' ? '(upload surat dulu)' : ''}
                          </option>
                          <option value="Izin">Izin</option>
                          <option value="Sakit">Sakit</option>
                          <option value="Alpha">Alpha</option>
                          <option value="Pulang">Pulang</option>
                          <option value="Dispen">Dispen</option>
                          <option disabled style={{ color: '#999' }}>Terlambat (dari guru)</option>
                        </select>
                      ) : (
                        <div className="status-cell">
                          <span className={`status ${s.status.toLowerCase()}`}>
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
                        <button title="Edit Status" onClick={() => setEditingIndex(i)}
                          className="btn-icon btn-edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button title="Lihat Surat"
                          onClick={() => needsSurat(s) && s.suratFile ? handleViewSurat(s) : null}
                          className={`btn-icon btn-view ${needsSurat(s) && s.suratFile ? 'visible' : 'invisible'}`}>
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
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
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
                    <span className="preview-status-badge"
                      style={{ backgroundColor: previewModal.isTerlambat ? '#ff9800' : getStatusColor(previewModal.status) }}>
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