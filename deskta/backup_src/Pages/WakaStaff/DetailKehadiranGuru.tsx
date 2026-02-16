import { useMemo, useState } from "react";
import { User, SquarePen } from "lucide-react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { FormModal } from "../../component/Shared/FormModal";
import { Select } from "../../component/Shared/Select";

type StatusKehadiran = "Hadir" | "Izin" | "Sakit" | "Alfa";

type RowKehadiran = {
  no: number;
  tanggal: string; // dd-mm-yyyy
  jam: string; // "1-4"
  mapel: string;
  kelas: string;
  status: StatusKehadiran;
};

interface DetailKehadiranGuruProps {
  user?: { name: string; role: string };
  currentPage?: string;
  onMenuClick?: (page: string) => void;
  onLogout?: () => void;
  onBack?: () => void;
}

export default function DetailKehadiranGuru({
  user = { name: "Admin", role: "waka" },
  currentPage = "detail-kehadiran-guru",
  onMenuClick = () => {},
  onLogout = () => {},
  onBack = () => {},
}: DetailKehadiranGuruProps) {
  // contoh data (silakan ganti dari API)
  const [rows, setRows] = useState<RowKehadiran[]>([
    {
      no: 2,
      tanggal: "25-05-2025",
      jam: "1-4",
      mapel: "Matematika",
      kelas: "XII Mekatronika 2",
      status: "Hadir",
    },
    {
      no: 2,
      tanggal: "24-05-2025",
      jam: "5-8",
      mapel: "Matematika",
      kelas: "XII Mekatronika 2",
      status: "Hadir",
    },
    {
      no: 2,
      tanggal: "25-05-2025",
      jam: "9-10",
      mapel: "Matematika",
      kelas: "XII Mekatronika 2",
      status: "Izin",
    },
  ]);

  const guruInfo = {
    name: "Ewit Erniyah S.pd",
    phone: "0918415784",
  };

  const statusOptions = useMemo(
    () => [
      { label: "Hadir", value: "Hadir" },
      { label: "Sakit", value: "Sakit" },
      { label: "Izin", value: "Izin" },
      { label: "Tidak Hadir", value: "Alfa" },
    ],
    []
  );

  const [editingRow, setEditingRow] = useState<RowKehadiran | null>(null);
  const [editStatus, setEditStatus] = useState<StatusKehadiran>("Hadir");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenEdit = (row: RowKehadiran) => {
    setEditingRow(row);
    setEditStatus(row.status);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingRow(null);
    setIsSubmitting(false);
  };

  const handleSubmitEdit = () => {
    if (!editingRow) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setRows((prev) =>
        prev.map((r) =>
          r === editingRow ? { ...r, status: editStatus } : r
        )
      );
      setIsSubmitting(false);
      setIsEditOpen(false);
      setEditingRow(null);
    }, 300);
  };

  const statusStyle = (status: StatusKehadiran): React.CSSProperties => {
    if (status === "Hadir") {
      return {
        backgroundColor: "#0AA000",
        color: "#FFFFFF",
      };
    }
    if (status === "Izin") {
      return {
        backgroundColor: "#D6BE2C",
        color: "#FFFFFF",
      };
    }
    if (status === "Sakit") {
      return {
        backgroundColor: "#3B82F6",
        color: "#FFFFFF",
      };
    }
    return {
      backgroundColor: "#EF4444",
      color: "#FFFFFF",
    };
  };

  return (
    <StaffLayout
      pageTitle="Detail Kehadiran Guru"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={{ width: "100%" }}>
        {/* Back Button */}
        <button
          onClick={onBack}
          style={{
            marginBottom: "20px",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            color: "#0F172A",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F1F5F9";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FFFFFF";
          }}
        >
          ← Kembali
        </button>

        {/* CONTENT */}
        <div style={{ padding: "28px 24px 40px" }}>
        {/* Card Guru */}
        <div
          style={{
            width: 420,
            backgroundColor: "#062A4A",
            borderRadius: 10,
            padding: "18px 18px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#FFFFFF",
            boxShadow: "0 10px 24px rgba(0,0,0,0.10)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.10)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <User size={30} color="#FFFFFF" />
          </div>

          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{guruInfo.name}</div>
            <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, opacity: 0.95 }}>
              {guruInfo.phone}
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            marginTop: 34,
            borderRadius: 8,
            overflow: "hidden",
            border: "2px solid #C7C7C7",
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* header */}
          <div
            style={{
              backgroundColor: "#C9C3C3",
              padding: "14px 0",
              display: "grid",
              gridTemplateColumns: "90px 160px 220px 260px 220px 160px 90px",
              alignItems: "center",
              fontWeight: 900,
              color: "#374151",
              fontSize: 20,
            }}
          >
            <div style={{ paddingLeft: 16 }}>No</div>
            <div>Tanggal</div>
            <div>Jam Pelajaran</div>
            <div>Mata Pelajaran</div>
            <div>Kelas</div>
            <div style={{ textAlign: "center" }}>Status</div>
            <div style={{ textAlign: "center" }}>Aksi</div>
          </div>

          {/* rows */}
          {rows.map((r, idx) => (
            <div
              key={`${r.no}-${idx}`}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 160px 220px 260px 220px 160px 90px",
                alignItems: "center",
                padding: "16px 0",
                borderTop: idx === 0 ? "1px solid #7B7B7B" : "1px solid #7B7B7B",
                fontSize: 20,
                color: "#0F172A",
                backgroundColor: "#FFFFFF",
              }}
            >
              <div style={{ paddingLeft: 24 }}>{r.no}.</div>
              <div style={{ fontWeight: 800 }}>{r.tanggal}</div>
              <div style={{ textAlign: "center", fontWeight: 800 }}>{r.jam}</div>
              <div style={{ fontWeight: 900, textAlign: "center" }}>{r.mapel}</div>
              <div style={{ fontWeight: 800 }}>{r.kelas}</div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    minWidth: 130,
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontWeight: 900,
                    textAlign: "center",
                    ...statusStyle(r.status),
                  }}
                >
                  {r.status}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  type="button"
                  aria-label="Edit"
                  onClick={() => handleOpenEdit(r)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <SquarePen size={28} color="#0F172A" />
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      <FormModal
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        title="Edit Kehadiran"
        onSubmit={handleSubmitEdit}
        submitLabel="Simpan"
        isSubmitting={isSubmitting}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
            Pilih Kehadiran
          </div>
          <Select
            value={editStatus}
            onChange={(val) => setEditStatus(val as StatusKehadiran)}
            options={statusOptions}
            placeholder="Hadir/Sakit/Izin/Tdk Hadir"
          />
        </div>
      </FormModal>
    </StaffLayout>
  );
}
