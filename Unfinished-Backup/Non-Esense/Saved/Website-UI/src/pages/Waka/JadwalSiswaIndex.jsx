import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JadwalSiswaIndex.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import {
  FaEye,
  FaEdit,
  FaChevronDown,
  FaBriefcase,
  FaDoorOpen,
} from "react-icons/fa";

function JadwalSiswaIndex() {
  const [dataSiswa, setDataSiswa] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [filterKompetensi, setFilterKompetensi] = useState('');
  const [filterKelas, setFilterKelas] = useState('');

  const kompetensiList = [
    { label: 'Rekayasa Perangkat Lunak', value: 'RPL' },
    { label: 'Teknik Komputer dan Jaringan', value: 'TKJ' },
    { label: 'Desain Komunikasi Visual', value: 'DKV' },
  ];

  const kelasOptions = ['X RPL 1', 'X RPL 2', 'XI RPL 1', 'X TKJ 1', 'X DKV 1'];

  useEffect(() => {
    fetchJadwalSiswa();
  }, []);

  const fetchJadwalSiswa = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${baseURL}/classes`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        const raw = result.data || result || [];
        // Map backend class fields to what the table expects
        const mapped = (Array.isArray(raw) ? raw : []).map(c => ({
          id: c.id,
          kelas: c.name || '',
          kompetensi_keahlian: c.major?.code || c.major_code || '',
          wali_kelas: c.homeroom_teacher?.name || '-',
        }));
        setDataSiswa(mapped);
        setFilteredData(mapped);
      } else {
        console.error('Gagal memuat data jadwal siswa');
      }
    } catch (error) {
      console.error('Error fetching jadwal siswa:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = dataSiswa;

    if (filterKompetensi) {
      filtered = filtered.filter(
        (siswa) => siswa.kompetensi_keahlian === filterKompetensi
      );
    }

    if (filterKelas) {
      filtered = filtered.filter(
        (siswa) => siswa.kelas === filterKelas
      );
    }

    setFilteredData(filtered);
  }, [filterKompetensi, filterKelas, dataSiswa]);

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

  return (
    <div className="jadwal-siswa-index-root">
      <NavbarWaka />

      <div className="jadwal-siswa-index-header">
        <h1 className="jadwal-siswa-index-title">
          Jadwal Pembelajaran Siswa
        </h1>
        <p className="jadwal-siswa-index-subtitle">
          Kelola dan lihat jadwal pembelajaran per siswa
        </p>
      </div>

      {/* FILTER */}
      <div className="filter-card">
        <div className="filter-grid">

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
                <option value="">Semua Konsentrasi Keahlian</option>
                {kompetensiList.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
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
                {kelasOptions.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <FaChevronDown className="select-icon" />
            </div>
          </div>

        </div>
      </div>

      {/* TABLE */}
      <div className="jadwal-siswa-index-table-card">
        <div className="jadwal-siswa-index-table-header">
          <h3>Daftar Siswa ({filteredData.length})</h3>
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
                  filteredData.map((siswa, index) => (
                    <tr key={siswa.id}>
                      <td>{index + 1}</td>

                      <td>
                        <span className="jadwal-siswa-index-badge-blue">
                          {siswa.kompetensi_keahlian}
                        </span>
                      </td>

                      <td>{siswa.wali_kelas}</td>
                      <td className="siswa-mapel">{siswa.kelas}</td>

                      <td>
                        <div className="jadwal-siswa-index-action">
                          <button
                            className="jadwal-siswa-index-btn-view"
                            onClick={(e) => handleView(e, siswa.id)}
                            title="Lihat Detail"
                          >
                            <FaEye />
                          </button>

                          <button
                            className="jadwal-siswa-index-btn-edit"
                            onClick={(e) => handleEdit(e, siswa.id)}
                            title="Edit Data"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      Tidak ada data yang sesuai dengan filter
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