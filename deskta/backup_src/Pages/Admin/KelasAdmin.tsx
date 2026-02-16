import { useState } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { Button } from '../../component/Shared/Button';
import { Select } from '../../component/Shared/Select';
import { Table } from '../../component/Shared/Table';
import { TambahKelasForm } from '../../component/Shared/Form/KelasForm';

import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import AWANKIRI from '../../assets/Icon/AWANKIRI.png';
import AwanBawahkanan from '../../assets/Icon/AwanBawahkanan.png';

/* ================= INTERFACE ================= */
interface User {
  role: string;
  name: string;
}

interface Kelas {
  id: string;
  nama: string;
  jurusan: string;
  jurusanId: string;
  kelasId: string;
  waliKelas: string;
  waliKelasId: string;
}

interface KelasAdminProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

/* ================= FILTER OPTION ================= */
const jurusanOptions = [
  { label: 'PPLG', value: 'PPLG' },
  { label: 'Mekatronika', value: 'Mekatronika' },
];

const tingkatOptions = [
  { label: '10', value: '10' },
  { label: '11', value: '11' },
  { label: '12', value: '12' },
];

/* ================= FORM DATA ================= */
const jurusanListForForm = [
  { id: 'Mekatronika', nama: 'Mekatronika' },
  { id: 'PPLG', nama: 'PPLG' },
];

const kelasListForForm = [
  { id: '10', nama: '10' },
  { id: '11', nama: '11' },
  { id: '12', nama: '12' },
];

const waliKelasListForForm: { id: string; nama: string }[] = [];

/* ================= DUMMY DATA ================= */
const dummyData: Kelas[] = [
  {
    id: '1',
    jurusan: 'Mekatronika',
    jurusanId: 'Mekatronika',
    kelasId: '12',
    nama: 'Mekatronika 1',
    waliKelas: 'Budi Santoso',
    waliKelasId: 'Budi Santoso',
  },
];

