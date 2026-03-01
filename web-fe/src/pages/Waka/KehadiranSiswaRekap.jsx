import "./KehadiranSiswaRekap.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavbarWaka from "../../components/Waka/NavbarWaka";
import { FaSchool } from "react-icons/fa6";
import { FaArrowLeft, FaCalendar, FaEdit, FaFileExport, FaUser, FaFilePdf, FaFileExcel, FaEye, FaSpinner } from "react-icons/fa";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const rekapByKelas = {
  7: {
    kelasInfo: { nama_kelas: "XII RPL 1", wali_kelas: "RR. Henning Gratyanis Anggraeni, S.Pd" },
    data: [
      { id: 1,  nisn: "3078207819", nama: "ABRORY AKBAR AL BATAMI",           hadir: 20, terlambat: 1, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 2,  nisn: "0086659776", nama: "AFIF FIRMANSYAH",                  hadir: 19, terlambat: 0, izin: 1, sakit: 1, alfa: 0, pulang: 0 },
      { id: 3,  nisn: "0087441890", nama: "AGIES WIDYAWATI",                  hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 4,  nisn: "0071026334", nama: "AGIL RIFATUL HAQ",                 hadir: 18, terlambat: 2, izin: 1, sakit: 0, alfa: 0, pulang: 0 },
      { id: 5,  nisn: "0078492418", nama: "AKH. SEPTIAN FIO RAMADHAN",        hadir: 17, terlambat: 0, izin: 3, sakit: 1, alfa: 0, pulang: 0 },
      { id: 6,  nisn: "0077521428", nama: "Alya Fitri Larasati",              hadir: 20, terlambat: 1, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 7,  nisn: "0084302867", nama: "ANASTASYA DYAH AYU PROBONINGRUM",  hadir: 19, terlambat: 0, izin: 0, sakit: 2, alfa: 0, pulang: 0 },
      { id: 8,  nisn: "0079564039", nama: "ANISA PUSPITASARI",                hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 9,  nisn: "0087599872", nama: "Anissa Prissilvia Tahara",         hadir: 18, terlambat: 0, izin: 0, sakit: 3, alfa: 0, pulang: 0 },
      { id: 10, nisn: "0084701495", nama: "AQILLA MAULIDDYAH",                hadir: 20, terlambat: 1, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 11, nisn: "0079518058", nama: "AQILNA FAILLA LILFARA AIZANI",     hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 12, nisn: "0076823738", nama: "Aristia Faren Rafaela",            hadir: 19, terlambat: 0, izin: 1, sakit: 0, alfa: 0, pulang: 1 },
      { id: 13, nisn: "0088840490", nama: "ASYHARIL KAHFI DEWANDA",           hadir: 16, terlambat: 4, izin: 0, sakit: 1, alfa: 0, pulang: 0 },
      { id: 14, nisn: "0086920055", nama: "Athaar Putra Ruhenda",             hadir: 20, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 15, nisn: "0088032174", nama: "AVRILIANA ANJANI",                 hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 16, nisn: "0089732684", nama: "AZHAR ANISATUL JANNAH",            hadir: 20, terlambat: 0, izin: 0, sakit: 1, alfa: 0, pulang: 0 },
      { id: 17, nisn: "0086246127", nama: "BINTANG FIRMAN ARDANA",            hadir: 15, terlambat: 2, izin: 1, sakit: 0, alfa: 3, pulang: 0 },
      { id: 18, nisn: "3079461424", nama: "CALLISTA SHAFA RAMADHANI",         hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 19, nisn: "0077372447", nama: "CHEVY APRILIA HUTABARAT",          hadir: 20, terlambat: 0, izin: 1, sakit: 0, alfa: 0, pulang: 0 },
      { id: 20, nisn: "0073851099", nama: "CINDI TRI PRASETYO",               hadir: 19, terlambat: 1, izin: 0, sakit: 1, alfa: 0, pulang: 0 },
      { id: 21, nisn: "0082111423", nama: "CINTYA KARINA PUTRI",              hadir: 18, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 22, nisn: "0078343685", nama: "DHIA MIRZA HANDHIONO",             hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 23, nisn: "0081555900", nama: "DIANDHIKA DWI PRANATA",            hadir: 20, terlambat: 0, izin: 0, sakit: 0, alfa: 1, pulang: 0 },
      { id: 24, nisn: "0081936855", nama: "FAIRUZ QUDS ZAHRAN FIRDAUS",       hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 25, nisn: "0079300540", nama: "FARDAN RASYAH ISLAMI",             hadir: 19, terlambat: 1, izin: 1, sakit: 0, alfa: 0, pulang: 0 },
      { id: 26, nisn: "0088713839", nama: "FATCHUR ROHMAN ROFIAN",            hadir: 20, terlambat: 0, izin: 0, sakit: 1, alfa: 0, pulang: 0 },
      { id: 27, nisn: "0087853322", nama: "FIDATUL AVIVA",                    hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 28, nisn: "0088560011", nama: "FIRLI ZULFA AZZAHRA",              hadir: 20, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 1 },
      { id: 29, nisn: "0062756939", nama: "HAPSARI ISMARTOYO",                hadir: 19, terlambat: 0, izin: 2, sakit: 0, alfa: 0, pulang: 0 },
      { id: 30, nisn: "0087538918", nama: "HAVID ABDILAH SURAHMAD",           hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 31, nisn: "0072226999", nama: "IGNACIA ZANDRA",                   hadir: 20, terlambat: 0, izin: 0, sakit: 1, alfa: 0, pulang: 0 },
      { id: 32, nisn: "0074853632", nama: "IQBAL LAZUARDI",                   hadir: 18, terlambat: 2, izin: 0, sakit: 0, alfa: 1, pulang: 0 },
      { id: 33, nisn: "0089462835", nama: "IQLIMAHDA TANZILLA FINAN DIVA",    hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 34, nisn: "0077181841", nama: "IRDINA MARSYA MAZARINA",           hadir: 19, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 2 },
      { id: 35, nisn: "0086237279", nama: "ISABEL CAHAYA HATI",               hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 36, nisn: "0074316703", nama: "KHOIRUN NI'MAH NURUL HIDAYAH",     hadir: 20, terlambat: 1, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
    ]
  },
  8: {
    kelasInfo: { nama_kelas: "XII RPL 2", wali_kelas: "Triana Andriani, S.Pd" },
    data: [
      { id: 1,  nisn: "0074182519", nama: "LAURA LAVIDA LOCA",                  hadir: 20, terlambat: 0, izin: 1, sakit: 0, alfa: 0, pulang: 0 },
      { id: 2,  nisn: "0074320819", nama: "LELY SAGITA",                        hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 3,  nisn: "0078658367", nama: "MAYA MELINDA WIJAYANTI",             hadir: 19, terlambat: 1, izin: 0, sakit: 1, alfa: 0, pulang: 0 },
      { id: 4,  nisn: "0079292238", nama: "MOCH. ABYL GUSTIAN",                 hadir: 17, terlambat: 3, izin: 0, sakit: 1, alfa: 0, pulang: 0 },
      { id: 5,  nisn: "0084421457", nama: "MUHAMMAD AMINULLAH",                 hadir: 20, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 6,  nisn: "0089104721", nama: "Muhammad Azka Fadli Atthaya",        hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 7,  nisn: "0087917739", nama: "MUHAMMAD HADI FIRMANSYAH",           hadir: 16, terlambat: 1, izin: 0, sakit: 0, alfa: 4, pulang: 0 },
      { id: 8,  nisn: "0074704843", nama: "MUHAMMAD HARRIS MAULANA SAPUTRA",    hadir: 20, terlambat: 0, izin: 1, sakit: 0, alfa: 0, pulang: 0 },
      { id: 9,  nisn: "0077192596", nama: "MUHAMMAD IBNU RAFFI AHDAN",          hadir: 19, terlambat: 0, izin: 0, sakit: 2, alfa: 0, pulang: 0 },
      { id: 10, nisn: "0075024492", nama: "MUHAMMAD REYHAN ATHADIANSYAH",       hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 11, nisn: "0141951182", nama: "MUHAMMAD WISNU DEWANDARU",           hadir: 18, terlambat: 0, izin: 3, sakit: 0, alfa: 0, pulang: 0 },
      { id: 12, nisn: "0072504970", nama: "NABILA RAMADHAN",                    hadir: 20, terlambat: 1, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 13, nisn: "0061631562", nama: "NADIA SINTA DEVI OKTAVIA",           hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 14, nisn: "0081112175", nama: "NADJWA KIRANA FIRDAUS",              hadir: 19, terlambat: 0, izin: 1, sakit: 0, alfa: 0, pulang: 1 },
      { id: 15, nisn: "0089965810", nama: "NINDI NARITA MAULIDYA",              hadir: 20, terlambat: 0, izin: 0, sakit: 1, alfa: 0, pulang: 0 },
      { id: 16, nisn: "0085834363", nama: "NISWATUL KHOIRIYAH",                 hadir: 18, terlambat: 0, izin: 0, sakit: 3, alfa: 0, pulang: 0 },
      { id: 17, nisn: "0087884391", nama: "NOVERITA PASCALIA RAHMA",            hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 18, nisn: "0078285764", nama: "NOVITA ANDRIANI",                    hadir: 20, terlambat: 1, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 19, nisn: "0078980482", nama: "NOVITA AZZAHRA",                     hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 20, nisn: "0078036100", nama: "NURUL KHASANAH",                     hadir: 19, terlambat: 0, izin: 2, sakit: 0, alfa: 0, pulang: 0 },
      { id: 21, nisn: "0081838771", nama: "RACHEL ALUNA MEIZHA",                hadir: 18, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 22, nisn: "0079312790", nama: "RAENA WESTI DHEANOFA HERLIANI",      hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 23, nisn: "0084924963", nama: "RAYHANUN",                           hadir: 20, terlambat: 0, izin: 1, sakit: 0, alfa: 0, pulang: 0 },
      { id: 24, nisn: "0077652198", nama: "RAYYAN DAFFA AL AFFANI",             hadir: 19, terlambat: 2, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 25, nisn: "0087959211", nama: "RHAMEYZHA ALEA CHALILA PUTRI EDWA",  hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 26, nisn: "0089530132", nama: "RHEISYA MAULIDDIVA PUTRI",           hadir: 20, terlambat: 0, izin: 0, sakit: 1, alfa: 0, pulang: 0 },
      { id: 27, nisn: "0089479412", nama: "RHEYVAN RAMADHAN I.P",               hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 28, nisn: "0073540571", nama: "RISKY RAMADHANI",                    hadir: 19, terlambat: 1, izin: 1, sakit: 0, alfa: 0, pulang: 0 },
      { id: 29, nisn: "0076610748", nama: "RITA AURA AGUSTINA",                 hadir: 20, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 1 },
      { id: 30, nisn: "0077493253", nama: "RIZKY RAMADHANI",                    hadir: 18, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 3 },
      { id: 31, nisn: "0076376703", nama: "SA'IDHATUL HASANA",                  hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 32, nisn: "0072620559", nama: "SHISILIA ISMU PUTRI",                hadir: 20, terlambat: 0, izin: 1, sakit: 0, alfa: 0, pulang: 0 },
      { id: 33, nisn: "0072336597", nama: "SUCI RAMADANI INDRIANSYAH",          hadir: 21, terlambat: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
      { id: 34, nisn: "0075802873", nama: "TALITHA NUDIA RISMATULLAH",          hadir: 19, terlambat: 1, izin: 0, sakit: 1, alfa: 0, pulang: 0 },
    ]
  }
};

export default function KehadiranSiswaRekap() {
  const { id } = useParams();
  const [showExport, setShowExport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [kelasInfo, setKelasInfo] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');
  const [data, setData] = useState([]);

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
  };

  const handleSave = () => {
    const newData = [...data];
    newData[selectedIndex] = {
      ...newData[selectedIndex],
      hadir: Number(form.hadir),
      terlambat: Number(form.terlambat),
      izin: Number(form.izin),
      sakit: Number(form.sakit),
      alfa: Number(form.alfa),
      pulang: Number(form.pulang),
    };
    setData(newData);
    setShowEditModal(false);
  };

  const [form, setForm] = useState({
    hadir: '', terlambat: '', izin: '', sakit: '', alfa: '', pulang: '',
  });

  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    setTanggalMulai(getFirstDayOfMonth());
    setTanggalSampai(getTodayDate());

    const kelasId = parseInt(id);
    const rekapData = rekapByKelas[kelasId];

    if (rekapData) {
      setKelasInfo(rekapData.kelasInfo);
      setData(rekapData.data);
    }

    setLoading(false);
  }, [id]);

  const formatTanggalIndonesia = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatDateDisplay = (start, end) => {
    const opt = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${new Date(start).toLocaleDateString('id-ID', opt)} - ${new Date(end).toLocaleDateString('id-ID', opt)}`;
  };

  const handleApplyPeriode = () => {
    if (tanggalMulai && tanggalSampai) {
      console.log('Filter periode dari:', tanggalMulai, 'sampai:', tanggalSampai);
    }
  };

  const handleExportExcel = async () => {
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Rekap Kehadiran');

      ws.mergeCells('A1:I1');
      const titleCell = ws.getCell('A1');
      titleCell.value = `REKAP KEHADIRAN PESERTA DIDIK`;
      titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0a1f3e' } };
      ws.getRow(1).height = 30;

      ws.mergeCells('A2:I2');
      const classCell = ws.getCell('A2');
      classCell.value = `Kelas: ${kelasInfo?.nama_kelas || '-'}`;
      classCell.font = { bold: true, size: 12 };
      classCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(2).height = 25;

      ws.mergeCells('A3:I3');
      const periodCell = ws.getCell('A3');
      periodCell.value = `Periode: ${formatDateDisplay(tanggalMulai, tanggalSampai)}`;
      periodCell.font = { size: 11 };
      periodCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(3).height = 20;

      ws.addRow([]);

      const headerRow = ws.addRow([
        'No', 'NIS/NISN', 'Nama Siswa',
        'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alfa', 'Pulang'
      ]);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0066cc' } };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });

      data.forEach((siswa, index) => {
        const dataRow = ws.addRow([
          index + 1, siswa.nisn, siswa.nama,
          siswa.hadir || 0, siswa.terlambat || 0, siswa.izin || 0,
          siswa.sakit || 0, siswa.alfa || 0, siswa.pulang || 0
        ]);
        dataRow.height = 20;
        dataRow.eachCell((cell, colNumber) => {
          cell.alignment = { horizontal: colNumber === 3 ? 'left' : 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
            left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
            bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
            right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
          };
          if (index % 2 === 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
          }
        });
      });

      ws.getColumn(1).width = 6;
      ws.getColumn(2).width = 15;
      ws.getColumn(3).width = 35;
      ws.getColumn(4).width = 10;
      ws.getColumn(5).width = 12;
      ws.getColumn(6).width = 10;
      ws.getColumn(7).width = 10;
      ws.getColumn(8).width = 10;
      ws.getColumn(9).width = 10;

      const buf = await wb.xlsx.writeBuffer();
      const fileName = `Rekap_Kehadiran_${kelasInfo?.nama_kelas || 'Kelas'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(new Blob([buf]), fileName);
      setShowExport(false);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Gagal mengekspor Excel. Silakan coba lagi.');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');

      doc.setFillColor(10, 31, 62);
      doc.rect(0, 0, 297, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('REKAP KEHADIRAN PESERTA DIDIK', 148.5, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Kelas: ${kelasInfo?.nama_kelas || '-'}`, 148.5, 23, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Periode: ${formatDateDisplay(tanggalMulai, tanggalSampai)}`, 148.5, 30, { align: 'center' });

      const tableData = data.map((siswa, index) => [
        index + 1, siswa.nisn, siswa.nama,
        siswa.hadir || 0, siswa.terlambat || 0, siswa.izin || 0,
        siswa.sakit || 0, siswa.alfa || 0, siswa.pulang || 0
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['No', 'NIS/NISN', 'Nama Siswa', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alfa', 'Pulang']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 10 },
        bodyStyles: { fontSize: 9, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 80, halign: 'left' },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 18, halign: 'center' },
          5: { cellWidth: 15, halign: 'center' },
          6: { cellWidth: 15, halign: 'center' },
          7: { cellWidth: 15, halign: 'center' },
          8: { cellWidth: 15, halign: 'center' },
        },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        margin: { top: 40, left: 14, right: 14 }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Halaman ${i} dari ${pageCount}`, 148.5, doc.internal.pageSize.height - 10, { align: 'center' });
        doc.text(
          `Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
          148.5, doc.internal.pageSize.height - 5, { align: 'center' }
        );
      }

      const fileName = `Rekap_Kehadiran_${kelasInfo?.nama_kelas || 'Kelas'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      setShowExport(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Gagal mengekspor PDF. Silakan coba lagi.');
    }
  };

  const generateDetailData = (siswa) => {
    const mapelList = ["Pemrograman Web", "Basis Data", "Matematika", "Bahasa Indonesia", "Jaringan Komputer", "PKK"];
    const guruList  = ["Budi Santoso", "Sri Wahyuni", "Agus Riyanto", "Rina Marlina", "Hendra Kusuma", "Dewi Lestari"];
    const statusMap = {
      hadir:     { label: "Hadir",     cls: "badge-hadir" },
      terlambat: { label: "Terlambat", cls: "badge-terlambat" },
      izin:      { label: "Izin",      cls: "badge-izin" },
      sakit:     { label: "Sakit",     cls: "badge-sakit" },
      alfa:      { label: "Alfa",      cls: "badge-alfa" },
      pulang:    { label: "Pulang",    cls: "badge-pulang" },
    };

    const entries = [];
    Object.entries(statusMap).forEach(([key, { label, cls }]) => {
      const count = siswa[key] || 0;
      for (let i = 0; i < count; i++) {
        const dayOffset = entries.length + 1;
        const tgl = new Date();
        tgl.setDate(tgl.getDate() - dayOffset);
        const mapelIdx = entries.length % mapelList.length;
        entries.push({
          no:         entries.length + 1,
          tanggal:    tgl.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
          jam:        `JP ${(mapelIdx % 6) + 1}-${(mapelIdx % 6) + 2}`,
          mapel:      mapelList[mapelIdx],
          guru:       guruList[mapelIdx],
          keterangan: key === "izin" ? "Keperluan keluarga" : key === "sakit" ? "Sakit flu" : "-",
          status:     label,
          badgeClass: cls,
        });
      }
    });

    return entries;
  };

  if (loading) {
    return (
      <div className="kontainer-loading">
        <div className="teks-loading">
          <FaSpinner className="spinner" /> Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="kehadiran-siswa-rekap-page">
      <NavbarWaka />
      <div className="kehadiran-siswa-rekap-header-card">
        <div className="kehadiran-siswa-rekap-header-top">
          <div className="kehadiran-siswa-rekap-header-left">
            <div className="kehadiran-siswa-rekap-icon">
              <FaSchool />
            </div>
            <h2>Rekap Kehadiran Peserta Didik</h2>
          </div>

          <div className="kehadiran-siswa-rekap-header-right">
            <div className="kehadiran-siswa-rekap-periode-wrapper">
              <span className="kehadiran-siswa-rekap-periode-label">Periode:</span>
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
                <span> — </span>
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
                <FaFileExport /> Ekspor
              </button>
              {showExport && (
                <div className="kehadiran-guru-index-export-menu">
                  <button onClick={handleExportPDF} className="export-item pdf">
                    <FaFilePdf /> PDF
                  </button>
                  <button onClick={handleExportExcel} className="export-item excel">
                    <FaFileExcel /> Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="kehadiran-siswa-rekap-info">
          <span className="info-badge">
            <FaUser /> {kelasInfo?.nama_kelas || '-'}
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
              <th>Alfa</th>
              <th>Pulang</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((siswa, i) => (
                <tr key={siswa.id || i}>
                  <td>{i + 1}</td>
                  <td>{siswa.nisn}</td>
                  <td><b>{siswa.nama}</b></td>
                  <td className="hadir">{siswa.hadir || 0}</td>
                  <td className="terlambat">{siswa.terlambat || 0}</td>
                  <td className="izin">{siswa.izin || 0}</td>
                  <td className="sakit">{siswa.sakit || 0}</td>
                  <td className="alfa">{siswa.alfa || 0}</td>
                  <td className="pulang">{siswa.pulang || 0}</td>
                  <td className="aksi-wrapper">
                    <button
                      className="kehadiran-siswa-rekap-detail"
                      title="Detail Kehadiran"
                      onClick={() => {
                        setSelectedDetail({ ...siswa, detail: generateDetailData(siswa) });
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
                          alfa: siswa.alfa || 0,
                          pulang: siswa.pulang || 0,
                        });
                        setShowEditModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                  Tidak ada data rekap kehadiran untuk kelas ini
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button className="kehadiran-siswa-rekap-back" onClick={() => window.history.back()}>
        <FaArrowLeft /> Kembali
      </button>

      {/* MODAL EDIT */}
      {showEditModal && (
        <div className="kehadiran-siswa-rekap-modal-overlay">
          <div className="kehadiran-siswa-rekap-modal">
            <h3 className="kehadiran-siswa-rekap-modal-title">Edit Rekap Kehadiran</h3>
            <div className="kehadiran-siswa-rekap-modal-body">
              <label>Hadir</label>
              <input type="number" min="0" value={form.hadir} onChange={(e) => setForm({ ...form, hadir: e.target.value })} />
              <label>Terlambat</label>
              <input type="number" min="0" value={form.terlambat} onChange={(e) => setForm({ ...form, terlambat: e.target.value })} />
              <label>Izin</label>
              <input type="number" min="0" value={form.izin} onChange={(e) => setForm({ ...form, izin: e.target.value })} />
              <label>Sakit</label>
              <input type="number" min="0" value={form.sakit} onChange={(e) => setForm({ ...form, sakit: e.target.value })} />
              <label>Alfa</label>
              <input type="number" min="0" value={form.alfa} onChange={(e) => setForm({ ...form, alfa: e.target.value })} />
              <label>Pulang</label>
              <input type="number" min="0" value={form.pulang} onChange={(e) => setForm({ ...form, pulang: e.target.value })} />
            </div>
            <div className="kehadiran-siswa-rekap-modal-actions">
              <button className="kehadiran-siswa-rekap-modal-cancel" onClick={() => setShowEditModal(false)}>Batal</button>
              <button type="button" className="kehadiran-siswa-rekap-modal-save" onClick={handleSave}>Simpan</button>
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
                {selectedDetail.detail && selectedDetail.detail.length > 0 ? (
                  selectedDetail.detail.map((item, index) => (
                    <tr key={index}>
                      <td>{item.no}</td>
                      <td>{item.tanggal}</td>
                      <td>{item.jam}</td>
                      <td>{item.mapel}</td>
                      <td>{item.guru}</td>
                      <td>{item.keterangan}</td>
                      <td>
                        <span className={`badge ${item.badgeClass}`}>{item.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                      Tidak ada detail kehadiran
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}