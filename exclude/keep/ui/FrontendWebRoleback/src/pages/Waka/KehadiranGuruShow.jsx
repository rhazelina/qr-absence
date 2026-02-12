import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./KehadiranGuruShow.css";
import NavbarWaka from "../../components/Waka/NavbarWaka";
import {
  FaArrowLeft,
  FaEdit,
  FaSave,
  FaTimes,
  FaUser,
  FaClipboardCheck,
  FaChevronDown,
} from "react-icons/fa";

function KehadiranGuruShow() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  // Ambil data dari sessionStorage
  useEffect(() => {
    setTimeout(() => {
      const saved = sessionStorage.getItem("kehadiran-guru");
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        const mock = [
          {
            id: 1,
            tanggal: "12-01-2026",
            jam: "07.00 - 08.30",
            mapel: "Matematika",
            kelas: "X RPL 1",
            status: "Hadir",
          },
          {
            id: 2,
            tanggal: "13-01-2026",
            jam: "09.00 - 10.30",
            mapel: "Bahasa Indonesia",
            kelas: "XI RPL 2",
            status: "",
          },
        ];
        sessionStorage.setItem("kehadiran-guru", JSON.stringify(mock));
        setData(mock);
      }
      setLoading(false);
    }, 400);
  }, []);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setSelectedStatus(item.status || "Tidak Ada Jam Mengajar");
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    const updated = data.map((item) =>
      item.id === selectedItem.id
        ? { ...item, status: selectedStatus }
        : item
    );
    setData(updated);
    sessionStorage.setItem("kehadiran-guru", JSON.stringify(updated));
    setShowEditModal(false);
  };

  if (loading) {
    return <div className="kehadiran-guru-show-loading">Loading...</div>;
  }

  return (
    <div className="kehadiran-guru-show">
      <NavbarWaka />

      <div className="kehadiran-guru-show-container">
        {/* HEADER */}
        <div className="kehadiran-guru-show-header">
          <div className="avatar-header">
            <FaUser />
          </div>
          <div className="info-header">
            <h2>Budi Santoso, S.Pd</h2>
            <p>Kode Guru: GR001</p>
          </div>
        </div>

        <div className="kehadiran-guru-show-table-container">
          <div className="kehadiran-guru-show-table-header">
            <div className="kehadiran-guru-show-table-header-inner">
              <h3 className="kehadiran-guru-show-table-title">
                Daftar Kehadiran Guru
              </h3>
            </div>
          </div>

          <div className="kehadiran-guru-show-table-wrapper">
            <table className="kehadiran-guru-show-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tanggal</th>
                  <th>Jam Pelajaran</th>
                  <th>Mata Pelajaran</th>
                  <th>Kelas</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => {
                  const displayStatus =
                    item.status && item.status !== ""
                      ? item.status
                      : "Tidak Ada Jam Mengajar";

                  return (
                    <tr key={item.id}>
                      <td>{i + 1}</td>
                      <td>{item.tanggal}</td>
                      <td>{item.jam}</td>
                      <td>{item.mapel}</td>
                      <td>{item.kelas}</td>
                      <td>
                        <span
                          className={`kehadiran-guru-show-badge status-${displayStatus
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          className="kehadiran-guru-show-edit"
                          onClick={() => handleEditClick(item)}
                        >
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Link to="/waka/kehadiran-guru" className="kehadiran-guru-show-back">
          <FaArrowLeft /> Kembali
        </Link>
      </div>

      {/* MODAL EDIT */}
      {showEditModal && (
        <div className="overlay-modal">
          <div className="konten-modal">
            <div className="header-modal">
              <h3>Ubah Kehadiran</h3>
              <button
                className="tutup-modal"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="body-modal">
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
                    <option value="Terlambat">Terlambat</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpha">Alpha</option>
                    <option value="Pulang">Pulang</option>
                    <option value="Tidak Ada Jam Mengajar">Tidak Ada Jam Mengajar</option>
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
                <FaTimes /> Batal
              </button>
              <button className="tombol-modal-simpan" onClick={handleUpdate}>
                <FaSave /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KehadiranGuruShow;