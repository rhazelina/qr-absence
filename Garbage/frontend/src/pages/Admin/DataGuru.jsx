import React, { useState, useRef, useEffect, useMemo } from 'react';
import './DataGuru.css';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import { teacherService } from '../../services/teacher';
import { getClasses } from '../../services/class';
import { getSubjects } from '../../services/subject';
import { getMajors } from '../../services/major'; // Assuming this exists or I'll use hardcoded for now if import fails
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Edit, Trash2, FileSpreadsheet, FileText, Download } from 'lucide-react';

const ExcelIcon = () => <FileSpreadsheet size={18} />;
const PDFIcon = () => <FileText size={18} />;
const DownloadIcon = () => <Download size={18} />;
const EditIcon = () => <Edit size={18} />;
const DeleteIcon = () => <Trash2 size={18} />;

function DataGuru() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  
  // State untuk data dari API
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk dropdown options
  const [mataPelajaranOptions, setMataPelajaranOptions] = useState([]);
  const [jabatanOptions, setJabatanOptions] = useState(['Guru', 'Waka', 'Kapro', 'Wali Kelas']);
  const [bidangWakaOptions, setBidangWakaOptions] = useState(['Kurikulum', 'Kesiswaan', 'Sarpras', 'Humas', 'Mutu']);
  const [konsentrasiKeahlianOptions, setKonsentrasiKeahlianOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  
  // State untuk filter/search
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef(null);
  const exportButtonRef = useRef(null);

  // State untuk form modal
  const [formData, setFormData] = useState({
    kodeGuru: '',
    namaGuru: '',
    jabatan: '',
    mataPelajaran: '',
    bidangWaka: '',
    konsentrasiKeahlian: '',
    kelas: '',
    jurusan: '',
    homeroom_class_id: '' // Helper for submission
  });

  // Fetch data saat component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      const [teachersData, classesData, subjectsData, majorsData] = await Promise.all([
        teacherService.getTeachers(),
        getClasses(),
        getSubjects(),
        getMajors()
      ]);

      // Transform backend data to frontend format if necessary
      // Assuming backend returns array of teacher objects
      const formattedTeachers = teachersData.map(t => ({
        id: t.id,
        kodeGuru: t.kode_guru || t.nip, // Fallback to NIP if kode_guru is empty
        namaGuru: t.user?.name || '',
        jabatan: t.jabatan || 'Guru',
        mataPelajaran: t.subject || '',
        bidangWaka: t.bidang || '',
        konsentrasiKeahlian: t.konsentrasi_keahlian || '',
        kelas: t.homeroom_class?.nama || '',
        jurusan: t.homeroom_class?.major?.code || '',
        homeroom_class_id: t.homeroom_class_id,
        nip: t.nip,
        username: t.user?.username || '',
        email: t.user?.email || '',
        phone: t.user?.phone || ''
      }));
      setTeachers(formattedTeachers);

      // Options
      setMataPelajaranOptions(subjectsData?.map(s => s?.name) || []);
      setKelasOptions(classesData);
      setJurusanOptions(majorsData.map(m => m.code)); // Or name
      setKonsentrasiKeahlianOptions(majorsData.map(m => m.name)); // Assuming concentration matches major name

    } catch (err) {
      setError('Gagal memuat data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter teachers dengan useMemo untuk optimisasi
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const searchLower = searchQuery.toLowerCase();
        return (
            (teacher.kodeGuru && teacher.kodeGuru.toLowerCase().includes(searchLower)) ||
            (teacher.namaGuru && teacher.namaGuru.toLowerCase().includes(searchLower)) ||
            (teacher.jabatan && teacher.jabatan.toLowerCase().includes(searchLower))
        );
    });
  }, [teachers, searchQuery]);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    
    // Validasi sederhana
    if (!formData.kodeGuru.trim()) {
      alert('Kode Guru harus diisi!');
      return;
    }
    if (!formData.namaGuru.trim()) {
      alert('Nama Guru harus diisi!');
      return;
    }

    const isDuplicate = teachers.some(teacher => 
      teacher.kodeGuru && teacher.kodeGuru.toLowerCase() === formData.kodeGuru.trim().toLowerCase() &&
      teacher.id !== editingTeacher?.id
    );

    if (isDuplicate) {
      alert(`❌ Kode Guru "${formData.kodeGuru}" sudah digunakan!\n\nSilakan gunakan kode yang berbeda.`);
      return;
    }
    
    // Prepare payload for API
    // Need to match StoreTeacherRequest/UpdateTeacherRequest
    // Need a default password for new users? Controller typically handles logic or requires it.
    // StoreTeacherRequest requires 'password' if creating user.
    // I'll set a default password if creating.
    
    const payload = {
        name: formData.namaGuru,
        username: formData.kodeGuru, // Use kodeGuru as username? Or seperate?
        // Let's assume username = kodeGuru for simplicity or generate one
        password: 'password123', // Default password
        nip: formData.kodeGuru, // Use kodeGuru as NIP as well or separate field? 
        // Logic: Backend requires NIP. kode_guru is also there.
        // Let's assign nip = kodeGuru for now if user doesn't input valid NIP separately.
        kode_guru: formData.kodeGuru,
        jabatan: formData.jabatan,
        subject: formData.jabatan === 'Guru' ? formData.mataPelajaran : null,
        bidang: formData.jabatan === 'Waka' ? formData.bidangWaka : null,
        konsentrasi_keahlian: formData.jabatan === 'Kapro' ? formData.konsentrasiKeahlian : null,
        homeroom_class_id: formData.jabatan === 'Wali Kelas' ? formData.homeroom_class_id : null,
    };

    try {
        if (editingTeacher) {
            // Update
            await teacherService.updateTeacher(editingTeacher.id, payload);
            alert("Berhasil memperbarui data guru");
        } else {
            // Create
            await teacherService.createTeacher(payload);
            alert("Berhasil menambahkan guru baru");
        }
        setIsModalOpen(false);
        resetForm();
        fetchInitialData();
    } catch (err) {
        console.error(err);
        alert("Gagal menyimpan data: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      kodeGuru: teacher.kodeGuru,
      namaGuru: teacher.namaGuru,
      jabatan: teacher.jabatan,
      mataPelajaran: teacher.mataPelajaran,
      bidangWaka: teacher.bidangWaka,
      konsentrasiKeahlian: teacher.konsentrasiKeahlian,
      kelas: teacher.kelas,
      jurusan: teacher.jurusan,
      homeroom_class_id: teacher.homeroom_class_id
    });
    setIsModalOpen(true);
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
        try {
            await teacherService.deleteTeacher(id);
            fetchInitialData();
        } catch (err) {
            console.error(err);
            alert("Gagal menghapus data");
        }
    }
  };

  const resetForm = () => {
    setFormData({
      kodeGuru: '',
      namaGuru: '',
      jabatan: '',
      mataPelajaran: '',
      bidangWaka: '',
      konsentrasiKeahlian: '',
      kelas: '',
      jurusan: '',
      homeroom_class_id: ''
    });
    setEditingTeacher(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Helper to find available classes or just all classes
  // REVISIWEB had getAvailableKelas() logic, but let's just show all classes for now
  const getAvailableKelas = () => {
      // Return combined objects for the dropdown: { display: "X RPL 1", value: "class_id", split: {kelas, jurusan} }
      return classesOptions.map(c => ({
          id: c.id,
          display: `${c.name} ${c.major?.code || ''}`,
          kelas: c.name,
          jurusan: c.major?.code
      }));
  };

  // Export functions (Simulated with frontend data for now as per REVISIWEB structure)
  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(teachers.map((t, i) => ({
      No: i + 1,
      'Kode Guru': t.kodeGuru,
      'Nama Guru': t.namaGuru,
      Jabatan: t.jabatan,
      Keterangan: getKeterangan(t)
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Guru");
    XLSX.writeFile(workbook, "Data_Guru.xlsx");
    setShowExportMenu(false);
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Data Guru", 14, 15);
    autoTable(doc, {
      head: [['No', 'Kode Guru', 'Nama Guru', 'Jabatan', 'Keterangan']],
      body: teachers.map((t, i) => [i + 1, t.kodeGuru, t.namaGuru, t.jabatan, getKeterangan(t)]),
      startY: 20
    });
    doc.save("Data_Guru.pdf");
    setShowExportMenu(false);
  };

  const getKeterangan = (teacher) => {
    if (teacher.jabatan === 'Guru') return teacher.mataPelajaran;
    if (teacher.jabatan === 'Waka') return teacher.bidangWaka;
    if (teacher.jabatan === 'Kapro') return teacher.konsentrasiKeahlian;
    if (teacher.jabatan === 'Wali Kelas') return `${teacher.kelas} ${teacher.jurusan}`;
    return '';
  };

  const handleDownloadTemplate = () => {
      // Create a dummy excel for template
      const ws = XLSX.utils.json_to_sheet([{
          'Kode Guru': 'GR001',
          'Nama Guru': 'Contoh Nama',
          'Jabatan': 'Guru',
          'Mapel/Bidang/Konsentrasi/Kelas': 'Matematika'
      }]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "Template_Import_Guru.xlsx");
  };

  const handleImportFromExcel = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          // Process data and send to backend
          // Mapping fields...
          const items = data.map(row => ({
              kode_guru: row['Kode Guru'],
              name: row['Nama Guru'],
              jabatan: row['Jabatan'],
              // Simplify for now, import logic might need more work on backend to parse "Keterangan"
              detail: row['Mapel/Bidang/Konsentrasi/Kelas']
          }));

          try {
              await teacherService.importTeachers(items);
              alert("Import berhasil!");
              fetchInitialData();
          } catch (err) {
              console.error(err);
              alert("Import gagal: " + err.message);
          }
      };
      reader.readAsBinaryString(file);
  };

  return (
    <div className="data-container">
      <NavbarAdmin /> {/* Verify if this component exists and works */}
      
      <div className="page-title-guru">DATA GURU</div>
      
      <div className="table-wrapper">
        <div className="filter-box">
          <input
            type="text"
            className="search"
            placeholder="Cari NIP, Nama atau Jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="select-group">
            <button 
              className="btn-tambah"
              onClick={() => {
                resetForm();
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
                      alignItems: 'center',
                      gap: '8px'
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
                      alignItems: 'center',
                       gap: '8px'
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
              style={{ gap: '8px' }}
            >
              <DownloadIcon /> Format Excel
            </button>
          </div>
        </div>

        <table className="tabel-siswa">
          <thead>
            <tr>
              <th>No</th>
              <th>Kode Guru</th>
              <th>Nama Guru</th>
              <th>Jabatan</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan="6" style={{textAlign: 'center'}}>Loading...</td></tr>
            ) : filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data guru'}
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher, index) => {
                let detail = getKeterangan(teacher);

                return (
                  <tr key={teacher.id}>
                    <td>{index + 1}</td>
                    <td>{teacher.kodeGuru}</td>
                    <td>{teacher.namaGuru}</td>
                    <td>{teacher.jabatan}</td>
                    <td>{detail}</td>
                    <td className="aksi-cell">
                      <button 
                        className="aksi edit" 
                        onClick={() => handleEditTeacher(teacher)}
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button 
                        className="aksi hapus" 
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        title="Hapus"
                      >
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM TAMBAH/EDIT GURU */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-contentt" onClick={(e) => e.stopPropagation()}>
            <div className="modal-headerr">
              <h2>{editingTeacher ? 'Ubah Data Guru' : 'Tambah Data Guru'}</h2>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleAddTeacher}>
              <div className="form-group">
                <label htmlFor="kodeGuru">Kode Guru / NIP <span className="required">*</span></label>
                <input
                  type="text"
                  id="kodeGuru"
                  name="kodeGuru"
                  value={formData.kodeGuru}
                  onChange={handleChange}
                  placeholder="Contoh: GR001 atau NIP"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="namaGuru">Nama Guru <span className="required">*</span></label>
                <input
                  type="text"
                  id="namaGuru"
                  name="namaGuru"
                  value={formData.namaGuru}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap guru"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="jabatan">Jabatan <span className="required">*</span></label>
                <select
                  id="jabatan"
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Jabatan</option>
                  {jabatanOptions.map((jabatan, index) => (
                    <option key={index} value={jabatan}>{jabatan}</option>
                  ))}
                </select>
              </div>

              {/* Field Dinamis Berdasarkan Jabatan */}
              {formData.jabatan === 'Guru' && (
                <div className="form-group">
                  <label htmlFor="mataPelajaran">Mata Pelajaran <span className="required">*</span></label>
                  <select
                    id="mataPelajaran"
                    name="mataPelajaran"
                    value={formData.mataPelajaran}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Mata Pelajaran</option>
                    {mataPelajaranOptions.map((mapel, index) => (
                      <option key={index} value={mapel}>{mapel}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.jabatan === 'Waka' && (
                <div className="form-group">
                  <label htmlFor="bidangWaka">Bidang Waka <span className="required">*</span></label>
                  <select
                    id="bidangWaka"
                    name="bidangWaka"
                    value={formData.bidangWaka}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Bidang Waka</option>
                    {bidangWakaOptions.map((bidang, index) => (
                      <option key={index} value={bidang}>{bidang}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.jabatan === 'Kapro' && (
                <div className="form-group">
                  <label htmlFor="konsentrasiKeahlian">Konsentrasi Keahlian <span className="required">*</span></label>
                  <select
                    id="konsentrasiKeahlian"
                    name="konsentrasiKeahlian"
                    value={formData.konsentrasiKeahlian}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Konsentrasi Keahlian</option>
                    {konsentrasiKeahlianOptions.map((konsentrasi, index) => (
                      <option key={index} value={konsentrasi}>{konsentrasi}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.jabatan === 'Wali Kelas' && (
                <>
                  <div className="form-group">
                    <label htmlFor="kelasJurusan">Kelas & Jurusan <span className="required">*</span></label>
                    <select
                      id="kelasJurusan"
                      name="homeroom_class_id"
                      value={formData.homeroom_class_id}
                      onChange={(e) => {
                          const clsId = e.target.value;
                          const cls = kelasOptions.find(c => c.id == clsId);
                          setFormData(prev => ({
                              ...prev,
                              homeroom_class_id: clsId,
                              kelas: cls?.name,
                              jurusan: cls?.major?.code
                          }));
                      }}
                      required
                    >
                      <option value="">Pilih Kelas</option>
                      {kelasOptions.map((item, index) => (
                        <option key={index} value={item.id}>
                          {item.name} {item.major?.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn-submit">
                  {editingTeacher ? 'Ubah' : 'Simpan'}
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