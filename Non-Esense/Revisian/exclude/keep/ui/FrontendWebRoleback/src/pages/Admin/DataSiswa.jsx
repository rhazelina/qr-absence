import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './DataSiswa.css';
import TambahSiswa from '../../components/Admin/TambahSiswa';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';

function DataSiswa() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // ✅ DATA DUMMY (DITAMBAHKAN, BUKAN DIUBAH FUNGSINYA)
  const [students, setStudents] = useState([
    {
      id: 1,
      nama: 'Andi Pratama',
      nisn: '1234567890',
      jurusan: 'RPL',
      kelas: 'XI',
    },
    {
      id: 2,
      nama: 'Siti Aulia',
      nisn: '2345678901',
      jurusan: 'DKV',
      kelas: 'X',
    },
    {
      id: 3,
      nama: 'Budi Santoso',
      nisn: '3456789012',
      jurusan: 'TKJ',
      kelas: 'XII',
    },
  ]);

  const [editData, setEditData] = useState(null);
  const fileInputRef = useRef(null);
  const exportButtonRef = useRef(null);

  // ADD / UPDATE DATA
  const handleAddOrUpdate = (formData) => {
    if (editData) {
      const updated = students.map((s) =>
        s.id === editData.id
          ? {
              ...s,
              nama: formData.namaSiswa,
              nisn: formData.nisn,
              jurusan: formData.jurusan,
              kelas: formData.kelas,
            }
          : s
      );

      setStudents(updated);
      setEditData(null);
      alert("Data siswa berhasil diperbarui!");
    } else {
      const newStudent = {
        id: Date.now(),
        nama: formData.namaSiswa,
        nisn: formData.nisn,
        jurusan: formData.jurusan,
        kelas: formData.kelas,
      };

      setStudents([...students, newStudent]);
      alert("Data siswa berhasil ditambahkan!");
    }

    setIsModalOpen(false);
  };

  // DELETE DATA
  const handleDeleteStudent = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      setStudents(students.filter(student => student.id !== id));
      alert('Data siswa berhasil dihapus!');
    }
  };

  // CLICK EDIT
  const handleEditClick = (student) => {
    setEditData(student);
    setIsModalOpen(true);
  };

  // DOWNLOAD FORMAT EXCEL (TEMPLATE KOSONG)
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nama Siswa': '',
        'NISN': '',
        'Jurusan': '',
        'Kelas': '',
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Data Siswa');

    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 }
    ];

    const fileName = `Template_Data_Siswa.xlsx`;
    XLSX.writeFile(workbook, fileName);
    alert('Template Excel berhasil diunduh!');
  };

  // EKSPOR KE EXCEL
  const handleExportToExcel = () => {
    if (students.length === 0) {
      alert('Tidak ada data untuk diekspor!');
      return;
    }

    const exportData = students.map((student, index) => ({
      'No': index + 1,
      'Nama Siswa': student.nama,
      'NISN': student.nisn,
      'Jurusan': student.jurusan,
      'Kelas': student.kelas,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 }
    ];

    const fileName = `Data_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    alert('Data berhasil diekspor ke Excel!');
    setShowExportMenu(false);
  };

  // EKSPOR KE PDF
  const handleExportToPDF = () => {
    if (students.length === 0) {
      alert('Tidak ada data untuk diekspor!');
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Data Siswa', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    // Tabel
    const tableData = students.map((student, index) => [
      index + 1,
      student.nama,
      student.nisn,
      student.jurusan,
      student.kelas
    ]);

    autoTable(doc, {
      head: [['No', 'Nama Siswa', 'NISN', 'Konsentrasi Keahlian', 'Kelas']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 60 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
        4: { cellWidth: 20 }
      }
    });

    const fileName = `Data_Siswa_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    alert('Data berhasil diekspor ke PDF!');
    setShowExportMenu(false);
  };

  // ✅ IMPOR DARI EXCEL DENGAN DETEKSI DUPLIKAT YANG LEBIH BAIK
  const handleImportFromExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          alert('File Excel kosong!');
          return;
        }

        // 🔑 Ambil NISN yang sudah ada
        const existingNISN = students.map(s => String(s.nisn));

        let duplicateCount = 0;
        const duplicateList = [];

        const importedStudents = jsonData
          .map((row, index) => {
            const nisn = String(row['NISN'] || '').trim();
            const nama = String(row['Nama Siswa'] || '').trim();
            const jurusan = String(row['Jurusan'] || '').trim();
            const kelas = String(row['Kelas'] || '').trim();

            // Validasi data wajib
            if (!nisn || !nama) {
              throw new Error(`Baris ${index + 2}: Data tidak lengkap (NISN dan Nama Siswa wajib diisi)`);
            }

            // ❌ Skip jika NISN kosong atau sudah ada
            if (existingNISN.includes(nisn)) {
              duplicateCount++;
              duplicateList.push(nisn);
              return null;
            }

            // Tambahkan ke list existing untuk cek duplikat dalam file yang sama
            existingNISN.push(nisn);

            return {
              id: Date.now() + Math.random(),
              nama: nama,
              nisn: nisn,
              jurusan: jurusan,
              kelas: kelas,
            };
          })
          .filter(Boolean); // buang null

        if (importedStudents.length === 0) {
          alert(
            '❌ Semua data gagal diimpor!\n\n' +
            'NISN yang sudah ada:\n' +
            duplicateList.join(', ')
          );
          return;
        }

        setStudents([...students, ...importedStudents]);

        const successMessage = `✅ Berhasil mengimpor ${importedStudents.length} data siswa.`;
        const duplicateMessage = duplicateCount > 0 
          ? `\n\n❌ ${duplicateCount} data ditolak karena NISN sudah ada:\n${duplicateList.join(', ')}` 
          : '';

        alert(successMessage + duplicateMessage);

      } catch (error) {
        alert('❌ Gagal membaca file Excel!\n\n' + error.message);
        console.error(error);
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  // Icon Edit SVG
  const EditIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );

  // Icon Delete SVG
  const DeleteIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  // Icon Excel SVG
  const ExcelIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ marginRight: '8px' }}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="9" y1="15" x2="15" y2="15"></line>
      <line x1="9" y1="12" x2="15" y2="12"></line>
      <line x1="9" y1="18" x2="15" y2="18"></line>
    </svg>
  );

  // Icon PDF SVG
  const PDFIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ marginRight: '8px' }}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <path d="M9 13h6"></path>
      <path d="M9 17h6"></path>
    </svg>
  );

  // Icon Download SVG
  const DownloadIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ marginRight: '8px' }}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  );

  return (
    <div className="data-container">
      <NavbarAdmin />
      <h1 className="page-title-siswa">Data Siswa</h1>

      <div className="table-wrapper">
        <div className="filter-box">
          <input type="text" placeholder="Cari Siswa..." className="search1" />

          <div className="select-group">
            <label>Konsentrasi Keahlian :</label>
            <select>
              <option>Konsentrasi Keahlian</option>
              <option>RPL</option>
              <option>TKJ</option>
              <option>DKV</option>
              <option>AV</option>
              <option>MT</option>
              <option>BC</option>
              <option>AN</option>
              <option>EI</option>
            </select>

            <label>Kelas :</label>
            <select>
              <option>Kelas...</option>
              <option>X</option>
              <option>XI</option>
              <option>XII</option>
            </select>

            <button
              className="btn-tambah"
              onClick={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
            >
              Tambahkan
            </button>

            {/* Tombol Ekspor dengan Dropdown */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                ref={exportButtonRef}
                className="btn-export" 
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                Ekspor ▼
              </button>
              
              {showExportMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  minWidth: '170px',
                  marginTop: '5px'
                }}>
                  <button
                    onClick={handleExportToExcel}
                    style={{
                      width: '100%',
                      padding: '10px 15px',
                      border: 'none',
                      background: 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <ExcelIcon /> Excel (.xlsx)
                  </button>
                  <button
                    onClick={handleExportToPDF}
                    style={{
                      width: '100%',
                      padding: '10px 15px',
                      border: 'none',
                      background: 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      borderTop: '1px solid #f0f0f0',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <PDFIcon /> PDF (.pdf)
                  </button>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls"
              onChange={handleImportFromExcel}
              style={{ display: 'none' }}
            />

            <button
              className="btn-import"
              onClick={() => fileInputRef.current?.click()}
            >
              Impor
            </button>

            {/* Button Download Format Excel */}
            <button
              className="btn-download-template"
              onClick={handleDownloadTemplate}
              title="Download Format Excel kosong"
            >
              <DownloadIcon /> Format Excel
            </button>
          </div>
        </div>

        <table className="tabel-siswa">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Siswa</th>
              <th>NISN</th>
              <th>Konsentrasi Keahlian</th>
              <th>Kelas</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.nama}</td>
                <td>{student.nisn}</td>
                <td>{student.jurusan}</td>
                <td>{student.kelas}</td>
                <td className="aksi-cell">
                  <button 
                    className="aksi edit" 
                    onClick={() => handleEditClick(student)}
                    title="Edit"
                  >
                    <EditIcon />
                  </button>
                  <button 
                    className="aksi hapus" 
                    onClick={() => handleDeleteStudent(student.id)}
                    title="Hapus"
                  >
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TambahSiswa
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={handleAddOrUpdate}
        editData={editData}
      />
    </div>
  );
}

export default DataSiswa;