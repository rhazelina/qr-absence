import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JadwalGuruIndex.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import {
  FaEye,
  FaEdit,
  FaChevronDown,
  FaBriefcase,
  FaDoorOpen,
  FaIdCard,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaRedo,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";


function JadwalGuruIndex() {
  const navigate = useNavigate();
  const [dataGuru, setDataGuru] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchKode, setSearchKode] = useState('');
  const [searchNama, setSearchNama] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJadwalGuru();
  }, []);

  const fetchJadwalGuru = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${baseURL}/teachers`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        const raw = result.data || result || [];
        // Map backend teacher fields to what the table expects
        const mapped = (Array.isArray(raw) ? raw : []).map(g => ({
          id: g.id,
          kode_guru: g.nip || g.code || '',
          nama_guru: g.name || g.user?.name || '',
          mata_pelajaran: g.subjects?.map(s => s.name).join(', ') || g.subject_name || '-',
          email: g.user?.email || g.email || '-',
          no_hp: g.phone || g.no_hp || '-',
          jumlah_kelas: g.classes_count || 0,
          gambar_jadwal: g.schedule_image_url || null
        }));
        setDataGuru(mapped);
        setFilteredData(mapped);
      } else {
        console.error('Gagal memuat data jadwal guru');
      }
    } catch (error) {
      console.error('Error fetching jadwal guru:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = dataGuru;

    if (searchKode) {
      filtered = filtered.filter(guru =>
        guru.kode_guru.toLowerCase().includes(searchKode.toLowerCase())
      );
    }

    if (searchNama) {
      filtered = filtered.filter(guru =>
        guru.nama_guru.toLowerCase().includes(searchNama.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [searchKode, searchNama, dataGuru]);

  const handleReset = () => {
    setSearchKode('');
    setSearchNama('');
  };

  // Handler untuk view dengan preventDefault
  const handleView = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/waka/jadwal-guru/${id}`);
  };

  // Handler untuk edit dengan preventDefault
  const handleEdit = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/waka/jadwal-guru/${id}/edit`);
  };

  return (
    <>
      <NavbarWaka />

      <div className="jadwal-guru-index-root">
        <div className="jadwal-guru-index-header">
          <h1 className="jadwal-guru-index-title">
            Jadwal Pembelajaran Guru
          </h1>
          <p className="jadwal-guru-index-subtitle">
            Kelola dan lihat jadwal pembelajaran per guru
          </p>
        </div>

        <div className="jadwal-guru-index-filter-card">
          <div className="jadwal-guru-index-filter-grid">
            <div>
              <label className="jadwal-guru-index-label">
                <FaIdCard /> Cari Kode Guru
              </label>
              <input
                type="text"
                value={searchKode}
                onChange={(e) => setSearchKode(e.target.value)}
                placeholder="Contoh: GR001"
                className="jadwal-guru-index-input"
              />
            </div>

            <div>
              <label className="jadwal-guru-index-label">
                <FaUser /> Cari Nama Guru
              </label>
              <input
                type="text"
                value={searchNama}
                onChange={(e) => setSearchNama(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="jadwal-guru-index-input"
              />
            </div>
          </div>

          {(searchKode || searchNama) && (
            <div className="jadwal-guru-index-reset-wrapper">
              <button
                onClick={handleReset}
                className="jadwal-guru-index-reset-btn"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        <div className="jadwal-guru-index-table-card">
          <div className="jadwal-guru-index-table-header">
            <h3>Daftar Guru ({filteredData.length})</h3>
          </div>

          <div className="jadwal-guru-index-table-wrapper">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                Memuat data...
              </div>
            ) : filteredData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                Tidak ada data jadwal guru
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode Guru</th>
                    <th>Nama Guru</th>
                    <th>Mata Pelajaran</th>
                    <th>Kontak</th>
                    <th>Jumlah Kelas</th>
                    <th>Status Jadwal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map((guru, index) => (
                    <tr key={guru.id}>
                      <td>{index + 1}</td>

                      <td>
                        <span className="jadwal-guru-index-badge-blue">
                          {guru.kode_guru}
                        </span>
                      </td>

                      <td>{guru.nama_guru}</td>
                      <td>{guru.mata_pelajaran}</td>

                      <td>
                        <div><FaEnvelope /> {guru.email}</div>
                        <div><FaPhone /> {guru.no_hp}</div>
                      </td>

                      <td>{guru.jumlah_kelas || 0} Kelas</td>

                      <td>
                        {guru.gambar_jadwal ? (
                          <span className="jadwal-guru-index-badge-green">
                            <FaCheckCircle /> Jadwal Tersedia
                          </span>
                        ) : (
                          <span className="jadwal-guru-index-badge-orange">
                            <FaExclamationCircle /> Belum Ada Jadwal
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="jadwal-guru-index-action">
                          <button
                            onClick={(e) => handleView(e, guru.id)}
                            className="jadwal-guru-index-btn-view"
                          >
                            <FaEye />
                          </button>

                          <button
                            onClick={(e) => handleEdit(e, guru.id)}
                            className="jadwal-guru-index-btn-edit"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default JadwalGuruIndex;