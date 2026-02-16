import React, { useState, useEffect, useMemo } from 'react';
import './DataSiswa.css';
import TambahSiswa from '../../components/Admin/TambahSiswa';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import { getStudents, createStudent, updateStudent, deleteStudent, importStudents } from '../../services/student';
import { getClasses } from '../../services/class';
import { getMajors } from '../../services/major';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function DataSiswa() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const [editData, setEditData] = useState(null);
  const fileInputRef = React.useRef(null);
  const exportButtonRef = React.useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [studentsData, classesData, majorsData] = await Promise.all([
        getStudents(),
        getClasses(),
        getMajors()
      ]);
      setStudents(studentsData);
      setClasses(classesData);
      setMajors(majorsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal mengambil data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter students dengan useMemo untuk optimisasi  
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const searchLower = searchQuery.toLowerCase();
      const matchSearch =
        (student.name || '').toLowerCase().includes(searchLower) ||
        (student.nis || '').toLowerCase().includes(searchLower) ||
        (student.nisn || '').toLowerCase().includes(searchLower);

      const matchMajor = !selectedMajor || student.major_id === parseInt(selectedMajor);
      const matchLevel = !selectedLevel || (student.class_name && student.class_name.startsWith(selectedLevel));

      return matchSearch && matchMajor && matchLevel;
    });
  }, [students, searchQuery, selectedMajor, selectedLevel]);

  // ADD / UPDATE DATA
  const handleAddOrUpdate = async (formData) => {
    try {
      if (editData) {
        await updateStudent(editData.id, {
          name: formData.namaSiswa,
          nisn: formData.nisn,
          gender: formData.gender,
          address: formData.address,
          parent_phone: formData.parent_phone,
          class_id: formData.class_id
        });
        alert("Data siswa berhasil diperbarui!");
      } else {
        await createStudent({
          name: formData.namaSiswa,
          username: formData.nisn,
          password: formData.nisn,
          nis: formData.nisn,
          nisn: formData.nisn,
          gender: formData.gender,
          address: formData.address,
          parent_phone: formData.parent_phone,
          class_id: formData.class_id
        });
        alert("Data siswa berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      setEditData(null);
      fetchData();
    } catch (err) {
      console.error('Error saving student:', err);
      alert('Gagal menyimpan data siswa.');
    }
  };

  // DELETE DATA
  const handleDeleteStudent = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      try {
        await deleteStudent(id);
        alert('Data siswa berhasil dihapus!');
        fetchData();
      } catch (err) {
        console.error('Error deleting student:', err);
        alert('Gagal menghapus data siswa.');
      }
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
        'Username': '',
        'Password': ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Data Siswa');

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
      'Nama Siswa': student.name || student.nama,
      'NISN': student.nis || student.nisn,
      'Kelas': student.class_name || 'Belum ada kelas'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 }
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

    doc.setFontSize(18);
    doc.text('Data Siswa', 14, 22);

    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    const tableData = students.map((student, index) => [
      index + 1,
      student.name || student.nama,
      student.nis || student.nisn,
      student.class_name || 'Belum ada kelas'
    ]);

    autoTable(doc, {
      head: [['No', 'Nama Siswa', 'NISN', 'Kelas']],
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
      }
    });

    const fileName = `Data_Siswa_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    alert('Data berhasil diekspor ke PDF!');
    setShowExportMenu(false);
  };

  // IMPOR DARI EXCEL
  const handleImportFromExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
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

        const items = jsonData.map(row => ({
          name: String(row['Nama Siswa'] || '').trim(),
          nis: String(row['NISN'] || '').trim(),
          username: String(row['Username'] || row['NISN'] || '').trim(),
          password: String(row['Password'] || row['NISN'] || '').trim(),
          class_id: null
        }));

        await importStudents(items);
        alert(`✅ Berhasil mengimpor ${items.length} data siswa.`);
        fetchData();
      } catch (error) {
        alert('❌ Gagal membaca file Excel!\n\n' + error.message);
        console.error(error);
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  // Icon Components
  const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );

  const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  const ExcelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="9" y1="15" x2="15" y2="15"></line>
      <line x1="9" y1="12" x2="15" y2="12"></line>
      <line x1="9" y1="18" x2="15" y2="18"></line>
    </svg>
  );

  const PDFIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <path d="M9 13h6"></path>
      <path d="M9 17h6"></path>
    </svg>
  );

  const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
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
          <input
            type="text"
            placeholder="Cari Siswa..."
            className="search1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="select-group">
            <label>Konsentrasi Keahlian:</label>
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
            >
              <option value="">Semua Jurusan</option>
              {majors.map(major => (
                <option key={major.id} value={major.id}>{major.name}</option>
              ))}
            </select>

            <label>Kelas:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">Semua Kelas</option>
              <option value="X">X</option>
              <option value="XI">XI</option>
              <option value="XII">XII</option>
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

            <button
              className="btn-download-template"
              onClick={handleDownloadTemplate}
              title="Download Format Excel kosong"
            >
              <DownloadIcon /> Format Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay">
            <div className="loading-spinner">Memuat data siswa...</div>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button onClick={fetchData} className="btn-retry">Coba Lagi</button>
          </div>
        ) : (
          <table className="tabel-siswa">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>NISN</th>
                <th>Kelas</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    {searchQuery || selectedMajor ? 'Tidak ada data yang sesuai dengan filter' : 'Belum ada data siswa'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>{student.name || student.nama}</td>
                    <td>{student.nis || student.nisn}</td>
                    <td>{student.class_name || <span className="text-muted" style={{ fontStyle: 'italic' }}>Belum ada kelas</span>}</td>
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
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <TambahSiswa
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={handleAddOrUpdate}
        editData={editData}
        classes={classes}
        majors={majors}
      />
    </div>
  );
}

export default DataSiswa;