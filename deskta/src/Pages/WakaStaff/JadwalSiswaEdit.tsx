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
import { API_BASE_URL } from '../../services/api';
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
  'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'
];

const SEMESTER_OPTIONS = [
  { label: 'Ganjil', value: '1' },
  { label: 'Genap', value: '2' }
];

export default function JadwalSiswaEdit({ user, onLogout, onMenuClick, id }: any) {
  const isEditMode = !!id;

  const [headerData, setHeaderData] = useState<JadwalHeader>({
    class_id: id?.toString() || '',
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
      const data = await scheduleService.getScheduleByClass(id);

      if (data) {
        setHeaderData({
          class_id: data.class_id.toString(),
          year: data.year,
          semester: data.semester,
          is_active: data.is_active,
        });

        // Map existing daily schedules and items
        const mappedDays = data.daily_schedules.map((day: any) => ({
          day: day.day,
          items: day.schedule_items.map((item: any) => ({
            subject_id: item.subject_id.toString(),
            teacher_id: item.teacher_id.toString(),
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
            setPreviewImage(`${currentClass.schedule_image_url}?t=${Date.now()}`);
          }
        }
      }
    } catch (error: any) {
      if (error.status === 404) {
        console.log('No existing schedule for this class, starting fresh.');
      } else {
        console.error('Error fetching schedule:', error);
      }
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
      // 1. Digital Schedule Structure - Always use bulkUpsert for class-based schedules
      await scheduleService.bulkUpsert(id, payload);

      // 2. Schedule Image (Optional)
      if (scheduleImage && headerData.class_id) {
        const imageFormData = new FormData();
        imageFormData.append('file', scheduleImage);
        // Using fetch directly as masterService might not have this yet
        // TODO: Move this to a service call eventually
        const token = localStorage.getItem('token');

        await fetch(`${API_BASE_URL}/classes/${headerData.class_id}/schedule-image`, {
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
      <div className="schedule-edit-container">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-6 overflow-x-auto whitespace-nowrap px-2">
          <button
            onClick={() => onMenuClick('dashboard')}
            className="hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            <Home size={14} />
            Dashboard
          </button>
          <ChevronRight size={10} />
          <button
            onClick={() => onMenuClick('jadwal-kelas')}
            className="hover:text-blue-600 transition-colors"
          >
            Jadwal Kelas
          </button>
          <ChevronRight size={10} />
          <span className="text-blue-600 font-bold">{isEditMode ? 'Ubah Struktur' : 'Buat Baru'}</span>
        </div>

        {/* HEADER SECTION */}
        <div className="schedule-edit-card mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                <Calendar size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {isEditMode ? 'Edit Jadwal Kelas' : 'Buat Jadwal Baru'}
                </h1>
                <p className="text-slate-500 font-medium mt-1">Konfigurasi struktur jadwal digital dan visual</p>
              </div>
            </div>

            <button
              onClick={() => onMenuClick('jadwal-kelas')}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-600 flex items-center gap-2 hover:border-blue-600 transition-all shadow-sm"
            >
              <ArrowLeft size={18} className="text-blue-600" />
              <span>Kembali</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* INFORMATION CARD */}
            <div className="schedule-edit-card !p-0 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <Settings2 className="text-blue-600" size={20} /> Informasi Akademik
                </h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Target Kelas</label>
                  <select
                    name="class_id"
                    value={headerData.class_id}
                    onChange={handleHeaderChange}
                    className="premium-input premium-select"
                    required
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}> {c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    name="year"
                    value={headerData.year}
                    onChange={handleHeaderChange}
                    className="premium-input"
                    placeholder="2024/2025"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Semester</label>
                  <select
                    name="semester"
                    value={headerData.semester}
                    onChange={handleHeaderChange}
                    className="premium-input premium-select"
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
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                    <span className="ml-3 text-sm font-bold text-slate-700 select-none group-hover:text-blue-600 transition-colors uppercase tracking-wider">Set Sebagai Aktif</span>
                  </label>
                </div>
              </div>
            </div>

            {/* DAYS SECTION */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  Struktur Digital <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-bold">{days.length} HARI</span>
                </h3>
                <button
                  type="button"
                  onClick={addDay}
                  className="btn-add-day"
                >
                  <Plus size={18} /> Tambah Hari
                </button>
              </div>

              <div className="space-y-6">
                {days.map((day, dayIndex) => (
                  <div key={dayIndex} className="day-card">
                    <div className="day-header">
                      <div className="flex items-center gap-4">
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                          <select
                            value={day.day}
                            onChange={(e) => updateDayId(dayIndex, e.target.value)}
                            className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer text-sm uppercase tracking-wider"
                          >
                            {DAY_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">{day.items.length} Pelajaran</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDay(dayIndex)}
                        className="btn-delete-item !text-slate-400 hover:!text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="p-2">
                      {day.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="schedule-item-row group">
                          {/* TIME */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <Clock size={10} /> Alokasi Waktu
                            </label>
                            <div className="time-input-group">
                              <input
                                type="time"
                                value={item.start_time}
                                onChange={(e) => updateItem(dayIndex, itemIndex, 'start_time', e.target.value)}
                                className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full"
                              />
                              <span className="text-slate-300">-</span>
                              <input
                                type="time"
                                value={item.end_time}
                                onChange={(e) => updateItem(dayIndex, itemIndex, 'end_time', e.target.value)}
                                className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full"
                              />
                            </div>
                          </div>

                          {/* SUBJECT */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <BookOpen size={10} /> Mapel
                            </label>
                            <select
                              value={item.subject_id}
                              onChange={(e) => updateItem(dayIndex, itemIndex, 'subject_id', e.target.value)}
                              className="premium-input premium-select !py-2"
                              required
                            >
                              <option value="">Mapel</option>
                              {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* TEACHER */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <User size={10} /> Pengajar
                            </label>
                            <select
                              value={item.teacher_id}
                              onChange={(e) => updateItem(dayIndex, itemIndex, 'teacher_id', e.target.value)}
                              className="premium-input premium-select !py-2"
                              required
                            >
                              <option value="">Guru</option>
                              {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.user?.name || t.kode_guru}</option>
                              ))}
                            </select>
                          </div>

                          {/* ROOM & ACTION */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <MapPin size={10} /> Ruang
                              </label>
                              <input
                                type="text"
                                placeholder="Cth: A1"
                                value={item.room}
                                onChange={(e) => updateItem(dayIndex, itemIndex, 'room', e.target.value)}
                                className="premium-input !py-2"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(dayIndex, itemIndex)}
                              className="btn-delete-item mt-5"
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
                          className="btn-add-item"
                        >
                          <Plus size={18} /> Tambah Jam Pelajaran
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {days.length === 0 && (
                  <div className="py-16 bg-white rounded-xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-8">
                    <div className="p-5 bg-slate-50 rounded-2xl text-slate-300 mb-6">
                      <Calendar size={40} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Belum ada struktur digital</h4>
                    <p className="text-slate-500 font-medium max-w-sm mb-8 text-sm">Anda dapat menyusun jadwal digital agar sistem dapat melakukan sinkronisasi dengan presensi otomatis.</p>
                    <button
                      type="button"
                      onClick={addDay}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
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
            <div className="schedule-edit-card !p-0 overflow-hidden sticky top-6">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <ImageIcon className="text-blue-600" size={20} /> Visual Jadwal
                </h2>
              </div>
              <div className="p-8">
                <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs font-semibold text-blue-800 leading-relaxed flex items-start gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                    <span>Unggah desain visual jadwal (JPG/PNG) untuk ditampilkan pada dashboard siswa di kelas ini.</span>
                  </p>
                </div>

                <label className="group relative cursor-pointer block">
                  {previewImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg ring-4 ring-white">
                      <img src={previewImage} alt="Preview Jadwal" className="w-full h-auto object-cover max-h-[350px]" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white p-6 text-center backdrop-blur-sm">
                        <Upload size={28} className="mb-3" />
                        <span className="font-bold text-base uppercase tracking-wider">Ganti Visual</span>
                        <p className="text-[10px] font-medium opacity-80 mt-2">UKURAN MAKSIMAL 5MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setScheduleImage(null);
                          setPreviewImage(null);
                        }}
                        className="absolute top-3 right-3 p-1.5 bg-rose-500 text-white rounded-lg shadow-lg hover:bg-rose-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-[4/5] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-8 text-center transition-all group-hover:bg-blue-50/20 group-hover:border-blue-300">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 text-blue-600">
                        <ImageIcon size={28} />
                      </div>
                      <h4 className="text-slate-900 font-bold text-base mb-1">Unggah Desain</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">JPG, PNG, GIF</p>
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

                <div className="mt-10 pt-8 border-t border-slate-100 space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-save-schedule w-full"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                    <span>Simpan Konfigurasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onMenuClick('jadwal-kelas')}
                    className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-all uppercase tracking-wider text-[10px] text-center"
                  >
                    Batalkan Perubahan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </StaffLayout>

  );
}
