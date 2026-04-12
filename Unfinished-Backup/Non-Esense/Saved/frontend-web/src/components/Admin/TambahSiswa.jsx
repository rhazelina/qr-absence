// Tambah.jsx
import React, { useState, useEffect } from 'react';
import './TambahSiswa.css';

function Tambah({ isOpen, onClose, onSubmit, editData, majors = [], classes = [] }) {
  const [formData, setFormData] = useState({
    namaSiswa: '',
    nisn: '',
    class_id: ''
  });
  const [errors, setErrors] = useState({});

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
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.namaSiswa.trim()) {
      newErrors.namaSiswa = 'Nama siswa wajib diisi';
    } else if (formData.namaSiswa.length < 3) {
      newErrors.namaSiswa = 'Nama siswa minimal 3 karakter';
    }
    
    if (!formData.nisn.trim()) {
      newErrors.nisn = 'NISN wajib diisi';
    } else if (!/^\d{10}$/.test(formData.nisn)) {
      newErrors.nisn = 'NISN harus 10 digit angka';
    }
    
    if (!formData.class_id) {
      newErrors.class_id = 'Pilih kelas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({ namaSiswa: '', nisn: '', class_id: '' });
    }
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
            {errors.namaSiswa && <span className="error-text">{errors.namaSiswa}</span>}
          </div>

          <div className="input-group">
            <label>NISN (10 Digit)</label>
            <input
              type="text"
              name="nisn"
              placeholder="Masukkan 10 digit NISN..."
              value={formData.nisn}
              onChange={handleChange}
              maxLength={10}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) e.preventDefault();
              }}
              required
            />
            {errors.nisn && <span className="error-text">{errors.nisn}</span>}
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
            {errors.class_id && <span className="error-text">{errors.class_id}</span>}
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