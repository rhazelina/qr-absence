import { useState, useEffect, useRef } from 'react';
import StaffLayout from '../../component/WakaStaff/StaffLayout';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Clock, 
  User, 
  BookOpen, 
  MapPin,
  Calendar,
  Settings2,
  CheckCircle2,
  Image as ImageIcon,
  Home,
  ChevronRight,
  Upload,
  X
} from 'lucide-react';
import { masterService } from '../../services/masterService';
import { scheduleService } from '../../services/scheduleService';
import { teacherService } from '../../services/teacherService';
import './JadwalSiswaEdit.css';

interface JadwalHeader {
  class_id: string;
  year: string;
  semester: string;
  is_active: boolean;
}

interface ScheduleItemDraft {
  subject_id: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  room: string;
}

interface ScheduleDay {
  day: string;
  items: ScheduleItemDraft[];
}

const DAY_OPTIONS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const SEMESTER_OPTIONS = [
  { label: 'Ganjil', value: '1' },
  { label: 'Genap', value: '2' }
];

export default function JadwalSiswaEdit({ user, onLogout, onMenuClick, id }: any) {
  const isEditMode = !!id;

  const [headerData, setHeaderData] = useState<JadwalHeader>({
    class_id: '',
    year: '2024/2025',
    semester: '1',
    is_active: true,
  });

  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [scheduleImage, setScheduleImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (id && !initialLoading) {
      fetchExistingSchedule();
    }
  }, [id, initialLoading]);

  const fetchMasterData = async () => {
    try {
      const [classRes, subjectRes, teacherRes] = await Promise.all([
        masterService.getClasses(),
        masterService.getSubjects(),
        teacherService.getTeachers()
      ]);

      setClasses(classRes.data || classRes);
      setSubjects(subjectRes.data || subjectRes);
      setTeachers(teacherRes.data || teacherRes);
    } catch (error) {
      console.error('Error fetching master data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchExistingSchedule = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getSchedule(id);

      setHeaderData({
        class_id: data.class_id,
        year: data.year,
        semester: data.semester,
        is_active: data.is_active,
      });

      // Map existing daily schedules and items
      const mappedDays = data.daily_schedules.map((day: any) => ({
        day: day.day,
        items: day.schedule_items.map((item: any) => ({
          subject_id: item.subject_id,
          teacher_id: item.teacher_id,
          start_time: item.start_time?.substring(0, 5),
          end_time: item.end_time?.substring(0, 5),
          room: item.room || ''
        }))
      }));

      setDays(mappedDays);

      // Fetch class instance for schedule image
      if (data.class_id) {
        const classList = await masterService.getClasses();
        const currentClass = (classList.data || classList).find((c: any) => c.id === data.class_id);
        if (currentClass?.schedule_image_url) {
          setPreviewImage(currentClass.schedule_image_url);
        }
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScheduleImage(file);
      const reader = new FileReader();
      reader.onload = (event) => setPreviewImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleHeaderChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setHeaderData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addDay = () => {
    setDays([...days, { day: 'Monday', items: [] }]);
  };

  const removeDay = (index: number) => {
    if (!window.confirm('Hapus hari ini beserta isinya?')) return;
    const newDays = [...days];
    newDays.splice(index, 1);
    setDays(newDays);
  };

  const updateDayId = (index: number, value: string) => {
    const newDays = [...days];
    newDays[index].day = value;
    setDays(newDays);
  }

  const addItem = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].items.push({
      subject_id: '',
      teacher_id: '',
      start_time: '07:00',
      end_time: '08:00',
      room: ''
    });
    setDays(newDays);
  };

  const removeItem = (dayIndex: number, itemIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].items.splice(itemIndex, 1);
    setDays(newDays);
  };

  const updateItem = (dayIndex: number, itemIndex: number, field: keyof ScheduleItemDraft, value: string) => {
    const newDays = [...days];
    newDays[dayIndex].items[itemIndex][field] = value;
    setDays(newDays);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headerData.class_id) {
      alert('Pilih kelas terlebih dahulu');
      return;
    }

    setLoading(true);

    const payload = {
      ...headerData,
      days: days
    };

    try {
      // 1. Digital Schedule Structure
      if (isEditMode) {
        await scheduleService.updateSchedule(id, payload);
      } else {
        await scheduleService.createSchedule(payload);
      }

      // 2. Schedule Image (Optional)
      if (scheduleImage && headerData.class_id) {
        const imageFormData = new FormData();
        imageFormData.append('file', scheduleImage);
        // Using fetch directly as masterService might not have this yet
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:8000/api/classes/${headerData.class_id}/schedule-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: imageFormData
        });
      }

      alert(`Jadwal berhasil ${isEditMode ? 'diperbarui' : 'dibuat'}`);
      onMenuClick('jadwal-kelas');
    } catch (error) {
      console.error('Error submitting schedule:', error);
      alert('Gagal menyimpan jadwal');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <StaffLayout pageTitle="Loading..." currentPage="jadwal-kelas" onMenuClick={onMenuClick} user={user} onLogout={onLogout}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout 
      pageTitle={isEditMode ? 'Edit Jadwal Kelas' : 'Buat Jadwal Baru'} 
      currentPage="jadwal-kelas" 
      onMenuClick={onMenuClick} 
      user={user} 
      onLogout={onLogout}
      pageIcon={<Calendar size={24} />}
    >
      <div className="min-h-screen bg-slate-50/50 pb-20">
        <div className="px-4 max-w-7xl mx-auto pt-6">
          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-6 overflow-x-auto whitespace-nowrap px-2">
              <button 
                onClick={() => onMenuClick('dashboard')}
                className="hover:text-emerald-600 transition-colors flex items-center gap-2"
              >
                  <Home size={14} />
                  Dashboard
              </button>
              <ChevronRight size={10} />
              <button 
                onClick={() => onMenuClick('jadwal-kelas')}
                className="hover:text-emerald-600 transition-colors"
              >
                  Jadwal Kelas
              </button>
              <ChevronRight size={10} />
              <span className="text-emerald-600 font-bold">{isEditMode ? 'Ubah Struktur' : 'Buat Baru'}</span>
          </div>

          {/* HEADER */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 mb-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                   <div className="p-5 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl shadow-emerald-100">
                      <Calendar size={32} />
                   </div>
                   <div>
                      <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                         {isEditMode ? 'Edit Jadwal Kelas' : 'Buat Jadwal Baru'}
                      </h1>
                      <p className="text-slate-500 font-bold mt-1">Konfigurasi struktur jadwal digital dan visual</p>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   <button
                    onClick={() => onMenuClick('jadwal-kelas')}
                    className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 flex items-center gap-3 hover:border-emerald-600 transition-all shadow-sm"
                  >
                    <ArrowLeft size={18} className="text-emerald-600" />
                    <span>Kembali</span>
                   </button>
                </div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* INFORMATION CARD */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                       <Settings2 className="text-emerald-600" size={24} /> Informasi Akademik
                    </h2>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Target Kelas</label>
                      <select
                        name="class_id"
                        value={headerData.class_id}
                        onChange={handleHeaderChange}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-emerald-600 transition-all outline-none appearance-none"
                        required
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.grade} {c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Tahun Ajaran</label>
                      <input
                        type="text"
                        name="year"
                        value={headerData.year}
                        onChange={handleHeaderChange}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-emerald-600 transition-all outline-none"
                        placeholder="2024/2025"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Semester</label>
                      <select
                        name="semester"
                        value={headerData.semester}
                        onChange={handleHeaderChange}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-emerald-600 transition-all outline-none appearance-none"
                      >
                        {SEMESTER_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center pt-4">
                      <label className="relative inline-flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={headerData.is_active}
                          onChange={handleHeaderChange}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                        <span className="ml-4 text-sm font-black text-slate-700 select-none group-hover:text-emerald-700 transition-colors uppercase tracking-wider">Set Sebagai Aktif</span>
                      </label>
                    </div>
                  </div>
              </div>

              {/* DAYS SECTION */}
              <div className="flex flex-col gap-6">
                 <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                       Struktur Digital <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-black">{days.length} HARI</span>
                    </h3>
                    <button 
                      type="button" 
                      onClick={addDay}
                      className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold hover:bg-black transition-all shadow-lg shadow-slate-200"
                    >
                      <Plus size={18} /> Tambah Hari
                    </button>
                 </div>

                 <div className="space-y-8">
                    {days.map((day, dayIndex) => (
                      <div key={dayIndex} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-slate-50">
                         <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="bg-white px-4 py-2 rounded-xl border-2 border-slate-100">
                                  <select
                                    value={day.day}
                                    onChange={(e) => updateDayId(dayIndex, e.target.value)}
                                    className="bg-transparent font-black text-slate-900 outline-none cursor-pointer text-sm uppercase tracking-widest"
                                  >
                                    {DAY_OPTIONS.map(opt => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                               </div>
                               <span className="text-xs font-bold text-slate-400">{day.items.length} Pelajaran Terdaftar</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeDay(dayIndex)}
                              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                            >
                              <Trash2 size={20} />
                            </button>
                         </div>

                         <div className="p-2">
                            {day.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="p-6 border-b border-slate-50 last:border-0 grid grid-cols-1 md:grid-cols-12 gap-6 items-end group hover:bg-slate-50/50 transition-colors">
                                 {/* TIME */}
                                 <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                       <Clock size={10} /> Alokasi Waktu
                                    </label>
                                    <div className="flex items-center gap-2 bg-white border-2 border-slate-100 p-3 rounded-2xl">
                                       <input
                                          type="time"
                                          value={item.start_time}
                                          onChange={(e) => updateItem(dayIndex, itemIndex, 'start_time', e.target.value)}
                                          className="bg-transparent text-xs font-black text-slate-800 outline-none w-full"
                                       />
                                       <span className="text-slate-300">-</span>
                                       <input
                                          type="time"
                                          value={item.end_time}
                                          onChange={(e) => updateItem(dayIndex, itemIndex, 'end_time', e.target.value)}
                                          className="bg-transparent text-xs font-black text-slate-800 outline-none w-full"
                                       />
                                    </div>
                                 </div>

                                 {/* SUBJECT */}
                                 <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                       <BookOpen size={10} /> Mata Pelajaran
                                    </label>
                                    <select
                                       value={item.subject_id}
                                       onChange={(e) => updateItem(dayIndex, itemIndex, 'subject_id', e.target.value)}
                                       className="w-full p-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-800 focus:border-emerald-600 outline-none appearance-none"
                                       required
                                    >
                                       <option value="">Mapel</option>
                                       {subjects.map(s => (
                                          <option key={s.id} value={s.id}>{s.name}</option>
                                       ))}
                                    </select>
                                 </div>

                                 {/* TEACHER */}
                                 <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                       <User size={10} /> Pengajar
                                    </label>
                                    <select
                                       value={item.teacher_id}
                                       onChange={(e) => updateItem(dayIndex, itemIndex, 'teacher_id', e.target.value)}
                                       className="w-full p-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-800 focus:border-emerald-600 outline-none appearance-none"
                                       required
                                    >
                                       <option value="">Guru</option>
                                       {teachers.map(t => (
                                          <option key={t.id} value={t.id}>{t.user?.name || t.kode_guru}</option>
                                       ))}
                                    </select>
                                 </div>

                                 {/* ROOM & ACTION */}
                                 <div className="md:col-span-3 flex items-center gap-3">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                           <MapPin size={10} /> Ruang
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Cth: A1"
                                          value={item.room}
                                          onChange={(e) => updateItem(dayIndex, itemIndex, 'room', e.target.value)}
                                          className="w-full p-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-800 focus:border-emerald-600 outline-none"
                                        />
                                    </div>
                                    <button 
                                      type="button" 
                                      onClick={() => removeItem(dayIndex, itemIndex)}
                                      className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                       <Trash2 size={18} />
                                    </button>
                                 </div>
                              </div>
                            ))}

                            <div className="p-4">
                               <button 
                                 type="button" 
                                 onClick={() => addItem(dayIndex)}
                                 className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[1.5rem] flex items-center justify-center gap-3 text-slate-400 font-black text-sm hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all"
                               >
                                 <Plus size={18} /> Tambah Jam Pelajaran
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}

                    {days.length === 0 && (
                       <div className="py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-8">
                          <div className="p-6 bg-slate-50 rounded-[1.5rem] text-slate-300 mb-6">
                             <Calendar size={48} />
                          </div>
                          <h4 className="text-xl font-black text-slate-900 mb-2">Belum ada struktur digital</h4>
                          <p className="text-slate-500 font-bold max-w-sm mb-8">Anda dapat menyusun jadwal digital agar sistem dapat melakukan sinkronisasi dengan presensi otomatis.</p>
                          <button 
                            type="button" 
                            onClick={addDay}
                            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                          >
                             Mulai Susun Struktur
                          </button>
                       </div>
                    )}
                 </div>
              </div>
            </div>

            <div className="lg:col-span-1 flex flex-col gap-8">
               {/* PREVIEW/UPLOAD CARD */}
               <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden sticky top-6">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                     <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <ImageIcon className="text-emerald-600" size={24} /> Visual Jadwal
                     </h2>
                  </div>
                  <div className="p-8">
                     <div className="mb-6 bg-emerald-50/50 p-6 rounded-[1.5rem] border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-800 leading-relaxed flex items-start gap-2">
                           <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> 
                           <span>Unggah desain visual jadwal (JPG/PNG) untuk ditampilkan pada dashboard siswa di kelas ini.</span>
                        </p>
                     </div>

                     <label className="group relative cursor-pointer block">
                        {previewImage ? (
                          <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl ring-8 ring-white">
                             <img src={previewImage} alt="Preview Jadwal" className="w-full h-auto object-cover max-h-[400px]" />
                             <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white p-6 text-center backdrop-blur-sm">
                                <Upload size={32} className="mb-4" />
                                <span className="font-black text-lg uppercase tracking-wider">Ganti Visual</span>
                                <p className="text-[10px] font-bold opacity-80 mt-2">UKURAN MAKSIMAL 5MB</p>
                             </div>
                             <button
                               type="button"
                               onClick={(e) => {
                                 e.preventDefault();
                                 setScheduleImage(null);
                                 setPreviewImage(null);
                               }}
                               className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-colors"
                             >
                                <X size={16} />
                             </button>
                          </div>
                        ) : (
                          <div className="aspect-[4/5] rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-8 text-center transition-all group-hover:bg-emerald-50/20 group-hover:border-emerald-300">
                             <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-emerald-600">
                                <ImageIcon size={32} />
                             </div>
                             <h4 className="text-slate-900 font-black text-lg mb-1">Unggah Desain</h4>
                             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">JPG, PNG, GIF</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          className="hidden" 
                          onChange={handleFileChange} 
                          accept="image/*" 
                        />
                     </label>

                     <div className="mt-12 pt-10 border-t border-slate-100 space-y-4">
                        <button 
                          type="submit" 
                          disabled={loading} 
                          className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                           {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={24} />}
                           <span>Simpan Konfigurasi</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => onMenuClick('jadwal-kelas')}
                          className="w-full py-4 text-slate-400 font-black hover:text-slate-600 transition-all uppercase tracking-widest text-xs"
                        >
                           Batalkan Perubahan
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </form>
        </div>
      </div>
    </StaffLayout>
  );
}
