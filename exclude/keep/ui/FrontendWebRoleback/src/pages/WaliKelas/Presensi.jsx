import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Presensi.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';

function Presensi() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const hasScheduleData = state.mataPelajaran && state.kelas;

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
    jamKe: '' // Untuk pulang
  });

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

  const getSiswaByKelas = (kelasNama) => {
    const dummyData = {
      'XII RPL 2': [
        { 
          no: 1, 
          nisn: '1348576392', 
          nama: 'Wito Suherman Suhermin', 
          status: 'hadir', 
          keterangan: null,
          dokumen: null
        },
        { 
          no: 2, 
          nisn: '1348576393', 
          nama: 'Ahmad Rizki Pratama', 
          status: 'hadir', 
          keterangan: null,
          dokumen: null
        },
        { 
          no: 3, 
          nisn: '1348576394', 
          nama: 'Siti Nurhaliza', 
          status: 'sakit', 
          keterangan: null,
          dokumen: {
            jenis: 'Surat Dokter',
            tanggal: '28 Jan 2026',
            file: 'surat-dokter-siti.pdf',
            keterangan: 'Demam tinggi, istirahat 3 hari'
          }
        },
        { 
          no: 4, 
          nisn: '1348576395', 
          nama: 'Budi Santoso', 
          status: 'izin', 
          keterangan: null,
          dokumen: {
            jenis: 'Surat Izin Orang Tua',
            tanggal: '28 Jan 2026',
            file: 'surat-izin-budi.pdf',
            keterangan: 'Acara keluarga di luar kota'
          }
        },
        { 
          no: 5, 
          nisn: '1348576396', 
          nama: 'Dewi Lestari', 
          status: 'izin', 
          keterangan: null,
          dokumen: null // Belum upload surat
        },
        { 
          no: 6, 
          nisn: '1348576397', 
          nama: 'Rina Amelia', 
          status: 'hadir', 
          keterangan: null,
          dokumen: null
        },
      ],
      'XII RPL 1': [
        { 
          no: 1, 
          nisn: '1348576398', 
          nama: 'Andi Setiawan', 
          status: 'hadir', 
          keterangan: null,
          dokumen: null
        },
        { 
          no: 2, 
          nisn: '1348576399', 
          nama: 'Putri Ayu', 
          status: 'hadir', 
          keterangan: null,
          dokumen: null
        },
        { 
          no: 3, 
          nisn: '1348576400', 
          nama: 'Joko Widodo', 
          status: 'sakit', 
          keterangan: null,
          dokumen: {
            jenis: 'Surat Dokter',
            tanggal: '28 Jan 2026',
            file: 'surat-dokter-joko.pdf',
            keterangan: 'Sakit maag akut'
          }
        },
        { 
          no: 4, 
          nisn: '1348576401', 
          nama: 'Maya Sari', 
          status: 'hadir', 
          keterangan: null,
          dokumen: null
        },
        { 
          no: 5, 
          nisn: '1348576402', 
          nama: 'Rudi Hermawan', 
          status: 'hadir', 
          keterangan: null,
          dokumen: null
        },
      ],
    };
    return dummyData[kelasNama] || [];
  };

  const [siswaList, setSiswaList] = useState(getSiswaByKelas(kelas));

  const handleStatusChange = (index, newStatus) => {
    if (newStatus === 'terlambat' || newStatus === 'pulang') {
      setCurrentSiswaIndex(index);
      setKeteranganTipe(newStatus);
      setShowKeteranganModal(true);
      setKeteranganForm({ alasan: '', jam: '', jamKe: '' });
    } else {
      const updated = [...siswaList];
      updated[index].status = newStatus;
      updated[index].keterangan = null;
      setSiswaList(updated);
    }
  };

  const handleSimpanKeterangan = () => {
    // Validasi berbeda untuk terlambat dan pulang
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
    updated[currentSiswaIndex].status = keteranganTipe;
    
    // Simpan data sesuai tipe
    if (keteranganTipe === 'terlambat') {
      updated[currentSiswaIndex].keterangan = {
        alasan: keteranganForm.alasan,
        jam: keteranganForm.jam
      };
    } else {
      updated[currentSiswaIndex].keterangan = {
        alasan: keteranganForm.alasan,
        jamKe: keteranganForm.jamKe,
        jamKeLabel: daftarJamKe.find(j => j.value === keteranganForm.jamKe)?.label || ''
      };
    }
    
    setSiswaList(updated);
    
    setShowKeteranganModal(false);
    setCurrentSiswaIndex(null);
    setKeteranganForm({ alasan: '', jam: '', jamKe: '' });
  };

  const handleBatalKeterangan = () => {
    setShowKeteranganModal(false);
    setCurrentSiswaIndex(null);
    setKeteranganForm({ alasan: '', jam: '', jamKe: '' });
  };

  const handleSimpan = () => {
    alert('Absensi berhasil disimpan!');
    setMode('view');
  };

  const handleEdit = () => {
    setMode('input');
  };

  const handleBackToDashboard = () => {
    navigate('/guru/dashboard');
  };

  const handleLihatDokumen = (siswa) => {
    setCurrentSiswaIndex(siswaList.findIndex(s => s.nisn === siswa.nisn));
    setShowDokumenModal(true);
  };

  const handleCloseDokumen = () => {
    setShowDokumenModal(false);
    setCurrentSiswaIndex(null);
  };

  const getStatusBadge = (siswa) => {
    const status = siswa.status;
    const hasDokumen = siswa.dokumen !== null;
    
    if (status === 'hadir') return <span className="status-badge hadir">Hadir</span>;
    if (status === 'alpha') return <span className="status-badge alpha">Alpha</span>;
    if (status === 'terlambat') return <span className="status-badge terlambat">Terlambat</span>;
    if (status === 'pulang') return <span className="status-badge pulang">Pulang</span>;
    
    // Sakit atau Izin dengan dokumen
    if (status === 'sakit') {
      return (
        <div className="status-with-dokumen">
          <span className="status-badge sakit">Sakit</span>
          {hasDokumen && (
            <button className="btn-lihat-dokumen" onClick={() => handleLihatDokumen(siswa)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Lihat Surat
            </button>
          )}
          {!hasDokumen && (
            <span className="no-dokumen-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Belum upload
            </span>
          )}
        </div>
      );
    }
    
    if (status === 'izin') {
      return (
        <div className="status-with-dokumen">
          <span className="status-badge izin">Izin</span>
          {hasDokumen && (
            <button className="btn-lihat-dokumen" onClick={() => handleLihatDokumen(siswa)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Lihat Surat
            </button>
          )}
          {!hasDokumen && (
            <span className="no-dokumen-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Belum upload
            </span>
          )}
        </div>
      );
    }
    
    return null;
  };

  if (!hasScheduleData) {
    return (
      <div className="presensi-container">
        <NavbarWakel />
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

  return (
    <div className="presensi-container">
      <NavbarWakel />
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
                  <tr key={index}>
                    <td>{siswa.no}.</td>
                    <td>{siswa.nisn}</td>
                    <td>{siswa.nama}</td>
                    <td>{mataPelajaran}</td>
                    <td>{getStatusBadge(siswa)}</td>
                    <td>
                      {siswa.keterangan ? (
                        <div className="keterangan-detail">
                          {siswa.keterangan.jam && (
                            <div className="keterangan-jam">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              {siswa.keterangan.jam}
                            </div>
                          )}
                          {siswa.keterangan.jamKeLabel && (
                            <div className="keterangan-jam">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                              </svg>
                              {siswa.keterangan.jamKeLabel}
                            </div>
                          )}
                          <div className="keterangan-alasan">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                            {siswa.keterangan.alasan}
                          </div>
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

      {/* MODAL KETERANGAN TERLAMBAT/PULANG */}
      {showKeteranganModal && (
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

              {/* Input berbeda untuk Terlambat vs Pulang */}
              {keteranganTipe === 'terlambat' ? (
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
              ) : (
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
                  placeholder={`Masukkan alasan ${keteranganTipe === 'terlambat' ? 'terlambat' : 'pulang cepat'}...`}
                  className="input-textarea"
                  rows="4"
                  value={keteranganForm.alasan}
                  onChange={(e) => setKeteranganForm({...keteranganForm, alasan: e.target.value})}
                  required
                ></textarea>
              </div>

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

      {/* MODAL LIHAT DOKUMEN */}
      {showDokumenModal && currentSiswaIndex !== null && siswaList[currentSiswaIndex]?.dokumen && (
        <div className="modal-overlay" onClick={handleCloseDokumen}>
          <div className="modal-dokumen" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dokumen-header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Dokumen Surat
              </h2>
              <button className="close-btn" onClick={handleCloseDokumen}>×</button>
            </div>

            <div className="dokumen-content">
              <div className="siswa-info-box">
                <strong>{siswaList[currentSiswaIndex]?.nama}</strong>
                <span className="siswa-nisn">{siswaList[currentSiswaIndex]?.nisn}</span>
              </div>

              <div className="dokumen-info">
                <div className="info-row">
                  <span className="info-label">Jenis Surat:</span>
                  <span className="info-value">{siswaList[currentSiswaIndex]?.dokumen.jenis}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Tanggal Upload:</span>
                  <span className="info-value">{siswaList[currentSiswaIndex]?.dokumen.tanggal}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Keterangan:</span>
                  <span className="info-value">{siswaList[currentSiswaIndex]?.dokumen.keterangan}</span>
                </div>
              </div>

              <div className="dokumen-file-preview">
                <div className="file-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg>
                </div>
                <div className="file-info">
                  <div className="file-name">{siswaList[currentSiswaIndex]?.dokumen.file}</div>
                  <div className="file-type">PDF Document</div>
                </div>
                <button className="btn-download">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download
                </button>
              </div>

              <div className="dokumen-note">
                <strong>Catatan:</strong> Dokumen ini diupload oleh Wali Kelas
              </div>

              <button className="btn-tutup-dokumen" onClick={handleCloseDokumen}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Presensi;