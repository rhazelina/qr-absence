import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import {
  FaSave,
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaCalendarAlt,
  FaChevronRight,
  FaUserTie,
  FaBook,
  FaClock,
  FaSpinner,
  FaImage,
  FaCheckCircle,
  FaTimes,
  FaListUl,
  FaLayerGroup
} from 'react-icons/fa';
import apiService from '../../utils/api';

function JadwalGuruEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [headerData, setHeaderData] = useState({
    teacher_id: '',
    year: '2024/2025',
    semester: 'ganjil',
    is_active: true,
  });

  const [days, setDays] = useState([]);
  const [scheduleImage, setScheduleImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Master Data
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingSchedule, setIsFetchingSchedule] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [imageError, setImageError] = useState('');

  const dayOptions = [
    'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'
  ];

  const engToIndo = {
    'Monday': 'Senin',
    'Tuesday': 'Selasa',
    'Wednesday': 'Rabu',
    'Thursday': 'Kamis',
    'Friday': 'Jumat',
    'Saturday': 'Sabtu',
    'Sunday': 'Minggu'
  };

  const indoToEng = {
    'Senin': 'Monday',
    'Selasa': 'Tuesday',
    'Rabu': 'Wednesday',
    'Kamis': 'Thursday',
    'Jumat': 'Friday',
    'Sabtu': 'Saturday',
    'Minggu': 'Sunday'
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (id && initialLoading === false) {
      fetchExistingSchedule();
    }
  }, [id, initialLoading]);

  const fetchMasterData = async () => {
    try {
      const [classData, subjectData, teacherData] = await Promise.all([
        apiService.get('/classes'),
        apiService.get('/subjects'),
        apiService.get('/teachers')
      ]);

      setClasses(classData.data || classData);
      setSubjects(subjectData.data || subjectData);
      setTeachers(teacherData.data || teacherData);
    } catch (error) {
      console.error('Error fetching master data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchExistingSchedule = async () => {
    try {
      setIsFetchingSchedule(true);
      const data = await apiService.get(`/schedules/${id}`);
      const scheduleData = data.data || data;

      setHeaderData({
        teacher_id: scheduleData.teacher_id,
        year: scheduleData.year,
        semester: scheduleData.semester === '1' ? 'ganjil' : scheduleData.semester === '2' ? 'genap' : scheduleData.semester || 'ganjil',
        is_active: scheduleData.is_active,
      });

      if (scheduleData.daily_schedules) {
        const mappedDays = scheduleData.daily_schedules.map(day => ({
          day: engToIndo[day.day] || day.day,
          items: (day.schedule_items || []).map(item => ({
            id: item.id,
            subject_id: item.subject_id,
            class_id: item.class_id,
            start_time: item.start_time?.substring(0, 5),
            end_time: item.end_time?.substring(0, 5),
            room: item.room || ''
          }))
        }));
        setDays(mappedDays);
      }

      const rawImg = scheduleData.image_url || scheduleData.teacher?.schedule_image_url;
      if (rawImg) {
        setPreviewImage(rawImg.startsWith('http') ? rawImg : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${rawImg}`);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      alert('Gagal memuat data jadwal');
      navigate('/waka/jadwal-guru');
    } finally {
      setIsFetchingSchedule(false);
    }
  };

  const handleHeaderChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHeaderData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('File harus berupa gambar.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Ukuran file maksimal 5MB.');
      return;
    }

    setImageError('');
    setScheduleImage(file);
    const reader = new FileReader();
    reader.onload = (readerEvent) => setPreviewImage(readerEvent.target.result);
    reader.readAsDataURL(file);
  };

  const addDay = () => setDays([...days, { day: 'Senin', items: [] }]);
  const removeDay = (idx) => {
    if (!window.confirm('Hapus hari ini?')) return;
    const newDays = [...days];
    newDays.splice(idx, 1);
    setDays(newDays);
  };
  const updateDayId = (idx, val) => {
    const newDays = [...days];
    newDays[idx].day = val;
    setDays(newDays);
  };

  const addItem = (dIdx) => {
    const newDays = [...days];
    newDays[dIdx].items.push({
      subject_id: '',
      class_id: '',
      start_time: '07:00',
      end_time: '08:00',
      room: ''
    });
    setDays(newDays);
  };

  const removeItem = (dIdx, iIdx) => {
    const newDays = [...days];
    newDays[dIdx].items.splice(iIdx, 1);
    setDays(newDays);
  };

  const updateItem = (dIdx, iIdx, field, val) => {
    const newDays = [...days];
    newDays[dIdx].items[iIdx][field] = val;
    setDays(newDays);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headerData.teacher_id) return alert('Pilih guru!');
    if (days.length === 0) return alert('Tambahkan jadwal!');

    setIsSubmitting(true);
    try {
      if (isEditMode) {
         await apiService.put(`/schedules/${id}`, {
            ...headerData,
            days: days.map(d => ({ ...d, day: indoToEng[d.day] || d.day })),
            type: 'teacher'
         });
      } else {
         await apiService.post('/schedules/bulk', {
            ...headerData,
            days: days.map(d => ({ ...d, day: indoToEng[d.day] || d.day })),
            type: 'teacher'
         });
      }

      if (scheduleImage) {
        const formData = new FormData();
        formData.append('file', scheduleImage);
        await apiService.post(`/teachers/${headerData.teacher_id}/schedule-image`, formData);
      }

      alert('Jadwal berhasil disimpan');
      navigate('/waka/jadwal-guru');
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Gagal menyimpan jadwal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-blue-600">
        <FaSpinner className="animate-spin text-4xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NavbarWaka />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
            <Link to="/waka/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <FaChevronRight className="text-[10px]" />
            <Link to="/waka/jadwal-guru" className="hover:text-blue-600 transition-colors">Jadwal Guru</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-blue-600 font-bold">{isEditMode ? 'Edit Jadwal' : 'Tambah Jadwal'}</span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* HEADER SECTION */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8">
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                   <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200">
                      <FaUserTie className="text-4xl" />
                   </div>
                   <div>
                      <h1 className="text-3xl font-black text-gray-900 tracking-tight">{isEditMode ? 'Ubah Jadwal' : 'Jadwal Baru'}</h1>
                      <p className="text-gray-500 font-bold mt-1">Konfigurasi jadwal pengajar digital dan visual</p>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                   <Link to="/waka/jadwal-guru" className="px-6 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2">
                      <FaArrowLeft />
                      <span>Kembali</span>
                   </Link>
                   <button 
                     type="submit"
                     disabled={isSubmitting}
                     className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50"
                   >
                      {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      <span>{isEditMode ? 'Simpan' : 'Terbitkan'}</span>
                   </button>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* LEFT: FORM INFO */}
             <div className="lg:col-span-1 space-y-8">
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                   <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                      <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-wider text-sm">
                         <FaUserTie className="text-blue-600" /> Informasi Pengajar
                      </h3>
                   </div>
                   <div className="p-8 space-y-6">
                      <div>
                         <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Pilih Guru</label>
                         <select 
                            name="teacher_id"
                            value={headerData.teacher_id}
                            onChange={handleHeaderChange}
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-blue-500 focus:bg-white transition-all outline-none"
                         >
                            <option value="">-- Pilih Guru --</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.user?.name || t.kode_guru}</option>)}
                         </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Tahun Ajaran</label>
                            <input 
                               type="text"
                               name="year"
                               value={headerData.year}
                               onChange={handleHeaderChange}
                               placeholder="2024/2025"
                               className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-blue-500 focus:bg-white transition-all outline-none"
                            />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Semester</label>
                            <select 
                               name="semester"
                               value={headerData.semester}
                               onChange={handleHeaderChange}
                               className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-blue-500 focus:bg-white transition-all outline-none"
                            >
                               <option value="ganjil">Ganjil</option>
                               <option value="genap">Genap</option>
                            </select>
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                         <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${headerData.is_active ? 'bg-green-500' : 'bg-gray-400'} text-white`}>
                               <FaCheckCircle />
                            </div>
                            <span className="font-bold text-gray-700 uppercase tracking-wider text-xs">Jadwal Aktif</span>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                               type="checkbox" 
                               name="is_active" 
                               checked={headerData.is_active} 
                               onChange={handleHeaderChange}
                               className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                         </label>
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                   <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                      <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-wider text-sm">
                         <FaImage className="text-blue-600" /> Preview Visual
                      </h3>
                   </div>
                   <div className="p-8">
                      <div 
                        className="relative group aspect-[3/4] rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition-all"
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                         {previewImage ? (
                            <>
                               <img src={previewImage} alt="Schedule Visual" className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <div className="text-white text-center">
                                     <FaPlus className="text-3xl mx-auto mb-2" />
                                     <span className="font-black uppercase tracking-widest text-xs">Ganti Gambar</span>
                                  </div>
                               </div>
                            </>
                         ) : (
                            <div className="text-center p-8">
                               <FaImage className="text-5xl text-gray-200 mx-auto mb-4" />
                               <p className="text-gray-400 font-bold text-sm">Klik untuk unggah jadwal gambar</p>
                               <p className="text-[10px] text-gray-300 font-bold uppercase mt-2">Format: JPG, PNG (Maks 5MB)</p>
                            </div>
                         )}
                         <input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                      </div>
                      {imageError && <p className="text-red-500 text-[10px] font-bold uppercase mt-3 text-center">*{imageError}</p>}
                   </div>
                </div>
             </div>

             {/* RIGHT: SCHEDULE STRUCTURE */}
             <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-2">
                   <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter">
                      <FaLayerGroup className="text-blue-600" /> Struktur Jadwal Harian
                   </h2>
                   <button 
                     type="button" 
                     onClick={addDay}
                     className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 text-sm"
                   >
                      <FaPlus /> <span>Tambah Hari</span>
                   </button>
                </div>

                {days.length > 0 ? (
                  days.map((day, dIdx) => (
                    <div key={dIdx} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-6">
                       <div className="p-6 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                                <FaCalendarAlt />
                             </div>
                             <select 
                               value={day.day} 
                               onChange={(e) => updateDayId(dIdx, e.target.value)}
                               className="bg-transparent border-none font-black text-gray-800 text-lg focus:ring-0 outline-none cursor-pointer p-0"
                             >
                                {dayOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                             </select>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeDay(dIdx)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          >
                             <FaTrash />
                          </button>
                       </div>
                       
                       <div className="p-8 space-y-4">
                          {day.items.map((item, iIdx) => (
                             <div key={iIdx} className="group relative flex flex-wrap md:flex-nowrap items-end gap-4 p-6 bg-gray-50/30 rounded-3xl border border-gray-100 hover:border-blue-200 transition-colors">
                                <div className="w-full md:w-48">
                                   <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">Waktu</label>
                                   <div className="flex items-center gap-2 bg-white p-2 border border-gray-200 rounded-xl">
                                      <input type="time" value={item.start_time} onChange={(e) => updateItem(dIdx, iIdx, 'start_time', e.target.value)} className="w-full border-none p-0 text-center font-bold text-gray-700 focus:ring-0 text-sm" />
                                      <span className="text-gray-300 font-bold">-</span>
                                      <input type="time" value={item.end_time} onChange={(e) => updateItem(dIdx, iIdx, 'end_time', e.target.value)} className="w-full border-none p-0 text-center font-bold text-gray-700 focus:ring-0 text-sm" />
                                   </div>
                                </div>

                                <div className="flex-1 min-w-[200px]">
                                   <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">Kelas</label>
                                   <select 
                                      value={item.class_id} 
                                      onChange={(e) => updateItem(dIdx, iIdx, 'class_id', e.target.value)}
                                      required
                                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:border-blue-500 transition-all outline-none text-sm"
                                   >
                                      <option value="">Pilih Kelas</option>
                                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                   </select>
                                </div>

                                <div className="flex-1 min-w-[200px]">
                                   <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">Mata Pelajaran</label>
                                   <select 
                                      value={item.subject_id} 
                                      onChange={(e) => updateItem(dIdx, iIdx, 'subject_id', e.target.value)}
                                      required
                                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:border-blue-500 transition-all outline-none text-sm"
                                   >
                                      <option value="">Pilih Mata Pelajaran</option>
                                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                   </select>
                                </div>

                                <button 
                                  type="button" 
                                  onClick={() => removeItem(dIdx, iIdx)}
                                  className="p-3.5 bg-white text-red-500 border border-gray-200 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                                >
                                   <FaTrash />
                                </button>
                             </div>
                          ))}
                          
                          <button 
                            type="button" 
                            onClick={() => addItem(dIdx)}
                            className="w-full py-5 border-3 border-dashed border-gray-100 hover:border-blue-200 hover:bg-blue-50 text-gray-300 hover:text-blue-500 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all mt-4"
                          >
                             <FaPlus className="text-lg" /> Tambah Sesi Mengajar
                          </button>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
                     <FaListUl className="text-5xl text-gray-200 mx-auto mb-4" />
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada hari yang ditambahkan</p>
                     <button type="button" onClick={addDay} className="mt-4 text-blue-600 font-black hover:underline">Ketuk di sini untuk memulai</button>
                  </div>
                )}
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JadwalGuruEdit;
