import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../utils/api';
import Pagination from '../../components/Common/Pagination';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import TambahSiswa from '../../components/Admin/TambahSiswa';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './DataSiswa.css';

function DataSiswa() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [majors, setMajors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0
  });

  const filteredStudents = students; // Assuming students array from backend is already filtered

  const filteredClasses = filterJurusan 
    ? classes.filter(cls => cls.major === parseInt(filterJurusan) || cls.major_id === parseInt(filterJurusan))
    : classes;

  const fileInputRef = useRef(null);
  const exportButtonRef = useRef(null);

  // Load students, majors, and classes from API
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [pagination.currentPage, filterJurusan, filterKelas]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.currentPage !== 1) {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      } else {
        loadStudents();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadInitialData = async () => {
    try {
      const [majorsRes, classesRes] = await Promise.all([
        apiService.getMajors(),
        apiService.getClasses()
      ]);
      setMajors(majorsRes.data || []);
      setClasses(classesRes.data || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        search: searchTerm,
        major_id: filterJurusan,
        class_id: filterKelas,
        per_page: 15
      };

      const result = await apiService.getStudents(params);
      if (result.data) {
        setStudents(result.data);
        if (result.meta) {
          setPagination(prev => ({
            ...prev,
            currentPage: result.meta.current_page,
            lastPage: result.meta.last_page,
            total: result.meta.total,
            from: result.meta.from,
            to: result.meta.to
          }));
        }
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Add or Update Student
  const handleAddOrUpdate = async (formData) => {
    try {
      const studentData = {
        name: formData.namaSiswa,
        nisn: formData.nisn,
        class_id: formData.class_id || null
      };

      if (editData) {
        await apiService.updateStudent(editData.id, studentData);
        alert("Data siswa berhasil diperbarui!");
      } else {
        await apiService.addStudent(studentData);
        alert("Data siswa berhasil ditambahkan!");
      }

      await loadStudents();
      setIsModalOpen(false);
      setEditData(null);
    } catch (error) {
      alert('Gagal menyimpan data siswa!');
    }
  };

  // Delete Student
  const handleDeleteStudent = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      try {
        await apiService.deleteStudent(id);
        alert('Data siswa berhasil dihapus!');
        await loadStudents();
      } catch (error) {
        alert('Gagal menghapus data siswa!');
      }
    }
  };

  // Edit Click
  const handleEditClick = (student) => {
    setEditData({
      id: student.id,
      name: student.name,
      nisn: student.nisn,
      class_id: student.class_id
    });
    setIsModalOpen(true);
  };

  // Reset Filter
  const handleResetFilter = () => {
    setSearchTerm('');
    setFilterJurusan('');
    setFilterKelas('');
  };

  // Download Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'name': 'Ahmad',
        'nisn': '0011223344',
        'nis': '12345',
        'gender': 'L',
        'address': 'Alamat Siswa',
        'class_name': 'XII RPL 1',
        'is_class_officer': 'false',
        'phone': '',
        'contact': ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Data Siswa');

    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 10 },
      { wch: 5 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];

    const fileName = 'Format_Data_Siswa.xlsx';
    XLSX.writeFile(workbook, fileName);
    alert('Format Excel berhasil diunduh! Isi class_name sesuai nama kelas yang tersedia.');
  };

  // Export to Excel
  const handleExportToExcel = () => {
    const dataToExport = students;

    if (dataToExport.length === 0) {
      alert('Tidak ada data untuk diekspor!');
      return;
    }

    const exportData = dataToExport.map((student, index) => ({
      'No': pagination.from + index,
      'Nama Siswa': student.name,
      'NISN': student.nisn,
      'Jurusan': student.major_name || '-',
      'Kelas': student.class_name || '-'
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

  // Export to PDF
  const handleExportToPDF = () => {
    const dataToExport = filteredStudents.length > 0 ? filteredStudents : students;

    if (dataToExport.length === 0) {
      alert('Tidak ada data untuk diekspor!');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Data Siswa', 14, 22);

    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    const tableData = dataToExport.map((student, index) => [
      index + 1,
      student.name,
      student.nisn,
      student.major,
      student.grade
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

  // Import from Excel
  const handleImportFromExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (jsonData.length === 0) {
          alert('File Excel kosong!');
          return;
        }

        // Map class names to IDs
        const classNameToId = {};
        classes.forEach(cls => {
          classNameToId[cls.name.toLowerCase()] = cls.id;
        });

        const importedStudents = jsonData
          .map((row) => {
            const className = String(row['class_name'] || '').trim().toLowerCase();
            return {
              name: String(row['name'] || '').trim(),
              username: String(row['username'] || '').trim(),
              email: String(row['email'] || '').trim() || null,
              password: String(row['password'] || '').trim() || null,
              nisn: String(row['nisn'] || '').trim(),
              nis: String(row['nis'] || '').trim(),
              gender: String(row['gender'] || '').trim(),
              address: String(row['address'] || '').trim(),
              class_id: classNameToId[className] || null,
              is_class_officer: String(row['is_class_officer'] || '').toLowerCase() === 'true' || row['is_class_officer'] == '1',
              phone: String(row['phone'] || '').trim() || null,
              contact: String(row['contact'] || '').trim() || null
            };
          });

        const result = await apiService.importStudents({ items: importedStudents });

        if (result.total_rows !== undefined) {
          alert(`✅ Berhasil mengimpor ${result.success_count} data siswa dari total ${result.total_rows} baris.`);
          await loadStudents();
        } else {
          alert(`✅ Berhasil mengimpor data siswa.`);
          await loadStudents();
        }

      } catch (error) {
        if (error.data && error.data.errors) {
          const { total_rows, success_count, failed_count, errors } = error.data;
          let message = `❌ Impor gagal.\n\nTotal Baris: ${total_rows}\nBerhasil: ${success_count}\nGagal: ${failed_count}\n\nDetail Error:\n`;
          errors.slice(0, 10).forEach(err => {
            message += `- Baris ${err.row}, Kolom ${err.column}: ${err.message}\n`;
          });
          if (errors.length > 10) {
            message += `... dan ${errors.length - 10} error lainnya.`;
          }
          alert(message);
        } else {
          alert('❌ Terjadi kesalahan saat mengimpor data!\n\n' + error.message);
        }
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
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
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

  if (loading) {
    return (
      <div className="data-container">
        <NavbarAdmin />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          fontSize: '18px',
          color: '#6b7280'
        }}>
          Memuat data siswa...
        </div>
      </div>
    );
  }

  return (
    <div className="data-container">
      <NavbarAdmin />
      <h1 className="page-title-siswa">Data Siswa</h1>

      <div className="table-wrapper">
        <div className="filter-box">
          <input
            type="text"
            placeholder="Cari Siswa (Nama/NISN)..."
            className="search1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="select-group">
            <label>Konsentrasi Keahlian :</label>
            <select
              value={filterJurusan}
              onChange={(e) => { setFilterJurusan(e.target.value); setFilterKelas(''); }}
            >
              <option value="">Semua Jurusan</option>
              {majors.map(major => (
                <option key={major.id} value={major.id}>{major.code} - {major.name}</option>
              ))}
            </select>

            <label>Kelas :</label>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              disabled={!filterJurusan}
            >
              <option value="">{filterJurusan ? 'Semua Kelas' : 'Pilih Jurusan Dulu'}</option>
              {filteredClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>

            {(searchTerm || filterJurusan || filterKelas) && (
              <button
                className="btn-reset-filter"
                onClick={handleResetFilter}
                title="Reset Filter"
              >
                Reset Filter
              </button>
            )}

            <button className="btn-tambah" onClick={() => { setEditData(null); setIsModalOpen(true); }}>
              Tambahkan
            </button>

            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button ref={exportButtonRef} className="btn-export" onClick={() => setShowExportMenu(!showExportMenu)}>
                Ekspor ▼
              </button>

              {showExportMenu && (
                <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 1000, minWidth: '170px', marginTop: '5px' }}>
                  <button onClick={handleExportToExcel} style={{ width: '100%', padding: '10px 15px', border: 'none', background: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', color: "black" }} onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'} onMouseOut={(e) => e.target.style.backgroundColor = 'white'}>
                    <ExcelIcon /> Excel (.xlsx)
                  </button>
                  <button onClick={handleExportToPDF} style={{ width: '100%', padding: '10px 15px', border: 'none', background: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '14px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', color: "black" }} onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'} onMouseOut={(e) => e.target.style.backgroundColor = 'white'}>
                    <PDFIcon /> PDF (.pdf)
                  </button>
                </div>
              )}
            </div>

            <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleImportFromExcel} style={{ display: 'none' }} />

            <button className="btn-import" onClick={() => fileInputRef.current?.click()}>
              Impor
            </button>

            <button className="btn-download-template" onClick={handleDownloadTemplate} title="Download Format Excel kosong">
              <DownloadIcon /> Format Excel
            </button>
          </div>
        </div>

        {(searchTerm || filterJurusan || filterKelas) && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: '#e3f2fd',
            borderLeft: '4px solid #2196f3',
            marginBottom: '15px',
            borderRadius: '4px'
          }}>
            <strong>Hasil Filter:</strong> {filteredStudents.length} dari {students.length} siswa
            {searchTerm && <span> | Pencarian: "{searchTerm}"</span>}
            {filterJurusan && <span> | Jurusan: {filterJurusan}</span>}
            {filterKelas && <span> | Kelas: {filterKelas}</span>}
          </div>
        )}

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
            {students.length > 0 ? (
              students.map((student, index) => (
                <tr key={student.id}>
                  <td>{pagination.from + index}</td>
                  <td>{student.name}</td>
                  <td>{student.nisn}</td>
                  <td>{student.major_name || '-'}</td>
                  <td>{student.class_name || '-'}</td>
                  <td className="aksi-cell">
                    <div className="aksi-container">
                      <button className="aksi edit" onClick={() => handleEditClick(student)} title="Edit">
                        <EditIcon />
                      </button>
                      <button className="aksi hapus" onClick={() => handleDeleteStudent(student.id)} title="Hapus">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  {searchTerm || filterJurusan || filterKelas
                    ? 'Tidak ada data yang sesuai dengan filter'
                    : 'Tidak ada data siswa'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          onPageChange={handlePageChange}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
        />
      </div>

      <TambahSiswa isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditData(null); }} onSubmit={handleAddOrUpdate} editData={editData} majors={majors} classes={classes} />
    </div>
  );
}

export default DataSiswa;