import React, { useState, useRef, useEffect, useMemo } from 'react';
import './DataGuru.css';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [bidangWakaOptions, setBidangWakaOptions] = useState([]);
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
    jurusan: ''
  });

  // Fetch data saat component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTeachers(),
        fetchMataPelajaran(),
        fetchJabatan(),
        fetchBidangWaka(),
        fetchKonsentrasiKeahlian(),
        fetchKelas(),
        fetchJurusan()
      ]);
    } catch (err) {
      setError('Gagal memuat data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // API Calls
  const fetchTeachers = async () => {
    try {
      // TODO: Ganti dengan endpoint API yang sesuai
      // const token = localStorage.getItem('token');
      // const response = await fetch('YOUR_API_ENDPOINT/guru', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // if (!response.ok) throw new Error('Gagal memuat data guru');
      // const data = await response.json();
      // setTeachers(data);
      
      // Sementara set data kosong
      setTeachers([]);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  };

  const fetchMataPelajaran = async () => {
    try {
      // TODO: Ganti dengan endpoint API
      // const response = await fetch('YOUR_API_ENDPOINT/mata-pelajaran');
      // const data = await response.json();
      // setMataPelajaranOptions(data);
      
      setMataPelajaranOptions([]);
    } catch (error) {
      console.error('Error fetching mata pelajaran:', error);
    }
  };

  const fetchJabatan = async () => {
    try {
      // TODO: Ganti dengan endpoint API
      // const response = await fetch('YOUR_API_ENDPOINT/jabatan');
      // const data = await response.json();
      // setJabatanOptions(data);
      
      setJabatanOptions([]);
    } catch (error) {
      console.error('Error fetching jabatan:', error);
    }
  };

  const fetchBidangWaka = async () => {
    try {
      // TODO: Ganti dengan endpoint API
      // const response = await fetch('YOUR_API_ENDPOINT/bidang-waka');
      // const data = await response.json();
      // setBidangWakaOptions(data);
      
      setBidangWakaOptions([]);
    } catch (error) {
      console.error('Error fetching bidang waka:', error);
    }
  };

  const fetchKonsentrasiKeahlian = async () => {
    try {
      // TODO: Ganti dengan endpoint API
      // const response = await fetch('YOUR_API_ENDPOINT/konsentrasi-keahlian');
      // const data = await response.json();
      // setKonsentrasiKeahlianOptions(data);
      
      setKonsentrasiKeahlianOptions([]);
    } catch (error) {
      console.error('Error fetching konsentrasi keahlian:', error);
    }
  };

  const fetchKelas = async () => {
    try {
      // TODO: Ganti dengan endpoint API
      // const response = await fetch('YOUR_API_ENDPOINT/kelas');
      // const data = await response.json();
      // setKelasOptions(data);
      
      setKelasOptions([]);
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  const fetchJurusan = async () => {
    try {
      // TODO: Ganti dengan endpoint API
      // const response = await fetch('YOUR_API_ENDPOINT/jurusan');
      // const data = await response.json();
      // setJurusanOptions(data);
      
      setJurusanOptions([]);
    } catch (error) {
      console.error('Error fetching jurusan:', error);
    }
  };

  // Filter teachers dengan useMemo untuk optimisasi
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const searchLower = searchQuery.toLowerCase();
      return (
        teacher.kodeGuru.toLowerCase().includes(searchLower) ||
        teacher.namaGuru.toLowerCase().includes(searchLower) ||
        teacher.jabatan.toLowerCase().includes(searchLower)
      );
    });
  }, [teachers, searchQuery]);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.kodeGuru.trim()) {
      alert('Kode Guru harus diisi!');
      return;
    }
    if (!formData.namaGuru.trim()) {
      alert('Nama Guru harus diisi!');
      return;
    }

    const isDuplicate = teachers.some(teacher => 
      teacher.kodeGuru.toLowerCase() === formData.kodeGuru.trim().toLowerCase() &&
      teacher.id !== editingTeacher?.id
    );

    if (isDuplicate) {
      alert(`❌ Kode Guru "${formData.kodeGuru}" sudah digunakan!\n\nSilakan gunakan kode yang berbeda.`);
      return;
    }

    // Validasi khusus untuk wali kelas
    if (formData.jabatan === 'Wali Kelas') {
      const available = getAvailableKelas();
      if (available.length === 0 && !editingTeacher) {
        alert('Tidak ada kelas yang tersedia! Semua kelas sudah memiliki wali kelas.');
        return;
      }
    }

    // Buat object data sesuai jabatan
    let teacherData = {
      kodeGuru: formData.kodeGuru,
      namaGuru: formData.namaGuru,
      jabatan: formData.jabatan
    };

    // Tambahkan field spesifik berdasarkan jabatan
    if (formData.jabatan === 'Guru') {
      teacherData.mataPelajaran = formData.mataPelajaran;
    } else if (formData.jabatan === 'Waka') {
      teacherData.bidangWaka = formData.bidangWaka;
    } else if (formData.jabatan === 'Kapro') {
      teacherData.konsentrasiKeahlian = formData.konsentrasiKeahlian;
    } else if (formData.jabatan === 'Wali Kelas') {
      teacherData.kelas = formData.kelas;
      teacherData.jurusan = formData.jurusan;
    }

    try {
      if (editingTeacher) {
        // UPDATE
        // TODO: Uncomment dan ganti endpoint
        // const token = localStorage.getItem('token');
        // const response = await fetch(`YOUR_API_ENDPOINT/guru/${editingTeacher.id}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${token}`
        //   },
        //   body: JSON.stringify(teacherData),
        // });
        // if (!response.ok) throw new Error('Gagal memperbarui data guru');

        alert('Data guru berhasil diperbarui!');
        await fetchTeachers();
        setEditingTeacher(null);
      } else {
        // CREATE
        // TODO: Uncomment dan ganti endpoint
        // const token = localStorage.getItem('token');
        // const response = await fetch('YOUR_API_ENDPOINT/guru', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${token}`
        //   },
        //   body: JSON.stringify(teacherData),
        // });
        // if (!response.ok) throw new Error('Gagal menambahkan data guru');

        alert('Data guru berhasil ditambahkan!');
        await fetchTeachers();
      }
      
      // Reset form
      setFormData({
        kodeGuru: '',
        namaGuru: '',
        jabatan: '',
        mataPelajaran: '',
        bidangWaka: '',
        konsentrasiKeahlian: '',
        kelas: '',
        jurusan: ''
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert('Terjadi kesalahan: ' + error.message);
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    
    let kelasValue = teacher.kelas || '';
    let jurusanValue = teacher.jurusan || '';
    
    if (teacher.jabatan === 'Wali Kelas' && teacher.kelas && teacher.jurusan) {
      kelasValue = teacher.kelas;
      jurusanValue = teacher.jurusan;
    }
    
    setFormData({
      kodeGuru: teacher.kodeGuru,
      namaGuru: teacher.namaGuru,
      jabatan: teacher.jabatan,
      mataPelajaran: teacher.mataPelajaran || '',
      bidangWaka: teacher.bidangWaka || '',
      konsentrasiKeahlian: teacher.konsentrasiKeahlian || '',
      kelas: kelasValue,
      jurusan: jurusanValue
    });
    setIsModalOpen(true);
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
      return;
    }

    try {
      // TODO: Uncomment dan ganti endpoint
      // const token = localStorage.getItem('token');
      // const response = await fetch(`YOUR_API_ENDPOINT/guru/${id}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // if (!response.ok) throw new Error('Gagal menghapus data guru');

      alert('Data guru berhasil dihapus!');
      await fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Terjadi kesalahan: ' + error.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
    setFormData({
      kodeGuru: '',
      namaGuru: '',
      jabatan: '',
      mataPelajaran: '',
      bidangWaka: '',
      konsentrasiKeahlian: '',
      kelas: '',
      jurusan: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fungsi untuk mendapatkan kelas yang tersedia
  const getAvailableKelas = () => {
    const allKombinasi = [];
    kelasOptions.forEach(kelas => {
      jurusanOptions.forEach(jurusan => {
        allKombinasi.push({ kelas, jurusan });
      });
    });

    const terpakai = teachers
      .filter(t => t.jabatan === 'Wali Kelas' && t.id !== editingTeacher?.id)
      .map(t => `${t.kelas}-${t.jurusan}`);

    return allKombinasi.filter(k => !terpakai.includes(`${k.kelas}-${k.jurusan}`));
  };

  // Auto-select kelas tersedia pertama kali
  useEffect(() => {
    if (formData.jabatan === 'Wali Kelas' && !editingTeacher) {
      const available = getAvailableKelas();
      if (available.length > 0) {
        setFormData(prev => ({
          ...prev,
          kelas: available[0].kelas,
          jurusan: available[0].jurusan
        }));
      }
    }
  }, [formData.jabatan]);

  // Auto-select default values when jabatan changes
  useEffect(() => {
    if (formData.jabatan && !editingTeacher) {
      if (formData.jabatan === 'Guru' && mataPelajaranOptions.length > 0) {
        setFormData(prev => ({
          ...prev,
          mataPelajaran: mataPelajaranOptions[0]
        }));
      } else if (formData.jabatan === 'Waka' && bidangWakaOptions.length > 0) {
        setFormData(prev => ({
          ...prev,
          bidangWaka: bidangWakaOptions[0]
        }));
      } else if (formData.jabatan === 'Kapro' && konsentrasiKeahlianOptions.length > 0) {
        setFormData(prev => ({
          ...prev,
          konsentrasiKeahlian: konsentrasiKeahlianOptions[0]
        }));
      }
    }
  }, [formData.jabatan, mataPelajaranOptions, bidangWakaOptions, konsentrasiKeahlianOptions]);

  // EKSPOR DATA KE EXCEL
  const handleExportToExcel = () => {
    if (filteredTeachers.length === 0) {
      alert('Tidak ada data untuk diekspor!');
      return;
    }
    
    const excelData = filteredTeachers.map((teacher, index) => {
      let data = {
        'No': index + 1,
        'Kode Guru': teacher.kodeGuru,
        'Nama Guru': teacher.namaGuru,
        'Jabatan': teacher.jabatan
      };

      if (teacher.jabatan === 'Guru') {
        data['Mata Pelajaran'] = teacher.mataPelajaran || '';
      } else if (teacher.jabatan === 'Waka') {
        data['Bidang Waka'] = teacher.bidangWaka || '';
      } else if (teacher.jabatan === 'Kapro') {
        data['Konsentrasi Keahlian'] = teacher.konsentrasiKeahlian || '';
      } else if (teacher.jabatan === 'Wali Kelas') {
        data['Kelas'] = teacher.kelas || '';
        data['Jurusan'] = teacher.jurusan || '';
      }

      return data;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 30 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 }
    ];

    const fileName = `Data_Guru_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    alert('Data berhasil diekspor ke Excel!');
    setShowExportMenu(false);
  };

  // EKSPOR DATA KE PDF
  const handleExportToPDF = () => {
    if (filteredTeachers.length === 0) {
      alert('Tidak ada data untuk diekspor!');
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Data Guru', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    const tableData = filteredTeachers.map((teacher, index) => {
      let detail = '';
      if (teacher.jabatan === 'Guru') {
        detail = teacher.mataPelajaran || '';
      } else if (teacher.jabatan === 'Waka') {
        detail = teacher.bidangWaka || '';
      } else if (teacher.jabatan === 'Kapro') {
        detail = teacher.konsentrasiKeahlian || '';
      } else if (teacher.jabatan === 'Wali Kelas') {
        detail = `${teacher.kelas || ''} ${teacher.jurusan || ''}`;
      }

      return [
        index + 1,
        teacher.kodeGuru,
        teacher.namaGuru,
        teacher.jabatan,
        detail
      ];
    });

    autoTable(doc, {
      head: [['No', 'Kode Guru', 'Nama Guru', 'Jabatan', 'Detail']],
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
        1: { cellWidth: 30 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30 },
        4: { cellWidth: 45 }
      }
    });

    const fileName = `Data_Guru_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    alert('Data berhasil diekspor ke PDF!');
    setShowExportMenu(false);
  };

  // DOWNLOAD TEMPLATE EXCEL
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Kode Guru': '',
        'Nama Guru': '',
        'Jabatan': '',
        'Keterangan': ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Data Guru');

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
      { wch: 30 }
    ];

    const fileName = 'Template_Data_Guru.xlsx';
    XLSX.writeFile(workbook, fileName);
    alert('Template Excel berhasil diunduh!');
  };

  // IMPOR EXCEL
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          alert('File Excel kosong!');
          return;
        }

        const existingKodeGuru = teachers.map(t => t.kodeGuru.toLowerCase());

        let duplicateCount = 0;
        const duplicateList = [];
        const validData = [];

        jsonData.forEach((row, index) => {
          const kodeGuru = String(row['Kode Guru'] || '').trim();
          const namaGuru = String(row['Nama Guru'] || '').trim();
          const jabatan = String(row['Jabatan'] || '').trim();
          const keterangan = String(row['Keterangan'] || '').trim();

          if (!kodeGuru || !namaGuru || !jabatan) {
            console.warn(`Baris ${index + 2}: Data tidak lengkap`);
            return;
          }

          if (existingKodeGuru.includes(kodeGuru.toLowerCase())) {
            duplicateCount++;
            duplicateList.push(kodeGuru);
            return;
          }

          existingKodeGuru.push(kodeGuru.toLowerCase());
          
          let teacherData = { kodeGuru, namaGuru, jabatan };
          
          if (jabatan === 'Guru') {
            teacherData.mataPelajaran = keterangan;
          } else if (jabatan === 'Waka') {
            teacherData.bidangWaka = keterangan;
          } else if (jabatan === 'Kapro') {
            teacherData.konsentrasiKeahlian = keterangan;
          } else if (jabatan === 'Wali Kelas') {
            const [kelas, jurusan] = keterangan.split(' ');
            teacherData.kelas = kelas;
            teacherData.jurusan = jurusan;
          }
          
          validData.push(teacherData);
        });

        if (validData.length === 0) {
          alert(
            '❌ Semua data gagal diimpor!\n\n' +
            'Kode Guru yang sudah ada:\n' +
            duplicateList.join(', ')
          );
          return;
        }

        // TODO: Uncomment dan ganti endpoint untuk bulk import
        // const token = localStorage.getItem('token');
        // const response = await fetch('YOUR_API_ENDPOINT/guru/bulk', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${token}`
        //   },
        //   body: JSON.stringify({ teachers: validData }),
        // });
        // if (!response.ok) throw new Error('Gagal mengimpor data');

        const successMessage = `✅ Berhasil mengimpor ${validData.length} data guru.`;
        const duplicateMessage = duplicateCount > 0 
          ? `\n\n❌ ${duplicateCount} data ditolak karena Kode Guru sudah ada:\n${duplicateList.join(', ')}` 
          : '';

        alert(successMessage + duplicateMessage);
        await fetchTeachers();

      } catch (error) {
        alert('❌ Gagal membaca file Excel!\n\n' + error.message);
        console.error(error);
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportButtonRef.current && !exportButtonRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // Icon Components
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
      <h1 className="page-title-guru">Data Guru</h1>

      <div className="table-wrapper">
        {/* Loading State */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">Memuat data guru...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button onClick={fetchInitialData}>Coba Lagi</button>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <>
            <div className="filter-box">
              <input 
                type="text" 
                placeholder="Cari Guru..." 
                className="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="select-group">
                <button 
                  className="btn-tambah" 
                  onClick={() => {
                    setEditingTeacher(null);
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
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data guru'}
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher, index) => {
                    let detail = '';
                    if (teacher.jabatan === 'Guru') {
                      detail = teacher.mataPelajaran || '';
                    } else if (teacher.jabatan === 'Waka') {
                      detail = teacher.bidangWaka || '';
                    } else if (teacher.jabatan === 'Kapro') {
                      detail = teacher.konsentrasiKeahlian || '';
                    } else if (teacher.jabatan === 'Wali Kelas') {
                      detail = `${teacher.kelas || ''} ${teacher.jurusan || ''}`;
                    }

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
          </>
        )}
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
                <label htmlFor="kodeGuru">Kode Guru <span className="required">*</span></label>
                <input
                  type="text"
                  id="kodeGuru"
                  name="kodeGuru"
                  value={formData.kodeGuru}
                  onChange={handleChange}
                  placeholder="Contoh: GR001"
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
                      name="kelasJurusan"
                      value={`${formData.kelas}-${formData.jurusan}`}
                      onChange={(e) => {
                        const [kelas, jurusan] = e.target.value.split('-');
                        setFormData(prev => ({
                          ...prev,
                          kelas,
                          jurusan
                        }));
                      }}
                      required
                    >
                      {getAvailableKelas().length === 0 ? (
                        <option value="">Semua kelas sudah memiliki wali kelas</option>
                      ) : (
                        getAvailableKelas().map((item, index) => (
                          <option key={index} value={`${item.kelas}-${item.jurusan}`}>
                            {item.kelas} {item.jurusan}
                          </option>
                        ))
                      )}
                    </select>
                    {getAvailableKelas().length === 0 && (
                      <small style={{ color: '#dc3545', fontSize: '13px', marginTop: '5px', display: 'block' }}>
                        Tidak ada kelas yang tersedia
                      </small>
                    )}
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