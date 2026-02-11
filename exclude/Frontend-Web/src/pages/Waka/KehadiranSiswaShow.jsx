import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './KehadiranSiswaShow.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { FaArrowLeft, FaChevronDown, FaClipboardCheck, FaDoorOpen, FaEdit, FaSave, FaSpinner, FaTimes, FaUser, FaEye, } from 'react-icons/fa';
import { FaChartBar } from 'react-icons/fa6';

function KehadiranSiswaShow() {

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailSiswa, setDetailSiswa] = useState(null);

  const handleDetailClick = (siswa) => {
    setDetailSiswa(siswa);
    setShowDetailModal(true);
  };

  const { id } = useParams();
  console.log(id);

  const [kelas, setKelas] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Jumlah status - diinisialisasi dengan 0, akan dihitung dari data siswa
  const [statusCounts, setStatusCounts] = useState({
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
    pulang: 0,
    terlambat: 0
  });


  // Fungsi untuk menghitung jumlah status dari data siswa
  const hitungStatusCounts = (dataSiswa) => {
    const counts = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpha: 0,
      pulang: 0,
      terlambat: 0
    };


    dataSiswa.forEach(siswa => {
      const status = siswa.status.toLowerCase();
      if (status === 'hadir') counts.hadir++;
      else if (status === 'izin') counts.izin++;
      else if (status === 'sakit') counts.sakit++;
      else if (status === 'alpha') counts.alpha++;
      else if (status === 'pulang') counts.pulang++;
      else if (status === 'terlambat') counts.terlambat++;
    });

    return counts;
  };

  // Data mock untuk kelas berdasarkan ID
  const kelasData = {
    1: { nama_kelas: 'X RPL 1', jurusan: 'RPL', wali_kelas: 'Prof. Aminullah' },
    2: { nama_kelas: 'X RPL 2', jurusan: 'RPL', wali_kelas: 'Bu Rina Wahyuni, S.Kom' },
    3: { nama_kelas: 'XI RPL 1', jurusan: 'RPL', wali_kelas: 'Bu Maya Sari, S.Kom' },
    4: { nama_kelas: 'XI RPL 2', jurusan: 'RPL', wali_kelas: 'Pak Dimas Nugroho, S.Kom' },
    5: { nama_kelas: 'XII RPL 1', jurusan: 'RPL', wali_kelas: 'Pak Wahyu Setiawan, S.Pd' },
    6: { nama_kelas: 'XII RPL 2', jurusan: 'RPL', wali_kelas: 'Pak Budi Santoso, S.Pd' },
    7: { nama_kelas: 'X TKJ 1', jurusan: 'TKJ', wali_kelas: 'Pak Hendra Saputra, S.T' },
    8: { nama_kelas: 'X TKJ 2', jurusan: 'TKJ', wali_kelas: 'Bu Nita Puspitasari, S.T' },
    9: { nama_kelas: 'XI TKJ 1', jurusan: 'TKJ', wali_kelas: 'Pak Rudi Hartono, S.T' },
    10: { nama_kelas: 'XI TKJ 2', jurusan: 'TKJ', wali_kelas: 'Pak Eko Prasetyo, S.Kom' },
    11: { nama_kelas: 'XII TKJ 1', jurusan: 'TKJ', wali_kelas: 'Pak Ahmad Yani, S.Kom' },
    12: { nama_kelas: 'X MM 1', jurusan: 'MM', wali_kelas: 'Bu Intan Lestari, S.Sn' },
    13: { nama_kelas: 'X MM 2', jurusan: 'MM', wali_kelas: 'Pak Bayu Pratama, S.Sn' },
    14: { nama_kelas: 'XI MM 1', jurusan: 'MM', wali_kelas: 'Bu Dian Anggraeni, S.Pd' },
    15: { nama_kelas: 'XI MM 2', jurusan: 'MM', wali_kelas: 'Pak Rizky Aditya, S.Sn' },
    16: { nama_kelas: 'XII MM 1', jurusan: 'MM', wali_kelas: 'Bu Sari Dewi, S.Pd' }
  };

  // Data mock siswa
  const mockSiswaList = [
    { id: 1, nisn: '123456789', nama: 'M. Abdul Khosim Ahmadiansyah', mata_pelajaran: 'Matematika', status: 'Hadir' },
    { id: 2, nisn: '123456790', nama: 'Budi Santoso', mata_pelajaran: 'Matematika', status: 'Hadir' },
    { id: 3, nisn: '123456791', nama: 'Siti Nurhaliza', mata_pelajaran: 'Matematika, Bahasa Indonesia', status: 'Izin' },
    { id: 4, nisn: '123456792', nama: 'Ahmad Rizki', mata_pelajaran: 'Matematika', status: 'Sakit' },
    { id: 5, nisn: '123456793', nama: 'Dewi Lestari', mata_pelajaran: '-', status: 'Alpha' },
    { id: 6, nisn: '123456794', nama: 'Rudi Hermawan', mata_pelajaran: 'Matematika', status: 'Hadir' },
    { id: 7, nisn: '123456795', nama: 'Maya Sari', mata_pelajaran: '-', status: 'Alpha' },
    { id: 8, nisn: '123456796', nama: 'Eko Prasetyo', mata_pelajaran: 'Matematika', status: 'Hadir' },
    { id: 9, nisn: '123456797', nama: 'Nita Puspitasari', mata_pelajaran: 'Matematika, Fisika', status: 'Pulang' },
    { id: 10, nisn: '123456798', nama: 'Hendra Saputra', mata_pelajaran: 'Matematika', status: 'Hadir' }
  ];

  useEffect(() => {
    setTimeout(() => {
      const saved = sessionStorage.getItem(`kehadiran-kelas-${id}`);

      let dataSiswa;
      if (saved) {
        dataSiswa = JSON.parse(saved);
        setSiswaList(dataSiswa);
      } else {
        dataSiswa = mockSiswaList;
        sessionStorage.setItem(
          `kehadiran-kelas-${id}`,
          JSON.stringify(mockSiswaList)
        );
        setSiswaList(mockSiswaList);
      }

      // Hitung status counts dari data siswa
      const counts = hitungStatusCounts(dataSiswa);
      setStatusCounts(counts);

      setKelas(kelasData[id]);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleEditClick = (siswa) => {
    setSelectedSiswa(siswa);
    setSelectedStatus(siswa.status);
    setShowEditModal(true);
  };

  const handleStatusUpdate = () => {
    const updatedList = siswaList.map(siswa =>
      siswa.id === selectedSiswa.id
        ? { ...siswa, status: selectedStatus }
        : siswa
    );

    setSiswaList(updatedList);

    // Hitung ulang status counts setelah update
    const counts = hitungStatusCounts(updatedList);
    setStatusCounts(counts);

    sessionStorage.setItem(
      `kehadiran-kelas-${id}`,
      JSON.stringify(updatedList)
    );

    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="kontainer-loading">
        <div className="teks-loading">
          <FaSpinner /> Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="tampilan-kehadiran-siswa">
      <NavbarWaka />
      <div className="kontainer-tampilan">
        {/* Header */}
        <div className="header-halaman-tampilan">
        </div>

        {/* Kartu Info Kelas & Statistik */}
        <div className="kartu-utama">
          {/* Header Kelas */}
          <div className="header-kelas">
            <div className="bagian-judul-kelas">
              <div className="ikon-judul-kelas">
                <div className="ikon-header-kelas">
                  <FaDoorOpen />
                </div>
                <div>
                  <h2>{kelas.nama_kelas}</h2>
                  <p className="wali-kelas-text">
                    Wali Kelas: {kelas.wali_kelas}
                  </p>
                </div>
              </div>

              <div className="wrapper-bagian-dropdown">
                {/* Filter Mata Pelajaran */}
                <div className="bagian-dropdown">
                  <select className="dropdown-kelas">
                    <option value="">Pilih Mata Pelajaran</option>
                    <option>Matematika</option>
                    <option>Bahasa Indonesia</option>
                    <option>IPA</option>
                    <option>IPS</option>
                    <option>Bahasa Inggris</option>
                  </select>
                  <FaChevronDown className="ikon-dropdown" />
                </div>

                {/* Tombol Lihat Rekap */}
                <Link
                  to="/waka/kehadiran-siswa/rekap"
                  className="tombol-rekap-inline"
                >
                  <FaChartBar />
                  Lihat Rekap
                </Link>
              </div>
            </div>

            {/* Statistik Status */}
            <div className="grid-statistik-status">
              <div className="kartu-stat stat-hadir">
                <div className="ikon-stat">
                </div>
                <div className="info-stat">
                  <div className="jumlah-stat">{statusCounts.hadir}</div>
                  <div className="label-stat">Hadir</div>
                </div>
              </div>

              <div className="kartu-stat stat-izin">
                <div className="info-stat">
                  <div className="jumlah-stat">{statusCounts.izin}</div>
                  <div className="label-stat">Izin</div>
                </div>
              </div>

              <div className="kartu-stat stat-sakit">
                <div className="info-stat">
                  <div className="jumlah-stat">{statusCounts.sakit}</div>
                  <div className="label-stat">Sakit</div>
                </div>
              </div>

              <div className="kartu-stat stat-terlambat">
                <div className="info-stat">
                  <div className="jumlah-stat">{statusCounts.terlambat}</div>
                  <div className="label-stat">Terlambat</div>
                </div>
              </div>


              <div className="kartu-stat stat-alpha">
                <div className="info-stat">
                  <div className="jumlah-stat">{statusCounts.alpha}</div>
                  <div className="label-stat">Alpha</div>
                </div>
              </div>

              <div className="kartu-stat stat-pulang">
                <div className="info-stat">
                  <div className="jumlah-stat">{statusCounts.pulang}</div>
                  <div className="label-stat">Pulang</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel */}
          <div className="bagian-tabel">
            <div className="wrapper-tabel-tampilan">
              <table className="tabel-kehadiran">
                <thead>
                  <tr>
                    <th className="th-nomor">No</th>
                    <th className="th-nisn">NISN</th>
                    <th className="th-nama">Nama Siswa</th>
                    <th className="th-mapel">Mata Pelajaran</th>
                    <th className="th-status">Status</th>
                    <th className="th-aksi">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {siswaList.map((siswa, index) => (
                    <tr key={siswa.id} className="baris-tabel">
                      <td className="td-tengah">
                        <span className="badge-nomor">{index + 1}</span>
                      </td>
                      <td className="td-nisn">{siswa.nisn}</td>
                      <td className="td-nama">{siswa.nama}</td>
                      <td className="td-mapel">{siswa.mata_pelajaran}</td>
                      <td className="td-status">
                        <span className={`badge-status status-${siswa.status.toLowerCase()}`}>
                          {siswa.status}
                        </span>
                      </td>
                      <td className="td-tengah">
                        <div className="wrapper-aksi">
                          <button
                            className="tombol-edit-status"
                            onClick={() => handleEditClick(siswa)}
                            title="Edit Status"
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="tombol-detail-status"
                            onClick={() => handleDetailClick(siswa)}
                            title="Detail Kehadiran"
                          >
                            <FaEye />
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

        {/* Tombol Kembali */}
        <div className="bagian-kembali">
          <Link to="/waka/kehadiran-siswa" className="tombol-kembali-tampilan">
            <FaArrowLeft />
            <span>Kembali</span>
          </Link>
        </div>
      </div>

      {/* Modal Edit Status */}
      {showEditModal && (
        <div className="overlay-modal">
          <div className="konten-modal">
            <div className="header-modal">
              <h3>Edit Kehadiran</h3>
              <button
                className="tutup-modal"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="body-modal">
              <div className="info-siswa-modal">
                <div className="avatar-siswa">
                  <FaUser />
                </div>
                <div className="detail-siswa">
                  <h4>{selectedSiswa?.nama}</h4>
                  <p>NISN: {selectedSiswa?.nisn}</p>
                </div>
              </div>

              <div className="grup-form-modal">
                <label className="label-form-modal">
                  <FaClipboardCheck />
                  Pilih Kehadiran
                </label>
                <div className="wrapper-select-modal">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="select-status-modal"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpha">Alpha</option>
                    <option value="Pulang">Pulang</option>
                    <option value="Terlambat">Terlambat</option>
                  </select>
                  <FaChevronDown className="ikon-select-modal" />
                </div>
              </div>
            </div>

            <div className="footer-modal">
              <button
                className="tombol-modal-batal"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
                Batal
              </button>
              <button
                className="tombol-modal-simpan"
                onClick={handleStatusUpdate}
              >
                <FaSave />
                Simpan
              </button>
            </div>
          </div>
        </div>


      )}
      {showDetailModal && detailSiswa && (
        <div className="overlay-modal">
          <div className="modal-detail">
            <div className="modal-detail-header">
              <FaClipboardCheck />
              <h3>Detail Kehadiran</h3>
              <button onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-detail-body">
              <div className="detail-row">
                <span>Tanggal:</span>
                <strong>25-01-2026</strong>
              </div>

              <div className="detail-row">
                <span>Jam Pelajaran:</span>
                <strong>1–4</strong>
              </div>

              <div className="detail-row">
                <span>Mata Pelajaran:</span>
                <strong>{detailSiswa.mata_pelajaran}</strong>
              </div>

              <div className="detail-row">
                <span>Nama Siswa:</span>
                <strong>{detailSiswa.nama}</strong>
              </div>

              <div className="detail-row">
                <span>Status:</span>
                <span className={`badge-status status-${detailSiswa.status.toLowerCase()}`}>
                  {detailSiswa.status}
                </span>
              </div>

              <div className="detail-row">
                <span>Keterangan:</span>

                {detailSiswa.status === 'Hadir' && (
                  <strong className="teks-hadir">
                    Siswa hadir dan mengikuti pembelajaran
                  </strong>
                )}

                {detailSiswa.status === 'Alpha' && (
                  <strong className="teks-alpha">
                    Tidak hadir tanpa keterangan
                  </strong>
                )}

                {['Izin', 'Sakit', 'Pulang'].includes(detailSiswa.status) && (
                  <strong>
                    Demam dan flu
                  </strong>
                )}
              </div>

              {detailSiswa.status === 'Terlambat' && (
                <strong className="teks-terlambat">
                  Siswa hadir namun datang terlambat
                </strong>
              )}



              <div className="detail-foto">
                <p>Bukti Kehadiran</p>

                {detailSiswa.status === 'Hadir' ? (
                  <div className="bukti-hadir">
                    <FaClipboardCheck />
                    <span>Hadir & tercatat di sistem</span>
                  </div>
                ) : (
                  <div className="wrapper-foto">
                    <div className="foto-kosong"></div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default KehadiranSiswaShow;