import React, { useState, useMemo, useEffect } from 'react';
import { authHelpers } from '../../utils/authHelpers';
import './RiwayatKehadiran.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import attendanceService from '../../services/attendance';

const RiwayatKehadiran = () => {
  // ✅ NEW: Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFirstDayOfMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }

  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [isPeriodeOpen, setIsPeriodeOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [selectedMapel, setSelectedMapel] = useState('');
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState({ nama: '' });
  const [attendanceData, setAttendanceData] = useState([]);

  const todayDate = getTodayDate(); // ✅ NEW: Tanggal hari ini untuk validasi

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        setLoading(true);
        const role = authHelpers.getRole();
        let homeroom, students, attendances;

        if (role === 'student' || role === 'class_officer') {
            homeroom = await attendanceService.getStudentClassDashboard();
            students = await attendanceService.getMyClassStudents();
            attendances = await attendanceService.getMyClassAttendance({ params: { from: startDate, to: endDate } });
        } else {
            homeroom = await attendanceService.getHomeroom();
            // Parallel fetch for teacher
            const [s, a] = await Promise.all([
                attendanceService.getHomeroomStudents(),
                attendanceService.getHomeroomAttendance({ params: { from: startDate, to: endDate } })
            ]);
            students = s;
            attendances = a;
        }
        
        setClassInfo({ nama: homeroom.name || `${homeroom.grade} ${homeroom.major?.code || ''} ${homeroom.label}` });

        processData(students, attendances);
    } catch (error) {
        console.error("Error fetching history:", error);
        // Fallback or alert
    } finally {
        setLoading(false);
    }
  };

  const processData = (students, attendances) => {
    const processed = students.map((student, index) => {
        const studentAttendances = attendances.filter(a => a.student_id === student.id);
        
        const details = studentAttendances.map(a => ({
            tanggal: new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            jamPelajaran: a.schedule?.start_time ? `${a.schedule.start_time.slice(0,5)} - ${a.schedule.end_time.slice(0,5)}` : '-',
            mataPelajaran: a.schedule?.subject_name || '-',
            guru: a.schedule?.teacher?.user?.name || '-',
            status: mapStatus(a.status),
            keterangan: a.reason || (a.status === 'present' ? 'Hadir' : '-')
        }));

        const counts = {
            hadir: details.filter(d => d.status === 'Hadir').length,
            terlambat: details.filter(d => d.status === 'Terlambat').length,
            sakit: details.filter(d => d.status === 'Sakit').length,
            izin: details.filter(d => d.status === 'Izin').length,
            alpha: details.filter(d => d.status === 'Alpha').length,
            pulang: details.filter(d => d.status === 'Pulang').length,
        };

        return {
            no: index + 1,
            nisn: student.nis,
            nama: student.user.name,
            ...counts,
            details: details
        };
    });
    setAttendanceData(processed);
  };

  const mapStatus = (status) => {
      const map = {
          'present': 'Hadir',
          'late': 'Terlambat',
          'sick': 'Sakit',
          'permission': 'Izin',
          'absent': 'Alpha',
          'leave_early': 'Pulang'
      };
      return map[status] || status;
  };

  const daftarMapel = useMemo(() => {
    const mapelSet = new Set();
    attendanceData.forEach(student => {
      student.details?.forEach(detail => {
        if (detail.mataPelajaran !== '-') {
          mapelSet.add(detail.mataPelajaran);
        }
      });
    });
    return Array.from(mapelSet).sort();
  }, [attendanceData]);

  const filteredAttendanceData = useMemo(() => {
    if (!selectedMapel) {
      return attendanceData;
    }

    return attendanceData.map(student => {
      const filteredDetails = student.details?.filter(
        detail => detail.mataPelajaran === selectedMapel
      ) || [];

      const recap = {
        hadir: 0,
        terlambat: 0,
        sakit: 0,
        izin: 0,
        alpha: 0,
        pulang: 0
      };

      filteredDetails.forEach(detail => {
        const status = detail.status.toLowerCase();
        if (recap.hasOwnProperty(status)) {
          recap[status]++;
        }
      });

      return {
        ...student,
        details: filteredDetails,
        ...recap
      };
    });
  }, [attendanceData, selectedMapel]);

  // ✅ NEW: Hitung total keseluruhan dari filtered data
  const totalSummary = useMemo(() => {
    return filteredAttendanceData.reduce((acc, student) => {
      acc.hadir += student.hadir;
      acc.terlambat += student.terlambat;
      acc.sakit += student.sakit;
      acc.izin += student.izin;
      acc.alpha += student.alpha;
      acc.pulang += student.pulang;
      return acc;
    }, {
      hadir: 0,
      terlambat: 0,
      sakit: 0,
      izin: 0,
      alpha: 0,
      pulang: 0
    });
  }, [filteredAttendanceData]);

  const formatDateDisplay = (start, end) => {
    const opt = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${new Date(start).toLocaleDateString('id-ID', opt)} - ${new Date(end).toLocaleDateString('id-ID', opt)}`;
  };

  // ✅ MODIFIED: Validasi tanggal tidak boleh melebihi hari ini
  const handleStartDateChange = (e) => {
    const val = e.target.value;
    
    // Validasi tidak boleh melebihi hari ini
    if (val > todayDate) {
      alert('Tanggal tidak boleh melebihi hari ini');
      return;
    }
    
    setStartDate(val);
    if (endDate < val) setEndDate(val);
  };

  // ✅ MODIFIED: Validasi tanggal tidak boleh melebihi hari ini
  const handleEndDateChange = (e) => {
    const val = e.target.value;
    
    // Validasi tidak boleh melebihi hari ini
    if (val > todayDate) {
      alert('Tanggal tidak boleh melebihi hari ini');
      return;
    }
    
    setEndDate(val);
  };

  const applyPeriodFilter = () => {
      setIsPeriodeOpen(false);
      fetchData();
  };

  const handleEditChange = (field, value) => {
    const numValue = Number(value);
    if (numValue < 0) return;
    setEditRow({ ...editRow, [field]: numValue });
  };

  const openEditModal = (row) => {
    setEditRow({ ...row });
    setShowModal(true);
  };

  const openDetailModal = (row) => {
    setSelectedStudent(row);
    setShowDetailModal(true);
  };

  const saveEdit = () => {
    setAttendanceData(attendanceData.map(d => d.no === editRow.no ? editRow : d));
    setEditRow(null);
    setShowModal(false);
  };

  const cancelEdit = () => {
    setEditRow(null);
    setShowModal(false);
  };

  const closeDetailModal = () => {
    setSelectedStudent(null);
    setShowDetailModal(false);
  };

  const handleExportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Riwayat Kehadiran');

    ws.mergeCells('A1:I1');
    const titleCell = ws.getCell('A1');
    titleCell.value = `RIWAYAT KEHADIRAN SISWA`;
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0a1f3e' }
    };
    ws.getRow(1).height = 30;

    ws.mergeCells('A2:I2');
    const classCell = ws.getCell('A2');
    classCell.value = `Kelas: ${classInfo.nama}`;
    classCell.font = { bold: true, size: 12 };
    classCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 25;

    ws.mergeCells('A3:I3');
    const periodCell = ws.getCell('A3');
    periodCell.value = `Periode: ${formatDateDisplay(startDate, endDate)}`;
    periodCell.font = { size: 11 };
    periodCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(3).height = 20;

    let currentRow = 4;
    if (selectedMapel) {
      ws.mergeCells(`A${currentRow}:I${currentRow}`);
      const mapelCell = ws.getCell(`A${currentRow}`);
      mapelCell.value = `Mata Pelajaran: ${selectedMapel}`;
      mapelCell.font = { size: 11, italic: true };
      mapelCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(currentRow).height = 20;
      currentRow++;
    }

    ws.addRow([]);
    currentRow++;

    // ✅ NEW: Tambahkan ringkasan total di Excel
    ws.mergeCells(`A${currentRow}:I${currentRow}`);
    const summaryTitleCell = ws.getCell(`A${currentRow}`);
    summaryTitleCell.value = 'RINGKASAN TOTAL';
    summaryTitleCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    summaryTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summaryTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0066cc' }
    };
    ws.getRow(currentRow).height = 25;
    currentRow++;

    const summaryRow = ws.addRow([
      '', '', 'Total',
      totalSummary.hadir,
      totalSummary.terlambat,
      totalSummary.sakit,
      totalSummary.izin,
      totalSummary.alpha,
      totalSummary.pulang
    ]);
    summaryRow.font = { bold: true };
    summaryRow.alignment = { horizontal: 'center', vertical: 'middle' };
    summaryRow.height = 22;
    summaryRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE599' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    currentRow++;

    ws.addRow([]);
    currentRow++;

    const headerRow = ws.addRow(['No', 'NISN', 'Nama', 'Hadir', 'Terlambat', 'Sakit', 'Izin', 'Alpha', 'Pulang']);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;
    
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0066cc' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    filteredAttendanceData.forEach((r, index) => {
      const dataRow = ws.addRow([r.no, r.nisn, r.nama, r.hadir, r.terlambat, r.sakit, r.izin, r.alpha, r.pulang]);
      dataRow.height = 20;
      
      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = { 
          horizontal: colNumber === 3 ? 'left' : 'center',
          vertical: 'middle' 
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
        };
        
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8F9FA' }
          };
        }
      });
    });

    ws.getColumn(1).width = 6;
    ws.getColumn(2).width = 12;
    ws.getColumn(3).width = 25;
    ws.getColumn(4).width = 10;
    ws.getColumn(5).width = 10;
    ws.getColumn(6).width = 10;
    ws.getColumn(7).width = 10;
    ws.getColumn(8).width = 10;
    ws.getColumn(9).width = 10;

    const buf = await wb.xlsx.writeBuffer();
    const fileName = selectedMapel 
      ? `Riwayat_Kehadiran_${classInfo.nama}_${selectedMapel}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `Riwayat_Kehadiran_${classInfo.nama}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([buf]), fileName);
    setIsExportOpen(false);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');

      doc.setFillColor(10, 31, 62);
      doc.rect(0, 0, 297, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('RIWAYAT KEHADIRAN SISWA', 148.5, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Kelas: ${classInfo.nama}`, 148.5, 23, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      let yPos = 30;
      doc.text(`Periode: ${formatDateDisplay(startDate, endDate)}`, 148.5, yPos, { align: 'center' });
      
      if (selectedMapel) {
        yPos += 5;
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.text(`Mata Pelajaran: ${selectedMapel}`, 148.5, yPos, { align: 'center' });
      }

      // ✅ NEW: Tambahkan ringkasan total di PDF
      yPos += 10;
      doc.setFillColor(0, 102, 204);
      doc.rect(14, yPos, 269, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('RINGKASAN TOTAL', 148.5, yPos + 5.5, { align: 'center' });

      yPos += 8;
      const summaryData = [[
        'Total',
        totalSummary.hadir,
        totalSummary.terlambat,
        totalSummary.sakit,
        totalSummary.izin,
        totalSummary.alpha,
        totalSummary.pulang
      ]];

      autoTable(doc, {
        startY: yPos,
        head: [['', 'Hadir', 'Terlambat', 'Sakit', 'Izin', 'Alpha', 'Pulang']],
        body: summaryData,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 9
        },
        bodyStyles: {
          fillColor: [255, 229, 153],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 65, halign: 'left' },
          1: { cellWidth: 33.66, halign: 'center' },
          2: { cellWidth: 33.66, halign: 'center' },
          3: { cellWidth: 33.66, halign: 'center' },
          4: { cellWidth: 33.66, halign: 'center' },
          5: { cellWidth: 33.66, halign: 'center' },
          6: { cellWidth: 33.66, halign: 'center' }
        },
        margin: { top: yPos, left: 14, right: 14 }
      });

      const tableData = filteredAttendanceData.map(r => [
        r.no,
        r.nisn,
        r.nama,
        r.hadir,
        r.terlambat,
        r.sakit,
        r.izin,
        r.alpha,
        r.pulang
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        head: [['No', 'NISN', 'Nama', 'Hadir', 'Terlambat', 'Sakit', 'Izin', 'Alpha', 'Pulang']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 22, halign: 'center' },
          2: { cellWidth: 65, halign: 'left' },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 18, halign: 'center' },
          5: { cellWidth: 18, halign: 'center' },
          6: { cellWidth: 18, halign: 'center' },
          7: { cellWidth: 18, halign: 'center' },
          8: { cellWidth: 18, halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        margin: { left: 14, right: 14 }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          148.5,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          `Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
          148.5,
          doc.internal.pageSize.height - 5,
          { align: 'center' }
        );
      }

      const fileName = selectedMapel
        ? `Riwayat_Kehadiran_${classInfo.nama}_${selectedMapel}_${new Date().toISOString().split('T')[0]}.pdf`
        : `Riwayat_Kehadiran_${classInfo.nama}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      setIsExportOpen(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Gagal mengekspor PDF. Silakan coba lagi.');
    }
  };

  return (
    <div className="kehadiran-siswa-pagee">
        <NavbarWakel />
      <div className="page-title-header">
        <h1>Riwayat Kehadiran</h1>
      </div>

      <div className="kehadiran-content">
        <div className="top-control-bar">
          <div className="control-left-group">
            <div className="selected-period-display">
              📅 {formatDateDisplay(startDate, endDate)}
            </div>

            <div className="periode-selector">
              <div className="periode-box" onClick={() => setIsPeriodeOpen(!isPeriodeOpen)}>
                Pilih Periode ▼
              </div>

              {isPeriodeOpen && (
                <div className="periode-dropdown-daterange">
                  <div className="date-range-inputs">
                    <div>
                      <label>Dari</label>
                      <input 
                        type="date" 
                        value={startDate} 
                        max={todayDate}
                        onChange={handleStartDateChange} 
                      />
                    </div>
                    <div>
                      <label>Sampai</label>
                      <input 
                        type="date" 
                        value={endDate} 
                        min={startDate} 
                        max={todayDate}
                        onChange={handleEndDateChange} 
                      />
                    </div>
                  </div>
                  <button className="apply-date-btn" onClick={applyPeriodFilter}>Terapkan</button>
                </div>
              )}
            </div>

            <div className="mapel-selector">
              <select 
                value={selectedMapel} 
                onChange={(e) => setSelectedMapel(e.target.value)}
                className="mapel-select-box"
              >
                <option value="">Semua Mata Pelajaran</option>
                {daftarMapel.map(mapel => (
                  <option key={mapel} value={mapel}>{mapel}</option>
                ))}
              </select>
            </div>

            <div className="class-display-box">
              <b>{loading ? 'Memuat...' : classInfo.nama}</b>
            </div>
          </div>

          <div className="export-selector">
            <button className="action-button" onClick={() => setIsExportOpen(!isExportOpen)}>
              Ekspor ▼
            </button>

            {isExportOpen && (
              <div className="export-dropdown">
                <button className="export-option" onClick={handleExportExcel}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Ekspor Excel
                </button>
                <button className="export-option" onClick={handleExportPDF}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Ekspor PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ✅ NEW: Ringkasan Total Cards */}
        <div className="summary-cards-container">
          <div className="summary-card summary-hadir">
            <div className="summary-icon">✓</div>
            <div className="summary-content">
              <div className="summary-label">Total Hadir</div>
              <div className="summary-value">{totalSummary.hadir}</div>
            </div>
          </div>

          <div className="summary-card summary-terlambat">
            <div className="summary-icon">⏰</div>
            <div className="summary-content">
              <div className="summary-label">Total Terlambat</div>
              <div className="summary-value">{totalSummary.terlambat}</div>
            </div>
          </div>

          <div className="summary-card summary-sakit">
            <div className="summary-icon">🏥</div>
            <div className="summary-content">
              <div className="summary-label">Total Sakit</div>
              <div className="summary-value">{totalSummary.sakit}</div>
            </div>
          </div>

          <div className="summary-card summary-izin">
            <div className="summary-icon">📝</div>
            <div className="summary-content">
              <div className="summary-label">Total Izin</div>
              <div className="summary-value">{totalSummary.izin}</div>
            </div>
          </div>

          <div className="summary-card summary-alpha">
            <div className="summary-icon">✖</div>
            <div className="summary-content">
              <div className="summary-label">Total Alpha</div>
              <div className="summary-value">{totalSummary.alpha}</div>
            </div>
          </div>

          <div className="summary-card summary-pulang">
            <div className="summary-icon">🏠</div>
            <div className="summary-content">
              <div className="summary-label">Total Pulang</div>
              <div className="summary-value">{totalSummary.pulang}</div>
            </div>
          </div>
        </div>

        <div className="student-data-table">
          {loading ? (
             <div style={{textAlign: 'center', padding: '2rem'}}>Memuat data riwayat...</div>
          ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NISN</th>
                <th>Nama</th>
                <th>Hadir</th>
                <th>Terlambat</th>
                <th>Sakit</th>
                <th>Izin</th>
                <th>Alpha</th>
                <th>Pulang</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendanceData.map(row => (
                <tr key={row.no}>
                  <td>{row.no}</td>
                  <td>{row.nisn}</td>
                  <td>{row.nama}</td>
                  <td>{row.hadir}</td>
                  <td>{row.terlambat}</td>
                  <td>{row.sakit}</td>
                  <td>{row.izin}</td>
                  <td>{row.alpha}</td>
                  <td>{row.pulang}</td>
                  <td>
                    <button className="view-btn" onClick={() => openDetailModal(row)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    {/* Hide edit button since we don't support history editing yet */}
                    {/* <button className="edit-btn" onClick={() => openEditModal(row)}>Ubah</button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ubah Rekap</h2>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Hadir</label>
                <input 
                  type="number" 
                  min="0"
                  value={editRow?.hadir || 0} 
                  onChange={e => handleEditChange('hadir', e.target.value)}
                />
              </div>

              {/* ... other fields ... */}
              {/* Simplified for now since we hid the button */}

              <div className="modal-footer">
                <button className="cancel-btn" onClick={cancelEdit}>Batal</button>
                <button className="save-btn" onClick={saveEdit}>Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedStudent && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detail Kehadiran - {selectedStudent.nama}</h2>
            </div>
            
            <div className="modal-body">
              <div className="detail-table-wrapper">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tanggal</th>
                      <th>Jam Pelajaran</th>
                      <th>Mata Pelajaran</th>
                      <th>Guru</th>
                      <th>Keterangan</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.details && selectedStudent.details.length > 0 ? (
                      selectedStudent.details.map((detail, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{detail.tanggal}</td>
                          <td>{detail.jamPelajaran}</td>
                          <td>{detail.mataPelajaran}</td>
                          <td>{detail.guru}</td>
                          <td>{detail.keterangan || '-'}</td>
                          <td>
                            <span className={`status-badge ${detail.status.toLowerCase()}`}>
                              {detail.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{textAlign: 'center'}}>Tidak ada data detail untuk {selectedMapel || 'periode ini'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-btn" onClick={closeDetailModal}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiwayatKehadiran;