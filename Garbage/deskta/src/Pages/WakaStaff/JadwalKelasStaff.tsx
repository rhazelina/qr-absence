// src/Pages/WakaStaff/JadwalKelasStaff.tsx
import { useEffect, useMemo, useState } from 'react';
import StaffLayout from '../../component/WakaStaff/StaffLayout';
import { Select } from '../../component/Shared/Select';
import { Table } from '../../component/Shared/Table';
import { Eye, Upload } from "lucide-react";
import { classService, type ClassRoom } from '../../services/class';
import { usePopup } from '../../component/Shared/Popup/PopupProvider';

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

export default function JadwalKelasStaff({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  onselectKelas,
}: JadwalKelasStaffProps) {
  const [selectedJurusan, setSelectedJurusan] = useState('');
  const [selectedTingkat, setSelectedTingkat] = useState('');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const { alert: popupAlert, confirm: popupConfirm } = usePopup();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await classService.getClasses();
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    } finally {
      setLoading(false);
    }
  };

  const jurusanOptions = useMemo(
    () => {
      const majors = Array.from(new Set(classes.map(c => c.major?.name || 'Unknown')));
      return majors.map((jrs) => ({
        label: jrs,
        value: jrs,
      }));
    },
    [classes]
  );

  const tingkatOptions = [
    { label: 'Kelas X', value: 'X' },
    { label: 'Kelas XI', value: 'XI' },
    { label: 'Kelas XII', value: 'XII' },
  ];

  const filteredData = classes.filter((item) => {
    const itemMajor = item.major?.name || "";
    const matchJurusan = selectedJurusan ? itemMajor === selectedJurusan : true;
    const matchTingkat = selectedTingkat ? item.grade === selectedTingkat : true;
    return matchJurusan && matchTingkat;
  });

  const handleUpload = (row: ClassRoom) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png, image/jpeg, image/jpg";

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          void popupAlert("Ukuran file maksimal 2MB");
          return;
        }

        const confirm = await popupConfirm(`Upload jadwal untuk ${row.grade} ${row.label}?`);
        if (!confirm) return;

        try {
          await classService.uploadSchedule(row.id, file);
          void popupAlert("Jadwal kelas berhasil diupload");
          fetchClasses(); // Refresh
        } catch (error) {
          console.error("Upload failed", error);
          void popupAlert("Gagal mengupload jadwal. Silakan coba lagi.");
        }
      }
    };

    input.click();
  };

  const handleViewDetail = (row: ClassRoom) => {
    const name = row.name || `${row.grade} ${row.label}`;
    if (onselectKelas) {
      onselectKelas(name);
    }

    onMenuClick('lihat-kelas', {
      kelas: name,
      classId: row.id,
      jadwalImage: row.schedule_image_path,
    });
  };

  const columns = [
    {
      key: 'displayName',
      label: 'Nama Kelas',
      render: (_: any, row: ClassRoom) => row.name || `${row.grade} ${row.label}`
    },
    {
      key: 'jurusan',
      label: 'Nama Konsentrasi Keahlian',
      render: (_: any, row: ClassRoom) => row.major?.name || "-"
    },
    {
      key: 'waliKelas',
      label: 'Wali Kelas',
      render: (_: any, row: ClassRoom) => row.homeroom_teacher?.user?.name || "-"
    },
    {
      key: 'aksi',
      label: 'Aksi',
      align: 'center',
      render: (_: any, row: ClassRoom) => (
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
            }}
            title="Lihat Detail"
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
              color: row.schedule_image_path ? '#3B82F6' : 'inherit'
            }}
            title={row.schedule_image_path ? "Ganti Jadwal" : "Upload Jadwal"}
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
          emptyMessage={loading ? "Memuat data..." : "Belum ada data jadwal kelas."}
        />
      </div>
    </StaffLayout>
  );
}
