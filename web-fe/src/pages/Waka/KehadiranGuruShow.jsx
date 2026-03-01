import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
  FaSpinner,
} from "react-icons/fa";

function KehadiranGuruShow() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [guruData, setGuruData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    // TODO: Ganti dengan API call untuk fetch data guru berdasarkan ID
    // Contoh:
    // fetchKehadiranGuru(id).then(data => {
    //   setGuruData(data);
    //   setLoading(false);
    // }).catch(error => {
    //   console.error('Error fetching data:', error);
    //   setLoading(false);
    // });
    
    setLoading(false);
  }, [id]);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setSelectedStatus(item.status || "Tidak Ada Jam Mengajar");
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    // TODO: Ganti dengan API call untuk update status kehadiran
    // Contoh:
    // updateKehadiranGuru(guruData.guru.id, selectedItem, selectedStatus)
    //   .then(response => {
    //     // Update local state setelah berhasil
    //     const updatedJam = [...guruData.jam];
    //     updatedJam[selectedItem] = selectedStatus;
    //     setGuruData({
    //       ...guruData,
    //       jam: updatedJam,
    //     });
    //     setShowEditModal(false);
    //   })
    //   .catch(error => {
    //     console.error('Error updating status:', error);
    //   });

    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="kontainer-loading">
        <div className="teks-loading">
          <FaSpinner className="spinner" /> Loading...
        </div>
      </div>
    );
  }

  if (!guruData) {
    return (
      <div className="kehadiran-guru-show">
        <NavbarWaka />
        <div className="kehadiran-guru-show-container">
          <p>Data guru tidak ditemukan</p>
          <Link to="/waka/kehadiran-guru" className="kehadiran-guru-show-back">
            <FaArrowLeft /> Kembali
          </Link>
        </div>
      </div>
    );
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
            <h2>{guruData?.guru?.nama}</h2>
            <p>Kode Guru: {guruData?.guru?.kode_guru}</p>
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
                  <th>Kelas</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {guruData?.jam?.map((status, i) => {
                  const displayStatus =
                    status && status !== ""
                      ? status
                      : "Tidak Ada Jam Mengajar";

                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{guruData?.guru?.kelas}</td>
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
                          onClick={() => {
                            setSelectedItem(i);
                            setSelectedStatus(displayStatus);
                            setShowEditModal(true);
                          }}
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
                    <option value="Alfa">Alfa</option>
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