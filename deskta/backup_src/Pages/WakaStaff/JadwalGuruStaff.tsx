// src/Pages/WakaStaff/JadwalGuruStaff.tsx
import { useState } from 'react';
import StaffLayout from '../../component/WakaStaff/StaffLayout';
import { SearchBox } from '../../component/Shared/Search';
import { Table } from '../../component/Shared/Table';

interface JadwalGuruStaffProps {
  user: {
    name: string;
    role: string;
  };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  onselectGuru?: (guruId: string) => void;
}

interface GuruJadwal {
  id: string;
  kodeGuru: string;
  namaGuru: string;
  mataPelajaran: string;
  role: string;
}

const dummyGuruJadwal: GuruJadwal[] = [
  {
    id: '1',
    kodeGuru: '0918415784',
    namaGuru: 'Alifah Diantobes Aindra S.Pd',
    mataPelajaran: 'Matematika',
    role: 'Wali Kelas',
  },
  {
    id: '2',
    kodeGuru: '1348576392',
    namaGuru: 'Budi Santoso',
    mataPelajaran: 'Bahasa Inggris',
    role: 'Staf',
  },
  {
    id: '3',
    kodeGuru: '0918415785',
    namaGuru: 'Joko Widodo',
    mataPelajaran: 'Fisika',
    role: 'Wali Kelas',
  },
  {
    id: '4',
    kodeGuru: '1348576393',
    namaGuru: 'Siti Nurhaliza',
    mataPelajaran: 'Kimia',
    role: 'Staf',
  },
];

export default function JadwalGuruStaff({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  onselectGuru,
}: JadwalGuruStaffProps) {
  const [searchValue, setSearchValue] = useState('');

  const filteredData = dummyGuruJadwal.filter(
    (item) =>
      item.kodeGuru.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.namaGuru.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.mataPelajaran.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.role.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns = [
    { key: 'kodeGuru', label: 'Kode Guru' },
    { key: 'namaGuru', label: 'Nama Guru' },
    { key: 'mataPelajaran', label: 'Mata Pelajaran' },
    { key: 'role', label: 'Role' },
  ];

  const handleViewDetail = (row: GuruJadwal) => {
    if (onselectGuru) {
      onselectGuru(row.id);
    }
    onMenuClick('lihat-guru');
  };

  return (
    <StaffLayout
      pageTitle="Jadwal Guru"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      {/* Container utama dengan style konsisten Admin */}
      <div
        style={{
          position: 'relative',
          minHeight: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          overflow: 'hidden',
          padding: '32px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header: Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: '200px' }}>
              <SearchBox
                placeholder="Cari guru..."
                value={searchValue}
                onChange={setSearchValue}
              />
            </div>
          </div>

          {/* Tabel Guru */}
          <Table
            columns={columns}
            data={filteredData}
            onView={handleViewDetail}
            keyField="id"
            emptyMessage="Belum ada data jadwal guru."
          />
        </div>
      </div>
    </StaffLayout>
  );
}