import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

  const [jadwal, setJadwal] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const stored = localStorage.getItem('jadwal-guru');
  if (!stored) return;

  const data = JSON.parse(stored);
  const found = data.find(g => String(g.id) === String(id));

  if (found) {
    setJadwal(found);
  }
}, [id]);


  const handleDeleteImage = async () => {
  if (!window.confirm('Yakin ingin menghapus jadwal ini?')) return;

  setLoading(true);
  await new Promise(resolve => setTimeout(resolve, 500));

  const stored = localStorage.getItem('jadwal-guru');
  if (!stored) return;

  const data = JSON.parse(stored);

  const updated = data.map(guru =>
    String(guru.id) === String(id)
      ? { ...guru, gambar_jadwal: null }
      : guru
  );

  localStorage.setItem('jadwal-guru', JSON.stringify(updated));

  setJadwal(prev => ({
    ...prev,
    gambar_jadwal: null
  }));

  setLoading(false);
};

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && setShowFullscreen(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  if (!jadwal) {
    return (
      <div className="jadwal-guru-show-loading-screen">
      <FaSpinner />Loading...
      </div>
    );
  }

  return (
  <div className="jadwal-guru-show-root">
    <NavbarWaka />
    {/* ================= BREADCRUMB ================= */}
    <div className="jadwal-guru-show-breadcrumb">
      <Link to="/jadwal-guru" className="jadwal-guru-show-breadcrumb-link">
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
        {jadwal.gambar_jadwal ? (
          <>
            <div
              className="jadwal-guru-show-image-wrapper"
              onClick={() => setShowFullscreen(true)}
            >
              <img
                src={jadwal.gambar_jadwal}
                alt={`Jadwal ${jadwal.nama_guru}`}
              />
            </div>

            <div className="jadwal-guru-show-action">
              <button
                onClick={handleDeleteImage}
                disabled={loading}
                className="jadwal-guru-show-btn-delete"
              >
                <FaTrash />
                <span>Hapus Jadwal</span>
              </button>

              <a
                href={jadwal.gambar_jadwal}
                download
                className="jadwal-guru-show-btn-download"
              >
                <FaDownload />
                <span>Download</span>
              </a>
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
    {showFullscreen && (
      <div
        className="jadwal-guru-show-fullscreen"
        onClick={() => setShowFullscreen(false)}
      >
        <button className="jadwal-guru-show-fullscreen-close">
          <FaTimes />
        </button>
        <img
          src={jadwal.gambar_jadwal}
          alt="Jadwal Fullscreen"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )}
  </div>
  );
}

export default JadwalGuruShow;