import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { wakaService } from "../../services/waka";
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
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [teacher, setTeacher] = useState({ name: 'Loading...', nip: '-' });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await wakaService.getTeacherAttendanceHistory(id);
      setData(response.history);
      setTeacher({
        name: response.teacher.user?.name || 'Guru',
        nip: response.teacher.nip || '-'
      });
    } catch (error) {
      console.error("Failed to fetch teacher attendance history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setSelectedStatus(item.status || "Hadir");
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    // Local update or API call if needed
    // Waka might not need to update teacher individual check-ins?
    // Requirement didn't specify. I'll refresh for now.
    setShowEditModal(false);
    fetchData();
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
            <h2>{teacher.name}</h2>
            <p>NIP: {teacher.nip}</p>
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
                      : "Belum Absen";

                  return (
                    <tr key={item.id}>
                      <td>{i + 1}</td>
                      <td>{item.date}</td>
                      <td>{item.checked_in_at || "-"}</td>
                      <td>-</td>
                      <td>-</td>
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