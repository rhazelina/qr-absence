import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './JadwalGuruEdit.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaChevronRight, 
  FaChalkboardTeacher, 
  FaSave, 
  FaSpinner, 
  FaHome, 
  FaImage, 
  FaCheckCircle,
  FaEnvelope,
  FaPhone,
  FaIdBadge,
  FaPlus
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
        nama_guru: data.user?.name || '',
        mata_pelajaran: data.subject || '',
        email: data.user?.email || '',
        no_hp: data.phone || '',
      });

      if (data.schedule_image_url || data.schedule_image_path) {
        const imageUrl = data.schedule_image_url || (
          data.schedule_image_path.startsWith('http')
            ? data.schedule_image_path
            : `${window.location.protocol}//${window.location.hostname}:8000/storage/${data.schedule_image_path}`
        );
        setPreviewImage(imageUrl);
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
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
            <Link to="/waka/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-2">
                <FaHome className="text-xs" />
                Dashboard
            </Link>
            <FaChevronRight className="text-[10px]" />
            <Link to="/waka/jadwal-guru" className="hover:text-blue-600 transition-colors">
                Jadwal Guru
            </Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-blue-600 font-bold">Ubah Profil & Jadwal</span>
        </div>

        {/* HEADER */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="p-5 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-200">
                    <FaChalkboardTeacher className="text-4xl" />
                 </div>
                 <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                       Ubah Jadwal Guru
                    </h1>
                    <p className="text-gray-500 font-bold mt-1">Kelola informasi profil dan visual jadwal mengajar</p>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <Link
                    to="/waka/jadwal-guru"
                    className="px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 flex items-center gap-3 hover:border-blue-600 transition-all shadow-sm"
                  >
                    <FaArrowLeft className="text-blue-600" />
                    <span>Kembali</span>
                 </Link>
              </div>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* INFORMATION CARD */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                     <FaIdBadge className="text-blue-600" /> Profil Pengajar
                  </h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600 uppercase tracking-widest pl-1">Kode Guru</label>
                    <input
                      type="text"
                      name="kode_guru"
                      value={formData.kode_guru}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-blue-600 transition-all outline-none"
                      disabled
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600 uppercase tracking-widest pl-1">Nama Lengkap</label>
                    <input
                      type="text"
                      name="nama_guru"
                      value={formData.nama_guru}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-blue-600 transition-all outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600 uppercase tracking-widest pl-1">Mata Pelajaran Utama</label>
                    <input
                      type="text"
                      name="mata_pelajaran"
                      value={formData.mata_pelajaran}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-blue-600 transition-all outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600 uppercase tracking-widest pl-1">Email</label>
                    <div className="relative">
                       <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-blue-600 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600 uppercase tracking-widest pl-1">No. HP (WhatsApp)</label>
                    <div className="relative">
                       <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input
                        type="text"
                        name="no_hp"
                        value={formData.no_hp}
                        onChange={handleInputChange}
                        className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-blue-600 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
            </div>

            <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                     <FaCheckCircle /> tips sinkronisasi
                  </h3>
                  <p className="font-bold opacity-90 leading-relaxed max-w-md">
                     Perubahan pada profil guru akan berdampak pada tampilan di dashboard guru dan pencatatan presensi. Pastikan data sudah akurat.
                  </p>
               </div>
               <FaChalkboardTeacher className="absolute right-[-20px] bottom-[-20px] text-[12rem] opacity-10 rotate-12" />
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-8">
             {/* VISUAL UPLOAD CARD */}
             <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                   <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                      <FaImage className="text-blue-600" /> Jadwal Visual
                   </h2>
                </div>
                <div className="p-8">
                   <div className="mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                      <p className="text-xs font-bold text-blue-800 leading-relaxed">
                         <FaCheckCircle className="inline mr-1" /> Unggah gambar desain jadwal asli milik guru untuk akses cepat di profil.
                      </p>
                   </div>

                   <label className="group relative cursor-pointer block">
                      {previewImage ? (
                        <div className="relative rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg">
                           <img src={previewImage} alt="Jadwal Visual" className="w-full h-auto object-cover" />
                           <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white p-6 text-center">
                              <FaPlus className="text-3xl mb-4" />
                              <span className="font-black text-lg">Ganti Gambar</span>
                              <p className="text-xs font-bold opacity-80 mt-2">Format: JPG, PNG (Max 5MB)</p>
                           </div>
                        </div>
                      ) : (
                        <div className="aspect-[3/4] rounded-[2rem] border-2 border-dashed border-blue-100 bg-gray-50 flex flex-col items-center justify-center p-8 text-center transition-all group-hover:bg-blue-50/30 group-hover:border-blue-300">
                           <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 text-blue-600">
                              <FaImage size={28} />
                           </div>
                           <h4 className="text-gray-900 font-black mb-1">Upload Jadwal</h4>
                           <p className="text-xs text-gray-400 font-bold">Tekan atau seret file kesini</p>
                        </div>
                      )}
                      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                   </label>

                   <div className="mt-10 pt-8 border-t border-gray-100">
                      <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                         {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                         <span>Simpan Perubahan</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => navigate('/waka/jadwal-guru')}
                        className="w-full mt-4 py-4 text-gray-400 font-black hover:text-gray-600 transition-all"
                      >
                         Batalkan
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JadwalGuruEdit;
