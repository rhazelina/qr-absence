import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JadwalSiswaIndex.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaChevronDown,
  FaBriefcase,
  FaDoorOpen,
} from "react-icons/fa";
import apiService from '../../utils/api';

function JadwalSiswaIndex() {
  const [schedules, setSchedules] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filters
  const [filterKompetensi, setFilterKompetensi] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  
  // Master Data for Filters
  const [classes, setClasses] = useState([]);
  const [majors, setMajors] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetch for schedules and classes
      const [schedulesRes, classesRes] = await Promise.all([
        apiService.get('/schedules'),
        apiService.get('/classes') // Assuming this endpoint exists based on Edit component
      ]);
      
      const schedulesData = schedulesRes.data || schedulesRes;
      const classesData = classesRes.data || classesRes;

      setSchedules(schedulesData);
      setFilteredData(schedulesData);
      setClasses(classesData);

      // Extract unique majors from classes
      // Assuming class object has 'major' or 'department' property, or we parse from name
      const uniqueMajors = [...new Set(classesData.map(c => c.major_name || c.major || c.department || 'Umum'))].filter(Boolean);
      // Or if major is an object
      // const uniqueMajors = [...new Set(classesData.map(c => c.major?.name))].filter(Boolean);
      
      // If backend doesn't provide explicit major, we might need to rely on what's available
      // For now, let's try to map from the class data we have.
      // If classes have a 'major' relationship or field
      const extractedMajors = [];
      classesData.forEach(c => {
          const majorName = c.major?.name || c.major_name || c.department;
          if (majorName && !extractedMajors.find(m => m.value === majorName)) {
              extractedMajors.push({ label: majorName, value: majorName });
          }
      });
       // Fallback if no major field found, maybe parse from class name (e.g. "X RPL 1")
      if (extractedMajors.length === 0) {
           const parsedMajors = [...new Set(classesData.map(c => {
               const name = c.name || '';
               const parts = name.split(' ');
               return parts.length > 1 ? parts[1] : null;
           }))].filter(Boolean);
           parsedMajors.forEach(m => extractedMajors.push({ label: m, value: m }));
      }

      setMajors(extractedMajors);

    } catch (error) {
      console.error('Error fetching data:', error);
      // alert('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = schedules;

    if (filterKompetensi) {
      filtered = filtered.filter((item) => {
        // Safe navigation for nested properties
        const majorName = item.class?.major?.name || item.class?.major_name || item.class?.department || '';
        // Also check if we parsed it from name
        const className = item.class?.name || '';
        return majorName === filterKompetensi || className.includes(filterKompetensi);
      });
    }

    if (filterKelas) {
      filtered = filtered.filter(
        (item) => item.class?.name === filterKelas
      );
    }

    setFilteredData(filtered);
  }, [filterKompetensi, filterKelas, schedules]);

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
      await apiService.delete(`/schedules/${id}`);
      alert('Jadwal berhasil dihapus');
      // Refresh data
      const res = await apiService.get('/schedules');
      setSchedules(res.data || res);
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

      {/* FILTER & ACTION */}
      <div className="filter-card">
        <div className="filter-grid" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
          
          {/* Kompetensi Keahlian */}
          <div className="filter-group">
            <label className="filter-label">
              <FaBriefcase /> Konsentrasi Keahlian
            </label>
            <div className="select-wrapper">
              <select
                value={filterKompetensi}
                onChange={(e) => setFilterKompetensi(e.target.value)}
                className="filter-select"
              >
                <option value="">Semua Konsentrasi</option>
                {majors.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <FaChevronDown className="select-icon" />
            </div>
          </div>

          {/* Kelas */}
          <div className="filter-group">
            <label className="filter-label">
              <FaDoorOpen /> Kelas
            </label>
            <div className="select-wrapper">
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="filter-select"
              >
                <option value="">Semua Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <FaChevronDown className="select-icon" />
            </div>
          </div>

          {/* Add Button */}
          <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
             <button
              onClick={handleCreate}
              className="jadwal-siswa-index-btn-add"
              title="Tambah Jadwal Baru"
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
                  <th>Kompetensi Keahlian</th>
                  <th>Wali Kelas</th>
                  <th>Kelas</th>
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
                          {schedule.class?.major_name || schedule.class?.major?.name || schedule.class?.department || (schedule.class?.name ? schedule.class.name.split(' ')[1] : '-') || '-'}
                        </span>
                      </td>

                      <td>
                          {schedule.class?.homeroom_teacher?.user?.name || schedule.class?.homeroom_teacher?.name || '-'}
                      </td>
                      
                      <td className="siswa-mapel">
                          {schedule.class?.name || 'N/A'}
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
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
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
