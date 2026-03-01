// TambahGuru.jsx
import React, { useState, useEffect } from 'react';
import './TambahGuru.css';

function TambahGuru({ isOpen, onClose, onSubmit, editData }) {
  const [formData, setFormData] = useState({
    namaGuru: '',
    kodeGuru: '',
    email: '',
    role: '',
    mataPelajaran: ''
  });
  const [errors, setErrors] = useState({});

  // Dummy data wali kelas tanpa pak bu
  const daftarWaliKelas = [
    'Tidak ada',
    'Siti Nurhaliza',
    'Ahmad Dahlan',
    'Dewi Sartika',
    'Budi Santoso',
    'Ratna Kartini',
    'Joko Widodo',
    'Mega Wati',
    'Habibie Rahman'
  ];

  // Pilihan Mata Pelajaran (hanya 3)
  const kategoriMataPelajaran = ['Normatif', 'Adaptif', 'Produktif'];

  useEffect(() => {
    if (editData) {
      setFormData({
        namaGuru: editData.namaGuru || '',
        kodeGuru: editData.kodeGuru || '',
        role: editData.role || '',
        mataPelajaran: editData.mataPelajaran || ''
      });
    } else {
      setFormData({
        namaGuru: '',
        kodeGuru: '',
        role: '',
        mataPelajaran: ''
      });
    }
  }, [editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate Nama Guru
    if (!formData.namaGuru.trim()) {
      newErrors.namaGuru = 'Nama guru wajib diisi';
    } else if (formData.namaGuru.length < 3) {
      newErrors.namaGuru = 'Nama guru minimal 3 karakter';
    }
    
    // Validate Kode Guru (NIP)
    if (!formData.kodeGuru.trim()) {
      newErrors.kodeGuru = 'Kode guru (NIP) wajib diisi';
    } else if (!/^\d{18}$/.test(formData.kodeGuru)) {
      newErrors.kodeGuru = 'NIP harus 18 digit angka';
    }
    
    // Validate Email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    // Validate Role
    if (!formData.role) {
      newErrors.role = 'Pilih status wali kelas';
    }
    
    // Validate Mata Pelajaran
    if (!formData.mataPelajaran) {
      newErrors.mataPelajaran = 'Pilih mata pelajaran';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({ namaGuru: '', kodeGuru: '', email: '', role: '', mataPelajaran: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{editData ? 'Ubah Data Guru' : 'Tambah Guru'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nama Guru</label>
            <input
              type="text"
              name="namaGuru"
              placeholder="Masukkan nama guru..."
              value={formData.namaGuru}
              onChange={handleChange}
              required
            />
            {errors.namaGuru && <span className="error-text">{errors.namaGuru}</span>}
          </div>

          <div className="input-group">
            <label>Kode Guru (NIP)</label>
            <input
              type="text"
              name="kodeGuru"
              placeholder="Masukkan 18 digit NIP..."
              value={formData.kodeGuru}
              onChange={handleChange}
              maxLength={18}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              required
            />
            {errors.kodeGuru && <span className="error-text">{errors.kodeGuru}</span>}
          </div>

          <div className="input-group">
            <label>Email (Opsional)</label>
            <input
              type="email"
              name="email"
              placeholder="contoh@email.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label>Wali Kelas</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Pilih wali kelas...</option>
              {daftarWaliKelas.map((guru, index) => (
                <option key={index} value={guru}>
                  {guru}
                </option>
              ))}
            </select>
            {errors.role && <span className="error-text">{errors.role}</span>}
          </div>

          <div className="input-group">
            <label>Mata Pelajaran</label>
            <select
              name="mataPelajaran"
              value={formData.mataPelajaran}
              onChange={handleChange}
              required
            >
              <option value="">Pilih mata pelajaran...</option>
              {kategoriMataPelajaran.map((kategori, index) => (
                <option key={index} value={kategori}>
                  {kategori}
                </option>
              ))}
            </select>
            {errors.mataPelajaran && <span className="error-text">{errors.mataPelajaran}</span>}
          </div>

          <div className="form-buttons">
            <button type="button" className="btn-batal" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-submit">
              {editData ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TambahGuru;
