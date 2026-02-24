import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './JadwalGuruEdit.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaSave, 
  FaSpinner, 
  FaImage
} from 'react-icons/fa';

import apiService from '../../utils/api';

function JadwalGuruEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    kode_guru: '',
    nama_guru: '',
    mata_pelajaran: '',
    email: '',
    no_hp: '',
  });

  const [scheduleImage, setScheduleImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchJadwalGuru();
  }, [id]);

  const fetchJadwalGuru = async () => {
    try {
      setInitialLoading(true);
      const result = await apiService.get(`/teachers/${id}`);
      const data = result?.data || result;
      
      setFormData({
        kode_guru: data.kode_guru || '',
        nama_guru: data.name || data.user?.name || '',
        mata_pelajaran: data.subject || '',
        email: data.email || data.user?.email || '',
        no_hp: data.phone || data.user?.phone || '',
      });

      if (data.schedule_image_url || data.schedule_image_path) {
        setPreviewImage(data.schedule_image_url);
      }
    } catch (error) {
      console.error('Error fetching jadwal guru:', error);
      alert('Gagal memuat data guru');
      navigate('/waka/jadwal-guru');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScheduleImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update Profile Data
      await apiService.put(`/teachers/${id}`, {
        name: formData.nama_guru,
        subject: formData.mata_pelajaran,
        email: formData.email,
        phone: formData.no_hp
      });

      // 2. Upload Schedule Image (Optional)
      if (scheduleImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', scheduleImage);
        await apiService.post(`/teachers/${id}/schedule-image`, imageFormData);
      }

      alert('Jadwal guru berhasil diperbarui');
      navigate('/waka/jadwal-guru');
    } catch (error) {
      console.error('Error updating jadwal guru:', error);
      alert('Gagal memperbarui jadwal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
        <p className="text-gray-500 font-bold">Memuat data profil guru...</p>
      </div>
    );
  }

  return (
    <div className="jadwal-guru-edit-root min-h-screen bg-gray-50 pb-20">
      <NavbarWaka />

      <div className="jadwal-guru-edit-container">
        <div className="jadwal-guru-edit-header">
           <div>
              <h1 className="jadwal-guru-edit-title">
                 <FaEdit className="inline mr-2 text-blue-600" /> Ubah Jadwal Guru
              </h1>
              <p className="jadwal-guru-edit-subtitle">Kelola informasi profil dan visual jadwal mengajar</p>
           </div>

           <Link
              to="/waka/jadwal-guru"
              className="jadwal-guru-edit-back"
            >
              <FaArrowLeft /> Kembali
           </Link>
        </div>

        <div className="jadwal-guru-edit-card overflow-hidden">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="jadwal-guru-edit-group">
                    <label>Kode Guru</label>
                    <input
                      type="text"
                      name="kode_guru"
                      value={formData.kode_guru}
                      onChange={handleInputChange}
                      className="bg-gray-50"
                      disabled
                    />
                  </div>

                  <div className="jadwal-guru-edit-group">
                    <label>Nama Lengkap</label>
                    <input
                      type="text"
                      name="nama_guru"
                      value={formData.nama_guru}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="jadwal-guru-edit-group">
                    <label>Mata Pelajaran Utama</label>
                    <input
                      type="text"
                      name="mata_pelajaran"
                      value={formData.mata_pelajaran}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="jadwal-guru-edit-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="jadwal-guru-edit-group">
                    <label>No. HP (WhatsApp)</label>
                    <input
                      type="text"
                      name="no_hp"
                      value={formData.no_hp}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="jadwal-guru-edit-upload mb-8">
                   <label htmlFor="gambar_jadwal" className="cursor-pointer block">
                      {previewImage ? (
                        <div className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                           <img src={previewImage} alt="Jadwal Visual" className="w-full h-auto object-cover max-h-[400px]" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <span className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm">Ganti Gambar</span>
                           </div>
                        </div>
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                           <FaImage className="text-4xl text-gray-300 mb-2" />
                           <span className="font-bold text-gray-500">Klik untuk upload jadwal</span>
                        </div>
                      )}
                   </label>
                   <input 
                      type="file" 
                      id="gambar_jadwal" 
                      className="hidden" 
                      onChange={handleFileChange} 
                      accept="image/*" 
                    />
                </div>

                <div className="jadwal-guru-edit-actions">
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="bg-blue-600 hover:bg-blue-700 transition-all"
                    >
                       {loading ? <FaSpinner className="animate-spin inline mr-2" /> : <FaSave className="inline mr-2" />}
                       Simpan Perubahan
                    </button>
                    <Link 
                      to="/waka/jadwal-guru"
                      className="jadwal-guru-edit-cancel hover:bg-gray-200 transition-all"
                    >
                       Batalkan
                    </Link>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}

export default JadwalGuruEdit;
