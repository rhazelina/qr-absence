import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaChevronDown,
  FaBriefcase,
  FaDoorOpen,
  FaUpload,
  FaDownload,
  FaSpinner,
  FaChevronRight,
  FaSearch,
  FaCalendarAlt,
  FaUserTie,
  FaLayerGroup,
  FaExclamationTriangle,
  FaTimes
} from "react-icons/fa";
import apiService from '../../utils/api';

function JadwalSiswaIndex() {
  const [schedules, setSchedules] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filters
  const [filterKompetensi, setFilterKompetensi] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  
  // Master Data for Filters
  const [classes, setClasses] = useState([]);
  const [majors, setMajors] = useState([]);

  // Import states
  const fileInputRef = useRef(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importErrors, setImportErrors] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, classesRes] = await Promise.all([
        apiService.get('/schedules'),
        apiService.get('/classes')
      ]);
      
      const schedulesData = schedulesRes.data || schedulesRes;
      const classesData = classesRes.data || classesRes;

      setSchedules(schedulesData);
      setFilteredData(schedulesData);
      setClasses(classesData);

      const extractedMajors = [];
      classesData.forEach(c => {
          const majorName = c.major?.name || c.major_name || c.department;
          if (majorName && !extractedMajors.find(m => m.value === majorName)) {
              extractedMajors.push({ label: majorName, value: majorName });
          }
      });
      
      if (extractedMajors.length === 0) {
           const parsedMajors = [...new Set(classesData.map(c => {
               const name = c.name || '';
               const parts = name.split(' ');
               return parts.length > 1 ? parts[1] : null;
           }))].filter(Boolean);
           parsedMajors.forEach(m => extractedMajors.push({ label: m, value: m }));
      }
      setMajors(extractedMajors);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = schedules;

    if (filterKompetensi) {
      filtered = filtered.filter((item) => {
        const majorName = item.class?.major?.name || item.class?.major_name || item.class?.department || '';
        const className = item.class?.name || '';
        return majorName === filterKompetensi || className.includes(filterKompetensi);
      });
    }

    if (filterKelas) {
      filtered = filtered.filter(
        (item) => item.class?.name === filterKelas
      );
    }

    setFilteredData(filtered);
  }, [filterKompetensi, filterKelas, schedules]);

  const handleCreate = () => {
    navigate('/waka/jadwal-siswa/create');
  };

  const handleView = (e, id) => {
    e.preventDefault();
    navigate(`/waka/jadwal-siswa/${id}`);
  };

  const handleEdit = (e, id) => {
    e.preventDefault();
    navigate(`/waka/jadwal-siswa/${id}/edit`);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      await apiService.delete(`/schedules/${id}`);
      fetchData();
      alert('Jadwal berhasil dihapus');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Terjadi kesalahan saat menghapus data');
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Mata Pelajaran': 'Matematika',
        'NIP Guru': '198001012005011001',
        'Nama Kelas': 'X RPL 1',
        'Semester (ganjil/genap)': 'ganjil',
        'Tahun Ajaran (ex: 2024/2025)': '2024/2025',
        'Hari (Senin-Minggu)': 'senin',
        'Jam Mulai (HH:MM)': '07:00',
        'Jam Selesai (HH:MM)': '08:30'
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Jadwal');
    XLSX.writeFile(workbook, 'Format_Jadwal.xlsx');
  };

  const handleImportFromExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

        if (jsonData.length === 0) {
          alert('File Excel kosong!');
          return;
        }

        const importedSchedules = jsonData.map(row => ({
          subject_name: String(row['Mata Pelajaran'] || '').trim(),
          teacher_nip: String(row['NIP Guru'] || '').trim(),
          class_name: String(row['Nama Kelas'] || '').trim(),
          semester: String(row['Semester (ganjil/genap)'] || '').trim().toLowerCase(),
          year: String(row['Tahun Ajaran (ex: 2024/2025)'] || '').trim(),
          day: String(row['Hari (Senin-Minggu)'] || '').trim().toLowerCase(),
          start_time: String(row['Jam Mulai (HH:MM)'] || '').trim(),
          end_time: String(row['Jam Selesai (HH:MM)'] || '').trim()
        }));

        try {
          const result = await apiService.post('/import/jadwal', { items: importedSchedules });
          alert(`Sukses mengimpor ${result.success_count || 0} data jadwal!`);
          fetchData();
        } catch (error) {
           if (error.response?.data?.errors) {
            setImportErrors({
              failed: error.response.data.failed_count,
              total: error.response.data.total_rows,
              success: error.response.data.success_count,
              details: error.response.data.errors
            });
            setIsImportModalOpen(true);
          } else {
            alert('Gagal mengimpor data jadwal. Pastikan format file sesuai template.');
          }
        }
      } catch (error) {
        console.error('Error reading excel file:', error);
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NavbarWaka />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
            <Link to="/waka/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-blue-600 font-bold">Jadwal Siswa</span>
        </div>

        {/* HEADER SECTION */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200">
                    <FaLayerGroup className="text-4xl" />
                 </div>
                 <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Jadwal Siswa</h1>
                    <p className="text-gray-500 font-bold mt-1">Kelola pembagian waktu belajar per kelas</p>
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                 <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".xlsx, .xls"
                    onChange={handleImportFromExcel}
                 />
                 <button 
                   onClick={() => fileInputRef.current.click()}
                   className="px-6 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                 >
                    <FaUpload />
                    <span>Impor</span>
                 </button>
                 <button 
                   onClick={handleDownloadTemplate}
                   className="px-6 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                 >
                    <FaDownload />
                    <span>Format</span>
                 </button>
                 <button 
                   onClick={handleCreate}
                   className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                 >
                    <FaPlus />
                    <span>Tambah</span>
                 </button>
              </div>
           </div>
        </div>

        {/* FILTER CARD */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Konsentrasi Keahlian</label>
                 <div className="relative group">
                    <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-600" />
                    <select
                      value={filterKompetensi}
                      onChange={(e) => setFilterKompetensi(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-gray-700 outline-none appearance-none"
                    >
                      <option value="">Semua Konsentrasi</option>
                      {majors.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 </div>
              </div>

              <div className="lg:col-span-2">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Cari Kelas</label>
                 <div className="relative group">
                    <FaDoorOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-600" />
                    <select
                      value={filterKelas}
                      onChange={(e) => setFilterKelas(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-gray-700 outline-none appearance-none"
                    >
                      <option value="">Semua Kelas</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 </div>
              </div>
           </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
           {loading ? (
             <div className="p-20 text-center">
                <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Memuat data jadwal...</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-gray-50/50">
                         <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">No</th>
                         <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kelas</th>
                         <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wali Kelas</th>
                         <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bidang Keahlian</th>
                         <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {filteredData.length > 0 ? (
                        filteredData.map((schedule, index) => (
                          <tr key={schedule.id} className="group hover:bg-gray-50/30 transition-colors">
                             <td className="px-8 py-4 font-bold text-gray-400">{index + 1}</td>
                             <td className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                      <FaDoorOpen />
                                   </div>
                                   <p className="font-black text-gray-900">{schedule.class?.name || '-'}</p>
                                </div>
                             </td>
                             <td className="px-8 py-4">
                                <p className="font-bold text-gray-700">{schedule.class?.homeroom_teacher?.user?.name || schedule.class?.teacher_name || '-'}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Homeroom Teacher</p>
                             </td>
                             <td className="px-8 py-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 text-[10px] font-bold uppercase tracking-wide">
                                   {schedule.class?.major?.name || schedule.class?.major_name || schedule.class?.department || '-'}
                                </div>
                             </td>
                             <td className="px-8 py-4">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={(e) => handleView(e, schedule.id)}
                                     className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                                     title="Lihat Detail"
                                   >
                                      <FaEye />
                                   </button>
                                   <button 
                                     onClick={(e) => handleEdit(e, schedule.id)}
                                     className="p-3 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-600 hover:text-white transition-all shadow-sm border border-yellow-100"
                                     title="Edit Jadwal"
                                   >
                                      <FaEdit />
                                   </button>
                                   <button 
                                     onClick={(e) => handleDelete(e, schedule.id)}
                                     className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                                     title="Hapus Jadwal"
                                   >
                                      <FaTrash />
                                   </button>
                                </div>
                             </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                           <td colSpan="5" className="py-20 text-center">
                              <FaLayerGroup className="text-5xl text-gray-100 mx-auto mb-4" />
                              <p className="text-gray-400 font-bold tracking-tight">Tidak ada jadwal ditemukan</p>
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
           )}
        </div>
      </div>

      {/* IMPORT ERROR MODAL */}
      {isImportModalOpen && importErrors && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)} />
           <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-modal-in">
              <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                       <FaExclamationTriangle className="text-xl" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-gray-900">Gagal Impor Jadwal</h3>
                       <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Laporan Kesalahan</p>
                    </div>
                 </div>
                 <button onClick={() => setIsImportModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition-all">
                    <FaTimes />
                 </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto">
                 <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                       <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Baris</p>
                          <p className="text-xl font-black text-gray-900">{importErrors.total}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1">Berhasil</p>
                          <p className="text-xl font-black text-green-600">{importErrors.success}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Gagal</p>
                          <p className="text-xl font-black text-red-600">{importErrors.failed}</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    {importErrors.details.map((err, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                         <div className="w-20 font-black text-gray-400 text-xs uppercase pt-1">Baris {err.row}</div>
                         <p className="flex-1 text-sm font-bold text-gray-700 leading-relaxed">{err.message}</p>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="p-8 bg-gray-50/50 border-t border-gray-100 text-center">
                 <button 
                   onClick={() => setIsImportModalOpen(false)}
                   className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg"
                 >
                    Mengerti, Saya Akan Perbaiki
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default JadwalSiswaIndex;
