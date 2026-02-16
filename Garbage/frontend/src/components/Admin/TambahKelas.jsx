import React, { useState, useEffect } from 'react';
import './TambahKelas.css';

function TambahKelas({ isOpen, onClose, onSubmit, editData, majors = [], teachers = [] }) {
  const [formData, setFormData] = useState({
    namaKelas: '',
    major_id: '',
    homeroom_teacher_id: ''
  });

  // Filter teachers to show only those who don't have a class yet OR the current homeroom teacher
  // For simplicity, we show all teachers, or we could filter.
  // Standard practice: Show all eligible teachers.

  // === SET DATA SAAT EDIT ===
  useEffect(() => {
    if (editData) {
      setFormData({
        namaKelas: editData.namaKelas || editData.name,
        major_id: editData.major_id || '',
        homeroom_teacher_id: editData.homeroom_teacher_id || ''
      });
    } else {
      setFormData({
        namaKelas: '',
        major_id: '',
        homeroom_teacher_id: ''
      });
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
    setFormData({ namaKelas: '', major_id: '', homeroom_teacher_id: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-kelas" onClick={onClose}>
      <div className="modal-card-kelas" onClick={(e) => e.stopPropagation()}>
        {/* Judul otomatis berubah */}
        <h2 className="modal-title-kelas">
          {editData ? 'Ubah Data Kelas' : 'Tambah Kelas'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group-kelas">
            <label>Nama Kelas</label>
            <input
              type="text"
              name="namaKelas"
              placeholder="Contoh: X RPL 1"
              value={formData.namaKelas}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group-kelas">
            <label>Konsentrasi Keahlian</label>
            <select
              name="major_id"
              value={formData.major_id}
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

          <div className="input-group-kelas">
            <label>Wali Kelas</label>
            <select
              name="homeroom_teacher_id"
              value={formData.homeroom_teacher_id}
              onChange={handleChange}
            >
              <option value="">Pilih wali kelas...</option>
              {teachers.map((teacher, index) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user?.name || teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-buttons-kelas">
            <button type="button" className="btn-batal-kelas" onClick={onClose}>
              Batal
            </button>
            {/* Tombol berubah */}
            <button type="submit" className="btn-submit-kelas">
              {editData ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TambahKelas;