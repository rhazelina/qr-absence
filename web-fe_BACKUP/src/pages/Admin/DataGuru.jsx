import React, { useState, useRef } from 'react';
import './DataGuru.css';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================
// DUMMY MODE — semua data disimpan di state lokal (tanpa API)
// Kelas: setiap jurusan punya beberapa nomor kelas
// ============================================================

const KELAS_DATA = {
  TKJ: ['X TKJ 1', 'X TKJ 2', 'XI TKJ 1', 'XI TKJ 2', 'XII TKJ 1', 'XII TKJ 2'],
  RPL: ['X RPL 1', 'X RPL 2', 'XI RPL 1', 'XI RPL 2', 'XII RPL 1', 'XII RPL 2'],
  DKV: ['X DKV 1', 'X DKV 2', 'XI DKV 1', 'XI DKV 2', 'XII DKV 1', 'XII DKV 2'],
  EI:  ['X EI 1',  'XI EI 1',  'XII EI 1'],
  AV:  ['X AV 1',  'XI AV 1',  'XII AV 1'],
  MT:  ['X MT 1',  'XI MT 1',  'XII MT 1'],
  AN:  ['X AN 1',  'XI AN 1',  'XII AN 1'],
  BC:  ['X BC 1',  'XI BC 1',  'XII BC 1'],
};

const JURUSAN_LIST = Object.keys(KELAS_DATA);

let nextId = 1;

