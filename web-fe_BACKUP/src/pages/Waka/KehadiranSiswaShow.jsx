import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './KehadiranSiswaShow.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { FaArrowLeft, FaChevronDown, FaClipboardCheck, FaDoorOpen, FaEdit, FaSave, FaSpinner, FaTimes, FaUser, FaEye } from 'react-icons/fa';
import { FaChartBar } from 'react-icons/fa6';

// Data siswa XII RPL 1 (id=7)
const dataSiswaRPL1 = [
  { id: 1,  nisn: "3078207819", nama: "ABRORY AKBAR AL BATAMI",           mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 2,  nisn: "0086659776", nama: "AFIF FIRMANSYAH",                  mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 3,  nisn: "0087441890", nama: "AGIES WIDYAWATI",                  mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 4,  nisn: "0071026334", nama: "AGIL RIFATUL HAQ",                 mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 5,  nisn: "0078492418", nama: "AKH. SEPTIAN FIO RAMADHAN",        mata_pelajaran: "Pemrograman Web", status: "Izin",      tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "Keperluan keluarga" },
  { id: 6,  nisn: "0077521428", nama: "Alya Fitri Larasati",              mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 7,  nisn: "0084302867", nama: "ANASTASYA DYAH AYU PROBONINGRUM",  mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 8,  nisn: "0079564039", nama: "ANISA PUSPITASARI",                mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 9,  nisn: "0087599872", nama: "Anissa Prissilvia Tahara",         mata_pelajaran: "Pemrograman Web", status: "Sakit",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "Sakit flu" },
  { id: 10, nisn: "0084701495", nama: "AQILLA MAULIDDYAH",                mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 11, nisn: "0079518058", nama: "AQILNA FAILLA LILFARA AIZANI",     mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 12, nisn: "0076823738", nama: "Aristia Faren Rafaela",            mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 13, nisn: "0088840490", nama: "ASYHARIL KAHFI DEWANDA",           mata_pelajaran: "Pemrograman Web", status: "Terlambat", tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "Terlambat 15 menit" },
  { id: 14, nisn: "0086920055", nama: "Athaar Putra Ruhenda",             mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 15, nisn: "0088032174", nama: "AVRILIANA ANJANI",                 mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 16, nisn: "0089732684", nama: "AZHAR ANISATUL JANNAH",            mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 17, nisn: "0086246127", nama: "BINTANG FIRMAN ARDANA",            mata_pelajaran: "Pemrograman Web", status: "Alfa",      tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 18, nisn: "3079461424", nama: "CALLISTA SHAFA RAMADHANI",         mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 19, nisn: "0077372447", nama: "CHEVY APRILIA HUTABARAT",          mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 20, nisn: "0073851099", nama: "CINDI TRI PRASETYO",               mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 21, nisn: "0082111423", nama: "CINTYA KARINA PUTRI",              mata_pelajaran: "Pemrograman Web", status: "Dispen",    tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "Lomba sekolah" },
  { id: 22, nisn: "0078343685", nama: "DHIA MIRZA HANDHIONO",             mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 23, nisn: "0081555900", nama: "DIANDHIKA DWI PRANATA",            mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 24, nisn: "0081936855", nama: "FAIRUZ QUDS ZAHRAN FIRDAUS",       mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 25, nisn: "0079300540", nama: "FARDAN RASYAH ISLAMI",             mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 26, nisn: "0088713839", nama: "FATCHUR ROHMAN ROFIAN",            mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 27, nisn: "0087853322", nama: "FIDATUL AVIVA",                    mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 28, nisn: "0088560011", nama: "FIRLI ZULFA AZZAHRA",              mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 29, nisn: "0062756939", nama: "HAPSARI ISMARTOYO",                mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 30, nisn: "0087538918", nama: "HAVID ABDILAH SURAHMAD",           mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 31, nisn: "0072226999", nama: "IGNACIA ZANDRA",                   mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 32, nisn: "0074853632", nama: "IQBAL LAZUARDI",                   mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 33, nisn: "0089462835", nama: "IQLIMAHDA TANZILLA FINAN DIVA",    mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 34, nisn: "0077181841", nama: "IRDINA MARSYA MAZARINA",           mata_pelajaran: "Pemrograman Web", status: "Pulang",    tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "Pulang lebih awal" },
  { id: 35, nisn: "0086237279", nama: "ISABEL CAHAYA HATI",               mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 36, nisn: "0074316703", nama: "KHOIRUN NI'MAH NURUL HIDAYAH",     mata_pelajaran: "Pemrograman Web", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
];

// Data siswa XII RPL 2 (id=8)
const dataSiswaRPL2 = [
  { id: 1,  nisn: "0074182519", nama: "LAURA LAVIDA LOCA",                    mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 2,  nisn: "0074320819", nama: "LELY SAGITA",                          mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 3,  nisn: "0078658367", nama: "MAYA MELINDA WIJAYANTI",               mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 4,  nisn: "0079292238", nama: "MOCH. ABYL GUSTIAN",                   mata_pelajaran: "Basis Data", status: "Terlambat", tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "Terlambat 10 menit" },
  { id: 5,  nisn: "0084421457", nama: "MUHAMMAD AMINULLAH",                   mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 6,  nisn: "0089104721", nama: "Muhammad Azka Fadli Atthaya",          mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 7,  nisn: "0087917739", nama: "MUHAMMAD HADI FIRMANSYAH",             mata_pelajaran: "Basis Data", status: "Alfa",      tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 8,  nisn: "0074704843", nama: "MUHAMMAD HARRIS MAULANA SAPUTRA",      mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 9,  nisn: "0077192596", nama: "MUHAMMAD IBNU RAFFI AHDAN",            mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 10, nisn: "0075024492", nama: "MUHAMMAD REYHAN ATHADIANSYAH",         mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 11, nisn: "0141951182", nama: "MUHAMMAD WISNU DEWANDARU",             mata_pelajaran: "Basis Data", status: "Izin",      tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "Keperluan keluarga" },
  { id: 12, nisn: "0072504970", nama: "NABILA RAMADHAN",                      mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 13, nisn: "0061631562", nama: "NADIA SINTA DEVI OKTAVIA",             mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 14, nisn: "0081112175", nama: "NADJWA KIRANA FIRDAUS",                mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 15, nisn: "0089965810", nama: "NINDI NARITA MAULIDYA",                mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 16, nisn: "0085834363", nama: "NISWATUL KHOIRIYAH",                   mata_pelajaran: "Basis Data", status: "Sakit",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "Sakit demam" },
  { id: 17, nisn: "0087884391", nama: "NOVERITA PASCALIA RAHMA",              mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 18, nisn: "0078285764", nama: "NOVITA ANDRIANI",                      mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 19, nisn: "0078980482", nama: "NOVITA AZZAHRA",                       mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 20, nisn: "0078036100", nama: "NURUL KHASANAH",                       mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 21, nisn: "0081838771", nama: "RACHEL ALUNA MEIZHA",                  mata_pelajaran: "Basis Data", status: "Dispen",    tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "Lomba sekolah" },
  { id: 22, nisn: "0079312790", nama: "RAENA WESTI DHEANOFA HERLIANI",        mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 23, nisn: "0084924963", nama: "RAYHANUN",                             mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 24, nisn: "0077652198", nama: "RAYYAN DAFFA AL AFFANI",               mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 25, nisn: "0087959211", nama: "RHAMEYZHA ALEA CHALILA PUTRI EDWA",    mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 26, nisn: "0089530132", nama: "RHEISYA MAULIDDIVA PUTRI",             mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 27, nisn: "0089479412", nama: "RHEYVAN RAMADHAN I.P",                 mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 28, nisn: "0073540571", nama: "RISKY RAMADHANI",                      mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 29, nisn: "0076610748", nama: "RITA AURA AGUSTINA",                   mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 30, nisn: "0077493253", nama: "RIZKY RAMADHANI",                      mata_pelajaran: "Basis Data", status: "Pulang",    tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "Pulang lebih awal" },
  { id: 31, nisn: "0076376703", nama: "SA'IDHATUL HASANA",                    mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 32, nisn: "0072620559", nama: "SHISILIA ISMU PUTRI",                  mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 33, nisn: "0072336597", nama: "SUCI RAMADANI INDRIANSYAH",            mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
  { id: 34, nisn: "0075802873", nama: "TALITHA NUDIA RISMATULLAH",            mata_pelajaran: "Basis Data", status: "Hadir",     tanggal: "27 Februari 2026", jam_pelajaran: "JP 1-2", keterangan: "-" },
];

// Info kelas
const infoKelas = {
  7: { nama_kelas: "XII RPL 1", wali_kelas: "RR. Henning Gratyanis Anggraeni, S.Pd" },
  8: { nama_kelas: "XII RPL 2", wali_kelas: "Triana Andriani, S.Pd" },
};

const dataSiswaByKelas = {
  7: dataSiswaRPL1,
  8: dataSiswaRPL2,
};

function KehadiranSiswaShow() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailSiswa, setDetailSiswa] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [kelas, setKelas] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState({
    hadir: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0, terlambat: 0, dispen: 0
  });

  const { id } = useParams();

  const hitungStatusCounts = (dataSiswa) => {
    const counts = { hadir: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0, terlambat: 0, dispen: 0 };
    dataSiswa.forEach(siswa => {
      const status = siswa.status.toLowerCase();
      if (counts[status] !== undefined) counts[status]++;
    });
    return counts;
  };

  useEffect(() => {
    const kelasId = parseInt(id);
    const kelasData = infoKelas[kelasId] || null;
    const siswaData = dataSiswaByKelas[kelasId] || [];

    setKelas(kelasData);
    setSiswaList(siswaData);
    setStatusCounts(hitungStatusCounts(siswaData));
    setLoading(false);
  }, [id]);

  const handleDetailClick = (siswa) => {
    setDetailSiswa(siswa);
    setShowDetailModal(true);
  };

  const handleEditClick = (siswa) => {
    setSelectedSiswa(siswa);
    setSelectedStatus(siswa.status);
    setShowEditModal(true);
  };

  const handleStatusUpdate = () => {
    const updatedList = siswaList.map(siswa =>
      siswa.id === selectedSiswa.id ? { ...siswa, status: selectedStatus } : siswa
    );
    setSiswaList(updatedList);
    setStatusCounts(hitungStatusCounts(updatedList));
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
        <div className="header-halaman-tampilan"></div>

        <div className="kartu-utama">
          <div className="header-kelas">
            <div className="bagian-judul-kelas">
              <div className="ikon-judul-kelas">
                <div className="ikon-header-kelas">
                  <FaDoorOpen />
                </div>
                <div>
                  <h2>{kelas?.nama_kelas || 'Kelas tidak ditemukan'}</h2>
                  <p className="wali-kelas-text">
                    Wali Kelas: {kelas?.wali_kelas || '-'}
                  </p>
                </div>
              </div>

              <div className="wrapper-bagian-dropdown">
                <div className="bagian-dropdown">
                  <select className="dropdown-kelas">
                    <option value="">Pilih Mata Pelajaran</option>
                    <option>Pemrograman Web</option>
                    <option>Basis Data</option>
                    <option>Matematika</option>
                    <option>Bahasa Indonesia</option>
                    <option>Bahasa Inggris</option>
                    <option>Jaringan Komputer</option>
                  </select>
                  <FaChevronDown className="ikon-dropdown" />
                </div>

                {/* Tombol Lihat Rekap - pakai id kelas */}
                <Link
                  to={`/waka/kehadiran-siswa/${id}/rekap`}
                  className="tombol-rekap-inline"
                >
                  <FaChartBar />
                  Lihat Rekap
                </Link>
              </div>
            </div>

            <div className="grid-statistik-status">
              <div className="kartu-stat stat-hadir">
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
              <div className="kartu-stat stat-alfa">
                <div className="info-stat">
                  <div className="jumlah-stat">{statusCounts.alfa}</div>
                  <div className="label-stat">Alfa</div>
                </div>
              </div>
              <div className="kartu-stat stat-pulang">
                <div className="info-stat">
                  <div className="jumlah-stat">{statusCounts.pulang}</div>
                  <div className="label-stat">Pulang</div>
                </div>
              </div>
              <div className="kartu-stat stat-dispen">
                <div className="info-stat">
                  <div className="jumlah-stat">{statusCounts.dispen}</div>
                  <div className="label-stat">Dispen</div>
                </div>
              </div>
            </div>
          </div>

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
                  {siswaList.length > 0 ? (
                    siswaList.map((siswa, index) => (
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="td-tengah">
                        Tidak ada data siswa untuk kelas ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
              <button className="tutup-modal" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="body-modal">
              <div className="info-siswa-modal">
                <div className="avatar-siswa"><FaUser /></div>
                <div className="detail-siswa">
                  <h4>{selectedSiswa?.nama}</h4>
                  <p>NISN: {selectedSiswa?.nisn}</p>
                </div>
              </div>
              <div className="grup-form-modal">
                <label className="label-form-modal">
                  <FaClipboardCheck /> Pilih Kehadiran
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
                    <option value="Alfa">Alfa</option>
                    <option value="Pulang">Pulang</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Dispen">Dispen</option>
                  </select>
                  <FaChevronDown className="ikon-select-modal" />
                </div>
              </div>
            </div>
            <div className="footer-modal">
              <button className="tombol-modal-batal" onClick={() => setShowEditModal(false)}>
                <FaTimes /> Batal
              </button>
              <button className="tombol-modal-simpan" onClick={handleStatusUpdate}>
                <FaSave /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetailModal && detailSiswa && (
        <div className="overlay-modal">
          <div className="modal-detail">
            <div className="modal-detail-header">
              <FaClipboardCheck />
              <h3>Detail Kehadiran</h3>
              <button onClick={() => setShowDetailModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-detail-body">
              <div className="detail-row">
                <span>Tanggal:</span>
                <strong>{detailSiswa.tanggal || '-'}</strong>
              </div>
              <div className="detail-row">
                <span>Jam Pelajaran:</span>
                <strong>{detailSiswa.jam_pelajaran || '-'}</strong>
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
                <strong>{detailSiswa.keterangan || '-'}</strong>
              </div>
              <div className="detail-foto">
                <p>Bukti Kehadiran</p>
                {detailSiswa.status === 'Hadir' ? (
                  <div className="bukti-hadir">
                    <FaClipboardCheck />
                    <span>Hadir & tercatat di sistem</span>
                  </div>
                ) : (
                  <div className="wrapper-foto">
                    <div className="foto-kosong">Tidak ada bukti</div>
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