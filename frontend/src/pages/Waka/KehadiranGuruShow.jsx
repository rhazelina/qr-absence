import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import PageWrapper from "../../components/ui/PageWrapper";
import apiClient from "../../services/api";
import {
  FaArrowLeft,
  FaEdit,
  FaSave,
  FaTimes,
  FaUser,
  FaClipboardCheck,
  FaChevronDown,
  FaCalendarAlt,
  FaChevronRight,
  FaUserTie,
  FaSpinner,
  FaExclamationTriangle
} from "react-icons/fa";

function KehadiranGuruShow() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teacherRes, attendanceRes] = await Promise.all([
        apiClient.get(`/teachers/${id}`),
        apiClient.get(`/teachers/${id}/attendance`)
      ]);
      setTeacher(teacherRes.data);
      // Backend for teacher attendance returns { data: [...] } or just [...]
      setData(attendanceRes.data.data || attendanceRes.data || []);
    } catch (error) {
      console.error("Error fetching teacher attendance details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setSelectedStatus(item.status || "present");
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      // Using /attendance/manual since it's the standard for admin/teacher
      await apiClient.post('/attendance/manual', {
        attendee_type: 'teacher',
        teacher_id: id,
        schedule_id: selectedItem.schedule_id,
        status: selectedStatus,
        date: selectedItem.date,
        reason: 'Updated by Waka'
      });

      await fetchData();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating teacher attendance:", error);
      alert("Gagal memperbarui kehadiran.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !teacher) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Data...</span>
        </div>
      </PageWrapper>
    );
  }

  const teacherName = teacher?.user?.name || "Guru";

  return (
    <PageWrapper className="max-w-[1600px] mx-auto p-6 md:p-10 space-y-8 font-sans">

      {/* ================= BREADCRUMB ================= */}
      <div className="flex items-center gap-3 text-sm font-bold text-gray-500 mb-8 overflow-hidden whitespace-nowrap">
        <Link to="/waka/kehadiran-guru" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest text-[11px] font-black">
          <FaUserTie />
          <span>Kehadiran Guru</span>
        </Link>
        <FaChevronRight className="text-[10px] text-gray-300" />
        <span className="text-gray-400 uppercase tracking-widest text-[11px] font-black truncate">{teacherName}</span>
      </div>

      {/* ================= HEADER CARD ================= */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-white/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-100">
            <FaUser />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight leading-none italic uppercase">{teacherName}</h1>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-3">NIP: {teacher?.nip || '-'}</p>
          </div>
        </div>

        <Link
          to="/waka/kehadiran-guru"
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-black active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-gray-200"
        >
          <FaArrowLeft />
          <span>Kembali</span>
        </Link>
      </div>

      {/* ================= TABLE CARD ================= */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-3 uppercase tracking-tight">
            <FaClipboardCheck className="text-indigo-600" /> Daftar Kehadiran Mengajar
          </h3>
          <span className="hidden sm:block text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail Per Pertemuan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">No</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Jam / Matpel</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kelas</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((item, i) => {
                const statusColors = {
                  "present": "bg-emerald-50 text-emerald-600 border-emerald-100",
                  "late": "bg-amber-50 text-amber-600 border-amber-100",
                  "excused": "bg-blue-50 text-blue-600 border-blue-100",
                  "sick": "bg-violet-50 text-violet-600 border-violet-100",
                  "absent": "bg-red-50 text-red-600 border-red-100",
                  "return": "bg-gray-100 text-gray-600 border-gray-200"
                };
                const colorClass = statusColors[item.status] || "bg-gray-50 text-gray-400 border-gray-100";

                return (
                  <tr key={item.id} className="group hover:bg-indigo-50/10 transition-colors">
                    <td className="px-8 py-6 text-sm font-black text-gray-300 text-center group-hover:text-indigo-400">{i + 1}</td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-600">{item.date}</td>
                    <td className="px-8 py-6">
                      <div className="font-black text-gray-800 text-xs uppercase tracking-tight italic">{item.schedule?.subject_name}</div>
                      <div className="text-[10px] text-gray-400 font-bold">{item.schedule?.start_time} - {item.schedule?.end_time}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-100">{item.schedule?.class_room?.name || '-'}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${colorClass}`}>
                        {item.status || 'Belum Absen'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button
                        className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-400 flex items-center justify-center transition-all hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-100 active:scale-95 mx-auto"
                        onClick={() => handleEditClick(item)}
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="py-20 text-center text-gray-400 font-bold text-sm italic">
              Belum ada data kehadiran untuk guru ini.
            </div>
          )}
        </div>
      </div>

      {/* MODAL EDIT */}
      {showEditModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>

          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Ubah Kehadiran</h3>
              <button
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FaClipboardCheck className="text-indigo-600" /> Pilih Status Kehadiran
                </label>
                <div className="relative group">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full appearance-none px-6 py-5 bg-gray-50 border border-gray-200 rounded-[1.5rem] outline-none font-bold text-gray-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="present">Hadir</option>
                    <option value="late">Terlambat</option>
                    <option value="excused">Izin</option>
                    <option value="sick">Sakit</option>
                    <option value="absent">Alpha</option>
                    <option value="return">Pulang</option>
                  </select>
                  <FaChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-2 gap-4 border-t border-gray-50 bg-gray-50/30">
              <button
                className="py-4 rounded-2xl bg-white border border-gray-200 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 hover:text-gray-600 transition-all active:scale-95"
                onClick={() => setShowEditModal(false)}
              >
                Batal
              </button>
              <button
                className="py-4 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaSave />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

export default KehadiranGuruShow;
