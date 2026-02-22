import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../utils/api';
import Pagination from '../../components/Common/Pagination';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import * as XLSX from 'xlsx';
import './DataKelas.css';

function DataKelas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kelas, setKelas] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [majors, setMajors] = useState([]);
  const [majorMap, setMajorMap] = useState({});
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [searchKelas, setSearchKelas] = useState('');
  const [searchJurusan, setSearchJurusan] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    namaKelas: '',
    jurusan: '',
    kelas: '',
    waliKelas: ''
  });
  const [errors, setErrors] = useState({});
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [importErrors, setImportErrors] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fileInputRef = useRef(null);
  const exportButtonRef = useRef(null);

  // Convert number to Roman numeral
  const toRoman = (num) => {
    const romanNumerals = [
      ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
    ];
    let result = '';
    for (const [letter, value] of romanNumerals) {
      while (num >= value) {
        result += letter;
        num -= value;
      }
    }
    return result;
  };

  // Convert Roman numeral to number
  const fromRoman = (roman) => {
    const romanValues = { 'X': 10, 'IX': 9, 'V': 5, 'IV': 4, 'I': 1 };
    let result = 0;
    for (let i = 0; i < roman.length; i++) {
      if (romanValues[roman[i]] < romanValues[roman[i + 1]]) {
        result -= romanValues[roman[i]];
      } else {
        result += romanValues[roman[i]];
      }
    }
    return result || roman;
  };

  // Load classes from API
  useEffect(() => {
    loadClasses();
  }, [pagination.currentPage, searchKelas, searchJurusan]);

  // Load majors and grades from API
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [majorsRes, classesRes] = await Promise.all([
          apiService.getMajors({ per_page: 100 }),
          apiService.getClasses({ per_page: 1000 })
        ]);
        
        if (majorsRes.data) {
          setMajors(majorsRes.data);
          const map = {};
          majorsRes.data.forEach(m => {
            map[m.code] = m.id;
          });
          setMajorMap(map);
        }
        
        if (classesRes.data) {
          const uniqueGrades = [...new Set(classesRes.data.map(c => c.grade))].sort();
          setGrades(uniqueGrades);
        }
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };
    
    loadFilterOptions();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        grade: searchKelas,
        major: searchJurusan,
        per_page: 15
      };

      const result = await apiService.getClasses(params);
      if (result.data) {
        setKelas(result.data);
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
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const loadTeachers = async () => {
    const result = await apiService.getTeachers({ per_page: 1000 });
    if (result.data) {
      setAvailableTeachers(result.data);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      if (editData) {
        setFormData({
          namaKelas: editData.class_name,
          jurusan: editData.major,
          kelas: editData.grade,
          waliKelas: editData.homeroom_teacher_id
        });
      } else {
        setFormData({
          namaKelas: '',
          jurusan: '',
          kelas: '',
          waliKelas: ''
        });
      }
      setErrors({});
    }
  }, [editData, isModalOpen]);

  // Check if teacher is already assigned
  const getTeacherAssignment = (teacherId) => {
    if (editData && editData.homeroom_teacher_id === teacherId) {
      return null;
    }
    const assignedClass = kelas.find(k => k.homeroom_teacher_id === teacherId);
    return assignedClass ? assignedClass.class_name : null;
  };

  // Reset Filter
  const handleResetFilter = () => {
    setSearchKelas('');
    setSearchJurusan('');
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Check if class already has a teacher
  const checkClassHasTeacher = (namaKelas) => {
    if (editData && editData.class_name === namaKelas) {
      return null;
    }
    const existingClass = kelas.find(k => k.class_name === namaKelas);
    return existingClass ? existingClass.homeroom_teacher_name : null;
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.kelas) {
      newErrors.kelas = 'Tingkat kelas harus dipilih';
    }

    if (!formData.jurusan) {
      newErrors.jurusan = 'Konsentrasi keahlian harus dipilih';
    }

    if (!formData.namaKelas.trim()) {
      newErrors.namaKelas = 'Nama kelas harus diisi';
    } else {
      const existingTeacher = checkClassHasTeacher(formData.namaKelas);
      if (existingTeacher) {
        newErrors.namaKelas = `Kelas ${formData.namaKelas} sudah memiliki wali kelas: ${existingTeacher}`;
      }
    }

    if (!formData.waliKelas) {
      newErrors.waliKelas = 'Wali kelas harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add Class
  const handleAddKelas = async () => {
    if (!validate()) return;

    try {
      const classData = {
        label: formData.namaKelas,
        major_id: majorMap[formData.jurusan] || null,
        grade: formData.kelas,
        homeroom_teacher_id: formData.waliKelas || null
      };

      await apiService.addClass(classData);
      alert('Data kelas berhasil ditambahkan!\nJabatan guru telah diubah menjadi Wali Kelas.');

      await loadClasses();
      setIsModalOpen(false);
      setEditData(null);
    } catch (error) {
      alert('Gagal menambahkan data kelas!');
    }
  };

  // Edit Class
  const handleEditKelas = async () => {
    if (!validate()) return;

    try {
      const classData = {
        label: formData.namaKelas,
        major_id: majorMap[formData.jurusan] || null,
        grade: formData.kelas,
        homeroom_teacher_id: formData.waliKelas || null
      };

      await apiService.updateClass(editData.id, classData);
      alert('Data kelas berhasil diperbarui!\nData guru juga telah diperbarui.');

      await loadClasses();
      setEditData(null);
      setIsModalOpen(false);
    } catch (error) {
      alert('Gagal memperbarui data kelas!');
    }
  };

  // Delete Class
  const handleDeleteKelas = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data kelas ini?')) {
      try {
        await apiService.deleteClass(id);
        alert('Data kelas berhasil dihapus!\nJabatan guru telah dikembalikan ke Guru.');
        await loadClasses();
      } catch (error) {
        alert('Gagal menghapus data kelas!');
      }
    }
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editData) {
      handleEditKelas();
    } else {
      handleAddKelas();
    }
  };

  // Download Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Tingkat (X/XI/XII)': '',
        'Jurusan': '',
        'Label': '',
        'NIP Wali Kelas': ''
      },
      {
        'Tingkat (X/XI/XII)': 'X',
        'Jurusan': 'RPL',
        'Label': 'X RPL 1',
        'NIP Wali Kelas': ''
      },
      {
        'Tingkat (X/XI/XII)': 'XI',
        'Jurusan': 'TKJ',
        'Label': 'XI TKJ 1',
        'NIP Wali Kelas': ''
      },
      {
        'Tingkat (X/XI/XII)': 'XII',
        'Jurusan': 'DKV',
        'Label': 'XII DKV 1',
        'NIP Wali Kelas': ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Data Kelas');

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 }
    ];

    const fileName = 'Format_Data_Kelas.xlsx';
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

        const teacherMap = {};
        try {
          const teacherRes = await apiService.getTeachers({ per_page: 1000 });
          if (teacherRes.data) {
             teacherRes.data.forEach(t => teacherMap[t.nip] = t.id);
          }
        } catch (err) {}

        const importedClasses = jsonData.map(row => ({
          grade: fromRoman(String(row['Tingkat (X/XI/XII)'] || '').trim()),
          label: String(row['Label'] || '').trim(),
          major_id: majorMap[String(row['Jurusan'] || '').trim()] || null,
          homeroom_teacher_id: teacherMap[String(row['NIP Wali Kelas'] || '').trim()] || null
        }));

        try {
          const result = await apiService.importClasses({ items: importedClasses });
          alert(`Sukses mengimpor ${result.success_count} data kelas!`);
          await loadClasses();
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
            alert('Gagal mengimpor data kelas. Pastikan format file sesuai template.');
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

  // Filter
  const filteredKelas = kelas.filter(k => {
    const matchKelas = searchKelas === '' || k.grade === searchKelas;
    const matchJurusan = searchJurusan === '' || k.major === searchJurusan;
    return matchKelas && matchJurusan;
  });

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

  if (loading) {
    return (
      <div className="kelas-data-container">
        <NavbarAdmin />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          fontSize: '18px',
          color: '#6b7280'
        }}>
          Memuat data kelas...
        </div>
      </div>
    );
  }

  return (
    <div className="kelas-data-container">
      <NavbarAdmin />
      <h1 className="kelas-page-title">Data Kelas</h1>

      <div className="kelas-table-wrapper">
        <div className="kelas-filter-box">
          <div className="kelas-select-group">
            <label>Pilih Kelas :</label>
            <select value={searchKelas} onChange={(e) => setSearchKelas(e.target.value)}>
              <option value="">Semua Kelas</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{toRoman(parseInt(grade))}</option>
              ))}
            </select>

            <label>Pilih Konsentrasi Keahlian :</label>
            <select value={searchJurusan} onChange={(e) => setSearchJurusan(e.target.value)}>
              <option value="">Semua Jurusan</option>
              {majors.map(major => (
                <option key={major.code} value={major.code}>{major.code} - {major.name}</option>
              ))}
            </select>

            {(searchKelas || searchJurusan) && (
              <button
                className="kelas-btn-reset-filter"
                onClick={handleResetFilter}
                title="Reset Filter"
              >
                Reset Filter
              </button>
            )}

            <button
              className="kelas-btn-tambah"
              onClick={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
            >
              Tambahkan
            </button>
            <div className="kelas-btn-group" style={{ display: 'flex', gap: '8px' }}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".xlsx, .xls"
                onChange={handleImportFromExcel}
              />
              <button 
                className="kelas-btn-import" 
                style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                onClick={() => fileInputRef.current.click()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Import
              </button>
              <button 
                className="kelas-btn-template" 
                style={{ backgroundColor: '#e2e8f0', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                onClick={handleDownloadTemplate}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <polyline points="9 15 12 18 15 15"></polyline>
                </svg>
                Format Excel
              </button>
            </div>
          </div>
        </div>

        {(searchKelas || searchJurusan) && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: '#e3f2fd',
            borderLeft: '4px solid #2196f3',
            marginBottom: '15px',
            borderRadius: '4px'
          }}>
            <strong>Hasil Filter:</strong> {filteredKelas.length} dari {kelas.length} kelas
            {searchKelas && <span> | Tingkat: {searchKelas}</span>}
            {searchJurusan && <span> | Jurusan: {searchJurusan}</span>}
          </div>
        )}

        <table className="kelas-tabel">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Kelas</th>
              <th>Konsentrasi Keahlian</th>
              <th>Wali Kelas</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kelas.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  {searchKelas || searchJurusan
                    ? 'Tidak ada data yang sesuai dengan filter'
                    : 'Tidak ada data kelas'}
                </td>
              </tr>
            ) : (
              kelas.map((k, index) => (
                <tr key={k.id}>
                  <td>{pagination.from + index}</td>
                  <td>{k.class_name}</td>
                  <td>{k.major}</td>
                  <td>{k.homeroom_teacher_name}</td>
                  <td className="kelas-aksi-cell">
                    <div className="aksi-container">
                      <button
                        className="kelas-aksi kelas-edit"
                        onClick={() => {
                          setEditData(k);
                          setIsModalOpen(true);
                        }}
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="kelas-aksi kelas-hapus"
                        onClick={() => handleDeleteKelas(k.id)}
                        title="Hapus"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="kelas-modal-overlay" onClick={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}>
          <div className="kelas-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="kelas-modal-header">
              <h2>{editData ? 'Edit Data Kelas' : 'Tambah Data Kelas'}</h2>
              <button className="kelas-modal-close" onClick={() => {
                setIsModalOpen(false);
                setEditData(null);
              }}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="kelas-form">
              {formData.namaKelas && checkClassHasTeacher(formData.namaKelas) && (
                <div style={{
                  padding: '12px 15px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderLeft: '4px solid #ffc107',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '10px'
                }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#856404"
                    strokeWidth="2"
                    style={{ marginTop: '2px', flexShrink: 0 }}
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#856404', display: 'block', marginBottom: '4px' }}>Peringatan!</strong>
                    <span style={{ color: '#856404', fontSize: '13px' }}>
                      Kelas <strong>{formData.namaKelas}</strong> sudah memiliki wali kelas: <strong>{checkClassHasTeacher(formData.namaKelas)}</strong>
                    </span>
                  </div>
                </div>
              )}

              <div className="kelas-form-group">
                <label>Tingkat Kelas <span className="kelas-required">*</span></label>
                <select
                  name="kelas"
                  value={formData.kelas}
                  onChange={handleChange}
                  className={errors.kelas ? 'kelas-error' : ''}
                >
                  <option value="">Pilih Tingkat Kelas</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{toRoman(parseInt(grade))}</option>
                  ))}
                </select>
                {errors.kelas && <span className="kelas-error-message">{errors.kelas}</span>}
              </div>

              <div className="kelas-form-group">
                <label>Konsentrasi Keahlian <span className="kelas-required">*</span></label>
                <select
                  name="jurusan"
                  value={formData.jurusan}
                  onChange={handleChange}
                  className={errors.jurusan ? 'kelas-error' : ''}
                >
                  <option value="">Pilih Konsentrasi Keahlian</option>
                  {majors.map(major => (
                    <option key={major.code} value={major.code}>{major.code} - {major.name}</option>
                  ))}
                </select>
                {errors.jurusan && <span className="kelas-error-message">{errors.jurusan}</span>}
              </div>

              <div className="kelas-form-group">
                <label>Nama Kelas <span className="kelas-required">*</span></label>
                <input
                  type="text"
                  name="namaKelas"
                  value={formData.namaKelas}
                  onChange={handleChange}
                  placeholder="Contoh: XII RPL 1"
                  className={errors.namaKelas ? 'kelas-error' : ''}
                />
                {errors.namaKelas && <span className="kelas-error-message">{errors.namaKelas}</span>}
                {!errors.namaKelas && (
                  <small className="kelas-helper-text">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ marginRight: '5px', verticalAlign: 'middle' }}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Satu kelas hanya boleh memiliki satu wali kelas
                  </small>
                )}
              </div>

              <div className="kelas-form-group">
                <label>Wali Kelas <span className="kelas-required">*</span></label>
                <select
                  name="waliKelas"
                  value={formData.waliKelas}
                  onChange={handleChange}
                  className={errors.waliKelas ? 'kelas-error' : ''}
                >
                  <option value="">Pilih Wali Kelas</option>
                  {availableTeachers.length === 0 ? (
                    <option value="" disabled>Tidak ada guru yang tersedia</option>
                  ) : (
                    availableTeachers.map((teacher) => {
                      const assignedClass = getTeacherAssignment(teacher.id);
                      const isDisabled = assignedClass !== null;

                      return (
                        <option
                          key={teacher.id}
                          value={teacher.id}
                          disabled={isDisabled}
                          style={isDisabled ? {
                            color: '#999',
                            fontStyle: 'italic'
                          } : {}}
                        >
                          {teacher.name}
                          {isDisabled && ` (Wali Kelas ${assignedClass})`}
                        </option>
                      );
                    })
                  )}
                </select>
                {errors.waliKelas && <span className="kelas-error-message">{errors.waliKelas}</span>}

                <small className="kelas-helper-text">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ marginRight: '5px', verticalAlign: 'middle' }}
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Hanya guru dengan jabatan 'Guru' yang bisa menjadi wali kelas. Waka dan Kapro tidak bisa.
                </small>
              </div>

              <div className="kelas-modal-actions">
                <button type="button" className="kelas-btn-cancel" onClick={() => {
                  setIsModalOpen(false);
                  setEditData(null);
                }}>
                  Batal
                </button>
                <button type="submit" className="kelas-btn-submit">
                  {editData ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Error Modal */}
      {isImportModalOpen && importErrors && (
        <div className="kelas-modal-overlay" onClick={() => setIsImportModalOpen(false)}>
          <div className="kelas-modal-content" style={{ maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="kelas-modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
              <h2 style={{ color: '#ef4444', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Gagal Mengimpor File
              </h2>
              <button className="kelas-modal-close" onClick={() => setIsImportModalOpen(false)}>×</button>
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

export default DataKelas;