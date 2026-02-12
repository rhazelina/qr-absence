import "./KehadiranSiswaRekap.css";
import { useState, useEffect } from "react";
import NavbarWaka from "../../components/Waka/NavbarWaka";
import { FaSchool } from "react-icons/fa6";
import { FaArrowLeft, FaCalendar, FaEdit, FaFileExport, FaUser, FaFilePdf, FaFileExcel, FaEye } from "react-icons/fa";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function KehadiranSiswaRekap() {
  const [showExport, setShowExport] = useState(false);
  const kelasId = 2; // nanti bisa dari params
  const className = "XI RPL 2"; // tambahkan untuk keperluan export

  const mockRekapData = [
    {
      id: 1,
      nisn: "1234567890",
      nama: "M. Abdul Khosim Ahmadiansyah",
      hadir: 18,
      izin: 1,
      sakit: 0,
      alpha: 0,
      pulang: 1,
      terlambat: 2,
    },
    {
      id: 2,
      nisn: "1234567891",
      nama: "Budi Santoso",
      hadir: 17,
      izin: 0,
      sakit: 1,
      alpha: 0,
      pulang: 0,
      terlambat: 1,
    },
    {
      id: 3,
      nisn: "1234567892",
      nama: "Siti Nurhaliza",
      hadir: 15,
      izin: 2,
      sakit: 1,
      alpha: 0,
      pulang: 0,
      terlambat: 0,
    },
    {
      id: 4,
      nisn: "1234567893",
      nama: "Ahmad Rizki",
      hadir: 14,
      izin: 1,
      sakit: 2,
      alpha: 1,
      pulang: 0,
      terlambat: 0,
    },
  ];

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // State untuk tanggal periode
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');
  const [data, setData] = useState([]);

  // Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fungsi untuk mendapatkan tanggal awal bulan
  const getFirstDayOfMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const handleSave = () => {
    const newData = [...data];
    newData[selectedIndex] = {
      ...newData[selectedIndex],
      hadir: Number(form.hadir),
      terlambat: Number(form.terlambat),
      izin: Number(form.izin),
      sakit: Number(form.sakit),
      alpha: Number(form.alpha),
      pulang: Number(form.pulang),
    };

    setData(newData);
    sessionStorage.setItem("kehadiran-kelas-2", JSON.stringify(newData));
    setShowEditModal(false);
  };

  const [form, setForm] = useState({
    hadir: '',
    terlambat: '',
    izin: '',
    sakit: '',
    alpha: '',
    pulang: '',
  });

  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    // Set default tanggal (awal bulan sampai hari ini)
    setTanggalMulai(getFirstDayOfMonth());
    setTanggalSampai(getTodayDate());

    const saved = sessionStorage.getItem("kehadiran-kelas-2");

    if (saved) {
      setData(JSON.parse(saved));
    } else {
      sessionStorage.setItem(
        "kehadiran-kelas-2",
        JSON.stringify(mockRekapData)
      );
      setData(mockRekapData);
    }
  }, []);

  // Fungsi untuk format tanggal ke bahasa Indonesia
  const formatTanggalIndonesia = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  // Format tanggal untuk display di export
  const formatDateDisplay = (start, end) => {
    const opt = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${new Date(start).toLocaleDateString('id-ID', opt)} - ${new Date(end).toLocaleDateString('id-ID', opt)}`;
  };

  // Handler untuk apply filter periode
  const handleApplyPeriode = () => {
    if (tanggalMulai && tanggalSampai) {
      console.log('Filter periode dari:', tanggalMulai, 'sampai:', tanggalSampai);
      // Di sini bisa ditambahkan logic untuk filter data berdasarkan periode
    }
  };

  // FUNGSI EXPORT EXCEL
  const handleExportExcel = async () => {
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Rekap Kehadiran');

      // Title
      ws.mergeCells('A1:J1');
      const titleCell = ws.getCell('A1');
      titleCell.value = `REKAP KEHADIRAN PESERTA DIDIK`;
      titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0a1f3e' }
      };
      ws.getRow(1).height = 30;

      // Kelas
      ws.mergeCells('A2:J2');
      const classCell = ws.getCell('A2');
      classCell.value = `Kelas: ${className}`;
      classCell.font = { bold: true, size: 12 };
      classCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(2).height = 25;

      // Periode
      ws.mergeCells('A3:J3');
      const periodCell = ws.getCell('A3');
      periodCell.value = `Periode: ${formatDateDisplay(tanggalMulai, tanggalSampai)}`;
      periodCell.font = { size: 11 };
      periodCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(3).height = 20;

      ws.addRow([]);

      // Header Tabel
      const headerRow = ws.addRow(['No', 'NIS/NISN', 'Nama Siswa', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha', 'Pulang']);
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

      // Data Tabel
      data.forEach((siswa, index) => {
        const dataRow = ws.addRow([
          index + 1, 
          siswa.nisn, 
          siswa.nama, 
          siswa.hadir || 0, 
          siswa.terlambat || 0,
          siswa.izin || 0, 
          siswa.sakit || 0, 
          siswa.alpha || 0, 
          siswa.pulang || 0
        ]);
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

      // Atur lebar kolom
      ws.getColumn(1).width = 6;
      ws.getColumn(2).width = 15;
      ws.getColumn(3).width = 35;
      ws.getColumn(4).width = 10;
      ws.getColumn(5).width = 12;
      ws.getColumn(6).width = 10;
      ws.getColumn(7).width = 10;
      ws.getColumn(8).width = 10;
      ws.getColumn(9).width = 10;

      // Export file
      const buf = await wb.xlsx.writeBuffer();
      const fileName = `Rekap_Kehadiran_${className}_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(new Blob([buf]), fileName);
      setShowExport(false);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Gagal mengekspor Excel. Silakan coba lagi.');
    }
  };

  // FUNGSI EXPORT PDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');

      // Header biru
      doc.setFillColor(10, 31, 62);
      doc.rect(0, 0, 297, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('REKAP KEHADIRAN PESERTA DIDIK', 148.5, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Kelas: ${className}`, 148.5, 23, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Periode: ${formatDateDisplay(tanggalMulai, tanggalSampai)}`, 148.5, 30, { align: 'center' });

      // Data tabel
      const tableData = data.map((siswa, index) => [
        index + 1,
        siswa.nisn,
        siswa.nama,
        siswa.hadir || 0,
        siswa.terlambat || 0,
        siswa.izin || 0,
        siswa.sakit || 0,
        siswa.alpha || 0,
        siswa.pulang || 0
      ]);

      // Generate tabel
      autoTable(doc, {
        startY: 40,
        head: [['No', 'NIS/NISN', 'Nama Siswa', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha', 'Pulang']],
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
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 80, halign: 'left' },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 18, halign: 'center' },
          5: { cellWidth: 15, halign: 'center' },
          6: { cellWidth: 15, halign: 'center' },
          7: { cellWidth: 15, halign: 'center' },
          8: { cellWidth: 15, halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        margin: { top: 40, left: 14, right: 14 }
      });

      // Footer dengan nomor halaman
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

      // Simpan PDF
      const fileName = `Rekap_Kehadiran_${className}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      setShowExport(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Gagal mengekspor PDF. Silakan coba lagi.');
    }
  };

  const generateDetailData = (siswa) => {
    const result = [];
    let no = 1;

    const pushData = (jumlah, status, badgeClass) => {
      for (let i = 0; i < jumlah; i++) {
        result.push({
          no: no++,
          tanggal: formatTanggalIndonesia(tanggalSampai || getTodayDate()),
          jam: "1–4",
          mapel: "Matematika",
          guru: "Alifah Dianatbes Andira S.Pd",
          keterangan: "-",
          status,
          badgeClass,
        });
      }
    };

    pushData(siswa.hadir || 0, "Hadir", "hadir");
    pushData(siswa.terlambat || 0, "Terlambat", "terlambat");
    pushData(siswa.izin || 0, "Izin", "izin");
    pushData(siswa.sakit || 0, "Sakit", "sakit");
    pushData(siswa.alpha || 0, "Alpha", "alpha");
    pushData(siswa.pulang || 0, "Pulang", "pulang");

    return result;
  };

  return (
    <div className="kehadiran-siswa-rekap-page">
      <NavbarWaka />
      <div className="kehadiran-siswa-rekap-header-card">
        {/* TOP */}
        <div className="kehadiran-siswa-rekap-header-top">
          <div className="kehadiran-siswa-rekap-header-left">
            <div className="kehadiran-siswa-rekap-icon">
              <FaSchool />
            </div>
            <h2>Rekap Kehadiran Peserta Didik</h2>
          </div>

          {/* RIGHT */}
          <div className="kehadiran-siswa-rekap-header-right">
            {/* FILTER PERIODE */}
            <div className="kehadiran-siswa-rekap-periode-wrapper">
              <span className="kehadiran-siswa-rekap-periode-label">
                Periode:
              </span>

              <div className="kehadiran-siswa-rekap-date-range">
                <div className="kehadiran-siswa-rekap-date-input">
                  <FaCalendar />
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    max={tanggalSampai || getTodayDate()}
                  />
                </div>

                <span className="date-separator">—</span>

                <div className="kehadiran-siswa-rekap-date-input">
                  <FaCalendar />
                  <input
                    type="date"
                    value={tanggalSampai}
                    onChange={(e) => setTanggalSampai(e.target.value)}
                    min={tanggalMulai}
                    max={getTodayDate()}
                  />
                </div>

                <button
                  className="kehadiran-siswa-rekap-apply-periode"
                  onClick={handleApplyPeriode}
                  disabled={!tanggalMulai || !tanggalSampai}
                >
                  Terapkan
                </button>
              </div>
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
                  <button
                    onClick={handleExportPDF}
                    className="export-item pdf"
                  >
                    <FaFilePdf /> PDF
                  </button>

                  <button
                    onClick={handleExportExcel}
                    className="export-item excel"
                  >
                    <FaFileExcel /> Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* INFO BAR */}
        <div className="kehadiran-siswa-rekap-info">
          <span className="info-badge">
            <FaUser /> {className}
          </span>
          <span className="info-badge">
            <FaCalendar />
            {tanggalMulai && tanggalSampai
              ? `${formatTanggalIndonesia(tanggalMulai)} - ${formatTanggalIndonesia(tanggalSampai)}`
              : 'Pilih Periode'
            }
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="kehadiran-siswa-rekap-table-wrapper">
        <table className="kehadiran-siswa-rekap-table">
          <thead>
            <tr>
              <th>No</th>
              <th>NIS/NISN</th>
              <th>Nama Siswa</th>
              <th>Hadir</th>
              <th>Terlambat</th>
              <th>Izin</th>
              <th>Sakit</th>
              <th>Alpha</th>
              <th>Pulang</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.map((siswa, i) => (
              <tr key={siswa.id + i}>
                <td>{i + 1}</td>
                <td>{siswa.nisn}</td>
                <td><b>{siswa.nama}</b></td>
                <td className="hadir">{siswa.hadir || 0}</td>
                <td className="terlambat">{siswa.terlambat || 0}</td>
                <td className="izin">{siswa.izin || 0}</td>
                <td className="sakit">{siswa.sakit || 0}</td>
                <td className="alpha">{siswa.alpha || 0}</td>
                <td className="pulang">{siswa.pulang || 0}</td>
                <td className="aksi-wrapper">
                  <button
                    className="kehadiran-siswa-rekap-detail"
                    title="Detail Kehadiran"
                    onClick={() => {
                      setSelectedDetail({
                        ...siswa,
                        detail: generateDetailData(siswa),
                      });
                      setShowDetailModal(true);
                    }}
                  >
                    <FaEye />
                  </button>

                  <button
                    className="kehadiran-siswa-rekap-edit"
                    title="Edit Rekap"
                    onClick={() => {
                      setSelectedIndex(i);
                      setForm({
                        hadir: siswa.hadir || 0,
                        terlambat: siswa.terlambat || 0,
                        izin: siswa.izin || 0,
                        sakit: siswa.sakit || 0,
                        alpha: siswa.alpha || 0,
                        pulang: siswa.pulang || 0,
                      });
                      setShowEditModal(true);
                    }}
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="kehadiran-siswa-rekap-back"
        onClick={() => window.history.back()}
      >
        <FaArrowLeft /> Kembali
      </button>

      {/* MODAL EDIT */}
      {showEditModal && (
        <div className="kehadiran-siswa-rekap-modal-overlay">
          <div className="kehadiran-siswa-rekap-modal">
            <h3 className="kehadiran-siswa-rekap-modal-title">
              Edit Rekap Kehadiran
            </h3>

            <div className="kehadiran-siswa-rekap-modal-body">
              <label>Hadir</label>
              <input
                type="number"
                min="0"
                value={form.hadir}
                onChange={(e) =>
                  setForm({ ...form, hadir: e.target.value })
                }
              />

              <label>Terlambat</label>
              <input
                type="number"
                min="0"
                value={form.terlambat}
                onChange={(e) =>
                  setForm({ ...form, terlambat: e.target.value })
                }
              />

              <label>Izin</label>
              <input
                type="number"
                min="0"
                value={form.izin}
                onChange={(e) =>
                  setForm({ ...form, izin: e.target.value })
                }
              />

              <label>Sakit</label>
              <input
                type="number"
                min="0"
                value={form.sakit}
                onChange={(e) =>
                  setForm({ ...form, sakit: e.target.value })
                }
              />

              <label>Alpha</label>
              <input
                type="number"
                min="0"
                value={form.alpha}
                onChange={(e) =>
                  setForm({ ...form, alpha: e.target.value })
                }
              />

              <label>Pulang</label>
              <input
                type="number"
                min="0"
                value={form.pulang}
                onChange={(e) =>
                  setForm({ ...form, pulang: e.target.value })
                }
              />
            </div>

            <div className="kehadiran-siswa-rekap-modal-actions">
              <button
                className="kehadiran-siswa-rekap-modal-cancel"
                onClick={() => setShowEditModal(false)}
              >
                Batal
              </button>

              <button
                type="button"
                className="kehadiran-siswa-rekap-modal-save"
                onClick={handleSave}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {showDetailModal && selectedDetail && (
        <div className="detail-kehadiran-overlay">
          <div className="detail-kehadiran-modal">
            <div className="detail-kehadiran-header">
              <h3>Detail Kehadiran - {selectedDetail.nama}</h3>
              <button onClick={() => setShowDetailModal(false)}>✕</button>
            </div>

            <table className="detail-kehadiran-table">
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
                {selectedDetail.detail.map((item, index) => (
                  <tr key={index}>
                    <td>{item.no}</td>
                    <td>{item.tanggal}</td>
                    <td>{item.jam}</td>
                    <td>{item.mapel}</td>
                    <td>{item.guru}</td>
                    <td>{item.keterangan}</td>
                    <td>
                      <span className={`badge ${item.badgeClass}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}