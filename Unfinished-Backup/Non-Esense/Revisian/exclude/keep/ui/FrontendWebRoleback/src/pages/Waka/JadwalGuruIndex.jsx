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
  const stored = localStorage.getItem('jadwal-guru');

  if (stored) {
    const parsed = JSON.parse(stored);
    setDataGuru(parsed);
    setFilteredData(parsed);
  } else {
    const mockData = [
      {
        id: 1,
        kode_guru: 'GR001',
        nama_guru: 'Budi Santoso, S.Pd',
        mata_pelajaran: 'Matematika',
        email: 'budi.santoso@smkn2.sch.id',
        no_hp: '081234567890',
        gambar_jadwal: '/images/jadwal-guru-1.jpg',
        jumlah_kelas: 5
      },
      {
        id: 2,
        kode_guru: 'GR002',
        nama_guru: 'Siti Aminah, S.Pd',
        mata_pelajaran: 'Bahasa Indonesia',
        email: 'siti.aminah@smkn2.sch.id',
        no_hp: '081234567891',
        gambar_jadwal: null,
        jumlah_kelas: 4
      }
    ];

    localStorage.setItem('jadwal-guru', JSON.stringify(mockData));
    setDataGuru(mockData);
    setFilteredData(mockData);
  }
}, []);

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

                  <td>{guru.jumlah_kelas} Kelas</td>

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
        </div>
      </div>
    </div>
  </>
);
}

export default JadwalGuruIndex;