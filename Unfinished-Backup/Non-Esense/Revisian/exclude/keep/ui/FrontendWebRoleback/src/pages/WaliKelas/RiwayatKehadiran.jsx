import React, { useState, useMemo } from 'react';
import './RiwayatKehadiran.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RiwayatKehadiran = () => {
  // ✅ NEW: Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-13');
  const [isPeriodeOpen, setIsPeriodeOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [selectedMapel, setSelectedMapel] = useState('');

  const className = 'XI RPL 1';
  const todayDate = getTodayDate(); // ✅ NEW: Tanggal hari ini untuk validasi

  const [attendanceData, setAttendanceData] = useState([
    { no: 1, nisn: '00601', nama: 'Kim Andini', hadir: 10, terlambat: 0, sakit: 2, izin: 1, alpha: 2, pulang: 2, 
      details: [
        { tanggal: '25-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Matematika', guru: 'Alifah Diantebes Aindra S.pd', status: 'Alpha', keterangan: '' },
        { tanggal: '24-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Matematika', guru: 'Alifah Diantebes Aindra S.pd', status: 'Alpha', keterangan: '' },
        { tanggal: '23-05-2025', jamPelajaran: '5-8', mataPelajaran: 'Bahasa Inggris', guru: 'Siti Nurhaliza S.pd', status: 'Pulang', keterangan: 'Ada keperluan keluarga mendadak' },
        { tanggal: '22-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Fisika', guru: 'Dr. Ahmad Hidayat', status: 'Pulang', keterangan: 'Merasa tidak enak badan' },
        { tanggal: '21-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Kimia', guru: 'Dewi Lestari S.pd', status: 'Sakit', keterangan: 'Demam dan flu, membawa surat dokter' },
        { tanggal: '20-05-2025', jamPelajaran: '5-8', mataPelajaran: 'Biologi', guru: 'Prof. Samsul Arifin', status: 'Sakit', keterangan: 'Masih dalam masa pemulihan dari sakit' },
        { tanggal: '19-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Bahasa Indonesia', guru: 'Budi Santoso S.pd', status: 'Izin', keterangan: 'Mengikuti acara keluarga penting' }
      ]
    },
    { no: 2, nisn: '00602', nama: 'Siti Aisyah', hadir: 10, terlambat: 1, sakit: 2, izin: 1, alpha: 1, pulang: 0,
      details: [
        { tanggal: '27-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Matematika', guru: 'Alifah Diantebes Aindra S.pd', status: 'Terlambat', keterangan: 'Terlambat masuk jam 07:45, macet di jalan' },
        { tanggal: '26-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Bahasa Indonesia', guru: 'Budi Santoso S.pd', status: 'Sakit', keterangan: 'Demam tinggi, istirahat di rumah' },
        { tanggal: '25-05-2025', jamPelajaran: '5-8', mataPelajaran: 'Kimia', guru: 'Dewi Lestari S.pd', status: 'Sakit', keterangan: 'Masih dalam masa pemulihan sakit' },
        { tanggal: '24-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Matematika', guru: 'Alifah Diantebes Aindra S.pd', status: 'Izin', keterangan: 'Menghadiri acara keluarga di luar kota' },
        { tanggal: '23-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Sejarah', guru: 'Rina Kusuma S.pd', status: 'Alpha', keterangan: '' }
      ]
    },
    { no: 3, nisn: '00603', nama: 'Budi Santoso', hadir: 11, terlambat: 2, sakit: 1, izin: 2, alpha: 0, pulang: 1,
      details: [
        { tanggal: '28-05-2025', jamPelajaran: '5-8', mataPelajaran: 'Bahasa Inggris', guru: 'Siti Nurhaliza S.pd', status: 'Terlambat', keterangan: 'Terlambat masuk jam 08:10, ban sepeda bocor' },
        { tanggal: '27-05-2025', jamPelajaran: '1-4', mataPelajaran: 'PKN', guru: 'Hendra Wijaya S.pd', status: 'Sakit', keterangan: 'Flu dan batuk, membawa surat dokter' },
        { tanggal: '26-05-2025', jamPelajaran: '5-8', mataPelajaran: 'Seni Budaya', guru: 'Nina Karlina S.pd', status: 'Izin', keterangan: 'Keperluan administrasi penting' },
        { tanggal: '25-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Olahraga', guru: 'Tono Sukirman S.pd', status: 'Izin', keterangan: 'Mengikuti lomba tingkat kabupaten' },
        { tanggal: '24-05-2025', jamPelajaran: '5-8', mataPelajaran: 'Bahasa Jawa', guru: 'Sri Mulyani S.pd', status: 'Pulang', keterangan: 'Pusing dan mual setelah olahraga' },
        { tanggal: '23-05-2025', jamPelajaran: '1-4', mataPelajaran: 'Matematika', guru: 'Alifah Diantebes Aindra S.pd', status: 'Terlambat', keterangan: 'Terlambat masuk jam 07:30, hujan deras' }
      ]
    }
  ]);

  const daftarMapel = useMemo(() => {
    const mapelSet = new Set();
    attendanceData.forEach(student => {
      student.details?.forEach(detail => {
        if (detail.mataPelajaran) {
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
        hadir: recap.hadir,
        terlambat: recap.terlambat,
        sakit: recap.sakit,
        izin: recap.izin,
        alpha: recap.alpha,
        pulang: recap.pulang
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
    classCell.value = `Kelas: ${className}`;
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
      ? `Riwayat_Kehadiran_${className}_${selectedMapel}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `Riwayat_Kehadiran_${className}_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      doc.text(`Kelas: ${className}`, 148.5, 23, { align: 'center' });
      
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
        ? `Riwayat_Kehadiran_${className}_${selectedMapel}_${new Date().toISOString().split('T')[0]}.pdf`
        : `Riwayat_Kehadiran_${className}_${new Date().toISOString().split('T')[0]}.pdf`;
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
                      {/* ✅ MODIFIED: Tambahkan atribut max untuk membatasi tanggal */}
                      <input 
                        type="date" 
                        value={startDate} 
                        max={todayDate}
                        onChange={handleStartDateChange} 
                      />
                    </div>
                    <div>
                      <label>Sampai</label>
                      {/* ✅ MODIFIED: Tambahkan atribut max untuk membatasi tanggal */}
                      <input 
                        type="date" 
                        value={endDate} 
                        min={startDate} 
                        max={todayDate}
                        onChange={handleEndDateChange} 
                      />
                    </div>
                  </div>
                  <button className="apply-date-btn" onClick={() => setIsPeriodeOpen(false)}>Terapkan</button>
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
              <b>{className}</b>
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
                    <button className="edit-btn" onClick={() => openEditModal(row)}>Ubah</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

              <div className="form-group">
                <label>Terlambat</label>
                <input 
                  type="number" 
                  min="0"
                  value={editRow?.terlambat || 0} 
                  onChange={e => handleEditChange('terlambat', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Sakit</label>
                <input 
                  type="number" 
                  min="0"
                  value={editRow?.sakit || 0} 
                  onChange={e => handleEditChange('sakit', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Alpha</label>
                <input 
                  type="number" 
                  min="0"
                  value={editRow?.alpha || 0} 
                  onChange={e => handleEditChange('alpha', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Izin</label>
                <input 
                  type="number" 
                  min="0"
                  value={editRow?.izin || 0} 
                  onChange={e => handleEditChange('izin', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Pulang</label>
                <input 
                  type="number" 
                  min="0"
                  value={editRow?.pulang || 0} 
                  onChange={e => handleEditChange('pulang', e.target.value)}
                />
              </div>

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
                          <td>{idx + 1}.</td>
                          <td>{detail.tanggal}</td>
                          <td>{detail.jamPelajaran}</td>
                          <td>{detail.mataPelajaran}</td>
                          <td>{detail.guru}</td>
                          <td>{detail.keterangan || '-'}</td>
                          <td>
                            <span className={`status-badge status-${detail.status.toLowerCase()}`}>
                              {detail.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                          Tidak ada data untuk mata pelajaran yang dipilih
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiwayatKehadiran;