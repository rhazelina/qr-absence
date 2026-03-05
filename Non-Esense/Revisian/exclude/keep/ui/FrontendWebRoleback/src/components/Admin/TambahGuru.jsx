// TambahGuru.jsx
import React, { useState, useEffect } from 'react';
import './TambahGuru.css';

function TambahGuru({ isOpen, onClose, onSubmit, editData }) {
  const [formData, setFormData] = useState({
    namaGuru: '',
    kodeGuru: '',
    role: '',
    mataPelajaran: ''
  });

  // Dummy data wali kelas
  const daftarWaliKelas = [
    'Tidak ada',
    'Bu Siti Nurhaliza',
    'Pak Ahmad Dahlan',
    'Bu Dewi Sartika',
    'Pak Budi Santoso',
    'Bu Ratna Kartini',
    'Pak Joko Widodo',
    'Bu Mega Wati',
    'Pak Habibie Rahman'
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ namaGuru: '', kodeGuru: '', role: '', mataPelajaran: '' });
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
          </div>

          <div className="input-group">
            <label>Kode Guru</label>
            <input
              type="text"
              name="kodeGuru"
              placeholder="Masukkan kode guru..."
              value={formData.kodeGuru}
              onChange={handleChange}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              required
            />
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
