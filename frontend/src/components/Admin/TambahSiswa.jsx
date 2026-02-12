// TambahSiswa.jsx
import React, { useState, useEffect } from 'react';
import './TambahSiswa.css';

function TambahSiswa({ isOpen, onClose, onSubmit, editData, classes = [], majors = [] }) {
  const [formData, setFormData] = useState({
    namaSiswa: '',
    nisn: '',
    gender: '',
    address: '',
    parent_phone: '',
    jurusan_id: '',
    kelas_id: ''
  });

  // Filter classes based on selected major
  const [filteredClasses, setFilteredClasses] = useState([]);

  // Auto isi saat edit
  useEffect(() => {
    if (editData) {
      // Find class object to get major_id if needed, or use data if provided
      const currentClass = classes.find(c => c.id === editData.class_id) || {};

      setFormData({
        namaSiswa: editData.namaSiswa || editData.user?.name || editData.name || '',
        nisn: editData.nisn || '',
        gender: editData.gender || '',
        address: editData.address || '',
        parent_phone: editData.parent_phone || '',
        jurusan_id: currentClass.major_id || '',
        kelas_id: editData.class_id || editData.classRoom?.id || ''
      });
    } else {
      setFormData({
        namaSiswa: '',
        nisn: '',
        gender: '',
        address: '',
        parent_phone: '',
        jurusan_id: '',
        kelas_id: ''
      });
    }
  }, [editData, isOpen, classes]);

  // Update filtered classes when major changes
  useEffect(() => {
    if (formData.jurusan_id) {
      const filtered = classes.filter(c => c.major_id === parseInt(formData.jurusan_id));
      setFilteredClasses(filtered);
    } else {
      setFilteredClasses([]);
    }
  }, [formData.jurusan_id, classes]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'jurusan_id') {
      setFormData({
        ...formData,
        jurusan_id: value,
        kelas_id: '' // Reset class when major changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Transform data for parent consumption
    const submitData = {
      namaSiswa: formData.namaSiswa,
      nisn: formData.nisn,
      gender: formData.gender,
      address: formData.address,
      parent_phone: formData.parent_phone,
      class_id: formData.kelas_id
    };
    onSubmit(submitData);
    setFormData({ namaSiswa: '', nisn: '', gender: '', address: '', parent_phone: '', jurusan_id: '', kelas_id: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
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
            <label>Jenis Kelamin</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Pilih Jenis Kelamin...</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div className="input-group">
            <label>Alamat</label>
            <textarea
              name="address"
              placeholder="Masukkan alamat siswa..."
              value={formData.address}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="input-group">
            <label>No. Telepon Orang Tua (Opsional)</label>
            <input
              type="text"
              name="parent_phone"
              placeholder="Contoh: 08123456789"
              value={formData.parent_phone}
              onChange={handleChange}
              onKeyPress={(e) => {
                if (!/[0-9+]/.test(e.key)) e.preventDefault();
              }}
            />
          </div>

          <div className="input-group">
            <label>Konsentrasi Keahlian</label>
            <select
              name="jurusan_id"
              value={formData.jurusan_id}
              onChange={handleChange}
              required
            >
              <option value="">Pilih Konsentrasi Keahlian...</option>
              {majors.map(major => (
                <option key={major.id} value={major.id}>
                  {major.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Kelas</label>
            <select
              name="kelas_id"
              value={formData.kelas_id}
              onChange={handleChange}
              disabled={!formData.jurusan_id}
              required
            >
              <option value="">
                {formData.jurusan_id ? 'Pilih Kelas...' : 'Pilih Konsentrasi Keahlian Terlebih Dahulu'}
              </option>
              {filteredClasses.map((kelas) => (
                <option key={kelas.id} value={kelas.id}>
                  {kelas.name}
                </option>
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

export default TambahSiswa;