import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './JadwalSiswaEdit.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import {
  FaSave,
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaCalendarAlt,
  FaChevronRight,
  FaDoorOpen,
  FaBook,
  FaClock,
  FaHome,
  FaSpinner,
  FaImage,
  FaCheckCircle
} from 'react-icons/fa';

import apiService from '../../utils/api';

function JadwalSiswaEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [headerData, setHeaderData] = useState({
    class_id: '',
    year: '2024/2025',
    semester: '1',
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
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  const totalSessions = days.reduce((count, day) => count + day.items.length, 0);

  const getClassLabel = (classItem) => {
    if (!classItem) return 'Kelas';
    return (
      classItem.class_name ||
      classItem.name ||
      [classItem.grade, classItem.label].filter(Boolean).join(' ') ||
      `Kelas ${classItem.id}`
    );
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

      setHeaderData({
        class_id: data.class_id,
        year: data.year,
        semester: data.semester,
        is_active: data.is_active,
      });

      // Map existing daily schedules and items
      const mappedDays = (data.daily_schedules || []).map(day => ({
        day: day.day,
        items: (day.schedule_items || []).map(item => ({
          subject_id: item.subject_id,
          teacher_id: item.teacher_id,
          start_time: item.start_time?.substring(0, 5), // HH:mm
          end_time: item.end_time?.substring(0, 5),
          room: item.room || ''
        }))
      }));

      setDays(mappedDays);

      // Check for class-level schedule image
      const classImage =
        data.class?.schedule_image_url ||
        data.class_room?.schedule_image_url ||
        data.classRoom?.schedule_image_url;

      if (classImage) {
        setPreviewImage(classImage);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      alert('Gagal memuat data jadwal');
      navigate('/waka/jadwal-siswa');
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

    const maxFileSize = 5 * 1024 * 1024;

    if (!file.type.startsWith('image/')) {
      setImageError('File harus berupa gambar (JPG, PNG, WEBP, dll).');
      return;
    }

    if (file.size > maxFileSize) {
      setImageError('Ukuran file maksimal 5MB.');
      return;
    }

    setImageError('');
    setScheduleImage(file);
    const reader = new FileReader();
    reader.onload = (readerEvent) => setPreviewImage(readerEvent.target.result);
    reader.readAsDataURL(file);
  };

  const addDay = () => {
    setDays([...days, { day: 'Monday', items: [] }]);
  };

  const removeDay = (index) => {
    if (!window.confirm('Hapus hari ini beserta isinya?')) return;
    const newDays = [...days];
    newDays.splice(index, 1);
    setDays(newDays);
  };

  const updateDayId = (index, value) => {
    const newDays = [...days];
    newDays[index].day = value;
    setDays(newDays);
  }

  const addItem = (dayIndex) => {
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

  const removeItem = (dayIndex, itemIndex) => {
    const newDays = [...days];
    newDays[dayIndex].items.splice(itemIndex, 1);
    setDays(newDays);
  };

  const updateItem = (dayIndex, itemIndex, field, value) => {
    const newDays = [...days];
    newDays[dayIndex].items[itemIndex][field] = value;
    setDays(newDays);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headerData.class_id) {
      alert('Pilih kelas terlebih dahulu');
      return;
    }

    if (days.length === 0) {
      alert('Tambahkan minimal 1 hari jadwal sebelum menyimpan');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      year: headerData.year,
      semester: headerData.semester,
      is_active: headerData.is_active,
      days: days
    };

    try {
      // 1. Digital Schedule Structure
      await apiService.post(`/classes/${headerData.class_id}/schedules/bulk`, payload);

      // 2. Schedule Image (Optional)
      if (scheduleImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', scheduleImage);
        await apiService.post(`/classes/${headerData.class_id}/schedule-image`, imageFormData);
      }

      alert(`Jadwal berhasil ${isEditMode ? 'diperbarui' : 'dibuat'}`);
      navigate('/waka/jadwal-siswa');
    } catch (error) {
      console.error('Error submitting schedule:', error);
      alert('Gagal menyimpan jadwal: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
        <p className="text-gray-500 font-bold">Memuat sinkronisasi data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NavbarWaka />

      <div className="pt-24 px-4 max-w-7xl mx-auto">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/waka/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-2">
            <FaHome className="text-xs" />
            Dashboard
          </Link>
          <FaChevronRight className="text-[10px]" />
          <Link to="/waka/jadwal-siswa" className="hover:text-blue-600 transition-colors">
            Jadwal Siswa
          </Link>
          <FaChevronRight className="text-[10px]" />
          <span className="text-blue-600 font-bold">{isEditMode ? 'Ubah Struktur' : 'Buat Baru'}</span>
        </div>

        {/* HEADER */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-200">
                <FaCalendarAlt className="text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  {isEditMode ? 'Ubah Jadwal Siswa' : 'Buat Jadwal Baru'}
                </h1>
                <p className="text-gray-500 font-bold mt-1">Konfigurasi struktur digital dan visual jadwal harian</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/waka/jadwal-siswa"
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
            {isEditMode && isFetchingSchedule && (
              <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-3 text-sm font-bold text-gray-600">
                <FaSpinner className="animate-spin text-blue-600" />
                Memuat detail jadwal...
              </div>
            )}

            {/* INFORMATION CARD */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <FaDoorOpen className="text-blue-600" /> Informasi Utama
                </h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-600 uppercase tracking-widest pl-1">Kelas</label>
                  <select
                    name="class_id"
                    value={headerData.class_id}
                    onChange={handleHeaderChange}
                    required
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-blue-600 transition-all outline-none"
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{getClassLabel(c)}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-600 uppercase tracking-widest pl-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    name="year"
                    value={headerData.year}
                    onChange={handleHeaderChange}
                    placeholder="2024/2025"
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-blue-600 transition-all outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-600 uppercase tracking-widest pl-1">Semester</label>
                  <select
                    name="semester"
                    value={headerData.semester}
                    onChange={handleHeaderChange}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-blue-600 transition-all outline-none"
                  >
                    <option value="1">Semester Ganjil</option>
                    <option value="2">Semester Genap</option>
                  </select>
                </div>

                <label htmlFor="is_active" className="flex items-center justify-between gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mt-auto cursor-pointer">
                  <div>
                    <p className="text-sm font-bold text-blue-900">Set Aktif</p>
                    <p className="text-xs font-semibold text-blue-700/80 mt-0.5">Ditampilkan ke siswa</p>
                  </div>
                  <span className="relative inline-block w-12 h-7">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={headerData.is_active}
                      onChange={handleHeaderChange}
                      className="peer sr-only"
                    />
                    <span className="absolute inset-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-blue-600" />
                    <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                  </span>
                </label>
              </div>
            </div>

            {/* DAILY STRUCTURE SECTION */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <FaClock className="text-blue-600" /> Struktur Harian
                  </h2>
                  <p className="text-xs font-semibold text-gray-500 mt-1 ml-9">
                    {days.length} hari, {totalSessions} sesi pelajaran
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addDay}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-sm"
                >
                  <FaPlus /> Tambah Hari
                </button>
              </div>

              {days.map((day, dayIndex) => (
                <div key={dayIndex} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-2">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                        <FaCalendarAlt className="text-blue-600" />
                      </div>
                      <select
                        value={day.day}
                        onChange={(e) => updateDayId(dayIndex, e.target.value)}
                        className="bg-white border border-gray-100 rounded-xl px-3 py-2 font-black text-gray-900 text-sm sm:text-base outline-none cursor-pointer hover:border-blue-200 focus:border-blue-500 transition-colors"
                      >
                        {dayOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDay(dayIndex)}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Hapus hari"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="p-8">
                    {day.items.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {day.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="group p-6 bg-gray-50/50 border border-gray-100 rounded-3xl relative hover:bg-white hover:shadow-xl hover:shadow-gray-100/50 transition-all grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">

                            <div className="lg:col-span-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Waktu</label>
                              <div className="flex items-center gap-2 min-w-0">
                                <input
                                  type="time"
                                  value={item.start_time}
                                  onChange={(e) => updateItem(dayIndex, itemIndex, 'start_time', e.target.value)}
                                  className="flex-1 min-w-0 p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:border-blue-600 transition-all outline-none"
                                />
                                <span className="text-gray-300">-</span>
                                <input
                                  type="time"
                                  value={item.end_time}
                                  onChange={(e) => updateItem(dayIndex, itemIndex, 'end_time', e.target.value)}
                                  className="flex-1 min-w-0 p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:border-blue-600 transition-all outline-none"
                                />
                              </div>
                            </div>

                            <div className="lg:col-span-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Mata Pelajaran</label>
                              <select
                                value={item.subject_id}
                                onChange={(e) => updateItem(dayIndex, itemIndex, 'subject_id', e.target.value)}
                                required
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:border-blue-600 transition-all outline-none appearance-none"
                              >
                                <option value="">Pilih Mapel</option>
                                {subjects.map(s => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="lg:col-span-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Guru Pengajar</label>
                              <select
                                value={item.teacher_id}
                                onChange={(e) => updateItem(dayIndex, itemIndex, 'teacher_id', e.target.value)}
                                required
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:border-blue-600 transition-all outline-none appearance-none"
                              >
                                <option value="">Pilih Guru</option>
                                {teachers.map(t => (
                                  <option key={t.id} value={t.id}>{t.user?.name || t.kode_guru}</option>
                                ))}
                              </select>
                            </div>

                            <div className="lg:col-span-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Ruangan</label>
                              <input
                                type="text"
                                placeholder="R. 101"
                                value={item.room}
                                onChange={(e) => updateItem(dayIndex, itemIndex, 'room', e.target.value)}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:border-blue-600 transition-all outline-none"
                              />
                            </div>

                            <div className="lg:col-span-1 flex justify-center pb-1">
                              <button
                                type="button"
                                onClick={() => removeItem(dayIndex, itemIndex)}
                                className="w-10 h-10 bg-white border border-gray-100 text-red-400 hover:text-red-500 hover:border-red-100 rounded-xl transition-all flex items-center justify-center shadow-sm"
                                title="Hapus sesi"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-[2rem]">
                        <FaBook className="mx-auto text-gray-200 text-4xl mb-4" />
                        <p className="text-gray-400 font-bold">Belum ada rincian pelajaran</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => addItem(dayIndex)}
                      className="w-full mt-6 py-4 border-2 border-dashed border-blue-100 rounded-[1.5rem] text-blue-600 font-black hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center justify-center gap-3 text-sm"
                    >
                      <FaPlus className="text-xs" /> Tambahkan Sesi Pelajaran
                    </button>
                  </div>
                </div>
              ))}

              {days.length === 0 && (
                <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200" style={{ padding: '2rem', borderRadius: '2rem' }}>
                  <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 py-4">
                    <FaCalendarAlt className="text-gray-200 text-5xl" size={30} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2" style={{ marginBottom: '1rem' }}>Belum Ada Struktur Jadwal</h3>
                  <p className="text-gray-500 font-bold mb-10 max-w-xs mx-auto" style={{ marginBottom: '2rem' }}>Mulai dengan menambahkan hari untuk menyusun kurikulum mingguan kelas.</p>
                  <button
                    type="button"
                    onClick={addDay}
                    className="px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                  >
                    Mulai Sekarang
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-8">
            {/* VISUAL UPLOAD CARD */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden lg:sticky lg:top-24">
              <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <FaImage className="text-blue-600" /> Jadwal Visual
                </h2>
              </div>
              <div className="p-8">
                <div className="mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-800 leading-relaxed">
                    <FaCheckCircle className="inline mr-1" /> Unggah gambar desain jadwal asli untuk kemudahan visualisasi siswa di dashboard.
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
                      <h4 className="text-gray-900 font-black mb-1">Upload Gambar</h4>
                      <p className="text-xs text-gray-400 font-bold">Klik atau seret file ke sini</p>
                    </div>
                  )}
                  <input type="file" className="hidden" style={{ display: "none" }} onChange={handleFileChange} accept="image/*" />
                </label>
                {imageError && (
                  <p className="text-xs font-bold text-red-500 mt-4">{imageError}</p>
                )}

                <div className="mt-10 pt-8 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSubmitting || isFetchingSchedule || days.length === 0}
                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    <span>{isEditMode ? 'Simpan Perubahan' : 'Terbitkan Jadwal'}</span>
                  </button>
                  {days.length === 0 && (
                    <p className="text-xs font-semibold text-red-500 mt-3 text-center" style={{ marginTop: "8px" }}>
                      Tambahkan minimal satu hari sebelum menyimpan.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate('/waka/jadwal-siswa')}
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

export default JadwalSiswaEdit;
