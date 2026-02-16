import { useState, useRef } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { Button } from '../../component/Shared/Button';
import { SearchBox } from '../../component/Shared/Search';
import { Select } from '../../component/Shared/Select';
import { Table } from '../../component/Shared/Table';
import { TambahGuruForm } from '../../component/Shared/Form/TambahGuruForm';
import AWANKIRI from '../../assets/Icon/AWANKIRI.png';
import AwanBawahkanan from '../../assets/Icon/AwanBawahkanan.png';
import { MoreVertical, Edit, Trash2, Eye, Grid } from 'lucide-react';

interface User {
  role: string;
  name: string;
}

interface Guru {
  id: string;
  kodeGuru: string;
  namaGuru: string;
  mataPelajaran: string;
  role: string;
  password?: string;
  noTelp?: string;
  waliKelasDari?: string;
}

interface GuruAdminProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  onNavigateToDetail?: (guruId: string) => void;
}

const dummyData: Guru[] = [
  {
    id: '1',
    kodeGuru: '0918415784',
    namaGuru: 'Alifah Diantebes Aindra S.pd',
    mataPelajaran: 'Matematika',
    role: 'Wali Kelas',
    password: 'ABC123',
    noTelp: '08218374859',
    waliKelasDari: 'XII RPL 2',
  },
  {
    id: '2',
    kodeGuru: '1348576392',
    namaGuru: 'Budi Santoso',
    mataPelajaran: 'Bahasa Inggris',
    role: 'Staf',
    password: 'STAF123',
    noTelp: '08123456789',
    waliKelasDari: '',
  },
  {
    id: '3',
    kodeGuru: '0918415785',
    namaGuru: 'Joko Widodo',
    mataPelajaran: 'Fisika',
    role: 'Wali Kelas',
    password: 'JOKO123',
    noTelp: '08234567890',
    waliKelasDari: 'XI TKJ 1',
  },
  {
    id: '4',
    kodeGuru: '1348576393',
    namaGuru: 'Siti Nurhaliza',
    mataPelajaran: 'Kimia',
    role: 'Staf',
    password: 'SITI123',
    noTelp: '08345678901',
    waliKelasDari: '',
  },
  {
    id: '5',
    kodeGuru: '0918415786',
    namaGuru: 'Ahmad Dahlan',
    mataPelajaran: 'Biologi',
    role: 'Wali Kelas',
    password: 'AHMAD123',
    noTelp: '08456789012',
    waliKelasDari: 'X RPL 1',
  },
  {
    id: '6',
    kodeGuru: '1348576394',
    namaGuru: 'Dewi Lestari',
    mataPelajaran: 'Sejarah',
    role: 'Staf',
    password: 'DEWI123',
    noTelp: '08567890123',
    waliKelasDari: '',
  },
];

