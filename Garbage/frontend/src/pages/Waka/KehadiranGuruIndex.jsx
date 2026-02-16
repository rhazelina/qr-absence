import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KehadiranGuruIndex.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { FaCalendar, FaClock, FaFileExport, FaFilePdf, FaFileExcel, FaEye, FaSpinner } from 'react-icons/fa';
import { wakaService } from '../../services/waka';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

function KehadiranGuruIndex() {
  const navigate = useNavigate();
  const [kehadirans, setKehadirans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTanggal, setFilterTanggal] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [showExport, setShowExport] = useState(false);
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
        const data = await wakaService.getTeachersDailyAttendance(filterTanggal);
        // data.items could be paginated object or array. 
        // In controller: teachers -> paginate. 
        // response -> { date, items: paginated_object } or { date, items: [...] }?
        // Controller: return response()->json([ 'date' => $date, 'items' => $teachers ]);
        // $teachers is LengthAwarePaginator.
        // So data.items.data contains the array.
        const list = data.items.data || [];
        
        setKehadirans(list);
    } catch (error) {
        console.error("Failed to fetch teacher attendance:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterTanggal]);

  // --- FUNGSI EKSPOR PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const title = `Laporan Kehadiran Guru - ${filterTanggal}`;
    
    doc.setFontSize(14);
    doc.text(title, 14, 15);

    const headers = [["No", "NIP", "Nama Guru", "Status", "Waktu Check-in"]];
    const data = kehadirans.map((k, i) => [
      i + 1,
      k.teacher.nip || '-',
      k.teacher.user?.name || 'Guru',
      k.status,
      k.attendance?.checked_in_at || '-'
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 22,
      theme: 'grid',
      styles: { fontSize: 10, halign: 'center' },
      headStyles: { fillColor: [44, 62, 80] },
      columnStyles: { 2: { halign: 'left' } }
    });

    doc.save(`Kehadiran_Guru_${filterTanggal}.pdf`);
    setShowExport(false);
  };

  // --- FUNGSI EKSPOR EXCEL ---
  const handleExportExcel = () => {
    const dataExcel = kehadirans.map((k, i) => ({
      No: i + 1,
      'NIP': k.teacher.nip || '-',
      'Nama Guru': k.teacher.user?.name || 'Guru',
      'Status': k.status,
      'Waktu Check-in': k.attendance?.checked_in_at || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kehadiran");
    XLSX.writeFile(workbook, `Kehadiran_Guru_${filterTanggal}.xlsx`);
    setShowExport(false);
  };

  return (
    <div className="kehadiran-guru-index-container">
      <NavbarWaka />
      <div className="kehadiran-guru-index-header">
        <div>
          <h1>Kehadiran Guru</h1>
          <p>Kelola dan monitor kehadiran guru (Check-in Harian)</p>
        </div>

        <div className="kehadiran-guru-index-export-wrapper">
          <button
            className="kehadiran-guru-index-export-btn"
            onClick={() => setShowExport(prev => !prev)}
          >
            <FaFileExport />
            Ekspor
          </button>

          {showExport && (
            <div className="kehadiran-guru-index-export-menu">
               {/* Simplified export for single date for now since logic relies on filterTanggal */}
              <button
                className="export-item pdf"
                onClick={handleExportPDF}
              >
                <FaFilePdf /> PDF
              </button>

              <button
                className="export-item excel"
                onClick={handleExportExcel}
              >
                <FaFileExcel /> Excel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="kehadiran-guru-index-filter-wrapper">
        <div className="kehadiran-guru-index-filter-grid">
          <div className="kehadiran-guru-index-filter-item">
            <label className="kehadiran-guru-index-filter-label">
              <FaCalendar className='kehadiran-guru-index-filter-icon' />
              Tanggal
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

      <div className="kehadiran-guru-index-table-container">
        <div className="kehadiran-guru-index-table-header">
          <div className="kehadiran-guru-index-table-header-inner">
            <h3 className="kehadiran-guru-index-table-title">
              Daftar Kehadiran Guru ({kehadirans.length})
            </h3>
          </div>
        </div>

        {loading ? (
             <div className="kontainer-loading">
                <div className="teks-loading">
                  <FaSpinner /> Loading...
                </div>
             </div>
        ) : (
        <div className="kehadiran-guru-index-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>NIP</th>
                <th>Nama Guru</th>
                <th>Status</th>
                <th>Waktu Check-in</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kehadirans.length > 0 ? (
                  kehadirans.map((k, i) => (
                  <tr key={k.teacher.id}>
                    <td>{i + 1}</td>
                    <td><span className="kehadiran-guru-index-badge">{k.teacher.nip || '-'}</span></td>
                    <td>{k.teacher.user?.name || 'Guru'}</td>
                    <td>
                        <span className={`badge-status status-${k.status.toLowerCase().replace(' ', '-')}`}>
                            {k.status.charAt(0).toUpperCase() + k.status.slice(1)}
                        </span>
                    </td>
                    <td>{k.attendance?.checked_in_at || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="kehadiran-guru-action-btn"
                        onClick={() => navigate(`/waka/kehadiran-guru/${k.teacher.id}`)}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Tidak ada data kehadiran guru pada tanggal ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}

export default KehadiranGuruIndex;