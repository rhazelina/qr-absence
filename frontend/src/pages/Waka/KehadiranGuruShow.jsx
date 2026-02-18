import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import "./KehadiranGuruShow.css";
import NavbarWaka from "../../components/Waka/NavbarWaka";
import apiService from "../../utils/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  FaArrowLeft,
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaInfoCircle,
  FaHeartbeat,
  FaRegTimesCircle,
  FaSignOutAlt,
  FaBriefcase,
  FaHistory,
  FaUserTie,
  FaTrash,
  FaFileExport,
  FaFilePdf,
  FaFileExcel
} from "react-icons/fa";

function KehadiranGuruShow() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const [history, setHistory] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [voidingId, setVoidingId] = useState(null);

  const statusConfig = {
    present: { label: 'Hadir', bg: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', icon: <FaCheckCircle /> },
    late: { label: 'Terlambat', bg: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500', icon: <FaClock /> },
    excused: { label: 'Izin', bg: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: <FaInfoCircle /> },
    sick: { label: 'Sakit', bg: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500', icon: <FaHeartbeat /> },
    absent: { label: 'Alfa', bg: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', icon: <FaRegTimesCircle /> },
    return: { label: 'Pulang', bg: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-500', icon: <FaSignOutAlt /> },
    dinas: { label: 'Dinas', bg: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', icon: <FaBriefcase /> },
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getTeacherAttendanceHistory(id);
      setTeacher(data.teacher);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching teacher history:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleEditClick = (attendance) => {
    setSelectedAttendance(attendance);
    setSelectedStatus(attendance.status);
    setSelectedReason(attendance.reason || "");
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedAttendance) return;
    setSubmitting(true);
    try {
      await apiService.updateAttendanceStatus(selectedAttendance.id, {
        status: selectedStatus,
        reason: selectedReason.trim() || null,
      });
      setShowEditModal(false);
      fetchHistory(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal mengupdate status: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoidAttendance = async (attendance) => {
    if (!attendance?.id) return;
    const ok = window.confirm(
      `Batalkan presensi ${teacher?.user?.name || "guru"} pada ${new Date(attendance.date).toLocaleDateString("id-ID")}?`
    );
    if (!ok) return;

    setVoidingId(attendance.id);
    try {
      await apiService.voidAttendance(attendance.id);
      await fetchHistory();
      alert("Presensi berhasil dibatalkan.");
    } catch (error) {
      console.error("Error void attendance:", error);
      alert("Gagal membatalkan presensi: " + error.message);
    } finally {
      setVoidingId(null);
    }
  };

  const getStatusLabel = (status) => statusConfig[status]?.label || status || "-";

  const handleExportPDF = () => {
    setShowExport(false);
    const doc = new jsPDF("l", "mm", "a4");
    const title = `Riwayat Kehadiran Guru - ${teacher?.user?.name || "-"}`;
    const subtitle = `Kode Guru: ${teacher?.kode_guru || "-"} | Total: ${history.length} presensi`;
    doc.setFontSize(14);
    doc.text(title, 14, 14);
    doc.setFontSize(10);
    doc.text(subtitle, 14, 20);

    const headers = [["No", "Tanggal", "Waktu", "Status", "Mapel", "Kelas", "Catatan"]];
    const rows = history.map((h, idx) => {
      const day = h.date
        ? new Date(h.date).toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
        : "-";
      const time = h.checked_in_at
        ? new Date(h.checked_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        : "-";

      return [
        idx + 1,
        day,
        time,
        getStatusLabel(h.status),
        h.schedule?.subject?.name || "-",
        h.schedule?.daily_schedule?.class_schedule?.class?.name || "-",
        h.reason || "-",
      ];
    });

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 31, 62] },
    });

    doc.save(`kehadiran-guru-${teacher?.kode_guru || id}.pdf`);
  };

  const handleExportExcel = () => {
    setShowExport(false);
    const rows = history.map((h, idx) => ({
      No: idx + 1,
      Tanggal: h.date
        ? new Date(h.date).toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
        : "-",
      Waktu: h.checked_in_at
        ? new Date(h.checked_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        : "-",
      Status: getStatusLabel(h.status),
      "Mata Pelajaran": h.schedule?.subject?.name || "-",
      Kelas: h.schedule?.daily_schedule?.class_schedule?.class?.name || "-",
      Catatan: h.reason || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kehadiran Guru");
    XLSX.writeFile(workbook, `kehadiran-guru-${teacher?.kode_guru || id}.xlsx`);
  };

  if (loading) {
    return (
      <div className="wadah-muat">
        <div className="konten-muat">
          <FaSpinner />
          <span>Sinkronisasi data guru...</span>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="kehadiran-guru-show">
        <NavbarWaka />
        <div className="kehadiran-guru-show-container">
           <div className="keadaan-kosong">
              <div className="wadah-ikon-kosong">
                <FaUserTie />
              </div>
              <div className="teks-kosong">
                <p className="judul-kosong">Guru Tidak Ditemukan</p>
                <p className="keterangan-kosong">Maaf, data profil pengajar yang Anda cari tidak tersedia.</p>
                <Link to="/waka/kehadiran-guru" className="kehadiran-guru-show-back mt-6">
                  <FaArrowLeft /> Kembali ke Daftar
                </Link>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kehadiran-guru-show">
      <NavbarWaka />

      <div className="kehadiran-guru-show-container">
        {/* HEADER */}
        <div className="kehadiran-guru-show-header">
          <div className="info-header-wrapper">
             <div className="avatar-header">
                {teacher.user?.photo_url ? (
                  <img src={teacher.user.photo_url} alt={teacher.user.name} className="w-full h-full object-cover" />
                ) : (
                  <FaUserTie />
                )}
             </div>
             <div className="info-header">
                <h2>{teacher.user?.name}</h2>
                <div className="badge-wrapper">
                   <span className="lencana-jurusan">KODE: {teacher.kode_guru || '-'}</span>
                   <span className="lencana-jurusan bg-blue-50 text-blue-600 border-blue-100">STAF PENGAJAR</span>
                </div>
             </div>
          </div>
          <div className="header-action-wrap">
            <div className="export-dropdown">
              <button
                type="button"
                className="btn-export-toggle"
                onClick={() => setShowExport((prev) => !prev)}
              >
                <FaFileExport /> Ekspor
              </button>
              {showExport && (
                <div className="menu-export">
                  <button type="button" onClick={handleExportPDF}>
                    <FaFilePdf /> Ekspor PDF
                  </button>
                  <button type="button" onClick={handleExportExcel}>
                    <FaFileExcel /> Ekspor Excel
                  </button>
                </div>
              )}
            </div>

            <Link to="/waka/kehadiran-guru" className="kehadiran-guru-show-back">
              <FaArrowLeft /> Kembali
            </Link>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="kehadiran-guru-show-stats grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Presensi</p>
              <h3 className="text-2xl font-black text-gray-900">{history.length}</h3>
           </div>
           <div className="p-6 bg-green-50 rounded-2xl border border-green-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Hadir</p>
              <h3 className="text-2xl font-black text-green-700">{history.filter(h => h.status === 'present').length}</h3>
           </div>
           <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1">Terlambat</p>
              <h3 className="text-2xl font-black text-yellow-700">{history.filter(h => h.status === 'late').length}</h3>
           </div>
           <div className="p-6 bg-red-50 rounded-2xl border border-red-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Lainnya</p>
              <h3 className="text-2xl font-black text-red-700">{history.filter(h => h.status !== 'present' && h.status !== 'late').length}</h3>
           </div>
        </div>

        <div className="kehadiran-guru-show-table-container">
          <div className="kehadiran-guru-show-table-header">
            <div className="kehadiran-guru-show-table-header-inner">
              <h3 className="kehadiran-guru-show-table-title">
                <FaHistory className="mr-2" /> Riwayat Kehadiran
              </h3>
            </div>
          </div>

          <div className="kehadiran-guru-show-table-wrapper">
            {history.length === 0 ? (
              <div className="keadaan-kosong">
                <div className="wadah-ikon-kosong">
                  <FaHistory />
                </div>
                <div className="teks-kosong">
                  <p className="judul-kosong">Belum Ada Riwayat</p>
                  <p className="keterangan-kosong">Guru ini belum memiliki catatan kehadiran terdaftar.</p>
                </div>
              </div>
            ) : (
              <table className="kehadiran-guru-show-table">
                <thead>
                  <tr>
                    <th>Waktu Presensi</th>
                    <th className="th-tengah">Status</th>
                    <th>Catatan</th>
                    <th className="th-tengah">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => {
                    const statusInfo = statusConfig[h.status] || { 
                      label: h.status, 
                      bg: 'bg-gray-100 text-gray-600 border-gray-200', 
                      icon: <FaInfoCircle /> 
                    };
                    const dateObj = new Date(h.date);

                    return (
                      <tr key={h.id}>
                        <td>
                          <div className="flex items-center gap-3">
                             <div className="lencana-angka font-black text-xs flex-col !h-12 !w-12">
                                <span className="text-[8px] opacity-60 uppercase">{dateObj.toLocaleDateString('id-ID', { month: 'short' })}</span>
                                <span>{dateObj.getDate()}</span>
                             </div>
                             <div className="flex flex-col">
                                <span className="font-bold">{dateObj.toLocaleDateString('id-ID', { weekday: 'long' })}</span>
                                <span className="text-[10px] text-gray-400 font-bold tracking-tight uppercase">
                                  {h.checked_in_at ? new Date(h.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Tidak tercatat'}
                                </span>
                             </div>
                          </div>
                        </td>
                        <td className="td-tengah">
                          <span className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-wider ${statusInfo.bg}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="text-gray-500 font-medium italic text-sm">
                          {h.reason || '-'}
                        </td>
                        <td className="td-tengah">
                          <div className="aksi-row">
                            <button
                              className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                              onClick={() => handleEditClick(h)}
                              title="Ubah Status"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 disabled:opacity-50"
                              onClick={() => handleVoidAttendance(h)}
                              disabled={voidingId === h.id}
                              title="Batalkan Presensi"
                            >
                              {voidingId === h.id ? <FaSpinner className="animate-spin" size={14} /> : <FaTrash size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* MODAL EDIT */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
              <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                       <FaEdit size={20} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-gray-900">Ubah Status</h3>
                       <p className="text-xs text-gray-500 font-bold">
                         Presensi tanggal {selectedAttendance?.date ? new Date(selectedAttendance.date).toLocaleDateString('id-ID') : "-"}
                       </p>
                    </div>
                 </div>
                 <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                    <FaTimes size={20} />
                 </button>
              </div>

              <div className="p-8">
                 <div className="space-y-3">
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedStatus(key)}
                        className={`w-full p-4 flex items-center justify-between rounded-2xl border-2 transition-all group ${
                          selectedStatus === key 
                            ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100" 
                            : "border-gray-50 hover:border-gray-200 bg-gray-50/30"
                        }`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${config.bg} transition-transform group-hover:scale-110`}>
                               {config.icon}
                            </div>
                            <span className={`font-black tracking-tight ${selectedStatus === key ? 'text-blue-700' : 'text-gray-700'}`}>
                               {config.label}
                            </span>
                         </div>
                         <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedStatus === key ? 'border-blue-600 bg-blue-600' : 'border-gray-200 bg-white'
                         }`}>
                            {selectedStatus === key && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                         </div>
                      </button>
                    ))}
                 </div>

                 <div className="mt-5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      rows={3}
                      placeholder="Tambahkan catatan perubahan status..."
                      className="w-full resize-none p-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-blue-500 outline-none"
                    />
                 </div>

                 <div className="flex gap-4 mt-8">
                    <button
                      className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all cursor-pointer"
                      onClick={() => setShowEditModal(false)}
                      disabled={submitting}
                    >
                      Batal
                    </button>
                    <button
                      className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      onClick={handleUpdate}
                      disabled={submitting}
                    >
                      {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      Simpan
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default KehadiranGuruShow;
