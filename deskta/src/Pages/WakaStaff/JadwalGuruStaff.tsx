// src/Pages/WakaStaff/JadwalGuruStaff.tsx
import { useState } from "react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { SearchBox } from "../../component/Shared/Search";
import { Table } from "../../component/Shared/Table";
import { Eye, Upload } from "lucide-react";

interface JadwalGuruStaffProps {
  user: {
    name: string;
    role: string;
  };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string, payload?: any) => void;
  onselectGuru?: (namaGuru: string) => void;
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
    id: "1",
    kodeGuru: "0918415784",
    namaGuru: "Alifah Diantebes Aindra S.Pd",
    mataPelajaran: "Matematika",
    role: "Wali Kelas",
  },
  {
    id: "2",
    kodeGuru: "1348576392",
    namaGuru: "Budi Santoso",
    mataPelajaran: "Bahasa Inggris",
    role: "Staf",
  },
  {
    id: "3",
    kodeGuru: "0918415785",
    namaGuru: "Joko Widodo",
    mataPelajaran: "Fisika",
    role: "Wali Kelas",
  },
  {
    id: "4",
    kodeGuru: "1348576393",
    namaGuru: "Siti Nurhaliza",
    mataPelajaran: "Kimia",
    role: "Staf",
  },
];

export default function JadwalGuruStaff({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  onselectGuru,
}: JadwalGuruStaffProps) {
  const [searchValue, setSearchValue] = useState("");
  const [jadwalImages, setJadwalImages] = useState<Record<string, string>>({});

  const filteredData = dummyGuruJadwal.filter(
    (item) =>
      item.kodeGuru.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.namaGuru.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.mataPelajaran.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.role.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleUpload = (row: GuruJadwal) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png, image/jpeg, image/jpg";

    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setJadwalImages((prev) => ({
          ...prev,
          [row.id]: imageUrl,
        }));
      }
    };

    input.click();
  };

  const handleViewDetail = (row: GuruJadwal) => {
    if (onselectGuru) {
      onselectGuru(row.namaGuru);
    }

    onMenuClick("lihat-guru", {
      namaGuru: row.namaGuru,
      noIdentitas: row.kodeGuru,
      jadwalImage: jadwalImages[row.id],
    });
  };

  const columns = [
    { key: "kodeGuru", label: "Kode Guru" },
    { key: "namaGuru", label: "Nama Guru" },
    { key: "mataPelajaran", label: "Mata Pelajaran" },
    { key: "role", label: "Role" },
    {
      key: "aksi",
      label: "Aksi",
      align: "center",
      render: (_: any, row: GuruJadwal) => (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <button
            onClick={() => handleViewDetail(row)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => handleUpload(row)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
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
      pageTitle="Jadwal Guru"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 32,
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <SearchBox
            placeholder="Cari guru..."
            value={searchValue}
            onChange={setSearchValue}
          />
        </div>

        <Table
          columns={columns}
          data={filteredData}
          keyField="id"
          emptyMessage="Belum ada data jadwal guru."
        />
      </div>
    </StaffLayout>
  );
}
