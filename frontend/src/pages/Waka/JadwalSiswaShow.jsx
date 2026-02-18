import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './JadwalSiswaShow.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import {
  FaCalendarAlt,
  FaArrowLeft,
  FaPrint,
  FaEdit,
  FaUserGraduate,
  FaImage,
  FaChevronRight,
  FaSpinner,
} from 'react-icons/fa';

function JadwalSiswaShow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [id]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/schedules/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
      } else {
        console.error('Gagal memuat data jadwal');
        alert('Gagal memuat data jadwal');
        navigate('/waka/jadwal-siswa');
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      alert('Terjadi kesalahan saat memuat data');
      navigate('/waka/jadwal-siswa');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="jadwal-siswa-show-loading-screen">
        <FaSpinner className="animate-spin" /> Loading...
      </div>
    );
  }

  if (!schedule) {
    return null;
  }

  // Helper to sort days if needed, though usually backend handles it or we map manually
  const dayOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
  const sortedDays = schedule.daily_schedules?.sort((a, b) => dayOrder[a.day] - dayOrder[b.day]) || [];

  return (
    <div className="jadwal-siswa-show-root">
      <NavbarWaka />

      <div className="jadwal-siswa-show-container">
        {/* BREADCRUMB */}
        <div className="jadwal-siswa-show-breadcrumb">
          <Link to="/waka/jadwal-siswa" className="jadwal-siswa-show-breadcrumb-link">
            <FaCalendarAlt />
            <span>Jadwal Siswa</span>
          </Link>
          <FaChevronRight />
          <span>{schedule.class?.name}</span>
        </div>

        {/* HEADER */}
        <div className="jadwal-siswa-show-header">
          <div className="jadwal-siswa-show-header-top">
            <div className="jadwal-siswa-show-header-left">
              <div className="jadwal-siswa-show-icon">
                <FaUserGraduate />
              </div>
              <div className="jadwal-siswa-show-title">
                <h1>Jadwal Siswa</h1>
                <p>Tahun Ajaran {schedule.year} - Semester {schedule.semester == 1 ? 'Ganjil' : 'Genap'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="jadwal-siswa-show-btn-print"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                <FaPrint /> <span>Cetak</span>
              </button>
              <Link
                to={`/waka/jadwal-siswa/${id}/edit`}
                className="jadwal-siswa-show-btn-edit"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', backgroundColor: '#f59e0b', color: 'white', border: 'none', textDecoration: 'none' }}
              >
                <FaEdit /> <span>Edit</span>
              </Link>
              <Link to="/waka/jadwal-siswa" className="jadwal-siswa-show-btn-back">
                <FaArrowLeft />
                <span>Kembali</span>
              </Link>
            </div>
          </div>

          <div className="jadwal-siswa-show-header-info">
            <div className="jadwal-siswa-show-info-box">
              <span>Wali Kelas</span>
              <strong>{schedule.class?.teacher?.user?.name || '-'}</strong>
            </div>
            <div className="jadwal-siswa-show-info-box">
              <span>Kelas</span>
              <strong>{schedule.class?.name}</strong>
            </div>
            <div className="jadwal-siswa-show-info-box">
              <span>Status</span>
              <span className={`jadwal-siswa-index-badge-${schedule.is_active ? 'green' : 'gray'}`} style={{ marginTop: '4px' }}>
                {schedule.is_active ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </div>
          </div>
        </div>

        {/* CONTENT CARD */}
        <div className="jadwal-siswa-show-card">
          <div className="jadwal-siswa-show-card-header">
            <h2><FaImage /> Jadwal Pembelajaran</h2>
            <p>Daftar mata pelajaran per hari</p>
          </div>
          <div className="jadwal-siswa-show-card-body p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedDays.map((day) => (
                <div key={day.id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-lg text-gray-800 uppercase">
                    {day.day}
                  </div>
                  <div className="divide-y divide-gray-100">
                    {day.schedule_items?.length > 0 ? (
                      day.schedule_items.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((item) => (
                        <div key={item.id} className="p-4 hover:bg-gray-50 transition">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-gray-800">
                              {item.subject?.name || 'Unknown Subject'}
                            </span>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                              {item.room || '-'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            {item.teacher?.user?.name || item.teacher?.kode_guru || 'Unknown Teacher'}
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 italic">
                        Tidak ada pelajaran
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {sortedDays.length === 0 && (
                <div className="col-span-full text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">Belum ada jadwal yang diatur untuk kelas ini.</p>
                  <Link to={`/waka/jadwal-siswa/${id}/edit`} className="text-blue-600 hover:underline mt-2 inline-block">
                    Atur Jadwal Sekarang
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JadwalSiswaShow;
