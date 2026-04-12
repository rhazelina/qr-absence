import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './JadwalSiswaShow.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import {
  FaUserGraduate,
  FaCalendarAlt,
  FaArrowLeft,
  FaImage,
  FaTimes,
  FaTrash,
  FaDownload,
  FaSpinner,
  FaChevronRight
} from 'react-icons/fa';
import api from '../../utils/api';

function JadwalSiswaShow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [jadwal, setJadwal] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchJadwalSiswa();
  }, [id]);

  const fetchJadwalSiswa = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/classes/${id}`);
      setJadwal({
        ...data,
        kompetensi_keahlian: data?.major || data?.major_name || '-',
        wali_kelas: data?.homeroom_teacher_name || '-',
        kelas: data?.class_name || data?.name || '-',
        gambar_jadwal: data?.schedule_image_url || null,
      });
    } catch (error) {
      console.error('Error fetching jadwal siswa:', error);
      alert('Terjadi kesalahan saat memuat data');
      navigate('/waka/jadwal-siswa');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Yakin ingin menghapus jadwal ini?')) return;

    setDeleteLoading(true);
    try {
      await api.del(`/classes/${id}/schedule-image`);
      alert('Jadwal berhasil dihapus');
      setJadwal(prev => ({
        ...prev,
        gambar_jadwal: null
      }));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Terjadi kesalahan saat menghapus jadwal');
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && setShowFullscreen(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  if (loading) {
    return (
      <div className="jadwal-siswa-show-loading-screen">
        <FaSpinner /> Loading...
      </div>
    );
  }

  if (!jadwal) {
    return (
      <div className="jadwal-siswa-show-loading-screen">
        <p>Data tidak ditemukan</p>
        <Link to="/waka/jadwal-siswa">Kembali</Link>
      </div>
    );
  }

  const imageUrl = jadwal.gambar_jadwal || null;

  return (
    <>
      {/* NAVBAR HARUS DI LUAR */}
      <NavbarWaka />

      <div className="jadwal-siswa-show-root">
        <div className="jadwal-siswa-show-container">

          {/* BREADCRUMB */}
          <div className="jadwal-siswa-show-breadcrumb">
            <Link to="/waka/jadwal-siswa" className="jadwal-siswa-show-breadcrumb-link">
              <FaCalendarAlt />
              <span>Jadwal Siswa</span>
            </Link>
            <FaChevronRight />
            <span>{jadwal.kelas}</span>
          </div>

          {/* HEADER */}
          <div className="jadwal-siswa-show-header">
            <div className="jadwal-siswa-show-header-top">
              <div className="jadwal-siswa-show-header-left">
                <div className="jadwal-siswa-show-icon">
                  <FaUserGraduate />
                </div>
                <div className="jadwal-siswa-show-title">
                  <h1>Jadwal Siswa</h1>
                  <p>{jadwal.kompetensi_keahlian}</p>
                </div>
              </div>

              <Link to="/waka/jadwal-siswa" className="jadwal-siswa-show-btn-back">
                <FaArrowLeft />
                <span>Kembali</span>
              </Link>
            </div>

            <div className="jadwal-siswa-show-header-info">
              <div className="jadwal-siswa-show-info-box">
                <span>Wali Kelas</span>
                <strong>{jadwal.wali_kelas}</strong>
              </div>
              <div className="jadwal-siswa-show-info-box">
                <span>Kelas</span>
                <strong>{jadwal.kelas}</strong>
              </div>
            </div>
          </div>

          {/* CARD */}
          <div className="jadwal-siswa-show-card">
            <div className="jadwal-siswa-show-card-header">
              <h2><FaImage /> Jadwal Pembelajaran</h2>
              <p>Jadwal pembelajaran siswa</p>
            </div>

            <div className="jadwal-siswa-show-card-body">
              {imageUrl ? (
                <>
                  <div
                    className="jadwal-siswa-show-image-wrapper"
                    onClick={() => setShowFullscreen(true)}
                  >
                    <img src={imageUrl} alt="Jadwal" />
                  </div>

                  <div className="jadwal-siswa-show-action">
                    <button
                      onClick={handleDeleteImage}
                      disabled={deleteLoading}
                      className="jadwal-siswa-show-btn-delete"
                    >
                      <FaTrash /> {deleteLoading ? 'Menghapus...' : 'Hapus'}
                    </button>

                    <a
                      href={imageUrl}
                      download
                      className="jadwal-siswa-show-btn-download"
                    >
                      <FaDownload /> Download
                    </a>
                  </div>
                </>
              ) : (
                <div className="jadwal-siswa-show-empty">
                  <FaImage />
                  <h3>Belum Ada Jadwal</h3>
                  <p>Jadwal siswa belum tersedia</p>
                </div>
              )}
            </div>
          </div>

          {/* FULLSCREEN */}
          {showFullscreen && imageUrl && (
            <div
              className="jadwal-siswa-show-fullscreen"
              onClick={() => setShowFullscreen(false)}
            >
              <button className="jadwal-siswa-show-fullscreen-close">
                <FaTimes />
              </button>
              <img
                src={imageUrl}
                alt="Fullscreen"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default JadwalSiswaShow;
