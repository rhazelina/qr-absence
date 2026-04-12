import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './DataSiswa.css';
import TambahSiswa from '../../components/Admin/TambahSiswa';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';

// API Configuration
const baseURL = import.meta.env.VITE_API_URL;
const API_BASE_URL = baseURL ? baseURL : 'http://localhost:8000/api';

// API Service
const apiService = {
  getStudents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      return await response.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      return { data: [] };
    }
  },

  addStudent: async (studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      });
      if (!response.ok) throw new Error('Failed to add student');
      return await response.json();
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },

  updateStudent: async (id, studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      });
      if (!response.ok) throw new Error('Failed to update student');
      return await response.json();
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  deleteStudent: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to delete student');
      return await response.json();
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  importStudents: async (studentsData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ students: studentsData })
      });
      if (!response.ok) throw new Error('Failed to import students');
      return await response.json();
    } catch (error) {
      console.error('Error importing students:', error);
      throw error;
    }
  }
};

// ============================================================
// KONFIGURASI KELAS
// Ubah romawi → angka: X=10, XI=11, XII=12
// Setiap jurusan punya kelas bernomor (1, 2, 3)
// Format grade di DB tetap sama: "10 RPL 1", "11 TKJ 2", dst
// ============================================================
const JURUSAN_LIST = ['RPL', 'TKJ', 'DKV', 'AV', 'MT', 'BC', 'AN', 'EI'];

// Jurusan besar punya 3 kelas per angkatan, yang kecil 1
const JUMLAH_KELAS_PER_JURUSAN = {
  RPL: 3, TKJ: 3, DKV: 3,
  AV: 1, MT: 1, BC: 1, AN: 1, EI: 1
};

const ANGKATAN = [10, 11, 12]; // pengganti X, XI, XII

// Generate semua kombinasi kelas untuk satu jurusan
// misal RPL → ["10 RPL 1","10 RPL 2","10 RPL 3","11 RPL 1", ...]
const generateKelasForJurusan = (jurusan) => {
  const jumlah = JUMLAH_KELAS_PER_JURUSAN[jurusan] || 1;
  const result = [];
  for (const angkatan of ANGKATAN) {
    for (let no = 1; no <= jumlah; no++) {
      result.push(`${angkatan} ${jurusan} ${no}`);
    }
  }
  return result;
};

// Generate semua kelas dari semua jurusan
const generateSemuaKelas = () => {
  return JURUSAN_LIST.flatMap(j => generateKelasForJurusan(j));
};

