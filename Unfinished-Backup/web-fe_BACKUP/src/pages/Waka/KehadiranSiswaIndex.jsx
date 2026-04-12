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

  const jurusanList = ['RPL', 'TKJ', 'MM', 'AN', 'BC', 'EI', 'MT', 'AV'];
  const kelasOptions = ['X', 'XI', 'XII'];
  

  // Dummy data sesuai screenshot
  const dummyData = [
    // RPL
    { id: 1, nama_kelas: "X RPL 1", jurusan: { nama_jurusan: "RPL" }, wali_kelas: "" },
    { id: 2, nama_kelas: "X RPL 2", jurusan: { nama_jurusan: "RPL" }, wali_kelas: "" },
    { id: 3, nama_kelas: "X RPL 3", jurusan: { nama_jurusan: "RPL" }, wali_kelas: "" },
    { id: 4, nama_kelas: "XI RPL 1", jurusan: { nama_jurusan: "RPL" }, wali_kelas: "" },
    { id: 5, nama_kelas: "XI RPL 2", jurusan: { nama_jurusan: "RPL" }, wali_kelas: "" },
    { id: 6, nama_kelas: "XI RPL 3", jurusan: { nama_jurusan: "RPL" }, wali_kelas: "" },
    { id: 7, nama_kelas: "XII RPL 1", jurusan: { nama_jurusan: "RPL" }, wali_kelas: "RR. Henning Gratyanis Anggraeni, S.Pd" },
    { id: 8, nama_kelas: "XII RPL 2", jurusan: { nama_jurusan: "RPL" }, wali_kelas: "Triana Andriani, S.Pd" },

    // TKJ
    { id: 9, nama_kelas: "X TKJ 1", jurusan: { nama_jurusan: "TKJ" }, wali_kelas: "" },
    { id: 10, nama_kelas: "X TKJ 2", jurusan: { nama_jurusan: "TKJ" }, wali_kelas: "" },
    { id: 11, nama_kelas: "X TKJ 3", jurusan: { nama_jurusan: "TKJ" }, wali_kelas: "" },
    { id: 12, nama_kelas: "XI TKJ 1", jurusan: { nama_jurusan: "TKJ" }, wali_kelas: "" },
    { id: 13, nama_kelas: "XI TKJ 2", jurusan: { nama_jurusan: "TKJ" }, wali_kelas: "" },
    { id: 14, nama_kelas: "XI TKJ 3", jurusan: { nama_jurusan: "TKJ" }, wali_kelas: "" },
    { id: 15, nama_kelas: "XII TKJ 1", jurusan: { nama_jurusan: "TKJ" }, wali_kelas: "" },
    { id: 16, nama_kelas: "XII TKJ 2", jurusan: { nama_jurusan: "TKJ" }, wali_kelas: "" },

    // DKV
    { id: 17, nama_kelas: "X DKV 1", jurusan: { nama_jurusan: "DKV" }, wali_kelas: "" },
    { id: 18, nama_kelas: "X DKV 2", jurusan: { nama_jurusan: "DKV" }, wali_kelas: "" },
    { id: 19, nama_kelas: "X DKV 3", jurusan: { nama_jurusan: "DKV" }, wali_kelas: "" },
    { id: 20, nama_kelas: "XI DKV 1", jurusan: { nama_jurusan: "DKV" }, wali_kelas: "" },
    { id: 21, nama_kelas: "XI DKV 2", jurusan: { nama_jurusan: "DKV" }, wali_kelas: "" },
    { id: 22, nama_kelas: "XI DKV 3", jurusan: { nama_jurusan: "DKV" }, wali_kelas: "" },
    { id: 23, nama_kelas: "XII DKV 1", jurusan: { nama_jurusan: "DKV" }, wali_kelas: "" },
    { id: 24, nama_kelas: "XII DKV 2", jurusan: { nama_jurusan: "DKV" }, wali_kelas: "" },
    { id: 25, nama_kelas: "XII DKV 3", jurusan: { nama_jurusan: "DKV" }, wali_kelas: "" },

    // AN
    { id: 26, nama_kelas: "X AN 1", jurusan: { nama_jurusan: "AN" }, wali_kelas: "" },
    { id: 27, nama_kelas: "X AN 2", jurusan: { nama_jurusan: "AN" }, wali_kelas: "" },
    { id: 28, nama_kelas: "XI AN 1", jurusan: { nama_jurusan: "AN" }, wali_kelas: "" },
    { id: 29, nama_kelas: "XI AN 2", jurusan: { nama_jurusan: "AN" }, wali_kelas: "" },
    { id: 30, nama_kelas: "XII AN 1", jurusan: { nama_jurusan: "AN" }, wali_kelas: "" },
    { id: 31, nama_kelas: "XII AN 2", jurusan: { nama_jurusan: "AN" }, wali_kelas: "" },

    // BC
    { id: 32, nama_kelas: "X BC 1", jurusan: { nama_jurusan: "BC" }, wali_kelas: "" },
    { id: 33, nama_kelas: "X BC 2", jurusan: { nama_jurusan: "BC" }, wali_kelas: "" },
    { id: 34, nama_kelas: "XI BC 1", jurusan: { nama_jurusan: "BC" }, wali_kelas: "" },
    { id: 35, nama_kelas: "XI BC 2", jurusan: { nama_jurusan: "BC" }, wali_kelas: "" },
    { id: 36, nama_kelas: "XII BC 1", jurusan: { nama_jurusan: "BC" }, wali_kelas: "" },
    { id: 37, nama_kelas: "XII BC 2", jurusan: { nama_jurusan: "BC" }, wali_kelas: "" },

    // EI
    { id: 38, nama_kelas: "X EI 1", jurusan: { nama_jurusan: "EI" }, wali_kelas: "" },
    { id: 39, nama_kelas: "X EI 2", jurusan: { nama_jurusan: "EI" }, wali_kelas: "" },
    { id: 40, nama_kelas: "XI EI 1", jurusan: { nama_jurusan: "EI" }, wali_kelas: "" },
    { id: 41, nama_kelas: "XI EI 2", jurusan: { nama_jurusan: "EI" }, wali_kelas: "" },
    { id: 42, nama_kelas: "XII EI 1", jurusan: { nama_jurusan: "EI" }, wali_kelas: "" },
    { id: 43, nama_kelas: "XII EI 2", jurusan: { nama_jurusan: "EI" }, wali_kelas: "" },

    // MT
    { id: 44, nama_kelas: "X MT 1", jurusan: { nama_jurusan: "MT" }, wali_kelas: "" },
    { id: 45, nama_kelas: "X MT 2", jurusan: { nama_jurusan: "MT" }, wali_kelas: "" },
    { id: 46, nama_kelas: "XI MT 1", jurusan: { nama_jurusan: "MT" }, wali_kelas: "" },
    { id: 47, nama_kelas: "XI MT 2", jurusan: { nama_jurusan: "MT" }, wali_kelas: "" },
    { id: 48, nama_kelas: "XII MT 1", jurusan: { nama_jurusan: "MT" }, wali_kelas: "" },
    { id: 49, nama_kelas: "XII MT 2", jurusan: { nama_jurusan: "MT" }, wali_kelas: "" },

    // AV 
    { id: 50, nama_kelas: "X AV 1", jurusan: { nama_jurusan: "AV" }, wali_kelas: "" },
    { id: 51, nama_kelas: "X AV 2", jurusan: { nama_jurusan: "AV" }, wali_kelas: "" },
    { id: 52, nama_kelas: "XI AV 1", jurusan: { nama_jurusan: "AV" }, wali_kelas: "" },
    { id: 53, nama_kelas: "XI AV 2", jurusan: { nama_jurusan: "AV" }, wali_kelas: "" },
    { id: 54, nama_kelas: "XII AV 1", jurusan: { nama_jurusan: "AV" }, wali_kelas: "" },
    { id: 55, nama_kelas: "XII AV 2", jurusan: { nama_jurusan: "AV" }, wali_kelas: "" }
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