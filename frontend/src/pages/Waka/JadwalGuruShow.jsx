import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './JadwalGuruShow.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import apiService from '../../utils/api';
import {
  FaArrowLeft,
  FaChalkboardTeacher,
  FaChevronRight,
  FaImage,
  FaSpinner,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaBriefcase
} from 'react-icons/fa';

function JadwalGuruShow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [jadwal, setJadwal] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJadwalGuru();
  }, [id]);

  const fetchJadwalGuru = async () => {
    setLoading(true);
    try {
      const result = await apiService.get(`/teachers/${id}`);
      const data = result?.data || result;
      setJadwal(data);
      setImageLoadError(false);
    } catch (error) {
      console.error('Error fetching jadwal guru:', error);
      alert('Terjadi kesalahan saat memuat data');
      navigate('/waka/jadwal-guru');
    } finally {
      setLoading(false);
    }
  };

  // Fallback untuk jadwal, menggunakan image di storage
  

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && setShowFullscreen(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  if (loading) {
    return (
      <div className="jadwal-guru-show-loading-screen flex flex-col items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mb-2" />
        <p className="text-gray-500 font-medium">Memuat data...</p>
      </div>
    );
  }

  if (!jadwal) {
    return (
      <div className="jadwal-guru-show-loading-screen flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 font-medium mb-4">Data tidak ditemukan</p>
        <Link to="/waka/jadwal-guru" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
           Kembali
        </Link>
      </div>
    );
  }

  const imageUrl = !imageLoadError
    ? (jadwal.schedule_image_url
      || (jadwal.schedule_image_path
        ? (jadwal.schedule_image_path.startsWith('http')
          ? jadwal.schedule_image_path
          : `${window.location.protocol}//${window.location.hostname}:8000/storage/${jadwal.schedule_image_path}`)
        : null))
    : null;

  return (
    <div className="jadwal-guru-show-root">
      <NavbarWaka />
      
      {/* ================= BREADCRUMB ================= */}
      <div className="jadwal-guru-show-breadcrumb">
        <Link to="/waka/jadwal-guru" className="jadwal-guru-show-breadcrumb-link">
          <FaChalkboardTeacher />
          <span>Jadwal Guru</span>
        </Link>
        <FaChevronRight className="mx-2 text-gray-400" />
        <span>{jadwal.name || (jadwal.user?.name)}</span>
      </div>

      {/* ================= HEADER CARD ================= */}
      <div className="jadwal-guru-show-header bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        {/* HEADER TOP */}
        <div className="jadwal-guru-show-header-top flex justify-between items-center mb-6">
          <div className="jadwal-guru-show-header-left flex items-center gap-4">
            <div className="jadwal-guru-show-icon w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl">
              <FaChalkboardTeacher />
            </div>
            <div className="jadwal-guru-show-title">
              <h1 className="text-xl font-bold text-gray-900">Jadwal Mengajar</h1>
              <p className="text-gray-500">{jadwal.name || (jadwal.user?.name)}</p>
            </div>
          </div>

          <div className="jadwal-guru-show-header-action">
            <Link
              to="/waka/jadwal-guru"
              className="jadwal-guru-show-btn-back flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              <FaArrowLeft />
              <span>Kembali</span>
            </Link>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="jadwal-guru-show-header-info grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="jadwal-guru-show-info-box p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className="block text-xs text-gray-400 uppercase font-bold mb-1">Kode Guru</span>
            <strong className="text-gray-800">{jadwal.code || jadwal.nip || '-'}</strong>
          </div>

          <div className="jadwal-guru-show-info-box p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className="block text-xs text-gray-400 uppercase font-bold mb-1">Mata Pelajaran</span>
            <strong className="text-gray-800">{jadwal.subject || '-'}</strong>
          </div>

          <div className="jadwal-guru-show-info-box p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className="block text-xs text-gray-400 uppercase font-bold mb-1">Email</span>
            <strong className="text-gray-800">{jadwal.email || (jadwal.user?.email) || '-'}</strong>
          </div>

          <div className="jadwal-guru-show-info-box p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className="block text-xs text-gray-400 uppercase font-bold mb-1">No. HP</span>
            <strong className="text-gray-800">{jadwal.phone || (jadwal.user?.phone) || '-'}</strong>
          </div>
        </div>
      </div>

      {/* ================= JADWAL CARD ================= */}
      <div className="jadwal-guru-show-card bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="jadwal-guru-show-card-header mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaImage className="text-blue-500" />
            Jadwal Mengajar Guru
          </h2>
          <p className="text-gray-500 text-sm">Jadwal mengajar untuk guru ini dalam format gambar</p>
        </div>

        <div className="jadwal-guru-show-card-body">
          {imageUrl ? (
            <div
              className="jadwal-guru-show-image-wrapper cursor-pointer overflow-hidden rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
              onClick={() => setShowFullscreen(true)}
            >
              <img
                src={imageUrl}
                alt={`Jadwal ${jadwal.name}`}
                className="w-full h-auto object-contain max-h-[600px]"
                onError={() => setImageLoadError(true)}
              />
            </div>
          ) : (
            <div className="jadwal-guru-show-empty flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <FaImage className="text-5xl text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">Belum Ada Jadwal</h3>
              <p className="text-gray-500">Jadwal mengajar dalam bentuk gambar belum diunggah</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= FULLSCREEN ================= */}
      {showFullscreen && imageUrl && (
        <div
          className="jadwal-guru-show-fullscreen fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <button className="jadwal-guru-show-fullscreen-close absolute top-6 right-6 text-white text-3xl hover:text-red-500 transition">
            <FaTimes />
          </button>
          <img
            src={imageUrl}
            alt="Jadwal Fullscreen"
            className="max-w-full max-h-full object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default JadwalGuruShow;