export default function GuruAdmin({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  onNavigateToDetail,
}: GuruAdminProps) {
  const [searchValue, setSearchValue] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [isDataGuruDropdownOpen, setIsDataGuruDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guruList, setGuruList] = useState<Guru[]>(dummyData);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mapelOptions = Array.from(new Set(guruList.map((g) => g.mataPelajaran)))
    .filter(Boolean)
    .sort()
    .map((m) => ({ value: m, label: m }));

  const roleOptions = Array.from(new Set(guruList.map((g) => g.role)))
    .filter(Boolean)
    .sort()
    .map((r) => ({ value: r, label: r }));

  const filteredData = guruList.filter((item) => {
    const matchSearch =
      item.kodeGuru.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.namaGuru.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.mataPelajaran.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.role.toLowerCase().includes(searchValue.toLowerCase());

    const matchMapel = selectedMapel ? item.mataPelajaran === selectedMapel : true;
    const matchRole = selectedRole ? item.role === selectedRole : true;

    return matchSearch && matchMapel && matchRole;
  });

  const columns = [
    { key: 'kodeGuru', label: 'Kode Guru' },
    { key: 'namaGuru', label: 'Nama Guru' },
    { key: 'mataPelajaran', label: 'Mata Pelajaran' },
    { key: 'role', label: 'Peran' },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (_value: any, row: Guru) => (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            type="button"
            onClick={() =>
              setOpenActionId((prev) => (prev === row.id ? null : row.id))
            }
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Aksi"
          >
            <MoreVertical size={22} strokeWidth={1.5} />
          </button>

          {openActionId === row.id && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 4,
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                boxShadow:
                  '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                zIndex: 10,
                minWidth: 160,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setOpenActionId(null);
                  handleEditClick(row);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  border: 'none',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#111827',
                }}
              >
                <Edit size={18} strokeWidth={2} color="#64748B" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenActionId(null);
                  handleDeleteClick(row);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  border: 'none',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#B91C1C',
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                <Trash2 size={18} strokeWidth={2} color="#64748B" />
                <span>Hapus</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenActionId(null);
                  handleViewDetail(row);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  border: 'none',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#111827',
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                <Eye size={18} strokeWidth={2} color="#64748B" />
                <span>Lihat</span>
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleTambahGuru = (data: {
    kodeGuru: string;
    namaGuru: string;
    mataPelajaran: string;
    role: string;
    password: string;
    noTelp: string;
    waliKelasDari: string;
  }) => {
    const newGuru: Guru = {
      id: String(guruList.length + 1),
      kodeGuru: data.kodeGuru,
      namaGuru: data.namaGuru,
      mataPelajaran: data.mataPelajaran,
      role: data.role,
      password: data.password,
      noTelp: data.noTelp,
      waliKelasDari: data.waliKelasDari,
    };
    setGuruList([...guruList, newGuru]);
    setIsModalOpen(false);
    setEditingGuru(null);
    alert(`✅ Guru "${data.namaGuru}" berhasil ditambahkan!`);
  };

  const handleEditGuru = (data: {
    kodeGuru: string;
    namaGuru: string;
    mataPelajaran: string;
    role: string;
    password: string;
    noTelp: string;
    waliKelasDari: string;
  }) => {
    if (editingGuru) {
      const updatedList = guruList.map((item) =>
        item.id === editingGuru.id
          ? {
            ...item,
            kodeGuru: data.kodeGuru,
            namaGuru: data.namaGuru,
            mataPelajaran: data.mataPelajaran,
            role: data.role,
            password: data.password,
            noTelp: data.noTelp,
            waliKelasDari: data.waliKelasDari,
          }
          : item
      );
      setGuruList(updatedList);
      setEditingGuru(null);
      setIsModalOpen(false);
      alert(`✅ Data guru "${data.namaGuru}" berhasil diperbarui!`);
    }
  };

  const handleEditClick = (row: Guru) => {
    setEditingGuru(row);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (row: Guru) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus guru "${row.namaGuru}"?`
    );
    if (confirmDelete) {
      const updatedList = guruList.filter((item) => item.id !== row.id);
      setGuruList(updatedList);
      alert(`✅ Guru "${row.namaGuru}" berhasil dihapus!`);
    }
  };

  const handleViewDetail = (row: Guru) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(row.id);
    } else {
      alert(`Navigasi ke detail guru: ${row.namaGuru} (ID: ${row.id})`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGuru(null);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleExportPDF = () => {
    try {
      if (typeof window !== 'undefined' && (window as any).jspdf) {
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Data Guru', 14, 20);
        doc.setFontSize(12);
        doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

        const headers = [['No', 'Kode Guru', 'Nama Guru', 'Mata Pelajaran', 'Role']];
        const data = filteredData.map((item, idx) => [
          String(idx + 1),
          item.kodeGuru,
          item.namaGuru,
          item.mataPelajaran,
          item.role,
        ]);

        (doc as any).autoTable({
          head: headers,
          body: data,
          startY: 40,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [37, 99, 235] },
        });

        doc.save(`Data_Guru_${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Data Guru</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; }
                  h1 { color: #0B2948; }
                  table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #2563EB; color: white; }
                  tr:nth-child(even) { background-color: #f2f2f2; }
                </style>
              </head>
              <body>
                <h1>Data Guru</h1>
                <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Kode Guru</th>
                      <th>Nama Guru</th>
                      <th>Mata Pelajaran</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredData
              .map(
                (item, idx) => `
                      <tr>
                        <td>${idx + 1}</td>
                        <td>${item.kodeGuru}</td>
                        <td>${item.namaGuru}</td>
                        <td>${item.mataPelajaran}</td>
                        <td>${item.role}</td>
                      </tr>
                    `
              )
              .join('')}
                  </tbody>
                </table>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Terjadi kesalahan saat mengekspor PDF. Silakan coba lagi.');
    }
  };

  const buttonBaseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 20px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    height: '44px',
  } as const;

  return (
    <AdminLayout
      pageTitle="Data Guru"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
      hideBackground={true}
    >
      {/* Layer bg fixed (awan) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={AWANKIRI}
          alt="Awan kiri atas"
          style={{ position: 'fixed', top: 0, left: 0, width: 220, height: 'auto' }}
        />
        <img
          src={AwanBawahkanan}
          alt="Awan kanan bawah"
          style={{ position: 'fixed', bottom: 0, right: 0, width: 220, height: 'auto' }}
        />
      </div>

      {/* Kontainer utama */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          overflow: 'hidden',
          padding: 'clamp(16px, 3vw, 32px)',
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Controls Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                alignItems: 'end',
              }}
            >
              <Select
                label="Mata Pelajaran"
                value={selectedMapel}
                onChange={setSelectedMapel}
                options={mapelOptions}
                placeholder="Semua Mata Pelajaran"
              />
              <Select
                label="Peran / Role"
                value={selectedRole}
                onChange={setSelectedRole}
                options={roleOptions}
                placeholder="Semua Peran"
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
                borderTop: '1px solid #F1F5F9',
                paddingTop: '20px',
              }}
            >
              <div style={{ flex: 1, minWidth: 240 }}>
                <SearchBox
                  placeholder="Cari guru..."
                  value={searchValue}
                  onChange={setSearchValue}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsDataGuruDropdownOpen(!isDataGuruDropdownOpen)}
                    style={{
                      ...buttonBaseStyle,
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Data Guru
                    <Grid size={16} style={{ marginLeft: 4 }} />
                  </button>

                  {isDataGuruDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 4,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 8,
                        boxShadow:
                          '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                        zIndex: 20,
                        minWidth: 160,
                        border: '1px solid #E5E7EB',
                      }}
                    >
                      <button
                        onClick={() => {
                          setIsDataGuruDropdownOpen(false);
                          handleImport();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 16px',
                          border: 'none',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: 14,
                          color: '#111827',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 3v12" />
                          <path d="m8 11 4 4 4-4" />
                          <path d="M20 21H4" />
                        </svg>
                        Import
                      </button>
                      <button
                        onClick={() => {
                          setIsDataGuruDropdownOpen(false);
                          handleExportPDF();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 16px',
                          border: 'none',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: 14,
                          color: '#111827',
                          textAlign: 'left',
                          borderTop: '1px solid #F1F5F9',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                        Ekspor PDF
                      </button>
                    </div>
                  )}
                </div>

                <Button
                  label="Tambahkan Guru"
                  onClick={() => setIsModalOpen(true)}
                  variant="primary"
                />
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 0 0 1px #E5E7EB',
              overflowX: 'auto',
            }}
          >
            <Table columns={columns} data={filteredData} keyField="id" />
          </div>
        </div>
      </div>

      <TambahGuruForm
        key={editingGuru?.id || 'new'}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingGuru ? handleEditGuru : handleTambahGuru}
        initialData={
          editingGuru
            ? {
              kodeGuru: editingGuru.kodeGuru,
              namaGuru: editingGuru.namaGuru,
              mataPelajaran: editingGuru.mataPelajaran,
              role: editingGuru.role,
              password: editingGuru.password || '',
              noTelp: editingGuru.noTelp || '',
              waliKelasDari: editingGuru.waliKelasDari || '',
            }
            : undefined
        }
        isEdit={!!editingGuru}
      />
    </AdminLayout>
  );
}