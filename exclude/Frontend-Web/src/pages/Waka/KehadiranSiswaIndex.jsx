import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KehadiranSiswaIndex.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { FaBriefcase, FaChevronDown, FaDoorOpen, FaEye, FaInbox, FaSpinner, FaTable, FaUser } from 'react-icons/fa';

function KehadiranSiswaIndex() {
  const navigate = useNavigate();
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterJurusan, setFilterJurusan] = useState('');
  const [filterKelas, setFilterKelas] = useState('');

  const jurusanList = ['TKJ', 'RPL', 'MM', 'TBSM', 'TKR'];
  const kelasOptions = ['X', 'XI', 'XII'];

  // Dummy data sesuai screenshot
  const dummyData = [
    { id: 1, nama_kelas: 'X RPL 1', jurusan: { nama_jurusan: 'RPL' }, wali_kelas: 'Prof. Aminullah' },
    { id: 2, nama_kelas: 'X RPL 2', jurusan: { nama_jurusan: 'RPL' }, wali_kelas: 'Bu Rina Wahyuni, S.Kom' },
    { id: 3, nama_kelas: 'XI RPL 1', jurusan: { nama_jurusan: 'RPL' }, wali_kelas: 'Bu Maya Sari, S.Kom' },
    { id: 4, nama_kelas: 'XI RPL 2', jurusan: { nama_jurusan: 'RPL' }, wali_kelas: 'Pak Dimas Nugroho, S.Kom' },
    { id: 5, nama_kelas: 'XII RPL 1', jurusan: { nama_jurusan: 'RPL' }, wali_kelas: 'Pak Wahyu Setiawan, S.Pd' },
    { id: 6, nama_kelas: 'XII RPL 2', jurusan: { nama_jurusan: 'RPL' }, wali_kelas: 'Pak Budi Santoso, S.Pd' },

    // ================= TKJ =================
    { id: 7, nama_kelas: 'X TKJ 1', jurusan: { nama_jurusan: 'TKJ' }, wali_kelas: 'Pak Hendra Saputra, S.T' },
    { id: 8, nama_kelas: 'X TKJ 2', jurusan: { nama_jurusan: 'TKJ' }, wali_kelas: 'Bu Nita Puspitasari, S.T' },
    { id: 9, nama_kelas: 'XI TKJ 1', jurusan: { nama_jurusan: 'TKJ' }, wali_kelas: 'Pak Rudi Hartono, S.T' },
    { id: 10, nama_kelas: 'XI TKJ 2', jurusan: { nama_jurusan: 'TKJ' }, wali_kelas: 'Pak Eko Prasetyo, S.Kom' },
    { id: 11, nama_kelas: 'XII TKJ 1', jurusan: { nama_jurusan: 'TKJ' }, wali_kelas: 'Pak Ahmad Yani, S.Kom' },

    // ================= MM =================
    { id: 12, nama_kelas: 'X MM 1', jurusan: { nama_jurusan: 'MM' }, wali_kelas: 'Bu Intan Lestari, S.Sn' },
    { id: 13, nama_kelas: 'X MM 2', jurusan: { nama_jurusan: 'MM' }, wali_kelas: 'Pak Bayu Pratama, S.Sn' },
    { id: 14, nama_kelas: 'XI MM 1', jurusan: { nama_jurusan: 'MM' }, wali_kelas: 'Bu Dian Anggraeni, S.Pd' },
    { id: 15, nama_kelas: 'XI MM 2', jurusan: { nama_jurusan: 'MM' }, wali_kelas: 'Pak Rizky Aditya, S.Sn' },
    { id: 16, nama_kelas: 'XII MM 1', jurusan: { nama_jurusan: 'MM' }, wali_kelas: 'Bu Sari Dewi, S.Pd' }
  ];

  useEffect(() => {
    // Simulasi loading data
    setTimeout(() => {
      setKelasList(dummyData);
      setLoading(false);
    }, 500);
  }, []);

  const filteredKelasList = kelasList.filter(kelas => {
    const matchesJurusan = filterJurusan ? kelas.jurusan.nama_jurusan === filterJurusan : true;
    const matchesKelas = filterKelas ? kelas.nama_kelas.startsWith(filterKelas + ' ') : true;
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
                          <span className="nama-kelas">{item.nama_kelas}</span>
                        </div>
                      </td>
                      <td>
                        <span className="lencana-jurusan">
                          {item.jurusan?.nama_jurusan || '-'}
                        </span>
                      </td>
                      <td>
                        <div className="info-wali">
                          <div className="avatar-wali">
                            <FaUser />
                          </div>
                          <span className="nama-wali">{item.wali_kelas || '-'}</span>
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