import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KehadiranGuruIndex.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { FaCalendar, FaClock, FaFileExport, FaFilePdf, FaFileExcel, FaEye } from 'react-icons/fa';

// Import library untuk fungsi ekspor
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

function KehadiranGuruIndex() {
  const navigate = useNavigate();
  const [kehadirans, setKehadirans] = useState([
    {
      id: 1,
      guru: {
        kode_guru: 'GR001',
        nama: 'Budi Santoso, S.Pd',
        kelas: 'XI RPL 1'
      },
      jam: [
        'Hadir', 'Hadir', 'Hadir', 'Hadir', 'Hadir',
        'Hadir', 'Alpha', 'Alpha', 'Alpha', 'Alpha'
      ]
    },
    {
      id: 2,
      guru: {
        kode_guru: 'GR002',
        nama: 'Siti Aminah, S.Pd',
        kelas: 'XI RPL 2'
      },
      jam: [
        'Hadir',
        'Terlambat',
        'Hadir',
        'Hadir',
        'Izin',
        'Hadir',
        'Alpha',
        'Alpha',
        '',
        ''
      ]
    }
  ]);

  const [filterJam, setFilterJam] = useState('');
  const [filterTanggal, setFilterTanggal] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, namaGuru: '' });
  const [qrModal, setQrModal] = useState({ show: false, kodeGuru: '', namaGuru: '' });
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const statusConfig = {
    Hadir: { bg: 'status-hadir', icon: 'fa-check-circle' },
    Terlambat: { bg: 'status-terlambat', icon: 'fa-clock' },
    Izin: { bg: 'status-izin', icon: 'fa-info-circle' },
    Sakit: { bg: 'status-sakit', icon: 'fa-heartbeat' },
    Alpha: { bg: 'status-alpha', icon: 'fa-times-circle' },
    Pulang: { bg: 'status-pulang', icon: 'fas fa-sign-out-alt' },
    'Belum Absen': { bg: 'status-belum', icon: 'fa-question-circle' },
    'Tidak Mengajar': { bg: 'status-tidak-mengajar', icon: 'fa-minus-circle' }
  };

  const handleDelete = (id) => {
    setKehadirans(prev => prev.filter(k => k.id !== id));
    setDeleteModal({ show: false, id: null, namaGuru: '' });
  };

  useEffect(() => {
    const esc = (e) => {
      if (e.key === 'Escape') {
        setDeleteModal({ show: false, id: null, namaGuru: '' });
        setQrModal({ show: false, kodeGuru: '', namaGuru: '' });
      }
    };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  const hitungStatus = (jamArray) => {
    const count = {
      Hadir: 0,
      Terlambat: 0,
      Alpha: 0,
      Izin: 0,
      Sakit: 0
    };

    jamArray.forEach(j => {
      if (count[j] !== undefined) count[j]++;
    });

    return Object.keys(count).reduce((a, b) =>
      count[a] > count[b] ? a : b
    );
  };

  const [showExport, setShowExport] = useState(false);
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');

  // --- FUNGSI EKSPOR PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const title = `Laporan Kehadiran Guru - ${exportFrom || filterTanggal} s/d ${exportTo || filterTanggal}`;
    
    doc.setFontSize(14);
    doc.text(title, 14, 15);

    const headers = [["No", "Kode Guru", "Nama Guru", "Kelas", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]];
    const data = kehadirans.map((k, i) => [
      i + 1,
      k.guru.kode_guru,
      k.guru.nama,
      k.guru.kelas,
      ...k.jam.map(j => j || '-')
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 22,
      theme: 'grid',
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [44, 62, 80] },
      columnStyles: { 2: { halign: 'left' } } // Nama guru rata kiri
    });

    doc.save(`Kehadiran_Guru_${filterTanggal}.pdf`);
    setShowExport(false);
  };

  // --- FUNGSI EKSPOR EXCEL ---
  const handleExportExcel = () => {
    const dataExcel = kehadirans.map((k, i) => {
      const row = {
        No: i + 1,
        'Kode Guru': k.guru.kode_guru,
        'Nama Guru': k.guru.nama,
        'Kelas': k.guru.kelas,
      };
      k.jam.forEach((status, idx) => {
        row[`Jam ${idx + 1}`] = status || 'Tidak Mengajar';
      });
      return row;
    });

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
          <p>Kelola dan monitor kehadiran mengajar guru</p>
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
              <div className="export-date-range">
                <label>Dari Tanggal</label>
                <input
                  type="date"
                  value={exportFrom}
                  onChange={(e) => setExportFrom(e.target.value)}
                />

                <label>Sampai Tanggal</label>
                <input
                  type="date"
                  value={exportTo}
                  onChange={(e) => setExportTo(e.target.value)}
                />
              </div>

              <div className="export-divider"></div>

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

        <div className="kehadiran-guru-legend">
          <div className="legend-item"><span className="legend-dot legend-hadir"></span><span className="legend-text">Hadir</span></div>
          <div className="legend-item"><span className="legend-dot legend-terlambat"></span><span className="legend-text">Terlambat</span></div>
          <div className="legend-item"><span className="legend-dot legend-alpha"></span><span className="legend-text">Alpha</span></div>
          <div className="legend-item"><span className="legend-dot legend-izin"></span><span className="legend-text">Izin</span></div>
          <div className="legend-item"><span className="legend-dot legend-sakit"></span><span className="legend-text">Sakit</span></div>
          <div className="legend-item"><span className="legend-dot legend-pulang"></span><span className="legend-text">Pulang</span></div>
          <div className="legend-item"><span className="legend-dot legend-tidak-mengajar"></span><span className="legend-text">Tidak Mengajar</span></div>
        </div>

        <div className="kehadiran-guru-index-table-wrapper">
          <table>
            <thead>
              <tr>
                <th rowSpan={2}>No</th>
                <th rowSpan={2}>Kode Guru</th>
                <th rowSpan={2}>Nama Guru</th>
                <th rowSpan={2}>Kelas</th>
                <th colSpan={10} style={{ textAlign: 'center', fontWeight: '800' }}>Jam Pelajaran Ke-</th>
                <th rowSpan={2}>Aksi</th>
              </tr>
              <tr>
                {[...Array(10)].map((_, i) => (
                  <th key={i} style={{ textAlign: 'center' }}>{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kehadirans.map((k, i) => {
                return (
                  <tr key={k.id}>
                    <td>{i + 1}</td>
                    <td><span className="kehadiran-guru-index-badge">{k.guru.kode_guru}</span></td>
                    <td>{k.guru.nama}</td>
                    <td><span className="kehadiran-guru-kelas-badge">{k.guru.kelas}</span></td>
                    {k.jam.map((j, idx) => {
                      const status = j && j !== '' ? j : 'Tidak Mengajar';
                      return (
                        <td key={idx} style={{ textAlign: 'center' }}>
                          <span className={`jam-box jam-${status.toLowerCase().replace(' ', '-')}`}></span>
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="kehadiran-guru-action-btn"
                        onClick={() => navigate(`/waka/kehadiran-guru/${k.guru.kode_guru}`)}
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
    </div>
  );
}

export default KehadiranGuruIndex;