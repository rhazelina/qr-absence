import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JadwalSiswaIndex.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaChevronDown,
  FaBriefcase,
  FaDoorOpen,
} from "react-icons/fa";

function JadwalSiswaIndex() {
  const [schedules, setSchedules] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClassSchedules();
  }, []);

  const fetchClassSchedules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Updated endpoint
      const response = await fetch('http://localhost:8000/api/schedules', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Assuming API returns { data: [...] } or just [...]
        const data = result.data || result;
        setSchedules(data);
        setFilteredData(data);
      } else {
        console.error('Gagal memuat data jadwal kelas');
        // alert('Gagal memuat data jadwal kelas');
      }
    } catch (error) {
      console.error('Error fetching class schedules:', error);
      // alert('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = schedules;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.class?.name?.toLowerCase().includes(lowerTerm) ||
          item.academic_year?.year?.includes(searchTerm)
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, schedules]);

  const handleCreate = () => {
    navigate('/waka/jadwal-siswa/create');
  };

  const handleView = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/waka/jadwal-siswa/${id}`);
  };

  const handleEdit = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/waka/jadwal-siswa/${id}/edit`);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/schedules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        alert('Jadwal berhasil dihapus');
        fetchClassSchedules();
      } else {
        alert('Gagal menghapus jadwal');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Terjadi kesalahan saat menghapus data');
    }
  };

  return (
    <div className="jadwal-siswa-index-root">
      <NavbarWaka />

      <div className="jadwal-siswa-index-header">
        <h1 className="jadwal-siswa-index-title">
          Jadwal Pembelajaran Siswa
        </h1>
        <p className="jadwal-siswa-index-subtitle">
          Kelola dan lihat jadwal pembelajaran per kelas dan semester
        </p>
      </div>

      {/* ACTION & FILTER */}
      <div className="filter-card">
        <div className="filter-grid">
          <div className="filter-group">
            <label className="filter-label">
              <FaSearch /> Cari Kelas
            </label>
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Cari Nama Kelas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-group" style={{ justifyContent: 'flex-end', display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={handleCreate}
              className="jadwal-siswa-index-btn-add"
            >
              <FaPlus /> Tambah Jadwal
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="jadwal-siswa-index-table-card">
        <div className="jadwal-siswa-index-table-header">
          <h3>Daftar Jadwal ({filteredData.length})</h3>
        </div>

        <div className="jadwal-siswa-index-table-wrapper">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Memuat data...
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kelas</th>
                  <th>Tahun Ajaran</th>
                  <th>Semester</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((schedule, index) => (
                    <tr key={schedule.id}>
                      <td>{index + 1}</td>

                      <td>
                        <span className="jadwal-siswa-index-badge-blue">
                          {schedule.class?.name || 'N/A'}
                        </span>
                      </td>

                      <td>{schedule.academic_year?.year || schedule.year || '-'}</td>
                      <td>
                        {schedule.semester == 1 ? 'Ganjil' : 'Genap'}
                      </td>
                      <td>
                        <span className={`jadwal-siswa-index-badge-${schedule.is_active ? 'green' : 'gray'}`}>
                          {schedule.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>

                      <td>
                        <div className="jadwal-siswa-index-action">
                          <button
                            className="jadwal-siswa-index-btn-view"
                            onClick={(e) => handleView(e, schedule.id)}
                            title="Lihat Detail"
                          >
                            <FaEye />
                          </button>

                          <button
                            className="jadwal-siswa-index-btn-edit"
                            onClick={(e) => handleEdit(e, schedule.id)}
                            title="Edit Data"
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="jadwal-siswa-index-btn-delete"
                            onClick={(e) => handleDelete(e, schedule.id)}
                            title="Hapus Data"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      Tidak ada data jadwal yang sesuai
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default JadwalSiswaIndex;