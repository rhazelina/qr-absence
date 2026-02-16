// src/Pages/WakaStaff/JadwalKelasStaff.tsx
import { useMemo, useState } from 'react';
import StaffLayout from '../../component/WakaStaff/StaffLayout';
import { Select } from '../../component/Shared/Select';
import { Table } from '../../component/Shared/Table';
import { Eye, Upload, AlertCircle } from "lucide-react";

interface JadwalKelasStaffProps {
  user: {
    name: string;
    role: string;
  };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string, payload?: any) => void;
  onselectKelas?: (namaKelas: string) => void;
}

interface KelasItem {
  id: string;
  namaKelas: string;
  tingkat: string;
  jurusan: string;
  waliKelas: string;
}

const dummyKelas: KelasItem[] = [
  {
    id: '1',
    namaKelas: '12 Mekatronika 1',
    tingkat: '12',
    jurusan: 'Mekatronika',
    waliKelas: 'Ewit Ernlyah',
  },
  {
    id: '2',
    namaKelas: '12 Mekatronika 2',
    tingkat: '12',
    jurusan: 'Mekatronika',
    waliKelas: 'Ewit Ernlyah',
  },
  {
    id: '3',
    namaKelas: '11 RPL 1',
    tingkat: '11',
    jurusan: 'Rekayasa Perangkat Lunak',
    waliKelas: 'Budi Santoso',
  },
  {
    id: '4',
    namaKelas: '10 TKJ 1',
    tingkat: '10',
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
  const [jadwalImages, setJadwalImages] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const jurusanOptions = useMemo(
    () =>
      [...new Set(dummyKelas.map((item) => item.jurusan))].map((jrs) => ({
        label: jrs,
        value: jrs,
      })),
    []
  );

  const tingkatOptions = [
    { label: '10', value: '10' },
    { label: '11', value: '11' },
    { label: '12', value: '12' },
  ];

  const filteredData = dummyKelas.filter((item) => {
    const matchJurusan = selectedJurusan ? item.jurusan === selectedJurusan : true;
    const matchTingkat = selectedTingkat ? item.tingkat === selectedTingkat : true;
    return matchJurusan && matchTingkat;
  });

  // Validasi tipe file
  const isValidFileType = (file: File): boolean => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return allowedTypes.includes(file.type);
  };

  // Tampilkan notif
  const showNotification = (type: 'error' | 'success', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleUpload = (row: KelasItem) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png, image/jpeg, image/jpg";

    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        // Validasi tipe file
        if (!isValidFileType(file)) {
          showNotification(
            'error',
            'Hanya file PNG, JPG, atau JPEG yang didukung'
          );
          return;
        }

        const imageUrl = URL.createObjectURL(file);
        setJadwalImages((prev) => ({
          ...prev,
          [row.id]: imageUrl,
        }));
        showNotification('success', 'Jadwal berhasil diupload');
      }
    };

    input.click();
  };

  const handleViewDetail = (row: KelasItem) => {
    if (onselectKelas) {
      onselectKelas(row.namaKelas);
    }

    onMenuClick('lihat-kelas', {
      kelas: row.namaKelas,
      jadwalImage: jadwalImages[row.id],
    });
  };

  const columns = [
    { key: 'namaKelas', label: 'Nama Kelas' },
    { key: 'jurusan', label: 'Nama Konsentrasi Keahlian' },
    { key: 'waliKelas', label: 'Wali Kelas' },
    {
      key: 'aksi',
      label: 'Aksi',
      align: 'center',
      render: (_: any, row: KelasItem) => (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <button
            onClick={() => handleViewDetail(row)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#0B2948',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => handleUpload(row)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#0B2948',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Upload size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <StaffLayout
      pageTitle="Jadwal Kelas"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      {/* Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            padding: '16px 20px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
            backgroundColor: notification.type === 'error' ? '#FEE2E2' : '#ECFDF5',
            border: notification.type === 'error' ? '1px solid #FECACA' : '1px solid #A7F3D0',
          }}
        >
          <AlertCircle
            size={20}
            style={{
              color: notification.type === 'error' ? '#DC2626' : '#059669',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: notification.type === 'error' ? '#DC2626' : '#059669',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {notification.message}
          </span>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 32,
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <Select
            label="Pilih Konsentrasi Keahlian"
            value={selectedJurusan}
            onChange={setSelectedJurusan}
            options={jurusanOptions}
            placeholder="Semua Konsentrasi Keahlian"
          />
          <Select
            label="Pilih Tingkat Kelas"
            value={selectedTingkat}
            onChange={setSelectedTingkat}
            options={tingkatOptions}
            placeholder="Semua Tingkat Kelas"
          />
        </div>

        <Table
          columns={columns}
          data={filteredData}
          keyField="id"
          emptyMessage="Belum ada data jadwal kelas."
        />
      </div>
    </StaffLayout>
  );
}