import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './KehadiranSiswaShow.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { FaArrowLeft, FaChevronDown, FaClipboardCheck, FaDoorOpen, FaEdit, FaSave, FaSpinner, FaTimes, FaUser, FaEye, } from 'react-icons/fa';
import { FaChartBar } from 'react-icons/fa6';
import { wakaService } from '../../services/waka';

function KehadiranSiswaShow() {
  const { id } = useParams();
  const [kelas, setKelas] = useState({ nama_kelas: 'Loading...', wali_kelas: 'Loading...' });
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailSiswa, setDetailSiswa] = useState(null);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [statusCounts, setStatusCounts] = useState({
    hadir: 0, izin: 0, sakit: 0, alpha: 0, pulang: 0, terlambat: 0
  });

  const hitungStatusCounts = (list) => {
    const counts = { hadir: 0, izin: 0, sakit: 0, alpha: 0, pulang: 0, terlambat: 0 };
    list.forEach(item => {
      const s = item.status.toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
        const data = await wakaService.getClassAttendanceDate(id, selectedDate);
        
        // Data class
        setKelas({
            nama_kelas: data.class.name || `${data.class.grade} ${data.class.major?.name || ''} ${data.class.label || ''}`,
            wali_kelas: data.class.homeroom_teacher?.user?.name || '-'
        });

        // Flatten data: Schedules -> Attendances
        let allList = [];
        if (data.items) {
             data.items.forEach(scheduleItem => {
                const subjectName = scheduleItem.schedule.subject?.name || scheduleItem.schedule.title || 'Mapel Lain';
                scheduleItem.attendances.forEach(att => {
                    allList.push({
                        id: att.id,
                        nisn: att.student?.nisn || '-',
                        nama: att.student?.user?.name || 'Siswa',
                        mata_pelajaran: subjectName,
                        status: att.status.charAt(0).toUpperCase() + att.status.slice(1),
                        student_id: att.student_id,
                        original: { ...att, schedule_id: scheduleItem.schedule.id }
                    });
                });
             });
        }
        setSiswaList(allList);
        setStatusCounts(hitungStatusCounts(allList));

    } catch (error) {
        console.error("Failed to fetch class attendance:", error);
        // Fallback or empty state
        setSiswaList([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, selectedDate]);

  const handleEditClick = (siswa) => {
    setSelectedSiswa(siswa);
    setSelectedStatus(siswa.status);
    setShowEditModal(true);
  };

  const handleDetailClick = (siswa) => {
    setDetailSiswa(siswa);
    setShowDetailModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedSiswa || !selectedStatus) return;

    try {
        const payload = {
            attendee_type: 'student',
            student_id: selectedSiswa.student_id,
            schedule_id: selectedSiswa.original.schedule_id, // Ensure this exists in flatten logic
            status: selectedStatus.toLowerCase(),
            date: selectedDate,
            reason: 'Diubah oleh Waka Kurikulum' // Or add a reason field in modal
        };
        await wakaService.updateAttendance(payload);
        
        setShowEditModal(false);
        fetchData(); // Refresh data
    } catch (error) {
        console.error("Failed to update status:", error);
        alert("Gagal mengubah status kehadiran");
    }
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
                  to={`/waka/kehadiran-siswa/${id}/rekap`}
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
                <strong>{selectedDate}</strong>
              </div>

              <div className="detail-row">
                <span>Jam Pelajaran:</span>
                <strong>-</strong>
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
                    {detailSiswa.original?.reason || 'Tidak ada keterangan'}
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