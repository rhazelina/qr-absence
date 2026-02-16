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
  const navigate = useNavigate();

  const [filterKompetensi, setFilterKompetensi] = useState('');
  const [filterKelas, setFilterKelas] = useState('');

  const kompetensiList = [
    { label: 'Rekayasa Perangkat Lunak', value: 'RPL' },
    { label: 'Teknik Komputer dan Jaringan', value: 'TKJ' },
    { label: 'Desain Komunikasi Visual', value: 'DKV' },
  ];

  const kelasOptions = ['X RPL 1', 'X RPL 2', 'XI RPL 1', 'X TKJ 1', 'X DKV 1'];

  // DATA DUMMY
  const dummyData = [
    {
      id: 'dummy-1',
      kompetensi_keahlian: 'RPL',
      wali_kelas: 'Budi Santoso, S.Pd',
      kelas: 'X RPL 1'
    },
    {
      id: 'dummy-2',
      kompetensi_keahlian: 'RPL',
      wali_kelas: 'Siti Aminah, S.Kom',
      kelas: 'X RPL 2'
    },
    {
      id: 'dummy-3',
      kompetensi_keahlian: 'TKJ',
      wali_kelas: 'Ahmad Dahlan, S.T',
      kelas: 'X TKJ 1'
    },
    {
      id: 'dummy-4',
      kompetensi_keahlian: 'DKV',
      wali_kelas: 'Dewi Lestari, S.Sn',
      kelas: 'X DKV 1'
    },
    {
      id: 'dummy-5',
      kompetensi_keahlian: 'RPL',
      wali_kelas: 'Eko Prasetyo, S.Pd',
      kelas: 'XI RPL 1'
    }
  ];

  useEffect(() => {
    const items = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key.startsWith('jadwal-siswa-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          
          // Filter data yang valid - harus memiliki semua field yang dibutuhkan
          if (data && 
              data.id && 
              data.kompetensi_keahlian && 
              data.wali_kelas && 
              data.kelas) {
            items.push({
              id: data.id,
              kompetensi_keahlian: data.kompetensi_keahlian,
              wali_kelas: data.wali_kelas,
              kelas: data.kelas
            });
          }
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
        }
      }
    }

    // Gabungkan data dummy dengan data dari localStorage
    // Prioritaskan data dummy jika tidak ada data dari localStorage
    const allData = [...dummyData, ...items];
    
    // Hapus duplikasi berdasarkan ID (prioritaskan yang pertama muncul - yaitu dummy data)
    const uniqueData = allData.filter((item, index, self) =>
      index === self.findIndex((t) => t.id === item.id)
    );
    
    setDataSiswa(uniqueData);
    setFilteredData(uniqueData);
  }, []);

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
        </div>
      </div>
    </div>
  );
}

export default JadwalSiswaIndex;