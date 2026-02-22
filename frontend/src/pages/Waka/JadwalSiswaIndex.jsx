import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './JadwalSiswaIndex.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaChevronDown,
  FaBriefcase,
  FaDoorOpen,
  FaUpload,
  FaDownload
} from "react-icons/fa";
import apiService from '../../utils/api';

function JadwalSiswaIndex() {
  const [schedules, setSchedules] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filters
  const [filterKompetensi, setFilterKompetensi] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  
  // Master Data for Filters
  const [classes, setClasses] = useState([]);
  const [majors, setMajors] = useState([]);

  // Import states
  const fileInputRef = useRef(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importErrors, setImportErrors] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetch for schedules and classes
      const [schedulesRes, classesRes] = await Promise.all([
        apiService.get('/schedules'),
        apiService.get('/classes') // Assuming this endpoint exists based on Edit component
      ]);
      
      const schedulesData = schedulesRes.data || schedulesRes;
      const classesData = classesRes.data || classesRes;

      setSchedules(schedulesData);
      setFilteredData(schedulesData);
      setClasses(classesData);

      // Extract unique majors from classes
      // Assuming class object has 'major' or 'department' property, or we parse from name
      const uniqueMajors = [...new Set(classesData.map(c => c.major_name || c.major || c.department || 'Umum'))].filter(Boolean);
      // Or if major is an object
      // const uniqueMajors = [...new Set(classesData.map(c => c.major?.name))].filter(Boolean);
      
      // If backend doesn't provide explicit major, we might need to rely on what's available
      // For now, let's try to map from the class data we have.
      // If classes have a 'major' relationship or field
      const extractedMajors = [];
      classesData.forEach(c => {
          const majorName = c.major?.name || c.major_name || c.department;
          if (majorName && !extractedMajors.find(m => m.value === majorName)) {
              extractedMajors.push({ label: majorName, value: majorName });
          }
      });
       // Fallback if no major field found, maybe parse from class name (e.g. "X RPL 1")
      if (extractedMajors.length === 0) {
           const parsedMajors = [...new Set(classesData.map(c => {
               const name = c.name || '';
               const parts = name.split(' ');
               return parts.length > 1 ? parts[1] : null;
           }))].filter(Boolean);
           parsedMajors.forEach(m => extractedMajors.push({ label: m, value: m }));
      }

      setMajors(extractedMajors);

    } catch (error) {
      console.error('Error fetching data:', error);
      // alert('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = schedules;

    if (filterKompetensi) {
      filtered = filtered.filter((item) => {
        // Safe navigation for nested properties
        const majorName = item.class?.major?.name || item.class?.major_name || item.class?.department || '';
        // Also check if we parsed it from name
        const className = item.class?.name || '';
        return majorName === filterKompetensi || className.includes(filterKompetensi);
      });
    }

    if (filterKelas) {
      filtered = filtered.filter(
        (item) => item.class?.name === filterKelas
      );
    }

    setFilteredData(filtered);
  }, [filterKompetensi, filterKelas, schedules]);

  const handleCreate = () => {
    navigate('/waka/jadwal-siswa/create');
  };

  const handleView = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/waka/jadwal-siswa/${id}`);
  };

  const handleEdit = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/waka/jadwal-siswa/${id}/edit`);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      await apiService.delete(`/schedules/${id}`);
      alert('Jadwal berhasil dihapus');
      // Refresh data
      const res = await apiService.get('/schedules');
      setSchedules(res.data || res);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Terjadi kesalahan saat menghapus data');
    }
  };

  // Download Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Mata Pelajaran': 'Matematika',
        'NIP Guru': '198001012005011001',
        'Nama Kelas': 'X RPL 1',
        'Semester (ganjil/genap)': 'ganjil',
        'Tahun Ajaran (ex: 2024/2025)': '2024/2025',
        'Hari (Senin-Minggu)': 'senin',
        'Jam Mulai (HH:MM)': '07:00',
        'Jam Selesai (HH:MM)': '08:30'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Jadwal');

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];

    const fileName = 'Format_Jadwal.xlsx';
    XLSX.writeFile(workbook, fileName);
    alert('Format Excel berhasil diunduh!');
  };

  // Import from Excel
  const handleImportFromExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          alert('File Excel kosong!');
          setLoading(false);
          return;
        }

        const subjectMap = {};
        try {
          const subjectRes = await apiService.get('/subjects');
          const subjects = subjectRes.data || subjectRes;
          subjects.forEach(s => subjectMap[s.name] = s.id);
        } catch(err) {}

        const teacherMap = {};
        try {
          const teacherRes = await apiService.getTeachers({ per_page: 1000 });
          if (teacherRes.data) {
             teacherRes.data.forEach(t => teacherMap[t.nip] = t.id);
          }
        } catch(err) {}

        const classMap = {};
        try {
          const classRes = await apiService.get('/classes');
          const classesList = classRes.data || classRes;
          classesList.forEach(c => classMap[c.name] = c.id);
        } catch(err) {}

        const importedSchedules = jsonData.map(row => {
          let startTime = String(row['Jam Mulai (HH:MM)'] || '').trim();
          let endTime = String(row['Jam Selesai (HH:MM)'] || '').trim();
          
          if (startTime && startTime.length === 5) startTime += ':00';
          if (endTime && endTime.length === 5) endTime += ':00';

          return {
            subject_id: subjectMap[String(row['Mata Pelajaran'] || '').trim()] || null,
            teacher_profile_id: teacherMap[String(row['NIP Guru'] || '').trim()] || null,
            class_id: classMap[String(row['Nama Kelas'] || '').trim()] || null,
            semester: String(row['Semester (ganjil/genap)'] || '').trim().toLowerCase(),
            year: String(row['Tahun Ajaran (ex: 2024/2025)'] || '').trim(),
            day: String(row['Hari (Senin-Minggu)'] || '').trim().toLowerCase(),
            start_time: startTime,
            end_time: endTime
          };
        });

        try {
          const result = await apiService.importSchedules({ items: importedSchedules });
          alert(`Sukses mengimpor ${result.success_count} data jadwal!`);
          await fetchData();
          event.target.value = ''; // Reset file input
        } catch (error) {
           if (error.errors && Array.isArray(error.errors)) {
            setImportErrors({
              total: error.total_rows,
              success: error.success_count,
              failed: error.failed_count,
              details: error.errors
            });
            setIsImportModalOpen(true);
          } else {
            alert('Gagal mengimpor data jadwal. Pastikan format file sesuai template.');
          }
        }
      } catch (error) {
        console.error('Error reading excel file:', error);
        alert('Gagal membaca file Excel!');
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };


  return (
    <div className="jadwal-siswa-index-root">
      <NavbarWaka />

      <div className="jadwal-siswa-index-header">
        <h1 className="jadwal-siswa-index-title">
          Jadwal Pembelajaran Siswa
        </h1>
        <p className="jadwal-siswa-index-subtitle">
          Kelola dan lihat jadwal pembelajaran per kelas dan semester
        </p>
      </div>

      {/* FILTER & ACTION */}
      <div className="filter-card">
        <div className="filter-grid" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
          
          {/* Kompetensi Keahlian */}
          <div className="filter-group">
            <label className="filter-label">
              <FaBriefcase /> Konsentrasi Keahlian
            </label>
            <div className="select-wrapper">
              <select
                value={filterKompetensi}
                onChange={(e) => setFilterKompetensi(e.target.value)}
                className="filter-select"
              >
                <option value="">Semua Konsentrasi</option>
                {majors.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <FaChevronDown className="select-icon" />
            </div>
          </div>

          {/* Kelas */}
          <div className="filter-group">
            <label className="filter-label">
              <FaDoorOpen /> Kelas
            </label>
            <div className="select-wrapper">
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="filter-select"
              >
                <option value="">Semua Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <FaChevronDown className="select-icon" />
            </div>
          </div>

          {/* Add Button */}
          <div className="filter-group" style={{ justifyContent: 'flex-end', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".xlsx, .xls"
              onChange={handleImportFromExcel}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="jadwal-siswa-index-btn-add"
              style={{ backgroundColor: '#10b981' }}
              title="Import Jadwal"
            >
              <FaUpload /> Import
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="jadwal-siswa-index-btn-add"
              style={{ backgroundColor: '#64748b' }}
              title="Format Excel"
            >
              <FaDownload /> Format
            </button>
            <button
              onClick={handleCreate}
              className="jadwal-siswa-index-btn-add"
              title="Tambah Jadwal Baru"
            >
              <FaPlus /> Tambah
            </button>
          </div>

        </div>
      </div>

      {/* TABLE */}
      <div className="jadwal-siswa-index-table-card">
        <div className="jadwal-siswa-index-table-header">
          <h3>Daftar Jadwal ({filteredData.length})</h3>
        </div>

        <div className="jadwal-siswa-index-table-wrapper">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Memuat data...
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kompetensi Keahlian</th>
                  <th>Wali Kelas</th>
                  <th>Kelas</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((schedule, index) => (
                    <tr key={schedule.id}>
                      <td>{index + 1}</td>

                      <td>
                        <span className="jadwal-siswa-index-badge-blue">
                          {schedule.class?.major_name || schedule.class?.major?.name || schedule.class?.department || (schedule.class?.name ? schedule.class.name.split(' ')[1] : '-') || '-'}
                        </span>
                      </td>

                      <td>
                          {schedule.class?.homeroom_teacher?.user?.name || schedule.class?.homeroom_teacher?.name || '-'}
                      </td>
                      
                      <td className="siswa-mapel">
                          {schedule.class?.name || 'N/A'}
                      </td>

                      <td>
                        <div className="jadwal-siswa-index-action">
                          <button
                            className="jadwal-siswa-index-btn-view"
                            onClick={(e) => handleView(e, schedule.id)}
                            title="Lihat Detail"
                          >
                            <FaEye />
                          </button>

                          <button
                            className="jadwal-siswa-index-btn-edit"
                            onClick={(e) => handleEdit(e, schedule.id)}
                            title="Edit Data"
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="jadwal-siswa-index-btn-delete"
                            onClick={(e) => handleDelete(e, schedule.id)}
                            title="Hapus Data"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      Tidak ada data jadwal yang sesuai
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Import Error Modal */}
      {isImportModalOpen && importErrors && (
        <div className="kelas-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setIsImportModalOpen(false)}>
          <div className="kelas-modal-content" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="kelas-modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: '#ef4444', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Gagal Mengimpor File
              </h2>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setIsImportModalOpen(false)}>×</button>
            </div>
            
            <div className="kelas-modal-body" style={{ overflowY: 'auto', padding: '15px 0' }}>
              <div style={{ padding: '15px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#991b1b', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>Terdapat {importErrors.failed} baris data yang bermasalah.</p>
                <div style={{ display: 'flex', gap: '15px', fontSize: '14px' }}>
                  <span>📋 Total: {importErrors.total}</span>
                  <span style={{ color: '#059669' }}>✅ Sukses: {importErrors.success}</span>
                  <span style={{ color: '#dc2626' }}>❌ Gagal: {importErrors.failed}</span>
                </div>
              </div>

              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#1e293b' }}>Detail Error:</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {importErrors.details.map((err, idx) => (
                  <div key={idx} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#f8fafc', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontWeight: '600', color: '#334155' }}>Baris {err.row}</span>
                      <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>{err.column}</span>
                    </div>
                    <div style={{ color: '#ef4444' }}>{err.message}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="kelas-modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JadwalSiswaIndex;
