import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./KehadiranSiswaShow.css";
import NavbarWaka from "../../components/Waka/NavbarWaka";
import apiService from "../../utils/api";
import {
  FaArrowLeft,
  FaChevronDown,
  FaClipboardCheck,
  FaDoorOpen,
  FaEdit,
  FaSave,
  FaSpinner,
  FaTimes,
  FaUser,
  FaEye,
  FaCalendarAlt,
  FaChevronRight,
  FaCheckCircle,
  FaClock,
  FaInfoCircle,
  FaHeartbeat,
  FaRegTimesCircle,
  FaSignOutAlt,
  FaBriefcase,
  FaHistory,
  FaChartBar,
  FaUserTie,
  FaMapMarkerAlt
} from "react-icons/fa";

const statusConfig = {
  present: { label: 'Hadir', bg: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', icon: <FaCheckCircle />, color: "#1FA83D" },
  late: { label: 'Terlambat', bg: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500', icon: <FaClock />, color: "#d8bf1a" },
  excused: { label: 'Izin', bg: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: <FaInfoCircle />, color: "#ECE10A" },
  sick: { label: 'Sakit', bg: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500', icon: <FaHeartbeat />, color: "#9A0898" },
  absent: { label: 'Alfa', bg: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', icon: <FaRegTimesCircle />, color: "#D90000" },
  return: { label: 'Pulang', bg: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-500', icon: <FaSignOutAlt />, color: "#FF5F1A" }
};

function KehadiranSiswaShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kelas, setKelas] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classRes, attendanceRes] = await Promise.all([
        apiService.getClass(id),
        apiService.getClassAttendanceByDate(id, selectedDate)
      ]);

      setKelas(classRes.data || classRes);
      const items = attendanceRes.items || [];
      setAttendanceData(items);
    } catch (error) {
      console.error("Error fetching class attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetail = (att, schedule) => {
    setSelectedItem({ att, schedule });
    setShowDetailModal(true);
  };

  const subjectOptions = useMemo(() => {
    const map = new Map();
    attendanceData.forEach((item) => {
      const scheduleId = item.schedule?.id;
      const subjectName = item.schedule?.subject?.name;
      if (scheduleId && subjectName) {
        map.set(String(scheduleId), subjectName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [attendanceData]);

  const filteredAttendanceData = useMemo(() => {
    if (selectedSubject === 'all') return attendanceData;
    return attendanceData.filter((item) => String(item.schedule?.id) === selectedSubject);
  }, [attendanceData, selectedSubject]);

  const stats = useMemo(() => {
    const computed = {
      present: 0,
      late: 0,
      excused: 0,
      sick: 0,
      absent: 0,
      return: 0
    };

    const seenAttendance = new Set();
    filteredAttendanceData.forEach((item) => {
      item.attendances.forEach((att) => {
        if (!seenAttendance.has(att.id)) {
          const status = (att.status || '').toLowerCase();
          if (computed[status] !== undefined) {
            computed[status]++;
          }
          seenAttendance.add(att.id);
        }
      });
    });

    return computed;
  }, [filteredAttendanceData]);

  useEffect(() => {
    if (selectedSubject === 'all') return;
    const stillExists = subjectOptions.some((option) => option.id === selectedSubject);
    if (!stillExists) {
      setSelectedSubject('all');
    }
  }, [subjectOptions, selectedSubject]);

  if (loading && !kelas) {
    return (
      <div className="flex items-center justify-center min-vh-100 bg-gray-50 text-blue-600">
        <FaSpinner className="animate-spin text-4xl" />
      </div>
    );
  }

  return (
    <div className="kehadiran-siswa-show-root min-h-screen pb-12">
      <NavbarWaka />

      <div className="kehadiran-siswa-show-container">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link to="/waka/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <FaChevronRight className="text-[10px]" />
            <Link to="/waka/kehadiran-siswa" className="hover:text-blue-600 transition-colors">Kehadiran Siswa</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-blue-600 font-bold">{kelas?.name}</span>
        </div>

        {/* HEADER SECTION */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200">
                    <FaDoorOpen className="text-4xl" />
                 </div>
                 <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{kelas?.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                       <span className="flex items-center gap-2 text-gray-500 font-bold">
                          <FaUserTie className="text-blue-500" />
                          {kelas?.homeroom_teacher?.user?.name || 'Wali Kelas Tidak Set'}
                       </span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                 <div className="relative group">
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                      className="kehadiran-siswa-subject-select pl-4 pr-10 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-gray-700 cursor-pointer appearance-none"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                      <option value="all">Semua Mata Pelajaran</option>
                      {subjectOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                 </div>
                 <div className="relative group">
                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
                    <input 
                       type="date"
                       className="kehadiran-siswa-date-input pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-gray-700 cursor-pointer"
                       value={selectedDate}
                       onChange={(e) => setSelectedDate(e.target.value)}
                    />
                 </div>
                 <Link 
                   to={`/waka/kehadiran-siswa/rekap?class_id=${id}`}
                   className="flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-600 shadow-lg shadow-gray-900/10 hover:shadow-blue-600/20 transition-all"
                 >
                    <FaChartBar />
                    <span>Rekap Bulanan</span>
                 </Link>
              </div>
           </div>

           {/* STATS STRIP */}
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-10">
              {Object.entries(statusConfig).map(([key, config]) => (
                 <div key={key} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 mb-1">
                       <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{config.label}</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">{stats[key] || 0}</p>
                 </div>
              ))}
           </div>
        </div>

        {/* ATTENDANCE DATA */}
        {filteredAttendanceData.length > 0 ? (
          <div className="space-y-8">
             {filteredAttendanceData.map((item, idx) => (
                <div key={idx} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                   <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm border border-blue-50">
                            <FaClipboardCheck className="text-xl" />
                         </div>
                         <div>
                            <h3 className="font-bold text-gray-900">{item.schedule?.subject?.name}</h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-1">
                               <span className="flex items-center gap-1.5"><FaClock className="text-blue-400" /> {item.schedule?.start_time} - {item.schedule?.end_time}</span>
                               <span className="w-1 h-1 bg-gray-300 rounded-full" />
                               <span className="flex items-center gap-1.5"><FaUserTie className="text-blue-400" /> {item.schedule?.teacher?.user?.name}</span>
                            </div>
                         </div>
                      </div>
                      <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                         {item.attendances.length} Siswa Tercatat
                      </span>
                   </div>

                   <div className="overflow-x-auto">
                      <table className="w-full">
                         <thead>
                            <tr className="bg-white">
                               <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Siswa</th>
                               <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                               <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aksi</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                            {item.attendances.map((att, attIdx) => {
                               const config = statusConfig[att.status.toLowerCase()] || statusConfig.absent;
                               return (
                                  <tr key={attIdx} className="hover:bg-gray-50/50 transition-colors">
                                     <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                           <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold border border-gray-200">
                                              {att.student?.user?.name?.charAt(0)}
                                           </div>
                                           <div>
                                              <p className="font-bold text-gray-900">{att.student?.user?.name}</p>
                                              <p className="text-[10px] text-gray-500 font-medium">NISN: {att.student?.nisn || '-'}</p>
                                           </div>
                                        </div>
                                     </td>
                                     <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${config.bg} text-[11px] font-bold uppercase tracking-wide`}>
                                           {config.icon}
                                           {config.label}
                                        </div>
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                        <button 
                                          onClick={() => handleShowDetail(att, item.schedule)}
                                          className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                                        >
                                           <FaEye />
                                        </button>
                                     </td>
                                  </tr>
                               );
                            })}
                         </tbody>
                      </table>
                   </div>
                </div>
             ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-200">
             <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                <FaHistory />
             </div>
             <h3 className="text-2xl font-black text-gray-800 mb-2">Belum Ada Data</h3>
             <p className="text-gray-500 font-medium max-w-sm mx-auto">
                Tidak ada jadwal atau rekaman kehadiran pada tanggal {selectedDate}
                {selectedSubject !== 'all' ? ' untuk mata pelajaran terpilih' : ''}
             </p>
             <button 
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
             >
                Kembali ke Hari Ini
             </button>
          </div>
        )}

        {/* BACK BUTTON */}
        <div className="mt-12 flex justify-center">
           <Link to="/waka/kehadiran-siswa" className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all shadow-sm">
              <FaArrowLeft />
              <span>Kembali ke Daftar Kelas</span>
           </Link>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
           <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-modal-in">
              <div className="p-8 pb-0 flex items-center justify-between">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <FaClipboardCheck className="text-2xl" />
                 </div>
                 <button onClick={() => setShowDetailModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition-all">
                    <FaTimes />
                 </button>
              </div>

              <div className="p-8">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-100 flex items-center justify-center text-gray-400 font-bold border border-gray-200 text-2xl">
                       {selectedItem.att.student?.user?.name?.charAt(0)}
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-gray-900">{selectedItem.att.student?.user?.name}</h3>
                       <p className="text-sm text-gray-500 font-bold">NISN: {selectedItem.att.student?.nisn}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">INFORMASI PELAJARAN</p>
                       <div className="space-y-3">
                          <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-gray-500">Mata Pelajaran</span>
                             <span className="text-sm font-bold text-gray-900">{selectedItem.schedule?.subject?.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-gray-500">Guru</span>
                             <span className="text-sm font-bold text-gray-900">{selectedItem.schedule?.teacher?.user?.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-gray-500">Sesi</span>
                             <span className="text-sm font-bold text-gray-900">{selectedItem.schedule?.start_time} - {selectedItem.schedule?.end_time}</span>
                          </div>
                       </div>
                    </div>

                    <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">STATUS KEHADIRAN</p>
                       <div className="flex items-center gap-4">
                          <div className={`px-4 py-2 rounded-full border font-bold text-xs uppercase tracking-wider ${statusConfig[selectedItem.att.status.toLowerCase()]?.bg}`}>
                             {statusConfig[selectedItem.att.status.toLowerCase()]?.label}
                          </div>
                          <span className="text-sm font-bold text-gray-700">{selectedItem.att.time || '-'}</span>
                       </div>
                       {selectedItem.att.note && (
                          <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-200 italic text-sm text-gray-600">
                             "{selectedItem.att.note}"
                          </div>
                       )}
                    </div>

                    {selectedItem.att.document_path && (
                      <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">LAMPIRAN / BUKTI</p>
                        <img 
                          src={selectedItem.att.document_path} 
                          alt="Bukti Kehadiran" 
                          className="w-full rounded-2xl shadow-sm border border-gray-200"
                        />
                      </div>
                    )}
                 </div>

                 <button 
                  onClick={() => setShowDetailModal(false)}
                  className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg"
                 >
                    Tutup Detail
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default KehadiranSiswaShow;
