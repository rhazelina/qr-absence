import React, { useState, useEffect } from "react";
import {
  FaChalkboardTeacher,
  FaSearch,
  FaEye,
  FaCalendarAlt,
  FaChevronRight,
  FaFilter,
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaProcedures
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/ui/PageWrapper";
import apiClient from "../../services/api";

const getStatusBadge = (status) => {
  const statusMapping = {
    present: { label: 'Hadir', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <FaCheckCircle /> },
    late: { label: 'Terlambat', class: 'bg-amber-100 text-amber-700 border-amber-200', icon: <FaExclamationTriangle /> },
    absent: { label: 'Belum Absen', class: 'bg-gray-100 text-gray-400 border-gray-200', icon: <FaSpinner /> },
    excused: { label: 'Izin', class: 'bg-blue-100 text-blue-700 border-blue-200', icon: <FaInfoCircle /> },
    sick: { label: 'Sakit', class: 'bg-violet-100 text-violet-700 border-violet-200', icon: <FaProcedures /> },
  };
  const config = statusMapping[status] || statusMapping.absent;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.class}`}>
      {config.icon} {config.label}
    </span>
  );
};

export default function KehadiranGuruIndex() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [teacherAttendance, setTeacherAttendance] = useState([]);

  const fetchAttendance = React.useCallback(async (signal) => {
    try {
      setLoading(true);
      const res = await apiClient.get('/attendance/teachers/daily', {
        params: { date },
        signal: signal
      });
      // Items is paginated based on controller
      setTeacherAttendance(res.data.items?.data || res.data.items || []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Error fetching daily teacher attendance:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAttendance(controller.signal);
    return () => controller.abort();
  }, [fetchAttendance]);

  const filteredTeachers = teacherAttendance.filter(item =>
    item.teacher?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.teacher?.nip?.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <PageWrapper className="max-w-[1600px] mx-auto p-6 md:p-10 space-y-10 font-sans">

      {/* HEADER SECTION */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-white/50 flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-200">
            <FaChalkboardTeacher />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight leading-none italic uppercase">Kehadiran Guru</h1>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-3">Monitor Real-time Tenaga Pendidik</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group flex-1 sm:min-w-[300px]">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari nama atau NIP guru..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700 shadow-inner"
            />
          </div>
          <div className="relative group">
            <FaCalendarAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-xs uppercase tracking-widest text-gray-700 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-3">
            <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
            Daftar Presensi Harian Guru
          </h3>
          <span className="text-[10px] font-black text-gray-400 bg-white px-4 py-1.5 rounded-full border border-gray-100 uppercase tracking-widest shadow-sm">
            TOTAL: {filteredTeachers.length} RECORD
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-24">No</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Data Tenaga Pendidik</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Identitas (NIP)</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-48">Status Presensi</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-40">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-24"><FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto" /></td></tr>
              ) : filteredTeachers.map((item, i) => (
                <tr key={item.teacher.id} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                  <td className="px-10 py-6 text-sm font-black text-gray-300 text-center group-hover:text-indigo-400 transition-colors">{i + 1}</td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-gray-800 group-hover:text-indigo-700 transition-colors uppercase tracking-tight italic">{item.teacher?.user?.name}</span>
                  </td>
                  <td className="px-8 py-6 font-mono text-xs font-bold text-gray-500 tracking-wider bg-gray-50 rounded-xl my-2 inline-block border border-gray-100">
                    {item.teacher?.nip}
                  </td>
                  <td className="px-8 py-6 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex justify-center">
                      <button
                        className="w-full max-w-[120px] py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                        onClick={() => navigate(`/waka/kehadiran-guru/${item.teacher.id}`)}
                      >
                        <FaEye /> DETAIL
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredTeachers.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-200">
              <FaChalkboardTeacher size={48} />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm italic">Data tenaga pendidik tidak ditemukan</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}