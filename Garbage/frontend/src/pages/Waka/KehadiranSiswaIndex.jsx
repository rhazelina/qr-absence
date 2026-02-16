import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KehadiranSiswaIndex.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { FaBriefcase, FaChevronDown, FaDoorOpen, FaEye, FaInbox, FaSpinner, FaTable, FaUser } from 'react-icons/fa';
import { wakaService } from '../../services/waka';

function KehadiranSiswaIndex() {
  const navigate = useNavigate();
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterJurusan, setFilterJurusan] = useState('');
  const [filterKelas, setFilterKelas] = useState('');

  const jurusanList = ['TKJ', 'RPL', 'MM', 'TBSM', 'TKR'];
  const kelasOptions = ['X', 'XI', 'XII'];

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await wakaService.getClasses();
        setKelasList(data);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const filteredKelasList = kelasList.filter(kelas => {
    // Determine major name safely
    const majorName = kelas.major?.code || kelas.major?.name || '';
    const matchesJurusan = filterJurusan ? majorName.includes(filterJurusan) : true;
    const matchesKelas = filterKelas ? kelas.grade.startsWith(filterKelas) : true;
    return matchesJurusan && matchesKelas;
  });

  // Handler untuk view kehadiran siswa
  const handleViewKehadiran = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/waka/kehadiran-siswa/${id}`);
  };

  if (loading) {
    return (
      <div className="wadah-muat">
        <div className="konten-muat">
          <FaSpinner />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavbarWaka />
      <div className="wadah-kehadiran">
        <div className="kepala-halaman">
          <h1 className="judul-halaman">Kehadiran Siswa</h1>
          <p className="deskripsi-halaman">Kelola dan monitor kehadiran siswa per kelas</p>
        </div>

        {/* Filter Card */}
        <div className="kartu-filter">
          <div className="susunan-filter">
            {/* Filter Jurusan */}
            <div className="kelompok-filter">
              <label className="label-filter">
                <FaBriefcase /> Jurusan
              </label>
              <div className="pembungkus-pilih">
                <select
                  name="jurusan"
                  value={filterJurusan}
                  onChange={(e) => {
                    setFilterJurusan(e.target.value);
                  }}
                  className="pilih-filter"
                >
                  <option value="">Semua Jurusan</option>
                  {jurusanList.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
                <FaChevronDown className="ikon-pilih" />
              </div>
            </div>

            {/* Filter Kelas */}
            <div className="kelompok-filter">
              <label className="label-filter">
                <FaDoorOpen /> Tingkatan
              </label>
              <div className="pembungkus-pilih">
                <select
                  name="kelas"
                  value={filterKelas}
                  onChange={(e) => {
                    setFilterKelas(e.target.value);
                  }}
                  className="pilih-filter"
                >
                  <option value="">Semua Tingkatan</option>
                  {kelasOptions.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <FaChevronDown className="ikon-pilih" />
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="kartu-tabel">
          {/* Kepala Tabel */}
          <div className="kepala-tabel">
            <div className="isi-kepala">
              <FaTable />
              <h2>Daftar Kelas</h2>
            </div>
          </div>

          {/* Isian Tabel */}
          <div className="bingkai-tabel">
            <table className="tabel-data">
              <thead>
                <tr>
                  <th className="th-tengah th-urut">No</th>
                  <th className="th-kiri">Kelas</th>
                  <th className="th-kiri">Jurusan</th>
                  <th className="th-kiri">Wali Kelas</th>
                  <th className="th-tengah th-tombol">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredKelasList.length > 0 ? (
                  filteredKelasList.map((item, index) => (
                    <tr key={item.id} className="baris-tabel">
                      <td className="td-tengah">
                        <span className="lencana-angka">
                          {index + 1}
                        </span>
                      </td>
                      <td className="td-kelas">
                        <div className="info-kelas">
                          <span className="nama-kelas">{item.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="lencana-jurusan">
                          {item.major?.name || '-'}
                        </span>
                      </td>
                      <td>
                        <div className="info-wali">
                          <div className="avatar-wali">
                            <FaUser />
                          </div>
                          <span className="nama-wali">{item.homeroom_teacher?.user?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="td-tengah">
                        <button
                          onClick={(e) => handleViewKehadiran(e, item.id)}
                          className="tombol-lihat"
                          title="Lihat Kehadiran"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="sel-kosong">
                      <div className="keadaan-kosong">
                        <div className="wadah-ikon-kosong">
                          <FaInbox />
                        </div>
                        <div className="teks-kosong">
                          <p className="judul-kosong">Tidak ada data tersedia</p>
                          <p className="keterangan-kosong">Silakan coba filter yang berbeda</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default KehadiranSiswaIndex;