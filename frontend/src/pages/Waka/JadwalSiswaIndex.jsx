import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  FaDownload,
  FaSpinner
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
      const [schedulesRes, classesRes] = await Promise.all([
        apiService.get('/schedules'),
        apiService.get('/classes')
      ]);
      
      const schedulesData = schedulesRes.data || schedulesRes;
      const classesData = classesRes.data || classesRes;

      setSchedules(schedulesData);
      setFilteredData(schedulesData);
      setClasses(classesData);

      const extractedMajors = [];
      classesData.forEach(c => {
          const majorName = c.major?.name || c.major_name || c.department;
          if (majorName && !extractedMajors.find(m => m.value === majorName)) {
              extractedMajors.push({ label: majorName, value: majorName });
          }
      });
      
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = schedules;

    if (filterKompetensi) {
      filtered = filtered.filter((item) => {
        const majorName = item.class?.major?.name || item.class?.major_name || item.class?.department || '';
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
    navigate(`/waka/jadwal-siswa/${id}`);
  };

  const handleEdit = (e, id) => {
    e.preventDefault();
    navigate(`/waka/jadwal-siswa/${id}/edit`);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      await apiService.delete(`/schedules/${id}`);
      fetchData();
      alert('Jadwal berhasil dihapus');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Terjadi kesalahan saat menghapus data');
    }
  };

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
    XLSX.writeFile(workbook, 'Format_Jadwal.xlsx');
  };

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
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

        if (jsonData.length === 0) {
          alert('File Excel kosong!');
          return;
        }

        const importedSchedules = jsonData.map(row => ({
          subject_name: String(row['Mata Pelajaran'] || '').trim(),
          teacher_nip: String(row['NIP Guru'] || '').trim(),
          class_name: String(row['Nama Kelas'] || '').trim(),
          semester: String(row['Semester (ganjil/genap)'] || '').trim().toLowerCase(),
          year: String(row['Tahun Ajaran (ex: 2024/2025)'] || '').trim(),
          day: String(row['Hari (Senin-Minggu)'] || '').trim().toLowerCase(),
          start_time: String(row['Jam Mulai (HH:MM)'] || '').trim(),
          end_time: String(row['Jam Selesai (HH:MM)'] || '').trim()
        }));

        try {
          const result = await apiService.post('/import/jadwal', { items: importedSchedules });
          alert(`Sukses mengimpor ${result.success_count || 0} data jadwal!`);
          fetchData();
        } catch (error) {
           if (error.response?.data?.errors) {
            setImportErrors({
              failed: error.response.data.failed_count,
              total: error.response.data.total_rows,
              success: error.response.data.success_count,
              details: error.response.data.errors
            });
            setIsImportModalOpen(true);
          } else {
            alert('Gagal mengimpor data jadwal. Pastikan format file sesuai template.');
          }
        }
      } catch (error) {
        console.error('Error reading excel file:', error);
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
        <div className="filter-grid">
          
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
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <FaChevronDown className="select-icon" />
            </div>
          </div>

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

          <div className="filter-actions">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".xlsx, .xls"
              onChange={handleImportFromExcel}
            />
            <button onClick={() => fileInputRef.current.click()} className="btn-action btn-import" title="Import Jadwal">
              <FaUpload /> <span>Import</span>
            </button>
            <button onClick={handleDownloadTemplate} className="btn-action btn-template" title="Format Excel">
              <FaDownload /> <span>Format</span>
            </button>
            <button onClick={handleCreate} className="btn-action btn-add" title="Tambah Jadwal Baru">
              <FaPlus /> <span>Tambah</span>
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
            <div className="loading-state">
              <FaSpinner className="animate-spin" /> Memuat data...
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
                          {schedule.class?.major?.name || schedule.class?.major_name || schedule.class?.department || '-'}
                        </span>
                      </td>
                      <td>{schedule.class?.homeroom_teacher?.user?.name || schedule.class?.teacher_name || '-'}</td>
                      <td>{schedule.class?.name || '-'}</td>
                      <td>
                        <div className="jadwal-siswa-index-action">
                          <button className="jadwal-siswa-index-btn-view" onClick={(e) => handleView(e, schedule.id)} title="Lihat Detail">
                            <FaEye />
                          </button>
                          <button className="jadwal-siswa-index-btn-edit" onClick={(e) => handleEdit(e, schedule.id)} title="Edit Data">
                            <FaEdit />
                          </button>
                          <button className="btn-delete" onClick={(e) => handleDelete(e, schedule.id)} title="Hapus Data">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      Tidak ada data jadwal yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Import Error Modal - Simplified placeholder based on existing logic */}
      {isImportModalOpen && importErrors && (
        <div className="modal-overlay" onClick={() => setIsImportModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Gagal Mengimpor File</h2>
              <button onClick={() => setIsImportModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Terdapat {importErrors.failed} data yang bermasalah dari total {importErrors.total} baris.</p>
              <div className="error-list">
                {importErrors.details.map((err, idx) => (
                  <div key={idx} className="error-item">
                    <strong>Baris {err.row}:</strong> {err.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JadwalSiswaIndex;