export default function KelasAdmin({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: KelasAdminProps) {
  const [selectedJurusan, setSelectedJurusan] = useState('');
  const [selectedTingkat, setSelectedTingkat] = useState('');
  const [kelasList, setKelasList] = useState<Kelas[]>(dummyData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  /* ================= TABLE COLUMN ================= */
  const columns = [
    { key: 'jurusan', label: 'Konsentrasi Keahlian' },
    { key: 'kelasId', label: 'Tingkat Kelas' },
    { key: 'nama', label: 'Kelas' },
    { key: 'waliKelas', label: 'Wali Kelas' },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (_: unknown, row: Kelas) => (
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() =>
              setOpenActionId(prev => (prev === row.id ? null : row.id))
            }
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F3F4F6';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
          >
            <MoreVertical size={22} strokeWidth={1.5} color="#64748B" />
          </button>

          {openActionId === row.id && (
            <div
              style={{
                position: 'absolute',
                right: -10,
                top: '100%',
                marginTop: 8,
                background: '#FFFFFF',
                borderRadius: 12,
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                zIndex: 9999,
                minWidth: 200,
                overflow: 'hidden',
                border: '1px solid #E5E7EB',
              }}
            >
              <button
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#0F172A',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  borderBottom: '1px solid #F3F4F6',
                }}
                onClick={() => {
                  setEditingKelas(row);
                  setIsModalOpen(true);
                  setOpenActionId(null);
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#DBEAFE';
                  (e.currentTarget as HTMLButtonElement).style.color = '#1E40AF';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                  (e.currentTarget as HTMLButtonElement).style.color = '#0F172A';
                }}
              >
                <Edit size={16} strokeWidth={2} />
                Edit
              </button>

              <button
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#0F172A',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => handleDelete(row)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FEE2E2';
                  (e.currentTarget as HTMLButtonElement).style.color = '#B91C1C';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                  (e.currentTarget as HTMLButtonElement).style.color = '#0F172A';
                }}
              >
                <Trash2 size={16} strokeWidth={2} />
                Hapus
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  /* ================= FILTER ================= */
  const filteredData = kelasList.filter(item => {
    if (selectedJurusan && item.jurusan !== selectedJurusan) return false;
    if (selectedTingkat && item.kelasId !== selectedTingkat) return false;
    return true;
  });

  /* ================= CRUD ================= */
  const handleSubmit = (data: {
    namaKelas: string;
    jurusanId: string;
    kelasId: string;
    waliKelasId: string;
  }) => {
    // Validation: 1 angkatan max 19 rombel
    // Count existing classes for the target Tingkat (data.kelasId)
    // If editing, exclude the current class from count if it stays in same tingkat, but logic is simpler: 
    // Just count how many classes have this 'kelasId' (tingkat).

    // Check if we are adding a NEW class or changing Tingkat
    const classesInLevel = kelasList.filter(k => k.kelasId === data.kelasId);
    // If editing and we are keeping the same ID, we don't count itself as "extra" if we are just updating name. 
    // But simplistic check: max 19.

    if (!editingKelas || (editingKelas && editingKelas.kelasId !== data.kelasId)) {
      if (classesInLevel.length >= 19) {
        alert(`Gagal: Maksimal 19 rombel untuk angkatan kelas ${data.kelasId}!`);
        return;
      }
    }

    if (editingKelas) {
      setKelasList(prev =>
        prev.map(item =>
          item.id === editingKelas.id
            ? {
              ...item,
              nama: data.namaKelas,
              jurusan: data.jurusanId,
              jurusanId: data.jurusanId,
              kelasId: data.kelasId,
              waliKelas: data.waliKelasId,
              waliKelasId: data.waliKelasId,
            }
            : item
        )
      );
    } else {
      setKelasList(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          nama: data.namaKelas,
          jurusan: data.jurusanId,
          jurusanId: data.jurusanId,
          kelasId: data.kelasId,
          waliKelas: data.waliKelasId,
          waliKelasId: data.waliKelasId,
        },
      ]);
    }

    setIsModalOpen(false);
    setEditingKelas(null);
  };

  const handleDelete = (row: Kelas) => {
    if (window.confirm(`Hapus kelas "${row.nama}"?`)) {
      setKelasList(prev => prev.filter(item => item.id !== row.id));
    }
  };

  return (
    <AdminLayout
      pageTitle="Data Kelas"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
      hideBackground
    >
      {/* BACKGROUND */}
      <img
        src={AWANKIRI}
        style={{ position: 'fixed', top: 0, left: 0, width: 220 }}
      />
      <img
        src={AwanBawahkanan}
        style={{ position: 'fixed', bottom: 0, right: 0, width: 220 }}
      />

      {/* CONTENT */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          minHeight: 'calc(100vh - 160px)',
        }}
      >
        {/* FILTER */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            alignItems: 'end',
          }}
        >
          <Select
            label="Konsentrasi Keahlian"
            value={selectedJurusan}
            onChange={setSelectedJurusan}
            options={jurusanOptions}
            placeholder="Semua Konsentrasi"
          />

          <Select
            label="Tingkat Kelas"
            value={selectedTingkat}
            onChange={setSelectedTingkat}
            options={tingkatOptions}
            placeholder="Semua Tingkat"
          />

          <Button label="Tambahkan" onClick={() => setIsModalOpen(true)} />
        </div>

        {/* TABLE */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 16,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 0 1px #E5E7EB',
          }}
        >
          <div
            style={{
              flex: 1,
              overflowX: 'auto',
              overflowY: 'auto',
            }}
          >
            <Table columns={columns} data={filteredData} keyField="id" />
          </div>
        </div>
      </div>

      {/* MODAL */}
      <TambahKelasForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingKelas(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingKelas}
        initialData={
          editingKelas
            ? {
              namaKelas: editingKelas.nama,
              jurusanId: editingKelas.jurusanId,
              kelasId: editingKelas.kelasId,
              waliKelasId: editingKelas.waliKelasId,
            }
            : undefined
        }
        jurusanList={jurusanListForForm}
        kelasList={kelasListForForm}
        waliKelasList={waliKelasListForForm}
      />
    </AdminLayout>
  );
}
