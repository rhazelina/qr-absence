import React, { useState } from 'react';
import './DataKelas.css';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import TambahKelas from '../../components/Admin/TambahKelas';

function DataKelas() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ DATA DUMMY (DITAMBAHKAN SAJA)
  const [kelas, setKelas] = useState([
    {
      id: 1,
      namaKelas: 'X RPL 1',
      jurusan: 'RPL',
      kelas: 'X',
      waliKelas: 'Budi Santoso'
    },
    {
      id: 2,
      namaKelas: 'XI TKJ 2',
      jurusan: 'TKJ',
      kelas: 'XI',
      waliKelas: 'Siti Aminah'
    },
    {
      id: 3,
      namaKelas: 'XII DKV 1',
      jurusan: 'DKV',
      kelas: 'XII',
      waliKelas: 'Ahmad Fauzi'
    },
    {
      id: 4,
      namaKelas: 'XI AV 1',
      jurusan: 'AV',
      kelas: 'XI',
      waliKelas: 'Rina Handayani'
    },
    {
      id: 5,
      namaKelas: 'X MT 1',
      jurusan: 'MT',
      kelas: 'X',
      waliKelas: 'Dewi Lestari'
    }
  ]);

  const [editData, setEditData] = useState(null);
  const [searchKelas, setSearchKelas] = useState('');
  const [searchJurusan, setSearchJurusan] = useState('');

  // === TAMBAH BARU ===
  const handleAddKelas = (formData) => {
    const newKelas = {
      id: Date.now(),
      namaKelas: formData.namaKelas,
      jurusan: formData.jurusan,
      kelas: formData.kelas,
      waliKelas: formData.waliKelas
    };

    setKelas([...kelas, newKelas]);
    setIsModalOpen(false);
    alert('Data kelas berhasil ditambahkan!');
  };

  // === EDIT DATA ===
  const handleEditKelas = (formData) => {
    setKelas(
      kelas.map(k =>
        k.id === formData.id ? formData : k
      )
    );

    setEditData(null);
    setIsModalOpen(false);
    alert('Data kelas berhasil diperbarui!');
  };

  // === HAPUS ===
  const handleDeleteKelas = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data kelas ini?')) {
      setKelas(kelas.filter(k => k.id !== id));
      alert('Data kelas berhasil dihapus!');
    }
  };

  // === FILTER ===
  const filteredKelas = kelas.filter(k => {
    const matchKelas = searchKelas === '' || k.kelas === searchKelas;
    const matchJurusan = searchJurusan === '' || k.jurusan === searchJurusan;
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

  return (
    <div className="data-container">
      <NavbarAdmin />
      <h1 className="page-title-kelas">Data Kelas</h1>

      <div className="table-wrapper">
        <div className="filter-box">
          <div className="select-group">
            <label>Pilih Kelas :</label>
            <select value={searchKelas} onChange={(e) => setSearchKelas(e.target.value)}>
              <option value="">Kelas...</option>
              <option value="X">X</option>
              <option value="XI">XI</option>
              <option value="XII">XII</option>
            </select>

            <label>Pilih Konsentrasi Keahlian :</label>
            <select value={searchJurusan} onChange={(e) => setSearchJurusan(e.target.value)}>
              <option value="">Konsentrasi Keahlian</option>
              <option value="RPL">RPL</option>
              <option value="TKJ">TKJ</option>
              <option value="DKV">DKV</option>
              <option value="AV">AV</option>
              <option value="MT">MT</option>
              <option value="BC">BC</option>
              <option value="AN">AN</option>
              <option value="EI">EI</option>
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
          </div>
        </div>

        <table className="tabel-siswa">
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
            {filteredKelas.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  Tidak ada data yang sesuai filter.
                </td>
              </tr>
            ) : (
              filteredKelas.map((k, index) => (
                <tr key={k.id}>
                  <td style={{ fontWeight: '700' }}>{index + 1}</td>
                  <td>{k.namaKelas}</td>
                  <td>{k.jurusan}</td>
                  <td>{k.waliKelas}</td>
                  <td className="aksi-cell">
                    <button
                      className="aksi edit"
                      onClick={() => {
                        setEditData(k);
                        setIsModalOpen(true);
                      }}
                      title="Edit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="aksi hapus"
                      onClick={() => handleDeleteKelas(k.id)}
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
      </div>

      <TambahKelas
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={editData ? handleEditKelas : handleAddKelas}
        editData={editData}
      />
    </div>
  );
}

export default DataKelas;