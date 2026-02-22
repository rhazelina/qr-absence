// Tambah.jsx
import React, { useState, useEffect } from 'react';
import './TambahSiswa.css';

function Tambah({ isOpen, onClose, onSubmit, editData, majors = [], classes = [] }) {
  const [formData, setFormData] = useState({
    namaSiswa: '',
    nisn: '',
    class_id: ''
  });

  // Filter classes by selected major
  const selectedMajor = formData.class_id 
    ? classes.find(c => c.id === parseInt(formData.class_id))?.major 
    : '';
  
  const availableClasses = selectedMajor 
    ? classes.filter(c => c.major === selectedMajor)
    : classes;

  // Auto fill when editing
  useEffect(() => {
    if (editData) {
      setFormData({
        namaSiswa: editData.name || '',
        nisn: editData.nisn || '',
        class_id: editData.class_id || ''
      });
    } else {
      setFormData({ namaSiswa: '', nisn: '', class_id: '' });
    }
  }, [editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ namaSiswa: '', nisn: '', class_id: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title" style={{ fontFamily: 'Poppins, sans-serif', color: 'whitesmoke' }}>
          {editData ? "Ubah Data Siswa" : "Tambah Siswa"}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nama Siswa</label>
            <input
              type="text"
              name="namaSiswa"
              placeholder="Masukkan nama siswa..."
              value={formData.namaSiswa}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>NISN</label>
            <input
              type="text"
              name="nisn"
              placeholder="Masukkan NISN siswa..."
              value={formData.nisn}
              onChange={handleChange}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) e.preventDefault();
              }}
              required
            />
          </div>

          <div className="input-group">
            <label>Kelas</label>
            <select
              name="class_id"
              value={formData.class_id}
              onChange={handleChange}
              required
            >
              <option value="">Pilih Kelas...</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className="form-buttons">
            <button type="button" className="btn-batal" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-submit">
              {editData ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Tambah;