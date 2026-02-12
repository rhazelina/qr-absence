import React, { useState, useEffect } from 'react';
import './DataJurusan.css';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import TambahJurusan from '../../components/Admin/TambahJurusan';
import { majorService } from '../../services/major';

function DataJurusan() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jurusans, setJurusans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMajors = async () => {
    try {
      setLoading(true);
      const data = await majorService.getMajors();
      setJurusans(data);
    } catch (err) {
      console.error('Error fetching majors:', err);
      setError('Gagal mengambil data jurusan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMajors();
  }, []);

  // === TAMBAH BARU ===
  const handleAddJurusan = async (formData) => {
    try {
      await majorService.createMajor({
        name: formData.namaJurusan,
        code: formData.kodeJurusan
      });
      alert('Data jurusan berhasil ditambahkan!');
      setIsModalOpen(false);
      fetchMajors();
    } catch (err) {
      console.error('Error creating major:', err);
      alert('Gagal menambahkan data jurusan.');
    }
  };

  // === EDIT DATA ===
  const handleEditJurusan = async (formData) => {
    try {
      await majorService.updateMajor(formData.id, {
        name: formData.namaJurusan,
        code: formData.kodeJurusan
      });
      alert('Data jurusan berhasil diperbarui!');
      setEditData(null);
      setIsModalOpen(false);
      fetchMajors();
    } catch (err) {
      console.error('Error updating major:', err);
      alert('Gagal memperbarui data jurusan.');
    }
  };

  // === HAPUS ===
  const handleDeleteJurusan = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data jurusan ini?')) {
      try {
        await majorService.deleteMajor(id);
        alert('Data jurusan berhasil dihapus!');
        fetchMajors();
      } catch (err) {
        console.error('Error deleting major:', err);
        alert('Gagal menghapus data jurusan.');
      }
    }
  };

  // === FILTER ===
  const filteredJurusans = jurusans.filter(jurusan =>
    (jurusan.name || jurusan.namaJurusan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (jurusan.code || jurusan.kodeJurusan || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="data-container">
      <NavbarAdmin />
      <h1 className="page-title">Data Konsentrasi Keahlian</h1>

      <div className="table-wrapper">
        <div className="filter-box">
          <input
            type="text"
            placeholder="Cari Jurusan..."
            className="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="select-group">
            <button
              className="btn-tambah"
              onClick={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
            >
              Tambahkan
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>
        ) : (
          <table className="tabel-siswa">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode Konsentrasi Keahlian</th>
                <th>Nama Konsentrasi Keahlian</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredJurusans.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    {searchTerm
                      ? 'Tidak ada data yang sesuai pencarian.'
                      : 'Belum ada data jurusan. Klik "Tambahkan" untuk menambah data.'}
                  </td>
                </tr>
              ) : (
                filteredJurusans.map((jurusan, index) => (
                  <tr key={jurusan.id}>
                    <td style={{ fontWeight: '700' }}>{index + 1}</td>
                    <td>{jurusan.code || jurusan.kodeJurusan}</td>
                    <td>{jurusan.name || jurusan.namaJurusan}</td>
                    <td className="aksi-cell">
                      <button
                        className="aksi edit"
                        onClick={() => {
                          setEditData({
                            id: jurusan.id,
                            namaJurusan: jurusan.name || jurusan.namaJurusan,
                            kodeJurusan: jurusan.code || jurusan.kodeJurusan
                          });
                          setIsModalOpen(true);
                        }}
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="aksi hapus"
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
        )}
      </div>

      <TambahJurusan
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={editData ? handleEditJurusan : handleAddJurusan}
        editData={editData}
      />
    </div>
  );
}

export default DataJurusan;