function DataGuru() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedJurusanWK, setSelectedJurusanWK] = useState(null);

  const fileInputRef = useRef(null);
  const exportButtonRef = useRef(null);

  const mataPelajaranOptions = [
    'Bahasa Indonesia', 'Bahasa Jawa', 'Matematika', 'Bahasa Inggris',
    'PPKN', 'PAI', 'MPKK', 'MPP', 'PKDK', 'BK', 'PIPADS',
    'Informatika', 'Seni Budaya', 'Sejarah Indonesia', 'PJOK'
  ];
  const jabatanOptions = ['Guru', 'Waka', 'Kapro', 'Wali Kelas'];
  const bidangWakaOptions = ['Waka Kurikulum', 'Waka Kesiswaan', 'Waka Humas', 'Waka Sarpras'];
  const konsentrasiKeahlianOptions = [
    'Teknik Komputer dan Jaringan', 'Rekayasa Perangkat Lunak',
    'Desain Komunikasi Visual', 'Elektronika Industri',
    'Audio Video', 'Mekatronika', 'Animasi', 'Broadcasting'
  ];

  const emptyForm = { kodeGuru: '', namaGuru: '', jabatan: [], keterangan: {} };
  const [formData, setFormData] = useState(emptyForm);

  // ── Filter ───────────────────────────────────────────────
  const filteredTeachers = teachers.filter(t => {
    const q = searchTerm.toLowerCase();
    return q === '' ||
      t.namaGuru?.toLowerCase().includes(q) ||
      t.kodeGuru?.toLowerCase().includes(q) ||
      (t.jabatan || []).join(' ').toLowerCase().includes(q);
  });

  // ── Handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleJabatan = (jab) => {
    setFormData(prev => {
      const isSelected = prev.jabatan.includes(jab);
      const newJabatan = isSelected
        ? prev.jabatan.filter(j => j !== jab)
        : [...prev.jabatan, jab];
      const newKeterangan = { ...prev.keterangan };
      if (isSelected) delete newKeterangan[jab];
      return { ...prev, jabatan: newJabatan, keterangan: newKeterangan };
    });
    if (jab === 'Wali Kelas' && formData.jabatan.includes('Wali Kelas')) {
      setSelectedJurusanWK(null);
    }
  };

  const handleToggleKeterangan = (jab, nilai) => {
    setFormData(prev => {
      const existing = prev.keterangan[jab] || [];
      const isSelected = existing.includes(nilai);
      const updated = isSelected
        ? existing.filter(v => v !== nilai)
        : [...existing, nilai];
      return { ...prev, keterangan: { ...prev.keterangan, [jab]: updated } };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.kodeGuru.trim()) { alert('Kode Guru harus diisi!'); return; }
    if (!formData.namaGuru.trim()) { alert('Nama Guru harus diisi!'); return; }
    if (formData.jabatan.length === 0) { alert('Pilih minimal satu jabatan!'); return; }

    for (const jab of formData.jabatan) {
      const ket = formData.keterangan[jab] || [];
      if (ket.length === 0) {
        alert(`Pilih minimal satu keterangan untuk jabatan "${jab}"!`);
        return;
      }
    }

    const duplikat = teachers.find(
      t => t.kodeGuru === formData.kodeGuru.trim() &&
           (!editingTeacher || t.id !== editingTeacher.id)
    );
    if (duplikat) { alert(`Kode Guru "${formData.kodeGuru}" sudah digunakan!`); return; }

    if (editingTeacher) {
      setTeachers(prev =>
        prev.map(t => t.id === editingTeacher.id ? { ...formData, id: t.id } : t)
      );
      alert('Data guru berhasil diperbarui!');
    } else {
      setTeachers(prev => [...prev, { ...formData, id: nextId++ }]);
      alert('Data guru berhasil ditambahkan!');
    }
    handleCloseModal();
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      kodeGuru: teacher.kodeGuru,
      namaGuru: teacher.namaGuru,
      jabatan: teacher.jabatan || [],
      keterangan: teacher.keterangan || {}
    });
    // Restore jurusan WK — ambil dari label kelas: "XI RPL 1" → jurusan = "RPL"
    const wkKet = teacher.keterangan?.['Wali Kelas'] || [];
    if (wkKet.length > 0) {
      const parts = wkKet[0].split(' ');
      setSelectedJurusanWK(parts[1] || null);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
      setTeachers(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
    setSelectedJurusanWK(null);
    setFormData(emptyForm);
  };

  const getRingkasan = (teacher) => {
    if (!teacher.jabatan || !teacher.keterangan) return '-';
    return teacher.jabatan.map(jab => {
      const ket = teacher.keterangan[jab] || [];
      return `${jab}: ${ket.join(', ') || '-'}`;
    }).join(' | ');
  };

  // ── Export Excel ──────────────────────────────────────────
  const handleExportToExcel = () => {
    const data = filteredTeachers.length > 0 ? filteredTeachers : teachers;
    if (data.length === 0) { alert('Tidak ada data!'); return; }
    const rows = data.map((t, i) => ({
      'No': i + 1, 'Kode Guru': t.kodeGuru, 'Nama Guru': t.namaGuru,
      'Jabatan': (t.jabatan || []).join(', '), 'Keterangan': getRingkasan(t)
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Guru');
    ws['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 30 }, { wch: 25 }, { wch: 60 }];
    XLSX.writeFile(wb, `data-guru-${new Date().toISOString().split('T')[0]}.xlsx`);
    alert('Diekspor ke Excel!');
    setShowExportMenu(false);
  };

  // ── Export PDF ────────────────────────────────────────────
  const handleExportToPDF = () => {
    const data = filteredTeachers.length > 0 ? filteredTeachers : teachers;
    if (data.length === 0) { alert('Tidak ada data!'); return; }
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('Data Guru', 14, 22);
    doc.setFontSize(10); doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
    autoTable(doc, {
      head: [['No', 'Kode Guru', 'Nama Guru', 'Jabatan', 'Keterangan']],
      body: data.map((t, i) => [i + 1, t.kodeGuru, t.namaGuru, (t.jabatan || []).join(', '), getRingkasan(t)]),
      startY: 35, theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 }
    });
    doc.save(`data-guru-${new Date().toISOString().split('T')[0]}.pdf`);
    alert('Diekspor ke PDF!');
    setShowExportMenu(false);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      'Kode Guru': 'GR001', 'Nama Guru': 'Contoh Guru', 'Jabatan': 'Guru', 'Keterangan': 'Matematika'
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Format');
    XLSX.writeFile(wb, 'format-data-guru.xlsx');
  };

  const handleImportFromExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        if (rows.length === 0) { alert('File kosong!'); return; }
        const imported = rows.map(row => ({
          id: nextId++,
          kodeGuru: String(row['Kode Guru'] || '').trim(),
          namaGuru: String(row['Nama Guru'] || '').trim(),
          jabatan: [String(row['Jabatan'] || 'Guru').trim()],
          keterangan: {
            [String(row['Jabatan'] || 'Guru').trim()]:
              [String(row['Keterangan'] || '').trim()].filter(Boolean)
          }
        })).filter(r => r.kodeGuru && r.namaGuru);
        setTeachers(prev => [...prev, ...imported]);
        alert(`✅ Berhasil mengimpor ${imported.length} data guru.`);
      } catch (err) { alert('❌ Gagal baca file: ' + err.message); }
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
  const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginRight: '8px' }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="guru-data-container">
      <NavbarAdmin />
      <h1 className="guru-page-title">Data Guru</h1>

      <div className="guru-table-wrapper">
        <div className="guru-filter-box">
          <input type="text" placeholder="Cari Guru (Nama/Kode/Jabatan)..."
            className="guru-search" value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="guru-select-group">
            {searchTerm && (
              <button className="guru-btn-reset-filter" onClick={() => setSearchTerm('')}>Reset</button>
            )}
            <button className="guru-btn-tambah"
              onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }}>
              Tambahkan
            </button>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button ref={exportButtonRef} className="guru-btn-export"
                onClick={() => setShowExportMenu(!showExportMenu)}>Ekspor ▼</button>
              {showExportMenu && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, backgroundColor: 'white',
                  border: '1px solid #ddd', borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 1000, minWidth: '170px', marginTop: '5px'
                }}>
                  {[{ label: 'Excel (.xlsx)', fn: handleExportToExcel }, { label: 'PDF (.pdf)', fn: handleExportToPDF }]
                    .map((item, i) => (
                      <button key={i} onClick={item.fn} style={{
                        width: '100%', padding: '10px 15px', border: 'none', background: 'white',
                        textAlign: 'left', cursor: 'pointer', fontSize: '14px',
                        borderTop: i > 0 ? '1px solid #f0f0f0' : 'none'
                      }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                        {item.label}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} accept=".xlsx,.xls"
              onChange={handleImportFromExcel} style={{ display: 'none' }} />
            <button className="guru-btn-import" onClick={() => fileInputRef.current?.click()}>Impor</button>
            <button className="guru-btn-download-template" onClick={handleDownloadTemplate}>
              <DownloadIcon /> Format Excel
            </button>
          </div>
        </div>

        {searchTerm && (
          <div style={{
            padding: '10px 20px', backgroundColor: '#e3f2fd',
            borderLeft: '4px solid #2196f3', marginBottom: '15px', borderRadius: '4px'
          }}>
            <strong>Hasil Pencarian:</strong> {filteredTeachers.length} dari {teachers.length} guru
            <span> | Kata kunci: "{searchTerm}"</span>
          </div>
        )}

        <table className="guru-tabel">
          <thead>
            <tr>
              <th>No</th><th>Kode Guru</th><th>Nama Guru</th>
              <th>Jabatan</th><th>Keterangan</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((t, i) => (
                <tr key={t.id}>
                  <td>{i + 1}</td>
                  <td>{t.kodeGuru}</td>
                  <td>{t.namaGuru}</td>
                  <td>{(t.jabatan || []).join(', ')}</td>
                  <td style={{ fontSize: '13px' }}>{getRingkasan(t)}</td>
                  <td className="guru-aksi-cell">
                    <button className="guru-aksi guru-edit" onClick={() => handleEdit(t)} title="Edit">
                      <EditIcon />
                    </button>
                    <button className="guru-aksi guru-hapus" onClick={() => handleDelete(t.id)} title="Hapus">
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  {searchTerm ? 'Tidak ada data yang sesuai' : 'Tidak ada data guru'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ════════════════ MODAL ════════════════ */}
      {isModalOpen && (
        <div className="guru-modal-overlay" onClick={handleCloseModal}>
          <div className="guru-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="guru-modal-header">
              <h2>{editingTeacher ? 'Ubah Data Guru' : 'Tambah Data Guru'}</h2>
              <button className="guru-close-button" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSave}>
              {/* Kode Guru */}
              <div className="guru-form-group">
                <label htmlFor="kodeGuru">Kode Guru <span className="guru-required">*</span></label>
                <input type="text" id="kodeGuru" name="kodeGuru"
                  value={formData.kodeGuru} onChange={handleChange}
                  placeholder="Contoh: GR001" required />
              </div>

              {/* Nama Guru */}
              <div className="guru-form-group">
                <label htmlFor="namaGuru">Nama Guru <span className="guru-required">*</span></label>
                <input type="text" id="namaGuru" name="namaGuru"
                  value={formData.namaGuru} onChange={handleChange}
                  placeholder="Masukkan nama lengkap guru" required />
              </div>

              {/* ── Jabatan multi-select ── */}
              <div className="guru-form-group">
                <label>Jabatan <span className="guru-required">*</span></label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {jabatanOptions.map((jab) => {
                    const aktif = formData.jabatan.includes(jab);
                    return (
                      <button key={jab} type="button" onClick={() => handleToggleJabatan(jab)}
                        style={{
                          padding: '7px 16px', borderRadius: '20px', border: '2px solid',
                          borderColor: aktif ? '#1d4ed8' : '#94a3b8',
                          backgroundColor: aktif ? '#1d4ed8' : 'rgba(255,255,255,0.15)',
                          color: aktif ? 'white' : '#e2e8f0',
                          fontWeight: 600, cursor: 'pointer', fontSize: '13px',
                          transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px'
                        }}>
                        {aktif && <span style={{ fontSize: '11px' }}>✓</span>}
                        {jab}
                      </button>
                    );
                  })}
                </div>
                {formData.jabatan.length === 0 && (
                  <small style={{ color: '#fca5a5', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Pilih minimal satu jabatan
                  </small>
                )}
              </div>

              {/* ── Keterangan per jabatan ── */}
              {formData.jabatan.map((jab) => {

                /* ── WALI KELAS: 2 tahap ── */
                if (jab === 'Wali Kelas') {
                  const kelasList = selectedJurusanWK ? (KELAS_DATA[selectedJurusanWK] || []) : [];

                  return (
                    <div key="Wali Kelas" className="guru-form-group">
                      {/* Langkah 1 — Jurusan */}
                      <label>
                        Jurusan{' '}
                        <small style={{ color: '#93c5fd', fontWeight: 400 }}>(Wali Kelas — langkah 1)</small>{' '}
                        <span className="guru-required">*</span>
                      </label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px', marginBottom: '14px' }}>
                        {JURUSAN_LIST.map((jrs) => {
                          const aktif = selectedJurusanWK === jrs;
                          return (
                            <button key={jrs} type="button"
                              onClick={() => {
                                setSelectedJurusanWK(jrs);
                                setFormData(prev => ({
                                  ...prev,
                                  keterangan: { ...prev.keterangan, 'Wali Kelas': [] }
                                }));
                              }}
                              style={{
                                padding: '6px 16px', borderRadius: '14px', border: '2px solid',
                                borderColor: aktif ? '#f97316' : '#64748b',
                                backgroundColor: aktif ? '#f97316' : 'rgba(255,255,255,0.1)',
                                color: aktif ? 'white' : '#cbd5e1',
                                fontWeight: 600, cursor: 'pointer', fontSize: '13px',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px'
                              }}>
                              {aktif && <span style={{ fontSize: '10px' }}>✓</span>}
                              {jrs}
                            </button>
                          );
                        })}
                      </div>

                      {/* Langkah 2 — Kelas (muncul setelah pilih jurusan) */}
                      {selectedJurusanWK && (
                        <>
                          <label>
                            Kelas{' '}
                            <small style={{ color: '#93c5fd', fontWeight: 400 }}>(Wali Kelas — langkah 2)</small>{' '}
                            <span className="guru-required">*</span>
                          </label>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {kelasList.map((kls) => {
                              const dipilih = (formData.keterangan['Wali Kelas'] || []).includes(kls);
                              return (
                                <button key={kls} type="button"
                                  onClick={() => handleToggleKeterangan('Wali Kelas', kls)}
                                  style={{
                                    padding: '6px 16px', borderRadius: '14px', border: '2px solid',
                                    borderColor: dipilih ? '#0891b2' : '#64748b',
                                    backgroundColor: dipilih ? '#0891b2' : 'rgba(255,255,255,0.1)',
                                    color: dipilih ? 'white' : '#cbd5e1',
                                    fontWeight: 500, cursor: 'pointer', fontSize: '13px',
                                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px'
                                  }}>
                                  {dipilih && <span style={{ fontSize: '10px' }}>✓</span>}
                                  {kls}
                                </button>
                              );
                            })}
                          </div>
                          {(formData.keterangan['Wali Kelas'] || []).length === 0 && (
                            <small style={{ color: '#fca5a5', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                              Pilih minimal satu kelas
                            </small>
                          )}
                        </>
                      )}
                    </div>
                  );
                }

                /* ── GURU / WAKA / KAPRO ── */
                let opsi = [];
                let label = '';
                if (jab === 'Guru')  { opsi = mataPelajaranOptions;       label = 'Mata Pelajaran'; }
                if (jab === 'Waka')  { opsi = bidangWakaOptions;           label = 'Bidang Waka'; }
                if (jab === 'Kapro') { opsi = konsentrasiKeahlianOptions;  label = 'Konsentrasi Keahlian'; }

                return (
                  <div key={jab} className="guru-form-group">
                    <label>
                      {label}{' '}
                      <small style={{ color: '#93c5fd', fontWeight: 400 }}>({jab})</small>{' '}
                      <span className="guru-required">*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {opsi.map((nilai) => {
                        const dipilih = (formData.keterangan[jab] || []).includes(nilai);
                        return (
                          <button key={nilai} type="button"
                            onClick={() => handleToggleKeterangan(jab, nilai)}
                            style={{
                              padding: '5px 12px', borderRadius: '14px', border: '2px solid',
                              borderColor: dipilih ? '#0891b2' : '#64748b',
                              backgroundColor: dipilih ? '#0891b2' : 'rgba(255,255,255,0.1)',
                              color: dipilih ? 'white' : '#cbd5e1',
                              fontWeight: 500, cursor: 'pointer', fontSize: '12px',
                              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                            {dipilih && <span style={{ fontSize: '10px' }}>✓</span>}
                            {nilai}
                          </button>
                        );
                      })}
                    </div>
                    {(formData.keterangan[jab] || []).length === 0 && opsi.length > 0 && (
                      <small style={{ color: '#fca5a5', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Pilih minimal satu
                      </small>
                    )}
                  </div>
                );
              })}

              <div className="guru-modal-footer">
                <button type="button" className="guru-btn-cancel" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="guru-btn-submit">
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