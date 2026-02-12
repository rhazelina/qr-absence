import React, { useState, useEffect } from 'react';
import './DataKelas.css';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import TambahKelas from '../../components/Admin/TambahKelas';
import { classService } from '../../services/class';
import { majorService } from '../../services/major';
import { teacherService } from '../../services/teacher';

function DataKelas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kelas, setKelas] = useState([]);
  const [majors, setMajors] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editData, setEditData] = useState(null);
  const [searchKelas, setSearchKelas] = useState('');
  const [searchJurusan, setSearchJurusan] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesData, majorsData, teachersData] = await Promise.all([
        classService.getClasses(),
        majorService.getMajors(),
        teacherService.getTeachers()
      ]);
      setKelas(classesData);
      setMajors(majorsData);
      setTeachers(teachersData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal mengambil data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === TAMBAH BARU ===
  const handleAddKelas = async (formData) => {
    try {
      await classService.createClass({
        name: formData.namaKelas,
        major_id: formData.major_id,
        homeroom_teacher_id: formData.homeroom_teacher_id
      });
      alert('Data kelas berhasil ditambahkan!');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error creating class:', err);
      alert('Gagal menambahkan data kelas.');
    }
  };

  // === EDIT DATA ===
  const handleEditKelas = async (formData) => {
    try {
      await classService.updateClass(formData.id, {
        name: formData.namaKelas,
        major_id: formData.major_id,
        homeroom_teacher_id: formData.homeroom_teacher_id
      });
      alert('Data kelas berhasil diperbarui!');
      setEditData(null);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error updating class:', err);
      alert('Gagal memperbarui data kelas.');
    }
  };

  // === HAPUS ===
  const handleDeleteKelas = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data kelas ini?')) {
      try {
        await classService.deleteClass(id);
        alert('Data kelas berhasil dihapus!');
        fetchData();
      } catch (err) {
        console.error('Error deleting class:', err);
        alert('Gagal menghapus data kelas.');
      }
    }
  };

  // === FILTER ===
  const filteredKelas = kelas.filter(k => {
    const majorCode = k.major?.code || k.jurusan || '';
    const matchJurusan = searchJurusan === '' || majorCode === searchJurusan;
    return matchJurusan;
  });

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
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  return (
    <div className="data-container">
      <NavbarAdmin />
      <h1 className="page-title-kelas">Data Kelas</h1>

      <div className="table-wrapper">
        <div className="filter-box">
          <div className="select-group">
            <label>Pilih Konsentrasi Keahlian :</label>
            <select value={searchJurusan} onChange={(e) => setSearchJurusan(e.target.value)}>
              <option value="">Semua Konsentrasi Keahlian</option>
              {majors.map((major) => (
                <option key={major.id} value={major.code || major.kodeJurusan}>
                  {major.name || major.namaJurusan}
                </option>
              ))}
            </select>

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
                <th>Nama Kelas</th>
                <th>Konsentrasi Keahlian</th>
                <th>Wali Kelas</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredKelas.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    Tidak ada data yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredKelas.map((k, index) => (
                  <tr key={k.id}>
                    <td style={{ fontWeight: '700' }}>{index + 1}</td>
                    <td>{k.name || k.namaKelas}</td>
                    <td>{k.major?.name || k.major?.namaJurusan || k.jurusan}</td>
                    <td>{k.homeroom_teacher?.user?.name || k.homeroomTeacher?.user?.name || 'Tidak ada'}</td>
                    <td className="aksi-cell">
                      <button
                        className="aksi edit"
                        onClick={() => {
                          setEditData({
                            id: k.id,
                            namaKelas: k.name || k.namaKelas,
                            major_id: k.major_id,
                            homeroom_teacher_id: k.homeroom_teacher_id
                          });
                          setIsModalOpen(true);
                        }}
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="aksi hapus"
                        onClick={() => handleDeleteKelas(k.id)}
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

      <TambahKelas
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={editData ? handleEditKelas : handleAddKelas}
        editData={editData}
        majors={majors}
        teachers={teachers}
      />
    </div>
  );
}

export default DataKelas;