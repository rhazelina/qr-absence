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
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];
  const totalSessions = days.reduce((count, day) => count + day.items.length, 0);

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
        class_id: scheduleData.class_id,
        year: scheduleData.year,
        semester: scheduleData.semester === '1' ? 'ganjil' : scheduleData.semester === '2' ? 'genap' : scheduleData.semester || 'ganjil',
        is_active: scheduleData.is_active,
      });

      // Map existing daily schedules and items if available
      if (scheduleData.daily_schedules) {
        const mappedDays = scheduleData.daily_schedules.map(day => ({
          day: day.day,
          items: (day.schedule_items || []).map(item => ({
            subject_id: item.subject_id,
            teacher_id: item.teacher_id,
            start_time: item.start_time?.substring(0, 5),
            end_time: item.end_time?.substring(0, 5),
            room: item.room || ''
          }))
        }));
        setDays(mappedDays);
      } else {
        // Fallback for flat structure
        setDays([{
           day: scheduleData.day || 'Monday',
           items: [{
              subject_id: scheduleData.subject_id,
              teacher_id: scheduleData.teacher_id,
              start_time: scheduleData.start_time?.substring(0, 5),
              end_time: scheduleData.end_time?.substring(0, 5),
              room: scheduleData.room || ''
           }]
        }]);
      }

      const rawImg = scheduleData.image_url || scheduleData.class?.schedule_image_url;
      if (rawImg) {
        setPreviewImage(rawImg.startsWith('http') ? rawImg : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${rawImg}`);
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

  const addDay = () => setDays([...days, { day: 'Monday', items: [] }]);
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
      teacher_id: '',
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
    if (!headerData.class_id) return alert('Pilih kelas!');
    if (days.length === 0) return alert('Tambahkan jadwal!');

    setIsSubmitting(true);
    try {
      // Bulk update/create
      if (isEditMode) {
         await apiService.put(`/schedules/${id}`, {
            ...headerData,
            days: days
         });
      } else {
         await apiService.post('/schedules/bulk', {
            ...headerData,
            days: days
         });
      }

      if (scheduleImage) {
        const formData = new FormData();
        formData.append('file', scheduleImage);
        await apiService.post(`/classes/${headerData.class_id}/schedule-image`, formData);
      }

      alert('Jadwal berhasil disimpan');
      navigate('/waka/jadwal-siswa');
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Gagal menyimpan jadwal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return <div className="jadwal-siswa-edit-loading"><FaSpinner className="animate-spin" /> Memuat data...</div>;
  }

  return (
    <div className="jadwal-siswa-edit-page">
      <NavbarWaka />

      <div className="jadwal-siswa-edit-root">
         <div className="jadwal-siswa-edit-container">
            {/* HEADER */}
            <div className="jadwal-siswa-edit-header">
               <div className="header-left">
                  <h1 className="jadwal-siswa-edit-title">
                     <FaCalendarAlt /> {isEditMode ? 'Edit Jadwal' : 'Tambah Jadwal'}
                  </h1>
                  <p className="jadwal-siswa-edit-subtitle">
                     {isEditMode ? 'Ubah rincian jadwal yang sudah ada' : 'Buat jadwal pembelajaran baru'}
                  </p>
               </div>
               <Link to="/waka/jadwal-siswa" className="jadwal-siswa-edit-back">
                  <FaArrowLeft /> Kembali
               </Link>
            </div>

            <form onSubmit={handleSubmit} className="jadwal-siswa-edit-content">
               <div className="edit-main-card">
                  <div className="jadwal-siswa-edit-group">
                     <label>Pilih Kelas</label>
                     <select 
                        name="class_id" 
                        value={headerData.class_id} 
                        onChange={handleHeaderChange}
                        required
                        className="edit-input"
                     >
                        <option value="">-- Pilih Kelas --</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                  </div>

                  <div className="edit-grid-3">
                     <div className="jadwal-siswa-edit-group">
                        <label>Tahun Ajaran</label>
                        <input type="text" name="year" value={headerData.year} onChange={handleHeaderChange} placeholder="2024/2025" className="edit-input" />
                     </div>
                     <div className="jadwal-siswa-edit-group">
                        <label>Semester</label>
                        <select name="semester" value={headerData.semester} onChange={handleHeaderChange} className="edit-input">
                           <option value="ganjil">Ganjil</option>
                           <option value="genap">Genap</option>
                        </select>
                     </div>
                     <div className="jadwal-siswa-edit-group active-toggle">
                        <label>Status Aktif</label>
                        <label className="switch">
                           <input type="checkbox" name="is_active" checked={headerData.is_active} onChange={handleHeaderChange} />
                           <span className="slider round"></span>
                        </label>
                     </div>
                  </div>

                  {/* DIGITAL STRUCTURE */}
                  <div className="digital-structure-section">
                     <div className="section-header">
                        <h3><FaClock /> Struktur Harian</h3>
                        <button type="button" onClick={addDay} className="btn-add-day"><FaPlus /> Tambah Hari</button>
                     </div>

                     {days.map((day, dIdx) => (
                        <div key={dIdx} className="day-card">
                           <div className="day-header">
                              <select value={day.day} onChange={(e) => updateDayId(dIdx, e.target.value)} className="day-select">
                                 {dayOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                              <button type="button" onClick={() => removeDay(dIdx)} className="btn-remove-day"><FaTrash /></button>
                           </div>
                           <div className="items-list">
                              {day.items.map((item, iIdx) => (
                                 <div key={iIdx} className="item-row">
                                    <div className="item-field time-field">
                                       <label>Waktu</label>
                                       <div className="time-inputs">
                                          <input type="time" value={item.start_time} onChange={(e) => updateItem(dIdx, iIdx, 'start_time', e.target.value)} />
                                          <span>-</span>
                                          <input type="time" value={item.end_time} onChange={(e) => updateItem(dIdx, iIdx, 'end_time', e.target.value)} />
                                       </div>
                                    </div>
                                    <div className="item-field">
                                       <label>Mapel</label>
                                       <select value={item.subject_id} onChange={(e) => updateItem(dIdx, iIdx, 'subject_id', e.target.value)} required>
                                          <option value="">Pilih Mapel</option>
                                          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                       </select>
                                    </div>
                                    <div className="item-field">
                                       <label>Guru</label>
                                       <select value={item.teacher_id} onChange={(e) => updateItem(dIdx, iIdx, 'teacher_id', e.target.value)} required>
                                          <option value="">Pilih Guru</option>
                                          {teachers.map(t => <option key={t.id} value={t.id}>{t.user?.name || t.kode_guru}</option>)}
                                       </select>
                                    </div>
                                    <button type="button" onClick={() => removeItem(dIdx, iIdx)} className="btn-remove-item"><FaTrash /></button>
                                 </div>
                              ))}
                              <button type="button" onClick={() => addItem(dIdx)} className="btn-add-item"><FaPlus /> Tambah Sesi</button>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* VISUAL SCHEDULE */}
                  <div className="visual-schedule-section">
                     <label><FaImage /> Gambar Jadwal (Opsional)</label>
                     <div className="jadwal-siswa-edit-upload">
                        {previewImage ? (
                           <div className="image-preview-wrapper" onClick={() => document.getElementById('file-upload').click()}>
                              <img src={previewImage} alt="Preview" />
                              <div className="overlay"><FaPlus /> Ganti Gambar</div>
                           </div>
                        ) : (
                           <label htmlFor="file-upload" className="upload-placeholder">
                              <FaImage />
                              <span>Klik untuk unggah gambar jadwal</span>
                           </label>
                        )}
                        <input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                     </div>
                     {imageError && <p className="error-text">*{imageError}</p>}
                  </div>

                  <div className="jadwal-siswa-edit-actions">
                     <button type="submit" disabled={isSubmitting} className="btn-submit">
                        {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />} {isEditMode ? 'Simpan Perubahan' : 'Terbitkan Jadwal'}
                     </button>
                     <Link to="/waka/jadwal-siswa" className="jadwal-siswa-edit-cancel">Batal</Link>
                  </div>
               </div>
            </form>
         </div>
      </div>
    </div>
  );
}

export default JadwalSiswaEdit;
