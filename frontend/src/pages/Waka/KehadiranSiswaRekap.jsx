import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import "./KehadiranSiswaRekap.css";
import NavbarWaka from "../../components/Waka/NavbarWaka";
import apiService from "../../utils/api";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaChevronRight,
  FaFileExport,
  FaFilePdf,
  FaFileExcel,
  FaEye,
  FaSpinner,
  FaDoorOpen,
  FaUserTie,
  FaHistory,
  FaCheckCircle,
  FaClock,
  FaInfoCircle,
  FaHeartbeat,
  FaRegTimesCircle,
  FaSignOutAlt,
  FaSearch,
  FaTimes,
  FaClipboardList
} from "react-icons/fa";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const statusConfig = {
  present: { label: 'Hadir', bg: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', icon: <FaCheckCircle />, color: "#1FA83D" },
  late: { label: 'Terlambat', bg: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500', icon: <FaClock />, color: "#d8bf1a" },
  excused: { label: 'Izin', bg: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: <FaInfoCircle />, color: "#2563eb" },
  sick: { label: 'Sakit', bg: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500', icon: <FaHeartbeat />, color: "#9A0898" },
  absent: { label: 'Alfa', bg: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', icon: <FaRegTimesCircle />, color: "#D90000" },
  return: { label: 'Pulang', bg: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500', icon: <FaSignOutAlt />, color: "#FF5F1A" }
};

export default function KehadiranSiswaRekap() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const classIdFromQuery = searchParams.get('class_id');
  const { id: classIdFromParams } = useParams();
  
  const id = classIdFromParams || classIdFromQuery;
  
  const [loading, setLoading] = useState(true);
  const [kelas, setKelas] = useState(null);
  const [rekapData, setRekapData] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedDateFrom, setSelectedDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [selectedDateTo, setSelectedDateTo] = useState(new Date().toISOString().split('T')[0]);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [studentHistory, setStudentHistory] = useState([]);

  useEffect(() => {
    if (id) {
        fetchInitialData();
    }
  }, [id]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [classRes, rekapRes] = await Promise.all([
        apiService.getClass(id),
        apiService.getWakaClassAttendanceSummary(id, { from: selectedDateFrom, to: selectedDateTo })
      ]);
      setKelas(classRes.data || classRes);
      setRekapData(rekapRes.data || rekapRes);
    } catch (error) {
      console.error("Error fetching initial rekap data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = async () => {
    setLoading(true);
    try {
        const rekapRes = await apiService.getWakaClassAttendanceSummary(id, { from: selectedDateFrom, to: selectedDateTo });
        setRekapData(rekapRes.data || rekapRes);
    } catch (error) {
        console.error("Error applying filter:", error);
    } finally {
        setLoading(false);
    }
  };

  const fetchStudentDetail = async (studentData) => {
    setSelectedStudent(studentData.student);
    setShowDetailModal(true);
    setModalLoading(true);
    try {
        const historyRes = await apiService.getStudentAttendance(studentData.student.id, {
            from: selectedDateFrom,
            to: selectedDateTo,
            per_page: -1
        });
        setStudentHistory(Array.isArray(historyRes) ? historyRes : (historyRes.data || []));
    } catch (error) {
        console.error("Error fetching student history:", error);
    } finally {
        setModalLoading(false);
    }
  };

  const handleExportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Rekap Kehadiran');

    ws.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'NISN', key: 'nisn', width: 15 },
      { header: 'Nama Siswa', key: 'nama', width: 30 },
      { header: 'Hadir', key: 'present', width: 10 },
      { header: 'Izin', key: 'excused', width: 10 },
      { header: 'Sakit', key: 'sick', width: 10 },
      { header: 'Alfa', key: 'absent', width: 10 },
      { header: 'Terlambat', key: 'late', width: 10 },
      { header: 'Pulang', key: 'return', width: 10 },
    ];

    rekapData.forEach((item, idx) => {
      ws.addRow({
        no: idx + 1,
        nisn: item.student?.nisn || '-',
        nama: item.student?.user?.name || '-',
        present: item.totals?.present || 0,
        excused: item.totals?.excused || 0,
        sick: item.totals?.sick || 0,
        absent: item.totals?.absent || 0,
        late: item.totals?.late || 0,
        return: item.totals?.return || 0,
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Rekap_${kelas?.name}_${selectedDateFrom}_${selectedDateTo}.xlsx`);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.text(`Rekap Kehadiran: ${kelas?.name}`, 14, 15);
    doc.text(`Periode: ${selectedDateFrom} - ${selectedDateTo}`, 14, 22);

    const tableData = rekapData.map((item, idx) => [
      idx + 1,
      item.student?.nisn || '-',
      item.student?.user?.name || '-',
      item.totals?.present || 0,
      item.totals?.excused || 0,
      item.totals?.sick || 0,
      item.totals?.absent || 0,
      item.totals?.late || 0,
      item.totals?.return || 0,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['No', 'NISN', 'Nama Siswa', 'H', 'I', 'S', 'A', 'T', 'P']],
      body: tableData,
    });

    doc.save(`Rekap_${kelas?.name}.pdf`);
    setShowExportMenu(false);
  };

  if (loading && !kelas) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-blue-600">
        <FaSpinner className="animate-spin text-4xl" />
      </div>
    );
  }

  return (
    <div className="kehadiran-siswa-rekap-root min-h-screen bg-gray-50 pb-12">
      <NavbarWaka />

      <div className="kehadiran-siswa-rekap-container">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
            <Link to="/waka/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <FaChevronRight className="text-[10px]" />
            <Link to="/waka/kehadiran-siswa" className="hover:text-blue-600 transition-colors">Kehadiran Siswa</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-blue-600 font-bold">Rekap {kelas?.name}</span>
        </div>

        {/* HEADER SECTION */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200">
                    <FaClipboardList className="text-4xl" />
                 </div>
                 <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Rekap Kehadiran</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                       <span className="flex items-center gap-2 text-gray-500 font-bold">
                          <FaDoorOpen className="text-blue-500" />
                          {kelas?.name}
                       </span>
                       <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                       <span className="flex items-center gap-2 text-gray-500 font-bold">
                          <FaUserTie className="text-blue-500" />
                          {kelas?.homeroom_teacher?.user?.name || 'Wali Kelas Tidak Set'}
                       </span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                 <div className="flex items-center bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        type="date"
                        className="kehadiran-siswa-rekap-date-input pl-11 pr-4 py-2 bg-transparent border-none focus:ring-0 font-bold text-gray-700 text-sm"
                        value={selectedDateFrom}
                        onChange={(e) => setSelectedDateFrom(e.target.value)}
                      />
                    </div>
                    <span className="px-2 text-gray-400 font-bold">-</span>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        type="date"
                        className="kehadiran-siswa-rekap-date-input pl-11 pr-4 py-2 bg-transparent border-none focus:ring-0 font-bold text-gray-700 text-sm"
                        value={selectedDateTo}
                        onChange={(e) => setSelectedDateTo(e.target.value)}
                      />
                    </div>
                 </div>
                 
                 <button 
                   onClick={handleApplyFilter}
                   disabled={loading}
                   className="px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                 >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                    <span>Filter</span>
                 </button>

                 <div className="relative">
                    <button 
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 shadow-lg shadow-gray-900/10 transition-all"
                    >
                       <FaFileExport />
                       <span>Ekspor</span>
                    </button>
                    {showExportMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                         <button 
                           onClick={handleExportExcel}
                           className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors font-bold text-gray-700"
                         >
                            <FaFileExcel className="text-green-600" /> Excel (.xlsx)
                         </button>
                         <button 
                           onClick={handleExportPDF}
                           className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors font-bold text-gray-700"
                         >
                            <FaFilePdf className="text-red-600" /> PDF (.pdf)
                         </button>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="kehadiran-siswa-rekap-table-wrap bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
           <div className="overflow-x-auto">
              <table className="kehadiran-siswa-rekap-table w-full">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Siswa</th>
                       <th className="px-4 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hadir</th>
                       <th className="px-4 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Izin</th>
                       <th className="px-4 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sakit</th>
                       <th className="px-4 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alfa</th>
                       <th className="px-4 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Late</th>
                       <th className="px-4 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pulang</th>
                       <th className="px-6 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {rekapData.length > 0 ? (
                      rekapData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold border border-gray-200 uppercase">
                                    {item.student?.user?.name?.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="font-bold text-gray-900">{item.student?.user?.name}</p>
                                    <p className="text-[10px] text-gray-500 font-medium tracking-wider">NISN: {item.student?.nisn || '-'}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-4 py-4 text-center text-blue-600 font-black">{item.totals?.present || 0}</td>
                           <td className="px-4 py-4 text-center text-blue-500 font-black">{item.totals?.excused || 0}</td>
                           <td className="px-4 py-4 text-center text-purple-600 font-black">{item.totals?.sick || 0}</td>
                           <td className="px-4 py-4 text-center text-red-600 font-black">{item.totals?.absent || 0}</td>
                           <td className="px-4 py-4 text-center text-yellow-600 font-black">{item.totals?.late || 0}</td>
                           <td className="px-4 py-4 text-center text-orange-600 font-black">{item.totals?.return || 0}</td>
                           <td className="px-6 py-4 text-right">
                              <button 
                                onClick={(e) => { e.stopPropagation(); fetchStudentDetail(item); }}
                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                              >
                                 <FaEye />
                              </button>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-20 text-center">
                           <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                              <FaHistory />
                           </div>
                           <p className="text-gray-400 font-bold">Tidak ada data rekap untuk periode ini</p>
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* BACK BUTTON */}
        <div className="mt-12 flex justify-center">
           <button 
             onClick={() => window.history.back()}
             className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all shadow-sm"
           >
              <FaArrowLeft />
              <span>Kembali</span>
           </button>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
           <div className="kehadiran-siswa-rekap-modal-content relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 pb-4 flex items-center justify-between">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-100 flex items-center justify-center text-gray-400 font-bold border border-gray-200 text-2xl uppercase">
                       {selectedStudent.user?.name?.charAt(0)}
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-gray-900">{selectedStudent.user?.name}</h3>
                       <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{kelas?.name}</p>
                    </div>
                 </div>
                 <button onClick={() => setShowDetailModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition-all">
                    <FaTimes />
                 </button>
              </div>

              <div className="p-8 overflow-y-auto">
                 {modalLoading ? (
                   <div className="py-20 text-center text-blue-600">
                      <FaSpinner className="animate-spin text-3xl mx-auto mb-4" />
                      <p className="font-bold">Memuat riwayat kehadiran...</p>
                   </div>
                 ) : (
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {Object.entries(statusConfig).map(([key, config]) => {
                            const count = studentHistory.filter(h => h.status.toLowerCase() === key).length;
                            return (
                               <div key={key} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                                  <div className="flex items-center gap-3 mb-1">
                                     <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{config.label}</span>
                                  </div>
                                  <p className="text-2xl font-black text-gray-900">{count}</p>
                               </div>
                            );
                         })}
                      </div>

                      <div className="kehadiran-siswa-rekap-modal-table-wrap bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden">
                         <table className="kehadiran-siswa-rekap-modal-table w-full text-left">
                            <thead>
                               <tr className="bg-white/50">
                                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tanggal</th>
                                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mata Pelajaran</th>
                                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Keterangan</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               {studentHistory.length > 0 ? studentHistory.map((item, idx) => {
                                 const config = statusConfig[item.status.toLowerCase()] || statusConfig.present;
                                 return (
                                   <tr key={idx} className="bg-white/30">
                                      <td className="px-6 py-4">
                                         <p className="font-bold text-gray-800 text-sm">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                         <p className="text-[10px] text-gray-500 font-bold uppercase">{item.schedule?.start_time.substring(0,5)} - {item.schedule?.end_time.substring(0,5)}</p>
                                      </td>
                                      <td className="px-6 py-4 font-bold text-gray-700 text-sm">
                                         {item.schedule?.subject?.name}
                                         <p className="text-[10px] text-gray-400 font-medium">Oleh: {item.schedule?.teacher?.user?.name}</p>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                         <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bg} text-[10px] font-bold uppercase tracking-wide`}>
                                            {config.label}
                                         </div>
                                      </td>
                                      <td className="px-6 py-4 italic text-gray-500 text-xs">
                                         {item.notes || '-'}
                                      </td>
                                   </tr>
                                 );
                               }) : (
                                 <tr>
                                    <td colSpan="4" className="py-10 text-center text-gray-400 font-medium">Tidak ada riwayat untuk periode ini</td>
                                 </tr>
                               )}
                            </tbody>
                         </table>
                      </div>
                   </div>
                 )}
              </div>

              <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                 <button 
                   onClick={() => setShowDetailModal(false)}
                   className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg"
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
