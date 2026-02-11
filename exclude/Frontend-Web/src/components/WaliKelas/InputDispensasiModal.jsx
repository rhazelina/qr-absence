import React, { useState, useEffect } from 'react';
import './InputDispensasiModal.css';

const InputDispensasiModal = ({ isOpen, onClose, onSuratUploaded, studentList = [] }) => {
  const [daftarSiswa] = useState(studentList.length > 0 ? studentList : [
    { nisn: '00601', nama: 'Andi Pratama' },
    { nisn: '00602', nama: 'Siti Aisyah' },
    { nisn: '00603', nama: 'Budi Santoso' },
    { nisn: '00604', nama: 'Rina Lestari' },
    { nisn: '00605', nama: 'Dewi Anggraini' },
    { nisn: '00606', nama: 'Ahmad Rizki' },
    { nisn: '00607', nama: 'Nur Halimah' },
    { nisn: '00608', nama: 'Fajar Sidiq' },
    { nisn: '00609', nama: 'Maya Sari' },
    { nisn: '00610', nama: 'Rudi Hartono' }
  ]);

  // Daftar jam pelajaran (Ke-1 sampai Ke-10)
  const jamPelajaran = [
    { ke: 1, waktu: '07:00 - 07:40' },
    { ke: 2, waktu: '07:40 - 08:20' },
    { ke: 3, waktu: '08:20 - 09:00' },
    { ke: 4, waktu: '09:00 - 09:40' },
    { ke: 5, waktu: '10:00 - 10:40' },
    { ke: 6, waktu: '10:40 - 11:20' },
    { ke: 7, waktu: '12:20 - 13:00' },
    { ke: 8, waktu: '13:00 - 13:40' },
    { ke: 9, waktu: '13:40 - 14:20' },
    { ke: 10, waktu: '14:20 - 15:00' }
  ];

  // ✅ FUNGSI: Dapatkan tanggal hari ini dalam format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    jenisSurat: 'Izin',
    namaSiswa: '',
    jamBerlaku: '',
    tanggalBerlaku: getTodayDate(), // ✅ OTOMATIS HARI INI
    jamPulang: '',
    keterangan: '',
    uploadFile: null
  });

  // ✅ UPDATE: Set tanggal ke hari ini setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        tanggalBerlaku: getTodayDate()
      }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // ✅ BLOKIR: Jangan izinkan perubahan tanggal manual
    if (name === 'tanggalBerlaku') {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    // ✅ REVISI: Hanya terima gambar (JPG, JPEG, PNG)
    input.accept = 'image/jpeg,image/jpg,image/png';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // ✅ VALIDASI: Cek ukuran maksimal 5MB
        if (file.size > 5 * 1024 * 1024) {
          alert('Ukuran file maksimal 5MB');
          return;
        }
        
        // ✅ VALIDASI: Hanya terima file gambar
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          alert('File tidak dapat diunggah. Harap unggah file dalam format gambar (JPG/PNG).');
          return;
        }
        
        console.log('File uploaded:', file.name);
        setFormData(prev => ({
          ...prev,
          uploadFile: file
        }));
      }
    };
    
    input.click();
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      uploadFile: null
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.namaSiswa) {
      alert('Nama siswa harus dipilih!');
      return;
    }
    
    // ✅ Tanggal selalu hari ini, tidak perlu validasi kosong
    
    // Validasi khusus untuk Dispensasi
    if (formData.jenisSurat === 'Dispensasi' && !formData.jamBerlaku) {
      alert('Jam berlaku harus diisi untuk dispensasi!');
      return;
    }

    // Validasi khusus untuk Pulang
    if (formData.jenisSurat === 'Pulang' && !formData.jamPulang) {
      alert('Jam pelajaran pulang harus dipilih!');
      return;
    }
    
    // Buat keterangan otomatis untuk Pulang
    let keteranganFinal = formData.keterangan;
    if (formData.jenisSurat === 'Pulang' && formData.jamPulang) {
      const jamSelected = jamPelajaran.find(j => j.ke === parseInt(formData.jamPulang));
      keteranganFinal = `Pulang di Jam Ke-${formData.jamPulang} (${jamSelected.waktu.split(' - ')[0]})${formData.keterangan ? ' - ' + formData.keterangan : ''}`;
    }
    
    console.log('Submit surat:', { ...formData, keterangan: keteranganFinal });
    
    // Kirim data ke parent component
    if (onSuratUploaded) {
      onSuratUploaded({ ...formData, keterangan: keteranganFinal });
    }
    
    alert(`Surat ${formData.jenisSurat} berhasil diunggah untuk ${formData.namaSiswa}!`);
    
    // Reset form
    setFormData({
      jenisSurat: 'Izin',
      namaSiswa: '',
      jamBerlaku: '',
      tanggalBerlaku: getTodayDate(), // ✅ RESET KE HARI INI
      jamPulang: '',
      keterangan: '',
      uploadFile: null
    });
    
    onClose();
  };

  const getModalTitle = () => {
    return `Unggah Surat ${formData.jenisSurat}`;
  };

  const getHintMessage = () => {
    if (formData.jenisSurat === 'Sakit') {
      return '💡 Surat dokter disarankan untuk verifikasi';
    }
    if (formData.jenisSurat === 'Dispensasi') {
      return '💡 Pastikan dispensasi resmi dari sekolah/dinas';
    }
    if (formData.jenisSurat === 'Pulang') {
      return '💡 Pilih jam pelajaran saat siswa pulang lebih awal';
    }
    return null;
  };

  // ✅ REVISI: Hanya untuk gambar, hapus ikon PDF
  const getFileIcon = (file) => {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
      </svg>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-surat" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header-surat">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          <h2>{getModalTitle()}</h2>
        </div>

        {/* Modal Body */}
        <div className="modal-body-surat">
          
          {/* Pilih Jenis Surat */}
          <div className="form-group-surat">
            <label>Jenis Surat</label>
            <div className="radio-group" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <label className="radio-option">
                <input
                  type="radio"
                  name="jenisSurat"
                  value="Izin"
                  checked={formData.jenisSurat === 'Izin'}
                  onChange={handleInputChange}
                />
                <span className="radio-label">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                  </svg>
                  Surat Izin
                </span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="jenisSurat"
                  value="Sakit"
                  checked={formData.jenisSurat === 'Sakit'}
                  onChange={handleInputChange}
                />
                <span className="radio-label">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                  </svg>
                  Surat Sakit
                </span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="jenisSurat"
                  value="Pulang"
                  checked={formData.jenisSurat === 'Pulang'}
                  onChange={handleInputChange}
                />
                <span className="radio-label">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                  Pulang Lebih Awal
                </span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="jenisSurat"
                  value="Dispensasi"
                  checked={formData.jenisSurat === 'Dispensasi'}
                  onChange={handleInputChange}
                />
                <span className="radio-label">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                  </svg>
                  Surat Dispensasi
                </span>
              </label>
            </div>
          </div>

          {/* Hint Message */}
          {getHintMessage() && (
            <div className="hint-message">
              {getHintMessage()}
            </div>
          )}

          {/* Nama Lengkap Siswa - DROPDOWN */}
          <div className="form-group-surat">
            <label>Nama Lengkap Siswa</label>
            <div className="select-wrapper-nama-siswa">
              <svg viewBox="0 0 24 24" fill="currentColor" className="icon-nama-siswa">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <select
                name="namaSiswa"
                value={formData.namaSiswa}
                onChange={handleInputChange}
                className="select-nama-siswa-dropdown"
              >
                <option value="">-- Pilih Nama Siswa --</option>
                {daftarSiswa.map((siswa) => (
                  <option key={siswa.nisn} value={siswa.nama}>
                    {siswa.nisn} - {siswa.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tanggal Berlaku & Jam/Pelajaran */}
          <div className="form-row-surat">
            <div className="form-group-surat">
              <label>Tanggal Berlaku</label>
              <div className="input-with-icon-surat">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                {/* ✅ REVISI: Tanggal read-only, otomatis hari ini */}
                <input
                  type="date"
                  name="tanggalBerlaku"
                  value={formData.tanggalBerlaku}
                  className="form-input-surat"
                  readOnly
                  style={{ 
                    backgroundColor: '#f8fafc', 
                    cursor: 'not-allowed',
                    color: '#64748b'
                  }}
                />
              </div>
            </div>

            {/* Jam Berlaku untuk Dispensasi */}
            {formData.jenisSurat === 'Dispensasi' && (
              <div className="form-group-surat">
                <label>Jam Berlaku</label>
                <div className="input-with-icon-surat">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  <input
                    type="time"
                    name="jamBerlaku"
                    value={formData.jamBerlaku}
                    onChange={handleInputChange}
                    className="form-input-surat"
                  />
                </div>
              </div>
            )}

            {/* Pilihan Jam Pelajaran untuk Pulang */}
            {formData.jenisSurat === 'Pulang' && (
              <div className="form-group-surat">
                <label>Pulang di Jam Pelajaran Ke-</label>
                <div className="input-with-icon-surat">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  <select
                    name="jamPulang"
                    value={formData.jamPulang}
                    onChange={handleInputChange}
                    className="form-select-surat"
                  >
                    <option value="">-- Pilih Jam Pelajaran --</option>
                    {jamPelajaran.map((jam) => (
                      <option key={jam.ke} value={jam.ke}>
                        Jam Ke-{jam.ke} ({jam.waktu})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Keterangan */}
          <div className="form-group-surat">
            <label>Keterangan {formData.jenisSurat === 'Pulang' ? '(Opsional - Alasan pulang)' : ''}</label>
            <textarea
              name="keterangan"
              placeholder={
                formData.jenisSurat === 'Pulang' 
                  ? 'Alasan pulang lebih awal (opsional)' 
                  : 'Masukkan keterangan (alasan, diagnosa, dll)'
              }
              value={formData.keterangan}
              onChange={handleInputChange}
              className="form-textarea-surat"
              rows="4"
            />
          </div>

          {/* Upload Foto - Single File */}
          <div className="form-group-surat">
            <label>Unggah Foto Surat (Maks. 5MB - JPG/PNG)</label>
            <div className="upload-box">
              {formData.uploadFile ? (
                <div className="file-preview">
                  <div className="file-info">
                    {getFileIcon(formData.uploadFile)}
                    <span>{formData.uploadFile.name}</span>
                  </div>
                  <button type="button" className="remove-file-btn" onClick={handleRemoveFile}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <button type="button" className="upload-file-btn-surat" onClick={handleFileUpload}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"/>
                  </svg>
                  <span>Klik untuk Upload File</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>JPG atau PNG (Maks. 5MB)</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="modal-footer-surat">
          <button className="cancel-btn-surat" onClick={onClose}>Batal</button>
          <button className="submit-btn-surat" onClick={handleSubmit}>Unggah Surat</button>
        </div>

      </div>
    </div>
  );
};

export default InputDispensasiModal;