function DataSiswa() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [editData, setEditData] = useState(null);

  const fileInputRef = useRef(null);
  const exportButtonRef = useRef(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    const result = await apiService.getStudents();
    if (result.data) setStudents(result.data);
    setLoading(false);
  };

  // ── Reset filterKelas saat filterJurusan berubah ──────────
  const handleJurusanChange = (e) => {
    setFilterJurusan(e.target.value);
    setFilterKelas(''); // reset kelas karena daftar kelas berubah
  };

  // ── Daftar kelas dinamis berdasarkan jurusan dipilih ──────
  const kelasDinamis = filterJurusan
    ? generateKelasForJurusan(filterJurusan)
    : generateSemuaKelas();

  // ── Filter & Search ───────────────────────────────────────
  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchSearch =
        searchTerm === '' ||
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nisn?.includes(searchTerm);

      // Filter jurusan: cocokkan student.major
      const matchJurusan = filterJurusan === '' || student.major === filterJurusan;

      // Filter kelas: cocokkan student.grade (format "10 RPL 1")
      const matchKelas = filterKelas === '' || student.grade === filterKelas;

      return matchSearch && matchJurusan && matchKelas;
    });
  };

  const filteredStudents = getFilteredStudents();

  // ── Add / Update ─────────────────────────────────────────
  const handleAddOrUpdate = async (formData) => {
    try {
      const studentData = {
        name: formData.namaSiswa,
        nisn: formData.nisn,
        major: formData.jurusan,
        grade: formData.kelas // tetap simpan sebagai string, misal "10 RPL 1"
      };

      if (editData) {
        await apiService.updateStudent(editData.id, studentData);
        alert('Data siswa berhasil diperbarui!');
      } else {
        await apiService.addStudent(studentData);
        alert('Data siswa berhasil ditambahkan!');
      }

      await loadStudents();
      setIsModalOpen(false);
      setEditData(null);
    } catch (error) {
      alert('Gagal menyimpan data siswa!');
    }
  };

  // ── Delete ────────────────────────────────────────────────
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

  // ── Edit ──────────────────────────────────────────────────
  const handleEditClick = (student) => {
    setEditData({
      id: student.id,
      namaSiswa: student.name,
      nisn: student.nisn,
      jurusan: student.major,
      kelas: student.grade
    });
    setIsModalOpen(true);
  };

  // ── Reset Filter ──────────────────────────────────────────
  const handleResetFilter = () => {
    setSearchTerm('');
    setFilterJurusan('');
    setFilterKelas('');
  };

  // ── Export Excel ──────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([{
      'No': '', 'Nama Siswa': '', 'NISN': '', 'Jurusan': '', 'Kelas': ''
    }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Data Siswa');
    worksheet['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
    XLSX.writeFile(workbook, 'Format_Data_Siswa.xlsx');
    alert('Format Excel berhasil diunduh!');
  };

  const handleExportToExcel = () => {
    const dataToExport = filteredStudents.length > 0 ? filteredStudents : students;
    if (dataToExport.length === 0) { alert('Tidak ada data untuk diekspor!'); return; }

    const exportData = dataToExport.map((s, i) => ({
      'No': i + 1, 'Nama Siswa': s.name, 'NISN': s.nisn,
      'Jurusan': s.major, 'Kelas': s.grade
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
    worksheet['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.writeFile(workbook, `Data_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`);
    alert('Data berhasil diekspor ke Excel!');
    setShowExportMenu(false);
  };

  const handleExportToPDF = () => {
    const dataToExport = filteredStudents.length > 0 ? filteredStudents : students;
    if (dataToExport.length === 0) { alert('Tidak ada data untuk diekspor!'); return; }

    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('Data Siswa', 14, 22);
    doc.setFontSize(10); doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    autoTable(doc, {
      head: [['No', 'Nama Siswa', 'NISN', 'Jurusan', 'Kelas']],
      body: dataToExport.map((s, i) => [i + 1, s.name, s.nisn, s.major, s.grade]),
      startY: 35, theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 15 }, 1: { cellWidth: 60 },
        2: { cellWidth: 35 }, 3: { cellWidth: 25 }, 4: { cellWidth: 30 }
      }
    });

    doc.save(`Data_Siswa_${new Date().toISOString().split('T')[0]}.pdf`);
    alert('Data berhasil diekspor ke PDF!');
    setShowExportMenu(false);
  };

  const handleImportFromExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) { alert('File Excel kosong!'); return; }

        const importedStudents = jsonData.map((row, index) => {
          const nisn  = String(row['NISN'] || '').trim();
          const nama  = String(row['Nama Siswa'] || '').trim();
          const jurusan = String(row['Jurusan'] || '').trim();
          const kelas = String(row['Kelas'] || '').trim();

          if (!nisn || !nama) {
            throw new Error(`Baris ${index + 2}: NISN dan Nama Siswa wajib diisi`);
          }
          return { name: nama, nisn, major: jurusan, grade: kelas };
        });

        const result = await apiService.importStudents(importedStudents);
        if (result.data) {
          const { imported, duplicates } = result.data;
          let message = `✅ Berhasil mengimpor ${imported} data siswa.`;
          if (duplicates?.length > 0) {
            message += `\n\n❌ ${duplicates.length} data ditolak (NISN duplikat):\n${duplicates.join(', ')}`;
          }
          alert(message);
          await loadStudents();
        }
      } catch (error) {
        alert('❌ Gagal membaca file Excel!\n\n' + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  // ── Icons ─────────────────────────────────────────────────
  const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
  const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  );
  const ExcelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginRight: '8px' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="15" x2="15" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="18" x2="15" y2="18"/>
    </svg>
  );
  const PDFIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginRight: '8px' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="M9 13h6"/><path d="M9 17h6"/>
    </svg>
  );
  const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginRight: '8px' }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );

  if (loading) {
    return (
      <div className="data-container">
        <NavbarAdmin />
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          minHeight: '60vh', fontSize: '18px', color: '#6b7280'
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
            {/* ── Filter Jurusan ── */}
            <label>Konsentrasi Keahlian :</label>
            <select value={filterJurusan} onChange={handleJurusanChange}>
              <option value="">Semua Jurusan</option>
              {JURUSAN_LIST.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>

            {/* ── Filter Kelas — dinamis berdasarkan jurusan ── */}
            <label>Kelas :</label>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
            >
              <option value="">
                {filterJurusan ? `Semua Kelas ${filterJurusan}` : 'Semua Kelas'}
              </option>
              {kelasDinamis.map(kls => (
                <option key={kls} value={kls}>{kls}</option>
              ))}
            </select>

            {(searchTerm || filterJurusan || filterKelas) && (
              <button className="btn-reset-filter" onClick={handleResetFilter} title="Reset Filter">
                Reset Filter
              </button>
            )}

            <button className="btn-tambah" onClick={() => { setEditData(null); setIsModalOpen(true); }}>
              Tambahkan
            </button>

            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button ref={exportButtonRef} className="btn-export"
                onClick={() => setShowExportMenu(!showExportMenu)}>
                Ekspor ▼
              </button>
              {showExportMenu && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, backgroundColor: 'white',
                  border: '1px solid #ddd', borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 1000,
                  minWidth: '170px', marginTop: '5px'
                }}>
                  <button onClick={handleExportToExcel} style={{
                    width: '100%', padding: '10px 15px', border: 'none',
                    background: 'white', textAlign: 'left', cursor: 'pointer',
                    fontSize: '14px', display: 'flex', alignItems: 'center'
                  }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                    <ExcelIcon /> Excel (.xlsx)
                  </button>
                  <button onClick={handleExportToPDF} style={{
                    width: '100%', padding: '10px 15px', border: 'none',
                    background: 'white', textAlign: 'left', cursor: 'pointer',
                    fontSize: '14px', borderTop: '1px solid #f0f0f0',
                    display: 'flex', alignItems: 'center'
                  }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                    <PDFIcon /> PDF (.pdf)
                  </button>
                </div>
              )}
            </div>

            <input type="file" ref={fileInputRef} accept=".xlsx,.xls"
              onChange={handleImportFromExcel} style={{ display: 'none' }} />
            <button className="btn-import" onClick={() => fileInputRef.current?.click()}>
              Impor
            </button>
            <button className="btn-download-template" onClick={handleDownloadTemplate}
              title="Download Format Excel kosong">
              <DownloadIcon /> Format Excel
            </button>
          </div>
        </div>

        {/* Info hasil filter */}
        {(searchTerm || filterJurusan || filterKelas) && (
          <div style={{
            padding: '10px 20px', backgroundColor: '#e3f2fd',
            borderLeft: '4px solid #2196f3', marginBottom: '15px', borderRadius: '4px'
          }}>
            <strong>Hasil Filter:</strong> {filteredStudents.length} dari {students.length} siswa
            {searchTerm   && <span> | Pencarian: "{searchTerm}"</span>}
            {filterJurusan && <span> | Jurusan: {filterJurusan}</span>}
            {filterKelas   && <span> | Kelas: {filterKelas}</span>}
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
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.name}</td>
                  <td>{student.nisn}</td>
                  <td>{student.major}</td>
                  <td>{student.grade}</td>
                  <td className="aksi-cell">
                    <button className="aksi edit"
                      onClick={() => handleEditClick(student)} title="Edit">
                      <EditIcon />
                    </button>
                    <button className="aksi hapus"
                      onClick={() => handleDeleteStudent(student.id)} title="Hapus">
                      <DeleteIcon />
                    </button>
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
      </div>

      <TambahSiswa
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditData(null); }}
        onSubmit={handleAddOrUpdate}
        editData={editData}
      />
    </div>
  );
}

export default DataSiswa;