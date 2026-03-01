import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './JadwalGuruShow.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import {
  FaArrowLeft,
  FaChalkboardTeacher,
  FaChevronRight,
  FaDownload,
  FaImage,
  FaSpinner,
  FaTimes,
  FaTrash
} from 'react-icons/fa';

function JadwalGuruShow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [jadwal, setJadwal] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchJadwalGuru();
  }, [id]);

  const fetchJadwalGuru = async () => {
    setLoading(true);
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/teachers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setJadwal({
          id: data.id,
          kode_guru: data.nip || '',
          nama_guru: data.name || data.user?.name || '',
          mata_pelajaran: data.subjects?.map(s => s.name).join(', ') || data.subject_name || '-',
          email: data.user?.email || data.email || '-',
          no_hp: data.phone || data.no_hp || '-',
          gambar_jadwal: data.schedule_image_url || null
        });
      } else {
        console.error('Gagal memuat data jadwal guru');
        navigate('/waka/jadwal-guru');
      }
    } catch (error) {
      console.error('Error fetching jadwal guru:', error);
      navigate('/waka/jadwal-guru');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Yakin ingin menghapus jadwal ini?')) return;

    setDeleteLoading(true);
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/teachers/${id}/schedule-image`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setJadwal(prev => ({ ...prev, gambar_jadwal: null }));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Gagal menghapus jadwal');
      }
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
      <div className="jadwal-guru-show-loading-screen">
        <FaSpinner />Loading...
      </div>
    );
  }

  if (!jadwal) {
    return (
      <div className="jadwal-guru-show-loading-screen">
        <p>Data tidak ditemukan</p>
        <Link to="/waka/jadwal-guru">Kembali</Link>
      </div>
    );
  }

  const imageUrl = jadwal.gambar_jadwal || null;

  return (
    <div className="jadwal-guru-show-root">
      <NavbarWaka />
      {/* ================= BREADCRUMB ================= */}
      <div className="jadwal-guru-show-breadcrumb">
        <Link to="/waka/jadwal-guru" className="jadwal-guru-show-breadcrumb-link">
          <FaChalkboardTeacher />
          <span>Jadwal Guru</span>
        </Link>
        <FaChevronRight />
        <span>{jadwal.nama_guru}</span>
      </div>

      {/* ================= HEADER CARD ================= */}
      <div className="jadwal-guru-show-header">

        {/* HEADER TOP */}
        <div className="jadwal-guru-show-header-top">
          <div className="jadwal-guru-show-header-left">
            <div className="jadwal-guru-show-icon">
              <FaChalkboardTeacher />
            </div>
            <div className="jadwal-guru-show-title">
              <h1>Jadwal Mengajar</h1>
              <p>{jadwal.nama_guru}</p>
            </div>
          </div>

          <div className="jadwal-guru-show-header-action">
            <Link
              to="/waka/jadwal-guru"
              className="jadwal-guru-show-btn-back"
            >
              <FaArrowLeft />
              <span>Kembali</span>
            </Link>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="jadwal-guru-show-header-info">
          <div className="jadwal-guru-show-info-box">
            <span>Kode Guru</span>
            <strong>{jadwal.kode_guru}</strong>
          </div>

          <div className="jadwal-guru-show-info-box">
            <span>Mata Pelajaran</span>
            <strong>{jadwal.mata_pelajaran}</strong>
          </div>

          <div className="jadwal-guru-show-info-box">
            <span>Email</span>
            <strong>{jadwal.email}</strong>
          </div>

          <div className="jadwal-guru-show-info-box">
            <span>No. HP</span>
            <strong>{jadwal.no_hp}</strong>
          </div>
        </div>
      </div>

      {/* ================= JADWAL CARD ================= */}
      <div className="jadwal-guru-show-card">

        <div className="jadwal-guru-show-card-header">
          <h2>
            <FaImage />
            Jadwal Mengajar Guru
          </h2>
          <p>Jadwal mengajar untuk guru ini</p>
        </div>

        <div className="jadwal-guru-show-card-body">
          {imageUrl ? (
            <>
              <div
                className="jadwal-guru-show-image-wrapper"
                onClick={() => setShowFullscreen(true)}
              >
                <img
                  src={imageUrl}
                  alt={`Jadwal ${jadwal.nama_guru}`}
                />
              </div>
            </>
          ) : (
            <div className="jadwal-guru-show-empty">
              <FaImage />
              <h3>Belum Ada Jadwal</h3>
              <p>Jadwal mengajar belum tersedia</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= FULLSCREEN ================= */}
      {showFullscreen && imageUrl && (
        <div
          className="jadwal-guru-show-fullscreen"
          onClick={() => setShowFullscreen(false)}
        >
          <button className="jadwal-guru-show-fullscreen-close">
            <FaTimes />
          </button>
          <img
            src={imageUrl}
            alt="Jadwal Fullscreen"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default JadwalGuruShow;