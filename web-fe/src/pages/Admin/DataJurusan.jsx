import React, { useState, useEffect } from 'react';
import './DataJurusan.css';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';

function DataJurusan() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ LOAD DATA DARI LOCALSTORAGE ATAU GUNAKAN DATA DEFAULT
  const getInitialData = () => {
    const savedData = localStorage.getItem('dataJurusan');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return [];
  };

  const [jurusans, setJurusans] = useState(getInitialData);

  // ✅ SAVE KE LOCALSTORAGE SETIAP KALI DATA BERUBAH
  useEffect(() => {
    localStorage.setItem('dataJurusan', JSON.stringify(jurusans));
  }, [jurusans]);

  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    kodeJurusan: '',
    namaJurusan: '',
    programKeahlian: '',
    bidangKeahlian: ''
  });
  const [errors, setErrors] = useState({});

  // Reset form ketika modal dibuka/ditutup
  useEffect(() => {
    if (isModalOpen) {
      if (editData) {
        setFormData(editData);
      } else {
        setFormData({
          kodeJurusan: '',
          namaJurusan: '',
          programKeahlian: '',
          bidangKeahlian: ''
        });
      }
      setErrors({});
    }
  }, [editData, isModalOpen]);

  // ✅ CEK APAKAH KODE JURUSAN SUDAH ADA
  const checkKodeExists = (kode) => {
    if (editData && editData.kodeJurusan.toUpperCase() === kode.toUpperCase()) {
      return false;
    }
    return jurusans.some(j => j.kodeJurusan.toUpperCase() === kode.toUpperCase());
  };

  // ✅ CEK APAKAH NAMA JURUSAN SUDAH ADA
  const checkNamaExists = (nama) => {
    if (editData && editData.namaJurusan.toLowerCase() === nama.toLowerCase()) {
      return false;
    }
    return jurusans.some(j => j.namaJurusan.toLowerCase() === nama.toLowerCase());
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.kodeJurusan.trim()) {
      newErrors.kodeJurusan = 'Kode jurusan harus diisi';
    } else if (formData.kodeJurusan.trim().length > 5) {
      newErrors.kodeJurusan = 'Kode jurusan maksimal 5 karakter';
    } else if (checkKodeExists(formData.kodeJurusan.trim())) {
      newErrors.kodeJurusan = `Kode jurusan "${formData.kodeJurusan.toUpperCase()}" sudah terdaftar`;
    }

    if (!formData.namaJurusan.trim()) {
      newErrors.namaJurusan = 'Nama jurusan harus diisi';
    } else if (checkNamaExists(formData.namaJurusan.trim())) {
      newErrors.namaJurusan = `Jurusan "${formData.namaJurusan}" sudah terdaftar`;
    }

    if (!formData.programKeahlian.trim()) {
      newErrors.programKeahlian = 'Program keahlian harus diisi';
    }

    if (!formData.bidangKeahlian.trim()) {
      newErrors.bidangKeahlian = 'Bidang keahlian harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === TAMBAH BARU ===
  const handleAddJurusan = () => {
    if (!validate()) return;

    const newJurusan = {
      id: Date.now(),
      kodeJurusan: formData.kodeJurusan.trim().toUpperCase(),
      namaJurusan: formData.namaJurusan.trim(),
      programKeahlian: formData.programKeahlian.trim(),
      bidangKeahlian: formData.bidangKeahlian.trim()
    };

    setJurusans([...jurusans, newJurusan]);
    setIsModalOpen(false);
    setEditData(null);
    alert('Data konsentrasi keahlian berhasil ditambahkan!');
  };

  // === EDIT DATA ===
  const handleEditJurusan = () => {
    if (!validate()) return;

    setJurusans(
      jurusans.map(j =>
        j.id === formData.id
          ? {
              ...formData,
              kodeJurusan: formData.kodeJurusan.trim().toUpperCase(),
              namaJurusan: formData.namaJurusan.trim(),
              programKeahlian: formData.programKeahlian.trim(),
              bidangKeahlian: formData.bidangKeahlian.trim()
            }
          : j
      )
    );

    setEditData(null);
    setIsModalOpen(false);
    alert('Data konsentrasi keahlian berhasil diperbarui!');
  };

  // === HAPUS ===
  const handleDeleteJurusan = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data konsentrasi keahlian ini?')) {
      setJurusans(jurusans.filter(jurusan => jurusan.id !== id));
      alert('Data konsentrasi keahlian berhasil dihapus!');
    }
  };

  // === SUBMIT FORM ===
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editData) {
      handleEditJurusan();
    } else {
      handleAddJurusan();
    }
  };

  // === FILTER (SEARCH) ===
  const filteredJurusans = jurusans.filter(jurusan =>
    jurusan.namaJurusan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jurusan.kodeJurusan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (jurusan.programKeahlian && jurusan.programKeahlian.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (jurusan.bidangKeahlian && jurusan.bidangKeahlian.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ✅ RESET SEARCH
  const handleResetSearch = () => {
    setSearchTerm('');
  };

  // Icon Edit SVG
  const EditIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );

  // Icon Delete SVG
  const DeleteIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  return (
    <div className="jurusan-container">
      <NavbarAdmin />
      <h1 className="jurusan-page-title">Data Konsentrasi Keahlian</h1>

      <div className="jurusan-table-wrapper">
        <div className="jurusan-filter-box">
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <input
              type="text"
              placeholder="Cari berdasarkan kode, nama jurusan, atau program keahlian..."
              className="jurusan-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={handleResetSearch}
                className="jurusan-clear-btn"
                title="Hapus pencarian"
              >
                ×
              </button>
            )}
          </div>
          <div className="jurusan-select-group">
            <button
              className="jurusan-btn-tambah"
              onClick={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
            >
              Tambahkan
            </button>
          </div>
        </div>

        {/* ✅ INFORMASI HASIL PENCARIAN */}
        {searchTerm && (
          <div className="jurusan-search-info">
            <strong>Hasil Pencarian:</strong> {filteredJurusans.length} dari {jurusans.length} data
            <span> | Kata kunci: "{searchTerm}"</span>
          </div>
        )}

        <table className="jurusan-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kode Konsentrasi Keahlian</th>
              <th>Konsentrasi Keahlian</th>
              <th>Program Keahlian</th>
              <th>Bidang Keahlian</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredJurusans.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  {searchTerm
                    ? 'Tidak ada data yang sesuai dengan pencarian'
                    : 'Belum ada data konsentrasi keahlian'}
                </td>
              </tr>
            ) : (
              filteredJurusans.map((jurusan, index) => (
                <tr key={jurusan.id}>
                  <td style={{ fontWeight: '700' }}>{index + 1}</td>
                  <td><strong>{jurusan.kodeJurusan}</strong></td>
                  <td>{jurusan.namaJurusan}</td>
                  <td>{jurusan.programKeahlian}</td>
                  <td>{jurusan.bidangKeahlian}</td>
                  <td className="jurusan-aksi-cell">
                    <button
                      className="jurusan-aksi jurusan-edit"
                      onClick={() => {
                        setEditData(jurusan);
                        setIsModalOpen(true);
                      }}
                      title="Edit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="jurusan-aksi jurusan-hapus"
                      onClick={() => handleDeleteJurusan(jurusan.id)}
                      title="Hapus"
                    >
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========== MODAL FORM ========== */}
      {isModalOpen && (
        <div className="jurusan-modal-overlay" onClick={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}>
          <div className="jurusan-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="jurusan-modal-header">
              <h2>{editData ? 'Edit Data Konsentrasi Keahlian' : 'Tambah Data Konsentrasi Keahlian'}</h2>
              <button className="jurusan-modal-close" onClick={() => {
                setIsModalOpen(false);
                setEditData(null);
              }}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Field: Kode Konsentrasi Keahlian */}
              <div className="jurusan-form-group">
                <label>Kode Konsentrasi Keahlian <span className="jurusan-required">*</span></label>
                <input
                  type="text"
                  name="kodeJurusan"
                  value={formData.kodeJurusan}
                  onChange={handleChange}
                  placeholder="Contoh: RPL"
                  className={errors.kodeJurusan ? 'jurusan-error' : ''}
                  maxLength="5"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.kodeJurusan && <span className="jurusan-error-message">{errors.kodeJurusan}</span>}
                {!errors.kodeJurusan && (
                  <small className="jurusan-helper-text">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ marginRight: '5px', verticalAlign: 'middle' }}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Maksimal 5 karakter, akan otomatis diubah ke huruf besar
                  </small>
                )}
              </div>

              {/* Field: Konsentrasi Keahlian */}
              <div className="jurusan-form-group">
                <label>Konsentrasi Keahlian <span className="jurusan-required">*</span></label>
                <input
                  type="text"
                  name="namaJurusan"
                  value={formData.namaJurusan}
                  onChange={handleChange}
                  placeholder="Contoh: Rekayasa Perangkat Lunak"
                  className={errors.namaJurusan ? 'jurusan-error' : ''}
                />
                {errors.namaJurusan && <span className="jurusan-error-message">{errors.namaJurusan}</span>}
                {!errors.namaJurusan && (
                  <small className="jurusan-helper-text">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ marginRight: '5px', verticalAlign: 'middle' }}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Nama lengkap konsentrasi keahlian
                  </small>
                )}
              </div>

              {/* Field: Program Keahlian */}
              <div className="jurusan-form-group">
                <label>Program Keahlian <span className="jurusan-required">*</span></label>
                <input
                  type="text"
                  name="programKeahlian"
                  value={formData.programKeahlian}
                  onChange={handleChange}
                  placeholder="Contoh: Teknologi Informasi"
                  className={errors.programKeahlian ? 'jurusan-error' : ''}
                />
                {errors.programKeahlian && <span className="jurusan-error-message">{errors.programKeahlian}</span>}
                {!errors.programKeahlian && (
                  <small className="jurusan-helper-text">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ marginRight: '5px', verticalAlign: 'middle' }}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Nama program keahlian yang menaungi konsentrasi ini
                  </small>
                )}
              </div>

              {/* Field: Bidang Keahlian */}
              <div className="jurusan-form-group">
                <label>Bidang Keahlian <span className="jurusan-required">*</span></label>
                <input
                  type="text"
                  name="bidangKeahlian"
                  value={formData.bidangKeahlian}
                  onChange={handleChange}
                  placeholder="Contoh: Teknologi Informasi dan Komunikasi"
                  className={errors.bidangKeahlian ? 'jurusan-error' : ''}
                />
                {errors.bidangKeahlian && <span className="jurusan-error-message">{errors.bidangKeahlian}</span>}
                {!errors.bidangKeahlian && (
                  <small className="jurusan-helper-text">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ marginRight: '5px', verticalAlign: 'middle' }}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Nama bidang keahlian yang menaungi program keahlian ini
                  </small>
                )}
              </div>

              <div className="jurusan-modal-actions">
                <button type="button" className="jurusan-btn-cancel" onClick={() => {
                  setIsModalOpen(false);
                  setEditData(null);
                }}>
                  Batal
                </button>
                <button type="submit" className="jurusan-btn-submit">
                  {editData ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataJurusan;