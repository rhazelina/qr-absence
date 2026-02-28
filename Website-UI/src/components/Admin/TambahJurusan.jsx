import React, { useState, useEffect } from 'react';
import './TambahJurusan.css';

function TambahJurusan({ isOpen, onClose, onSubmit, editData }) {
  const [formData, setFormData] = useState({
    namaJurusan: '',
    kodeJurusan: ''
  });

  // === SET DATA SAAT EDIT ===
  useEffect(() => {
    if (editData) {
      setFormData(editData); // isi form dengan data lama
    } else {
      setFormData({ namaJurusan: '', kodeJurusan: '' });
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-jurusan" onClick={onClose}>
      <div className="modal-card-jurusan" onClick={(e) => e.stopPropagation()}>
        
        {/* 🔥 Judul otomatis berubah */}
        <h2 className="modal-title-jurusan">
          {editData ? "Ubah Data Konsentrasi Keahlian" : "Tambah Konsentrasi Keahlian"}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group-jurusan">
            <label>Nama Konsentrasi Keahlian</label>
            <input
              type="text"
              name="namaJurusan"
              placeholder="Nama Konsentrasi Keahlian..."
              value={formData.namaJurusan}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group-jurusan">
            <label>Kode</label>
            <input
              type="text"
              name="kodeJurusan"
              placeholder="Kode..."
              value={formData.kodeJurusan}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-buttons-jurusan">
            <button type="button" className="btn-batal-jurusan" onClick={onClose}>
              Batal
            </button>

            {/* 🔥 Tombol juga berubah */}
            <button type="submit" className="btn-submit-jurusan">
              {editData ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TambahJurusan;