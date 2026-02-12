import React, { useState, useRef, useEffect, useMemo } from 'react';
import './DataGuru.css';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import { teacherService } from '../../services/teacher';
import { getClasses } from '../../services/class';
import { getSubjects } from '../../services/subject';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function DataGuru() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef(null);
  const exportButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    username: '',
    email: '',
    phone: '',
    subject: '',
    homeroom_class_id: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teachersData, classesData, subjectsData] = await Promise.all([
        teacherService.getTeachers(),
        getClasses(),
        getSubjects()
      ]);
      setTeachers(teachersData);
      setClasses(classesData);
      setSubjects(subjectsData);
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

  const resetForm = () => {
    setFormData({
      name: '',
      nip: '',
      username: '',
      email: '',
      phone: '',
      subject: '',
      homeroom_class_id: ''
    });
    setEditingTeacher(null);
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.nip.trim()) {
      alert('Nama dan NIP harus diisi!');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        nip: formData.nip,
        username: formData.username || formData.nip,
        email: formData.email || null,
        phone: formData.phone || null,
        subject: formData.subject || null,
        homeroom_class_id: formData.homeroom_class_id || null,
        password: formData.nip
      };

      if (editingTeacher) {
        await teacherService.updateTeacher(editingTeacher.id, payload);
        alert('Data guru berhasil diperbarui!');
      } else {
        await teacherService.createTeacher(payload);
        alert('Data guru berhasil ditambahkan!');
      }

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving teacher:', err);
      alert('Gagal menyimpan data guru.');
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
      try {
        await teacherService.deleteTeacher(id);
        alert('Data guru berhasil dihapus!');
        fetchData();
      } catch (err) {
        console.error('Error deleting teacher:', err);
        alert('Gagal menghapus data guru.');
      }
    }
  };

  const handleEditClick = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.user?.name || '',
      nip: teacher.nip || '',
      username: teacher.user?.username || '',
      email: teacher.user?.email || '',
      phone: teacher.user?.phone || '',
      subject: teacher.subject || '',
      homeroom_class_id: teacher.homeroom_class_id || ''
    });
    setIsModalOpen(true);
  };

  const handleExportToExcel = () => {
    if (teachers.length === 0) {
      alert('Tidak ada data untuk diekspor!');
      return;
    }

    const exportData = teachers.map((teacher, index) => ({
      'No': index + 1,
      'Nama Guru': teacher.user?.name || '',
      'NIP': teacher.nip || '',
      'Mata Pelajaran': teacher.subject || '',
      'Wali Kelas': teacher.homeroomClass?.name || 'Tidak ada'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');

    const fileName = `Data_Guru_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    alert('Data berhasil diekspor ke Excel!');
    setShowExportMenu(false);
  };

  const handleExportToPDF = () => {
    if (teachers.length === 0) {
      alert('Tidak ada data untuk diekspor!');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Data Guru', 14, 22);
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    const tableData = teachers.map((teacher, index) => [
      index + 1,
      teacher.user?.name || '',
      teacher.nip || '',
      teacher.subject || '',
      teacher.homeroomClass?.name || 'Tidak ada'
    ]);

    autoTable(doc, {
      head: [['No', 'Nama Guru', 'NIP', 'Mata Pelajaran', 'Wali Kelas']],
      body: tableData,
      startY: 35
    });

    const fileName = `Data_Guru_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    alert('Data berhasil diekspor ke PDF!');
    setShowExportMenu(false);
  };

  const handleDownloadTemplate = () => {
    const templateData = [{
      'Nama Guru': '',
      'NIP': '',
      'Username': '',
      'Email': '',
      'Telepon': '',
      'Mata Pelajaran': ''
    }];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Data Guru');
    XLSX.writeFile(workbook, 'Template_Data_Guru.xlsx');
    alert('Template Excel berhasil diunduh!');
  };

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
          name: String(row['Nama Guru'] || '').trim(),
          nip: String(row['NIP'] || '').trim(),
          username: String(row['Username'] || row['NIP'] || '').trim(),
          email: String(row['Email'] || '').trim() || null,
          phone: String(row['Telepon'] || '').trim() || null,
          subject: String(row['Mata Pelajaran'] || '').trim() || null
        }));

        await teacherService.importTeachers(items);
        alert(`✅ Berhasil mengimpor ${items.length} data guru.`);
        fetchData();
      } catch (error) {
        alert('❌ Gagal membaca file Excel!\n\n' + error.message);
        console.error(error);
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  // Filter teachers dengan useMemo untuk optimisasi
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (teacher.user?.name || '').toLowerCase().includes(searchLower) ||
        (teacher.nip || '').toLowerCase().includes(searchLower) ||
        (teacher.subject || '').toLowerCase().includes(searchLower)
      );
    });
  }, [teachers, searchQuery]);

  const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );

  const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  return (
    <div className="data-container">
      <NavbarAdmin />
      <h1 className="page-title">Data Guru</h1>

      <div className="table-wrapper">
        <div className="filter-box">
          <input
            type="text"
            placeholder="Cari Guru..."
            className="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="select-group">
            <button className="btn-tambah" onClick={() => { resetForm(); setIsModalOpen(true); }}>
              Tambahkan
            </button>

            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button ref={exportButtonRef} className="btn-export" onClick={() => setShowExportMenu(!showExportMenu)}>
                Ekspor ▼
              </button>

              {showExportMenu && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, backgroundColor: 'white',
                  border: '1px solid #ddd', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 1000, minWidth: '170px', marginTop: '5px'
                }}>
                  <button onClick={handleExportToExcel} style={{ width: '100%', padding: '10px 15px', border: 'none', background: 'white', textAlign: 'left', cursor: 'pointer' }}>
                    Excel (.xlsx)
                  </button>
                  <button onClick={handleExportToPDF} style={{ width: '100%', padding: '10px 15px', border: 'none', background: 'white', textAlign: 'left', cursor: 'pointer', borderTop: '1px solid #f0f0f0' }}>
                    PDF (.pdf)
                  </button>
                </div>
              )}
            </div>

            <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleImportFromExcel} style={{ display: 'none' }} />
            <button className="btn-import" onClick={() => fileInputRef.current?.click()}>Impor</button>
            <button className="btn-download-template" onClick={handleDownloadTemplate}>Format Excel</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay">
            <div className="loading-spinner">Memuat data guru...</div>
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
                <th>Nama Guru</th>
                <th>NIP</th>
                <th>Mata Pelajaran</th>
                <th>Wali Kelas</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data guru'}
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher, index) => (
                  <tr key={teacher.id}>
                    <td>{index + 1}</td>
                    <td>{teacher.user?.name || ''}</td>
                    <td>{teacher.nip || ''}</td>
                    <td>{teacher.subject || '-'}</td>
                    <td>{teacher.homeroomClass?.name || 'Tidak ada'}</td>
                    <td className="aksi-cell">
                      <button className="aksi edit" onClick={() => handleEditClick(teacher)} title="Edit">
                        <EditIcon />
                      </button>
                      <button className="aksi hapus" onClick={() => handleDeleteTeacher(teacher.id)} title="Hapus">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsModalOpen(false); resetForm(); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingTeacher ? 'Ubah Data Guru' : 'Tambah Guru'}</h2>

            <form onSubmit={handleAddOrUpdate}>
              <div className="input-group">
                <label>Nama Guru</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div className="input-group">
                <label>NIP</label>
                <input type="text" value={formData.nip} onChange={(e) => setFormData({ ...formData, nip: e.target.value })} required />
              </div>

              <div className="input-group">
                <label>Username</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>

              <div className="input-group">
                <label>Telepon</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>

              <div className="input-group">
                <label>Mata Pelajaran</label>
                <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                  <option value="">Pilih Mata Pelajaran (Opsional)</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Wali Kelas</label>
                <select value={formData.homeroom_class_id} onChange={(e) => setFormData({ ...formData, homeroom_class_id: e.target.value })}>
                  <option value="">Tidak ada</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-buttons">
                <button type="button" className="btn-batal" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                  Batal
                </button>
                <button type="submit" className="btn-submit">
                  {editingTeacher ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataGuru;