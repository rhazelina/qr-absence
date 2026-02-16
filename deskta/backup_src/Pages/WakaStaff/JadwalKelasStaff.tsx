// src/Pages/WakaStaff/JadwalKelasStaff.tsx
import { useMemo, useState } from 'react';
import StaffLayout from '../../component/WakaStaff/StaffLayout';
import { Select } from '../../component/Shared/Select';
import { Table } from '../../component/Shared/Table';

interface JadwalKelasStaffProps {
  user: {
    name: string;
    role: string;
  };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  onselectKelas?: (kelasId: string) => void;
}

interface KelasItem {
  id: string;
  namaKelas: string;
  tingkat: string; // X, XI, XII
  jurusan: string;
  waliKelas: string;
}

const dummyKelas: KelasItem[] = [
  {
    id: '1',
    namaKelas: 'XII Mekatronika 1',
    tingkat: 'XII',
    jurusan: 'Mekatronika',
    waliKelas: 'Ewit Ernlyah',
  },
  {
    id: '2',
    namaKelas: 'XII Mekatronika 2',
    tingkat: 'XII',
    jurusan: 'Mekatronika',
    waliKelas: 'Ewit Ernlyah',
  },
  {
    id: '3',
    namaKelas: 'XI RPL 1',
    tingkat: 'XI',
    jurusan: 'Rekayasa Perangkat Lunak',
    waliKelas: 'Budi Santoso',
  },
  {
    id: '4',
    namaKelas: 'X TKJ 1',
    tingkat: 'X',
    jurusan: 'Teknik Komputer Jaringan',
    waliKelas: 'Siti Nurhaliza',
  },
];

export default function JadwalKelasStaff({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  onselectKelas,
}: JadwalKelasStaffProps) {
  const [selectedJurusan, setSelectedJurusan] = useState('');
  const [selectedTingkat, setSelectedTingkat] = useState('');

  const jurusanOptions = useMemo(
    () =>
      [...new Set(dummyKelas.map((item) => item.jurusan))].map((jrs) => ({
        label: jrs,
        value: jrs,
      })),
    []
  );

  const tingkatOptions = [
    { label: 'Kelas X', value: 'X' },
    { label: 'Kelas XI', value: 'XI' },
    { label: 'Kelas XII', value: 'XII' },
  ];

  const filteredData = dummyKelas.filter((item) => {
    const matchJurusan = selectedJurusan ? item.jurusan === selectedJurusan : true;
    const matchTingkat = selectedTingkat ? item.tingkat === selectedTingkat : true;
    return matchJurusan && matchTingkat;
  });

  const columns = [
    { key: 'namaKelas', label: 'Nama Kelas' },
    { key: 'jurusan', label: 'Nama Jurusan' },
    { key: 'waliKelas', label: 'Wali Kelas' },
  ];

  const handleViewDetail = (row: KelasItem) => {
    if (onselectKelas) {
      onselectKelas(row.id);
    }
    onMenuClick('lihat-kelas');
  };

  return (
    <StaffLayout
      pageTitle="Jadwal Kelas"
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
          {/* Filter Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <Select
              label="Pilih Jurusan"
              value={selectedJurusan}
              onChange={setSelectedJurusan}
              options={jurusanOptions}
              placeholder="Semua Jurusan"
            />
            <Select
              label="Pilih Tingkat"
              value={selectedTingkat}
              onChange={setSelectedTingkat}
              options={tingkatOptions}
              placeholder="Semua Tingkat"
            />
          </div>

          {/* Tabel Kelas */}
          <Table
            columns={columns}
            data={filteredData}
            onView={handleViewDetail}
            keyField="id"
            emptyMessage="Belum ada data jadwal kelas."
          />
        </div>
      </div>
    </StaffLayout>
  );
}