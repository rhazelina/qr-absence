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
  FaTimes
} from 'react-icons/fa';

function JadwalGuruShow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [jadwal, setJadwal] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
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
    } catch (error) {
      console.error('Error fetching jadwal guru:', error);
      alert('Terjadi kesalahan saat memuat data');
      navigate('/waka/jadwal-guru');
    } finally {
      setLoading(false);
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
        <FaSpinner className="animate-spin mr-2" /> Memuat data...
      </div>
    );
  }

  if (!jadwal) {
    return (
      <div className="jadwal-guru-show-loading-screen flex-col">
        <p className="mb-4">Data tidak ditemukan</p>
        <Link to="/waka/jadwal-guru" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Kembali</Link>
      </div>
    );
  }

  const imageUrl = jadwal.schedule_image_url || null;

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
        <span>{jadwal.nama_guru || jadwal.name}</span>
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
              <p>{jadwal.nama_guru || jadwal.name}</p>
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
            <span>Kode Guru / NIP</span>
            <strong>{jadwal.kode_guru || jadwal.code || jadwal.nip || '-'}</strong>
          </div>

          <div className="jadwal-guru-show-info-box">
            <span>Peran</span>
            <div className="flex gap-1 flex-wrap mt-1">
              {(Array.isArray(jadwal.jabatan) ? jadwal.jabatan : (jadwal.role ? jadwal.role.split(' | ') : ['Guru'])).map((role, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                  style={{
                    backgroundColor: role === 'Wali Kelas' ? '#DBEAFE' : role === 'Guru' ? '#DCFCE7' : role === 'Waka' ? '#F3E8FF' : '#FEF3C7',
                    color: role === 'Wali Kelas' ? '#1E40AF' : role === 'Guru' ? '#166534' : role === 'Waka' ? '#6B21A8' : '#92400E',
                  }}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className="jadwal-guru-show-info-box">
            <span>Mata Pelajaran</span>
            <strong>
              {Array.isArray(jadwal.subject) 
                ? jadwal.subject.join(', ') 
                : (jadwal.subject || jadwal.subject_name || '-')}
            </strong>
          </div>

          {/* Role-specific Info */}
          {(Array.isArray(jadwal.jabatan) ? jadwal.jabatan : []).includes('Wali Kelas') && jadwal.homeroom_class && (
            <div className="jadwal-guru-show-info-box">
              <span>Wali Kelas Dari</span>
              <strong>{jadwal.homeroom_class.name || '-'}</strong>
            </div>
          )}

          {(Array.isArray(jadwal.jabatan) ? jadwal.jabatan : []).includes('Kapro') && jadwal.konsentrasi_keahlian && (
            <div className="jadwal-guru-show-info-box">
              <span>Kapro Program</span>
              <strong>{jadwal.konsentrasi_keahlian}</strong>
            </div>
          )}

          {(Array.isArray(jadwal.jabatan) ? jadwal.jabatan : []).includes('Waka') && (jadwal.waka_field || jadwal.bidang) && (
            <div className="jadwal-guru-show-info-box">
              <span>Bidang Waka</span>
              <strong>{jadwal.waka_field || jadwal.bidang}</strong>
            </div>
          )}

          <div className="jadwal-guru-show-info-box">
            <span>Email / No. HP</span>
            <div className="flex flex-col">
               <strong className="text-xs">{jadwal.email || '-'}</strong>
               <strong className="text-xs">{jadwal.phone || '-'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ================= JADWAL CARD ================= */}
      <div className="jadwal-guru-show-card">
        <div className="jadwal-guru-show-card-header">
          <h2>
            <FaImage className="text-blue-500 mr-2" />
            Jadwal Mengajar Guru
          </h2>
          <p>Jadwal mengajar untuk guru ini dalam format gambar</p>
        </div>

        <div className="jadwal-guru-show-card-body">
          {imageUrl ? (
            <div
              className="jadwal-guru-show-image-wrapper"
              onClick={() => setShowFullscreen(true)}
            >
              <img
                src={imageUrl}
                alt={`Jadwal ${jadwal.nama_guru || jadwal.name}`}
              />
            </div>
          ) : (
            <div className="jadwal-guru-show-empty flex flex-col items-center justify-center py-12">
              <FaImage className="text-5xl text-gray-300 mb-4" />
              <h3>Belum Ada Jadwal</h3>
              <p>Jadwal mengajar dalam bentuk gambar belum diunggah</p>
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
