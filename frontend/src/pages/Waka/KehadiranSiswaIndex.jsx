import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./KehadiranSiswaIndex.css";
import NavbarWaka from "../../components/Waka/NavbarWaka";
import apiService from "../../utils/api";
import {
  FaBriefcase,
  FaChevronDown,
  FaDoorOpen,
  FaEye,
  FaInbox,
  FaLayerGroup,
  FaSearch,
  FaSpinner,
  FaTable,
  FaUserTie,
} from "react-icons/fa";

const gradeToRoman = (grade) => {
  const map = {
    "10": "X",
    "11": "XI",
    "12": "XII",
    X: "X",
    XI: "XI",
    XII: "XII",
  };
  const normalized = String(grade ?? "").toUpperCase().trim();
  return map[normalized] || normalized || "-";
};

function KehadiranSiswaIndex() {
  const navigate = useNavigate();
  const [kelasList, setKelasList] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterJurusan, setFilterJurusan] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [classesData, majorsData] = await Promise.all([
          apiService.getClasses(),
          apiService.getMajors(),
        ]);

        setKelasList(classesData?.data || classesData || []);
        setMajors(majorsData?.data || majorsData || []);
      } catch (error) {
        console.error("Error fetching class attendance list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const majorMap = useMemo(
    () =>
      new Map(
        majors.map((major) => [Number(major.id), major.name || major.code || "-"])
      ),
    [majors]
  );

  const kelasOptions = useMemo(() => {
    const uniques = new Set(kelasList.map((kelas) => gradeToRoman(kelas.grade)));
    const ordered = ["X", "XI", "XII"];
    return ordered.filter((grade) => uniques.has(grade));
  }, [kelasList]);

  const jurusanOptions = useMemo(() => {
    return majors.map((major) => ({
      id: String(major.id),
      label: major.name || major.code || "-",
    }));
  }, [majors]);

  const getClassName = (kelas) =>
    kelas.class_name ||
    kelas.name ||
    [gradeToRoman(kelas.grade), kelas.label].filter(Boolean).join(" ") ||
    "-";

  const getMajorName = (kelas) =>
    kelas.major_name ||
    majorMap.get(Number(kelas.major_id)) ||
    kelas.major ||
    "-";

  const getHomeroomName = (kelas) =>
    kelas.homeroom_teacher_name || kelas.homeroom_teacher?.user?.name || "-";

  const filteredKelasList = kelasList.filter((kelas) => {
    const majorName = getMajorName(kelas).toLowerCase();
    const className = getClassName(kelas).toLowerCase();
    const homeroomName = getHomeroomName(kelas).toLowerCase();
    const gradeRoman = gradeToRoman(kelas.grade);

    const matchesJurusan = filterJurusan
      ? String(kelas.major_id) === filterJurusan
      : true;
    const matchesKelas = filterKelas ? gradeRoman === filterKelas : true;
    const matchesSearch = searchQuery
      ? className.includes(searchQuery.toLowerCase()) ||
        homeroomName.includes(searchQuery.toLowerCase()) ||
        majorName.includes(searchQuery.toLowerCase())
      : true;

    return matchesJurusan && matchesKelas && matchesSearch;
  });

  const handleViewKehadiran = (event, classId) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/waka/kehadiran-siswa/${classId}`);
  };

  if (loading) {
    return (
      <>
        <NavbarWaka />
        <div className="wadah-muat">
          <div className="konten-muat">
            <FaSpinner />
            <span>Memuat data kelas...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavbarWaka />
      <div className="wadah-kehadiran">
        <div className="kepala-halaman">
          <h1 className="judul-halaman">Kehadiran Siswa</h1>
          <p className="deskripsi-halaman">
            Kelola dan monitor kehadiran siswa per kelas
          </p>
        </div>

        <div className="kartu-filter">
          <div className="susunan-filter">
            <div className="kelompok-filter">
              <label className="label-filter">
                <FaSearch /> Pencarian
              </label>
              <div className="pembungkus-pilih">
                <input
                  type="text"
                  className="pilih-filter"
                  placeholder="Cari kelas, jurusan, atau wali kelas..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            </div>

            <div className="kelompok-filter">
              <label className="label-filter">
                <FaBriefcase /> Jurusan
              </label>
              <div className="pembungkus-pilih">
                <select
                  name="jurusan"
                  value={filterJurusan}
                  onChange={(event) => setFilterJurusan(event.target.value)}
                  className="pilih-filter"
                >
                  <option value="">Semua Jurusan</option>
                  {jurusanOptions.map((major) => (
                    <option key={major.id} value={major.id}>
                      {major.label}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="ikon-pilih" />
              </div>
            </div>

            <div className="kelompok-filter">
              <label className="label-filter">
                <FaLayerGroup /> Tingkatan
              </label>
              <div className="pembungkus-pilih">
                <select
                  name="kelas"
                  value={filterKelas}
                  onChange={(event) => setFilterKelas(event.target.value)}
                  className="pilih-filter"
                >
                  <option value="">Semua Tingkatan</option>
                  {kelasOptions.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="ikon-pilih" />
              </div>
            </div>
          </div>
        </div>

        <div className="kartu-tabel">
          <div className="kepala-tabel">
            <div className="isi-kepala">
              <FaTable />
              <h2>Daftar Kelas ({filteredKelasList.length})</h2>
            </div>
          </div>

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
                        <span className="lencana-angka">{index + 1}</span>
                      </td>
                      <td className="td-kelas">
                        <div className="info-kelas">
                          <span className="nama-kelas">{getClassName(item)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="lencana-jurusan">{getMajorName(item)}</span>
                      </td>
                      <td>
                        <div className="info-wali">
                          <div className="avatar-wali">
                            <FaUserTie />
                          </div>
                          <span className="nama-wali">{getHomeroomName(item)}</span>
                        </div>
                      </td>
                      <td className="td-tengah">
                        <button
                          onClick={(event) => handleViewKehadiran(event, item.id)}
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
                          <p className="keterangan-kosong">
                            Silakan coba filter yang berbeda
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="info-kaki">
          <small>Total kelas ditampilkan: {filteredKelasList.length}</small>
        </div>
      </div>
    </>
  );
}

export default KehadiranSiswaIndex;
