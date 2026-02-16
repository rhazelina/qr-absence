import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Presensi.css';
import NavbarGuru from '../../components/WaliKelas/NavbarWakel';

function Presensi() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(null);
  const [siswaList, setSiswaList] = useState([]);

  useEffect(() => {
    if (location.state && location.state.daftarSiswa) {
      setSessionData(location.state);

      const formattedSiswa = location.state.daftarSiswa.map((siswa, index) => ({
        no: index + 1,
        nisn: siswa.nisn,
        nama: siswa.nama,
        status: 'Hadir',
        keterangan: '',
        jamMasuk: null,
        suratFile: null,
        suratFileName: null,
        wasTerlambat: false,
        dokumen: null
      }));

      setSiswaList(formattedSiswa);
    } else {
      const savedData = sessionStorage.getItem('presensiData');

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSessionData(parsedData);

        if (parsedData.daftarSiswa) {
          const formattedSiswa = parsedData.daftarSiswa.map((siswa, index) => ({
            no: index + 1,
            nisn: siswa.nisn,
            nama: siswa.nama,
            status: 'Hadir',
            keterangan: '',
            jamMasuk: null,
            suratFile: null,
            suratFileName: null,
            wasTerlambat: false,
            dokumen: null
          }));
          setSiswaList(formattedSiswa);
        }
      }
    }
  }, [location.state]);

  const hasScheduleData = sessionData?.mataPelajaran && sessionData?.kelas;

  const mataPelajaran = sessionData?.mataPelajaran || '';
  const jamKe = sessionData?.jamKe || '';
  const kelas = sessionData?.kelas || '';
  const waktu = sessionData?.waktu || '';
  const tanggal = sessionData?.tanggal || '';

  const [mode, setMode] = useState('input');
  const [showKeteranganModal, setShowKeteranganModal] = useState(false);
  const [showDokumenModal, setShowDokumenModal] = useState(false);
  const [currentSiswaIndex, setCurrentSiswaIndex] = useState(null);
  const [keteranganTipe, setKeteranganTipe] = useState('');
  const [keteranganForm, setKeteranganForm] = useState({
    alasan: '',
    jam: '',
    jamKe: '',
    file: null,
    fileName: ''
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

  const getStatusColor = (status) => {
    const colors = {
      Izin: '#fac629',
      Sakit: '#9c27b0',
      Pulang: '#123cd3',
      Terlambat: '#FF5F1A',
    };
    return colors[status] || '#64748b';
  };

  const getSuratTitle = (jenisSurat) => {
    const map = {
      'Surat Dokter': 'Surat Keterangan Sakit',
      'Surat Izin Orang Tua': 'Surat Izin Orang Tua / Wali',
      'Surat Keterangan Pulang': 'Surat Keterangan Pulang Cepat',
      'Surat Izin Telat': 'Surat Keterangan Keterlambatan',
      'Sakit': 'Surat Keterangan Sakit',
      'Izin': 'Surat Izin Orang Tua / Wali',
      'Pulang': 'Surat Keterangan Pulang Cepat',
      'Terlambat': 'Surat Keterangan Keterlambatan',
    };
    return map[jenisSurat] || 'Surat Keterangan';
  };

  const handleStatusChange = (index, newStatus) => {
    if (newStatus === 'Terlambat' || newStatus === 'Pulang') {
      setCurrentSiswaIndex(index);
      setKeteranganTipe(newStatus.toLowerCase());
      setShowKeteranganModal(true);
      setKeteranganForm({ alasan: '', jam: '', jamKe: '', file: null, fileName: '' });
    } else {
      const updated = [...siswaList];
      updated[index].status = newStatus;
      updated[index].keterangan = '';
      updated[index].jamMasuk = null;
      updated[index].wasTerlambat = false;
      setSiswaList(updated);
    }
  };

  const handleSimpanKeterangan = () => {
    if (keteranganTipe === 'terlambat') {
      if (!keteranganForm.alasan || !keteranganForm.jam) {
        alert('Mohon lengkapi alasan dan jam masuk!');
        return;
      }
    } else if (keteranganTipe === 'pulang') {
      if (!keteranganForm.alasan || !keteranganForm.jamKe) {
        alert('Mohon lengkapi alasan dan jam ke-!');
        return;
      }
    }

    const updated = [...siswaList];

    if (keteranganTipe === 'terlambat') {
      updated[currentSiswaIndex].status = 'Terlambat';
      updated[currentSiswaIndex].keterangan = keteranganForm.alasan;
      updated[currentSiswaIndex].jamMasuk = keteranganForm.jam;
      updated[currentSiswaIndex].wasTerlambat = false;

      if (keteranganForm.file) {
        updated[currentSiswaIndex].suratFile = URL.createObjectURL(keteranganForm.file);
        updated[currentSiswaIndex].suratFileName = keteranganForm.fileName;
      }
    } else if (keteranganTipe === 'pulang') {
      const jamKeLabel = daftarJamKe.find(j => j.value === keteranganForm.jamKe)?.label || '';
      updated[currentSiswaIndex].status = 'Pulang';
      updated[currentSiswaIndex].keterangan = `Pulang di ${jamKeLabel} - ${keteranganForm.alasan}`;

      if (keteranganForm.file) {
        updated[currentSiswaIndex].suratFile = URL.createObjectURL(keteranganForm.file);
        updated[currentSiswaIndex].suratFileName = keteranganForm.fileName;
      }
    }

    setSiswaList(updated);
    setShowKeteranganModal(false);
    setCurrentSiswaIndex(null);
    setKeteranganForm({ alasan: '', jam: '', jamKe: '', file: null, fileName: '' });
  };

  const handleBatalKeterangan = () => {
    setShowKeteranganModal(false);
    setCurrentSiswaIndex(null);
    setKeteranganForm({ alasan: '', jam: '', jamKe: '', file: null, fileName: '' });
  };

  const handleSimpan = () => {
    const stats = {
      Hadir: 0,
      Terlambat: 0,
      Sakit: 0,
      Izin: 0,
      Alfa: 0,
      Pulang: 0
    };

    siswaList.forEach(siswa => {
      const status = siswa.status;
      if (stats.hasOwnProperty(status)) {
        stats[status]++;
      }
    });

    const currentDate = new Date().toISOString().split('T')[0];

    const presensiRecords = siswaList.map(siswa => ({
      nisn: siswa.nisn,
      nama: siswa.nama,
      status: siswa.status,
      keterangan: siswa.keterangan || '',
      jamMasuk: siswa.jamMasuk || null,
      suratFile: siswa.suratFile || null,
      suratFileName: siswa.suratFileName || null,
      wasTerlambat: siswa.wasTerlambat || false,
      mapel: mataPelajaran,
      tanggal: currentDate
    }));

    localStorage.setItem('studentAttendanceData', JSON.stringify(presensiRecords));

    const presensiMetadata = {
      mataPelajaran,
      kelas,
      jamKe,
      waktu,
      tanggal,
      timestamp: new Date().toISOString(),
      stats,
      totalSiswa: siswaList.length
    };

    localStorage.setItem('lastPresensiMetadata', JSON.stringify(presensiMetadata));

    alert(`Absensi berhasil disimpan!\n\nHadir: ${stats.Hadir}\nTerlambat: ${stats.Terlambat}\nSakit: ${stats.Sakit}\nIzin: ${stats.Izin}\nAlfa: ${stats.Alfa}\nPulang: ${stats.Pulang}`);

    setMode('view');
  };

  const handleEdit = () => {
    setMode('input');
  };

  const handleBackToDashboard = () => {
    navigate('/walikelas/dashboard');
  };

  const handleLihatDokumen = (siswa) => {
    setCurrentSiswaIndex(siswaList.findIndex(s => s.nisn === siswa.nisn));
    setShowDokumenModal(true);
  };

  const handleCloseDokumen = () => {
    setShowDokumenModal(false);
    setCurrentSiswaIndex(null);
  };

  const handleDownloadSurat = () => {
    if (currentSiswaIndex !== null && siswaList[currentSiswaIndex]?.suratFile) {
      const link = document.createElement('a');
      link.href = siswaList[currentSiswaIndex]?.suratFile;
      link.download = siswaList[currentSiswaIndex]?.suratFileName || 'surat.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusBadge = (siswa) => {
    const status = siswa.status;

    if (status === 'Hadir') return <span className="status-badge hadir">Hadir</span>;
    if (status === 'Alfa') return <span className="status-badge alfa">Alfa</span>;
    if (status === 'Terlambat') return <span className="status-badge terlambat">Terlambat</span>;
    if (status === 'Pulang') return <span className="status-badge pulang">Pulang</span>;
    if (status === 'Sakit') return <span className="status-badge sakit">Sakit</span>;
    if (status === 'Izin') return <span className="status-badge izin">Izin</span>;

    return null;
  };

  const getDokumenBadge = (siswa) => {
    const status = siswa.status;
    const hasDokumen = siswa.suratFile !== null;

    if (status !== 'Sakit' && status !== 'Izin' && status !== 'Pulang' && status !== 'Terlambat') {
      return null;
    }

    if (hasDokumen) {
      return (
        <button className="btn-lihat-dokumen" onClick={() => handleLihatDokumen(siswa)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          Lihat Surat
        </button>
      );
    } else {
      return <span className="no-dokumen-label">Belum unggah</span>;
    }
  };

  if (!hasScheduleData || siswaList.length === 0) {
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
            <h2>Tidak Ada Data Presensi</h2>
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
            <p className="class-subtitle">Jam Ke-{jamKe}</p>
          </div>
        </div>

        <div className="kelas-and-action">
          <div className="kelas-pill">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            {mataPelajaran} ({jamKe})
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
            <button className="btn-simpan-presensi" onClick={handleSimpan}>
              Simpan
            </button>
          )}
        </div>
      </div>

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
                <th>Alfa</th>
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
                    <input type="radio" name={`status-${index}`} checked={siswa.status === 'Hadir'} onChange={() => handleStatusChange(index, 'Hadir')} />
                  </td>
                  <td className="radio-cell">
                    <input type="radio" name={`status-${index}`} checked={siswa.status === 'Sakit'} onChange={() => handleStatusChange(index, 'Sakit')} />
                  </td>
                  <td className="radio-cell">
                    <input type="radio" name={`status-${index}`} checked={siswa.status === 'Izin'} onChange={() => handleStatusChange(index, 'Izin')} />
                  </td>
                  <td className="radio-cell">
                    <input type="radio" name={`status-${index}`} checked={siswa.status === 'Alfa'} onChange={() => handleStatusChange(index, 'Alfa')} />
                  </td>
                  <td className="radio-cell">
                    <input type="radio" name={`status-${index}`} checked={siswa.status === 'Terlambat'} onChange={() => handleStatusChange(index, 'Terlambat')} />
                  </td>
                  <td className="radio-cell">
                    <input type="radio" name={`status-${index}`} checked={siswa.status === 'Pulang'} onChange={() => handleStatusChange(index, 'Pulang')} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'view' && (
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
                <tr key={index}>
                  <td>{siswa.no}.</td>
                  <td>{siswa.nisn}</td>
                  <td>{siswa.nama}</td>
                  <td>{mataPelajaran}</td>
                  <td>{getStatusBadge(siswa)}</td>
                  <td>
                    <div className="keterangan-wrapper">
                      {getDokumenBadge(siswa)}
                      {siswa.keterangan ? (
                        <div className="keterangan-detail">
                          <div className="keterangan-terlambat">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            {siswa.keterangan}
                          </div>
                        </div>
                      ) : (
                        !getDokumenBadge(siswa) && <span className="no-keterangan">-</span>
                      )}
                    </div>
                  </td>
                  <td>
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

      {showKeteranganModal && currentSiswaIndex !== null && (
        <div className="modal-overlay" onClick={handleBatalKeterangan}>
          <div className="modal-keterangan" onClick={(e) => e.stopPropagation()}>
            <div className="modal-keterangan-header">
              <h2>
                {keteranganTipe === 'terlambat' ? 'Keterangan Terlambat' : 'Keterangan Pulang'}
              </h2>
              <button className="close-btn" onClick={handleBatalKeterangan}>×</button>
            </div>

            <div className="keterangan-form">
              <div className="siswa-info-box">
                <strong>{siswaList[currentSiswaIndex]?.nama}</strong>
                <span className="siswa-nisn">{siswaList[currentSiswaIndex]?.nisn}</span>
              </div>

              {keteranganTipe === 'terlambat' ? (
                <>
                  <div className="form-group">
                    <label>Jam Masuk</label>
                    <div className="input-icon">
                      <svg className="icon-clock" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <input
                        type="time"
                        value={keteranganForm.jam}
                        onChange={(e) => setKeteranganForm({...keteranganForm, jam: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Unggah Surat Keterlambatan (Opsional)</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        id="file-upload-terlambat"
                        accept="image/jpg, image/png, image/jpeg"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setKeteranganForm({ ...keteranganForm, file, fileName: file.name });
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="file-upload-terlambat" className="file-upload-label">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        {keteranganForm.fileName || 'Unggah Dokumen'}
                      </label>
                      {keteranganForm.fileName && (
                        <button
                          type="button"
                          className="btn-remove-file"
                          onClick={() => setKeteranganForm({...keteranganForm, file: null, fileName: ''})}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                      Format: JPG/JPEG, PNG (Maks. 5MB)
                    </small>
                  </div>
                </>
              ) : (
                <>
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

                  <div className="form-group">
                    <label>Unggah Surat Perizinan Pulang</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        id="file-upload-pulang"
                        accept="image/jpg, image/png, image/jpeg"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setKeteranganForm({ ...keteranganForm, file, fileName: file.name });
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="file-upload-pulang" className="file-upload-label">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        {keteranganForm.fileName || 'Unggah Dokumen'}
                      </label>
                      {keteranganForm.fileName && (
                        <button
                          type="button"
                          className="btn-remove-file"
                          onClick={() => setKeteranganForm({...keteranganForm, file: null, fileName: ''})}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                      Format: JPG/JPEG, PNG (Maks. 5MB)
                    </small>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Alasan</label>
                <textarea
                  placeholder={`Masukkan alasan ${keteranganTipe === 'terlambat' ? 'terlambat' : 'pulang cepat'}...`}
                  className="input-textarea"
                  rows="4"
                  value={keteranganForm.alasan}
                  onChange={(e) => setKeteranganForm({...keteranganForm, alasan: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="modal-buttons">
                <button className="btn-batal-keterangan" onClick={handleBatalKeterangan}>Batal</button>
                <button className="btn-simpan-keterangan" onClick={handleSimpanKeterangan}>Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDokumenModal && currentSiswaIndex !== null && siswaList[currentSiswaIndex]?.suratFile && (
        <div className="preview-modal-overlay" onClick={handleCloseDokumen}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <div>
                <h3>{getSuratTitle(siswaList[currentSiswaIndex]?.status)}</h3>
                <p className="file-name">{siswaList[currentSiswaIndex]?.suratFileName}</p>
              </div>
              <button className="close-preview" onClick={handleCloseDokumen} title="Tutup">✕</button>
            </div>

            <div className="preview-info-card">
              <div className="preview-info-row">
                <div className="preview-info-item">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    Nama Siswa
                  </span>
                  <span className="preview-info-value">{siswaList[currentSiswaIndex]?.nama}</span>
                </div>
                <div className="preview-info-item">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    NISN
                  </span>
                  <span className="preview-info-value">{siswaList[currentSiswaIndex]?.nisn}</span>
                </div>
                <div className="preview-info-item">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    Jenis Surat
                  </span>
                  <span className="preview-info-value">
                    <span
                      className="preview-status-badge"
                      style={{ backgroundColor: getStatusColor(siswaList[currentSiswaIndex]?.status) }}
                    >
                      {siswaList[currentSiswaIndex]?.status}
                    </span>
                  </span>
                </div>
              </div>
              {siswaList[currentSiswaIndex]?.keterangan && (
                <div className="preview-info-keterangan">
                  <span className="preview-info-label">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"/></svg>
                    Keterangan
                  </span>
                  <span className="preview-info-value preview-keterangan-text">
                    {siswaList[currentSiswaIndex]?.keterangan}
                  </span>
                </div>
              )}
            </div>

            <div className="preview-modal-body">
              <img
                src={siswaList[currentSiswaIndex]?.suratFile}
                alt="Surat"
                className="image-preview"
              />
            </div>

            <div className="preview-modal-footer">
              <button className="btn-download" onClick={handleDownloadSurat}>
                📥 Unduh Surat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Presensi;