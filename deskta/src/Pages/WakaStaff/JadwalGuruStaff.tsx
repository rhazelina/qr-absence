// src/Pages/WakaStaff/JadwalGuruStaff.tsx
import { useState, useEffect } from "react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { SearchBox } from "../../component/Shared/Search";
import { Table } from "../../component/Shared/Table";
import { Eye, Upload } from "lucide-react";
import { teacherService, type Teacher } from "../../services/teacherService";

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
  jabatan: string[];
  scheduleImage?: string;
}

export default function JadwalGuruStaff({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  onselectGuru,
}: JadwalGuruStaffProps) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [guruData, setGuruData] = useState<GuruJadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Deduplicated list of all subjects across all teachers
  const allSubjectOptions = Array.from(
    new Set(
      guruData
        .map(g => g.mataPelajaran)
        .join(', ')
        .split(', ')
        .map(s => s.trim())
        .filter(s => s && s !== '-')
    )
  ).sort();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getTeachers({ per_page: -1 });
      const teachers: Teacher[] = response.data || [];

      const mappedData: GuruJadwal[] = teachers.map((t) => {
        const rolesArray = Array.isArray(t.jabatan) ? t.jabatan : (t.role ? t.role.split(' | ') : ['Guru']);
        const subjects = Array.isArray(t.subject) ? t.subject.join(', ') : (t.subject || t.subject_name || "-");

        return {
          id: t.id,
          kodeGuru: t.kode_guru || t.code || t.nip || "-",
          namaGuru: t.nama_guru || t.name || "-",
          mataPelajaran: subjects,
          role: rolesArray.join(' | '),
          jabatan: rolesArray,
          scheduleImage: t.schedule_image_url
        };
      });

      setGuruData(mappedData);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = guruData.filter((item) => {
    const matchesSearch =
      item.kodeGuru.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.namaGuru.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.mataPelajaran.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.role.toLowerCase().includes(searchValue.toLowerCase());

    const matchesSubject = !selectedSubject ||
      item.mataPelajaran.split(', ').map(s => s.trim()).includes(selectedSubject);

    return matchesSearch && matchesSubject;
  });

  const handleUpload = (row: GuruJadwal) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png, image/jpeg, image/jpg";

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        try {
          setUploadingId(row.id);
          const response = await teacherService.uploadScheduleImage(row.id, file);
          console.log('UPLOAD SUCCESS RESPONSE:', response);

          // Update local state with new image URL if returned, or just refresh
          if (response.url) {
            const newImageUrl = `${response.url}${response.url.includes('?') ? '&' : '?'}t=${Date.now()}`;
            console.log('NEW IMAGE URL SET TO:', newImageUrl);
            setGuruData(prev => prev.map(item =>
              item.id === row.id ? { ...item, scheduleImage: newImageUrl } : item
            ));
          } else {
            console.log('NO URL IN RESPONSE, REFRESHING TEACHERS');
            fetchTeachers(); // Refresh to be sure
          }
          alert("Jadwal berhasil diunggah");
        } catch (error) {
          console.error("Upload failed", error);
          alert("Gagal mengunggah jadwal");
        } finally {
          setUploadingId(null);
        }
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
      jadwalImage: row.scheduleImage,
      guruId: row.id // Pass ID for detail fetching
    });
  };

  const columns = [
    { key: "kodeGuru", label: "Kode Guru" },
    { key: "namaGuru", label: "Nama Guru" },
    { key: "mataPelajaran", label: "Mata Pelajaran" },
    {
      key: "role",
      label: "Peran",
      render: (_: any, row: GuruJadwal) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {row.jabatan.map((r, i) => (
            <span key={i} style={{
              padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
              backgroundColor: r === 'Wali Kelas' ? '#DBEAFE' : r === 'Guru' ? '#DCFCE7' : r === 'Waka' ? '#F3E8FF' : '#FEF3C7',
              color: r === 'Wali Kelas' ? '#1E40AF' : r === 'Guru' ? '#166534' : r === 'Waka' ? '#6B21A8' : '#92400E',
            }}>
              {r}
            </span>
          ))}
        </div>
      )
    },
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
              color: "#374151"
            }}
            title="Lihat Detail"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => handleUpload(row)}
            disabled={uploadingId === row.id}
            style={{
              background: "none",
              border: "none",
              cursor: uploadingId === row.id ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              color: uploadingId === row.id ? "#9CA3AF" : "#374151"
            }}
            title="Upload Jadwal"
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
        <div style={{ marginBottom: 24, display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <SearchBox
              placeholder="Cari guru..."
              value={searchValue}
              onChange={setSearchValue}
            />
          </div>
          <div style={{ minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Mata Pelajaran</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '8px',
                border: '1px solid #D1D5DB', fontSize: '13px',
                backgroundColor: '#FFFFFF', color: '#374151',
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">Semua Mata Pelajaran</option>
              {allSubjectOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#6B7280" }}>Memuat data guru...</div>
        ) : (
          <Table
            columns={columns}
            data={filteredData}
            keyField="id"
            emptyMessage="Belum ada data jadwal guru."
          />
        )}
      </div>
    </StaffLayout>
  );
}
