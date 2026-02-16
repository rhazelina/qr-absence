// src/Pages/WakaStaff/JadwalGuruStaff.tsx
import { useEffect, useState } from "react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { SearchBox } from "../../component/Shared/Search";
import { Table } from "../../component/Shared/Table";
import { Eye, Upload } from "lucide-react";
import { teacherService, type Teacher } from "../../services/teacher";
import { usePopup } from "../../component/Shared/Popup/PopupProvider";

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

export default function JadwalGuruStaff({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  onselectGuru,
}: JadwalGuruStaffProps) {
  const [searchValue, setSearchValue] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const { alert: popupAlert, confirm: popupConfirm } = usePopup();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getTeachers();
      setTeachers(data);
    } catch (error) {
      console.error("Failed to fetch teachers", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = teachers.filter(
    (item) =>
      item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.nip.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleUpload = (row: Teacher) => {
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

        const confirm = await popupConfirm(`Upload jadwal untuk ${row.name}?`);
        if (!confirm) return;

        try {
          await teacherService.uploadScheduleImage(row.id, file);
          void popupAlert("Jadwal berhasil diupload");
          fetchTeachers(); // Refresh to get new image path if needed (though usually we assume it worked)
        } catch (error) {
          console.error("Upload failed", error);
          void popupAlert("Gagal mengupload jadwal. Silakan coba lagi.");
        }
      }
    };

    input.click();
  };

  const handleViewDetail = (row: Teacher) => {
    if (onselectGuru) {
      onselectGuru(row.name);
    }

    // Determine the image URL. Backend returns path, we need full URL or logic to prepend storage generic URL
    // Assuming backend returns relative path 'schedules/teachers/...' and we have a way to view it.
    // Ideally use `getScheduleImage` endpoint returning the file or redirect. 
    // Here we pass the ID so the detail page can fetch the image if needed, or if path is public.
    // For now passing row to detail.

    onMenuClick("lihat-guru", {
      namaGuru: row.name,
      noIdentitas: row.code || row.nip,
      teacherId: row.id, // Pass ID for detail page to fetch specific data
      jadwalImage: row.schedule_image_path, // Pass path if available
    });
  };

  const columns = [
    { key: "code", label: "Kode Guru" },
    { key: "name", label: "Nama Guru" },
    { key: "subject", label: "Mata Pelajaran" },
    // { key: "role", label: "Role" }, // Role is less relevant here as all are teachers/staff
    {
      key: "aksi",
      label: "Aksi",
      align: "center",
      render: (_: any, row: Teacher) => (
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
            title="Lihat Detail"
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
          emptyMessage={loading ? "Memuat data..." : "Belum ada data jadwal guru."}
        />
      </div>
    </StaffLayout>
  );
}
