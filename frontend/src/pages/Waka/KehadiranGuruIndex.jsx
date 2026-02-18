import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './KehadiranGuruIndex.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import {
  FaCalendarAlt,
  FaClock,
  FaFileExport,
  FaFilePdf,
  FaFileExcel,
  FaEye,
  FaTrash,
  FaChevronRight,
  FaUserTie,
  FaCheckCircle,
  FaInfoCircle,
  FaHeartbeat,
  FaRegTimesCircle,
  FaSignOutAlt,
  FaBriefcase,
  FaHome,
  FaSpinner
} from 'react-icons/fa';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import apiService from '../../utils/api';

function KehadiranGuruIndex() {
  const navigate = useNavigate();
  const [kehadirans, setKehadirans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const [filterTanggal, setFilterTanggal] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, namaGuru: '' });
  const [showExport, setShowExport] = useState(false);

  // Status mapping for the grid
  const statusColors = {
    present: 'jam-hadir',
    late: 'jam-terlambat',
    excused: 'jam-izin',
    sick: 'jam-sakit',
    absent: 'jam-alfa',
    return: 'jam-pulang',
    dinas: 'jam-dinas',
  };

  const statusLabels = {
    present: 'Hadir',
    late: 'Terlambat',
    excused: 'Izin',
    sick: 'Sakit',
    absent: 'Alfa',
    return: 'Pulang',
    dinas: 'Dinas',
  };

  useEffect(() => {
    if (filterTanggal) {
      fetchKehadiranGuru();
    }
  }, [filterTanggal]);

  const fetchKehadiranGuru = async () => {
    setLoading(true);
    try {
      const result = await apiService.getDailyTeacherAttendance(filterTanggal, { per_page: 100 });
      setKehadirans(result.items.data || []);
      setPagination(result.items);
    } catch (error) {
      console.error('Error fetching kehadiran guru:', error);
      alert('Terjadi kesalahan saat memuat data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    try {
      await apiService.voidAttendance(id);
      setKehadirans(prev => prev.map(item => {
        if (item.attendances) {
          return {
            ...item,
            attendances: item.attendances.filter(a => a.id !== id),
            status: item.attendances.length > 1 ? item.status : 'absent'
          };
        }
        return item;
      }));
      setDeleteModal({ show: false, id: null, namaGuru: '' });
      alert('Data kehadiran berhasil dibatalkan');
    } catch (error) {
      console.error('Error deleting kehadiran:', error);
      alert('Gagal membatalkan kehadiran: ' + error.message);
    }
  };

  // Helper to map attendances to 10 slots
  const getAttendanceSlots = (attendances = []) => {
    const slots = Array(10).fill(null);
    
    // Sort attendances by start_time if possible, or just use sequence
    const sorted = [...attendances].sort((a, b) => {
      const timeA = a.schedule?.start_time || '00:00';
      const timeB = b.schedule?.start_time || '00:00';
      return timeA.localeCompare(timeB);
    });

    sorted.forEach((att, idx) => {
      if (idx < 10) {
        slots[idx] = att.status;
      }
    });

    return slots;
  };

  // --- FUNGSI EKSPOR PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const title = `Laporan Kehadiran Guru - ${filterTanggal}`;

    doc.setFontSize(14);
    doc.text(title, 14, 15);

    const headers = [["No", "Kode Guru", "Nama Guru", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]];
    const data = kehadirans.map((k, i) => {
      const slots = getAttendanceSlots(k.attendances);
      return [
        i + 1,
        k.teacher.kode_guru || '-',
        k.teacher.user?.name || '-',
        ...slots.map(s => s ? statusLabels[s] || s : '-')
      ];
    });

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 22,
      theme: 'grid',
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [13, 40, 71] },
      columnStyles: { 2: { halign: 'left' } }
    });

    doc.save(`Kehadiran_Guru_${filterTanggal}.pdf`);
    setShowExport(false);
  };

  // --- FUNGSI EKSPOR EXCEL ---
  const handleExportExcel = () => {
    const dataExcel = kehadirans.map((k, i) => {
      const slots = getAttendanceSlots(k.attendances);
      const row = {
        No: i + 1,
        'Kode Guru': k.teacher.kode_guru || '-',
        'Nama Guru': k.teacher.user?.name || '-',
      };
      slots.forEach((s, idx) => {
        row[`Jam ${idx + 1}`] = s ? statusLabels[s] || s : '-';
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kehadiran");
    XLSX.writeFile(workbook, `Kehadiran_Guru_${filterTanggal}.xlsx`);
    setShowExport(false);
  };

  if (loading) {
    return (
      <div className="wadah-muat">
        <div className="konten-muat">
          <FaSpinner />
          <span>Sinkronisasi data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="kehadiran-guru-index-container">
      <NavbarWaka />
      
      <div className="kehadiran-guru-index-header">
        <div>
          <h1>Kehadiran Guru</h1>
          <p>Monitor kehadiran mengajar guru harian</p>
        </div>

        <div className="kehadiran-guru-index-export-wrapper">
          <button
            className="kehadiran-guru-index-export-btn"
            onClick={() => setShowExport(prev => !prev)}
          >
            <FaFileExport />
            Ekspor Laporan
          </button>

          {showExport && (
            <div className="kehadiran-guru-index-export-menu">
              <div className="export-date-range">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 mb-2">Pilih Format</p>
              </div>
              <button className="export-item pdf" onClick={handleExportPDF}>
                <FaFilePdf /> PDF Document
              </button>
              <button className="export-item excel" onClick={handleExportExcel}>
                <FaFileExcel /> Excel Spreadsheet
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FILTER CARD */}
      <div className="kehadiran-guru-index-filter-wrapper">
        <div className="kehadiran-guru-index-filter-grid">
          <div className="kehadiran-guru-index-filter-item">
            <label className="kehadiran-guru-index-filter-label">
              <FaCalendarAlt className='kehadiran-guru-index-filter-icon' />
              Halaman Tanggal
            </label>
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
              className="kehadiran-guru-index-filter-input"
            />
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="kehadiran-guru-index-table-container">
        <div className="kehadiran-guru-index-table-header">
          <div className="kehadiran-guru-index-table-header-inner">
            <h3 className="kehadiran-guru-index-table-title">
              Daftar Kehadiran Guru ({kehadirans.length})
            </h3>
          </div>
        </div>

        {/* LEGEND */}
        <div className="kehadiran-guru-legend">
          <div className="legend-item"><span className="legend-dot legend-hadir"></span><span className="legend-text">Hadir</span></div>
          <div className="legend-item"><span className="legend-dot legend-terlambat"></span><span className="legend-text">Terlambat</span></div>
          <div className="legend-item"><span className="legend-dot legend-alfa"></span><span className="legend-text">Alfa</span></div>
          <div className="legend-item"><span className="legend-dot legend-izin"></span><span className="legend-text">Izin</span></div>
          <div className="legend-item"><span className="legend-dot legend-sakit"></span><span className="legend-text">Sakit</span></div>
          <div className="legend-item"><span className="legend-dot legend-pulang"></span><span className="legend-text">Pulang</span></div>
          <div className="legend-item"><span className="legend-dot legend-tidak-mengajar"></span><span className="legend-text">Tidak Mengajar</span></div>
        </div>

        <div className="kehadiran-guru-index-table-wrapper">
          {kehadirans.length === 0 ? (
            <div className="keadaan-kosong">
              <div className="wadah-ikon-kosong">
                <FaUserTie />
              </div>
              <div className="teks-kosong">
                <p className="judul-kosong">Data Tidak Ditemukan</p>
                <p className="keterangan-kosong">Belum ada rekaman kehadiran untuk tanggal {new Date(filterTanggal).toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th rowSpan={2}>No</th>
                  <th rowSpan={2}>Kode</th>
                  <th rowSpan={2}>Nama Guru</th>
                  <th colSpan={10} style={{ textAlign: 'center', fontWeight: '800' }}>Jam Pelajaran Ke-</th>
                  <th rowSpan={2} style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
                <tr>
                  {[...Array(10)].map((_, i) => (
                    <th key={i} style={{ textAlign: 'center' }}>{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kehadirans.map((k, i) => {
                  const slots = getAttendanceSlots(k.attendances);
                  return (
                    <tr key={k.teacher.id}>
                      <td>
                        <span className="lencana-angka">{i + 1}</span>
                      </td>
                      <td>
                        <span className="kehadiran-guru-index-badge">{k.teacher.kode_guru || '-'}</span>
                      </td>
                      <td className="kehadiran-guru-index-col-nama">
                        {k.teacher.user?.name}
                      </td>
                      {slots.map((status, idx) => (
                        <td key={idx} style={{ textAlign: 'center' }}>
                          <span className={`jam-box ${status ? statusColors[status] || 'jam-hadir' : 'jam-tidak-mengajar'}`}></span>
                        </td>
                      ))}
                      <td style={{ textAlign: 'center' }}>
                        <div className="flex items-center justify-center gap-2">
                           {k.attendances && k.attendances.length > 0 && (
                             <button
                               className="kehadiran-guru-action-btn"
                               style={{ backgroundColor: '#dc2626' }}
                               onClick={() => setDeleteModal({ show: true, id: k.attendances[0].id, namaGuru: k.teacher.user?.name })}
                               title="Batalkan Kehadiran Terbaru"
                             >
                               <FaTrash />
                             </button>
                           )}
                           <button
                             className="kehadiran-guru-action-btn"
                             onClick={() => navigate(`/waka/kehadiran-guru/${k.teacher.id}`)}
                             title="Lihat Detail Riwayat"
                           >
                             <FaEye />
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

      {/* DELETE MODAL */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border border-gray-100 p-8">
             <div className="bg-red-50 text-red-600 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-100 border border-red-100">
                <FaTrash size={32} />
             </div>
            <h3 className="text-2xl font-black text-center text-gray-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-500 text-center font-bold mb-8">Apakah Anda yakin ingin membatalkan kehadiran untuk <strong>{deleteModal.namaGuru}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-4">
              <button
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all cursor-pointer"
                onClick={() => setDeleteModal({ show: false, id: null, namaGuru: '' })}
              >
                Kembali
              </button>
              <button
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-200 cursor-pointer"
                onClick={() => handleDelete(deleteModal.id)}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KehadiranGuruIndex;