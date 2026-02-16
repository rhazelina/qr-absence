// src/Pages/WakaStaff/DetailSiswaStaff.tsx
import { useEffect, useMemo, useState } from "react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { FilterItem } from "../../component/Shared/FilterBar";
import { StatusBadge } from "../../component/Shared/StatusBadge";
import { Button } from "../../component/Shared/Button";
import { FormModal } from "../../component/Shared/FormModal";
import { Select } from "../../component/Shared/Select";
import { Table } from "../../component/Shared/Table";

type DetailStatusType =
  | "hadir"
  | "terlambat"
  | "tidak-hadir"
  | "sakit"
  | "izin"
  | "alpha";

interface KehadiranRow {
  id: string;
  nisn: string;
  namaSiswa: string;
  mataPelajaran: string;
  status: DetailStatusType;
}

interface DetailSiswaStaffProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  kelasId?: string;
  onBack?: () => void;
}

const MATA_PELAJARAN_LIST = [
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Fisika",
  "Kimia",
];

export default function DetailSiswaStaff({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  kelasId: _kelasId,
  onBack,
}: DetailSiswaStaffProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedTanggal] = useState(
    new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  );

  const [selectedMapel, setSelectedMapel] = useState("");

  // Info dummy kelas
  const kelasInfo = {
    namaKelas: "X Mekatronika 1",
  };

  // Dummy data kehadiran siswa
  const [rows, setRows] = useState<KehadiranRow[]>([
    { id: "1", nisn: "1348576392", namaSiswa: "Wito Suherman Suhermin", mataPelajaran: "Matematika", status: "hadir" },
    { id: "2", nisn: "1348576393", namaSiswa: "Ahmad Fauzi", mataPelajaran: "Matematika", status: "hadir" },
    { id: "3", nisn: "1348576394", namaSiswa: "Siti Nurhaliza", mataPelajaran: "Bahasa Indonesia", status: "izin" },
    { id: "4", nisn: "1348576395", namaSiswa: "Budi Santoso", mataPelajaran: "Bahasa Inggris", status: "sakit" },
    { id: "5", nisn: "1348576396", namaSiswa: "Dewi Sartika", mataPelajaran: "Matematika", status: "alpha" },
    { id: "6", nisn: "1348576397", namaSiswa: "Rizki Ramadhan", mataPelajaran: "Fisika", status: "alpha" },
    { id: "7", nisn: "1348576398", namaSiswa: "Wito Suherman Suhermin", mataPelajaran: "Matematika", status: "tidak-hadir" },
  ]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter rows by selected Mata Pelajaran
  const filteredRows = useMemo(() => {
    return rows.filter(r => !selectedMapel || r.mataPelajaran === selectedMapel);
  }, [rows, selectedMapel]);

  // Summary berdasarkan filteredRows
  const totalHadir = filteredRows.filter(r => r.status === "hadir").length;
  const totalIzin = filteredRows.filter(r => r.status === "izin").length;
  const totalSakit = filteredRows.filter(r => r.status === "sakit").length;
  const totalAlpha = filteredRows.filter(r => r.status === "alpha" || r.status === "tidak-hadir").length;

  // Kolom tabel
  const columns = useMemo(() => [
    { key: "nisn", label: "NISN" },
    { key: "namaSiswa", label: "Nama Siswa" },
    { key: "mataPelajaran", label: "Mata Pelajaran" },
    {
      key: "status",
      label: "Status",
      render: (value: DetailStatusType) => (
        <StatusBadge status={value === "alpha" ? "tidak-hadir" : value} />
      ),
    },
  ], []);

  // Modal edit
  const [editingRow, setEditingRow] = useState<KehadiranRow | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<DetailStatusType>("hadir");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { label: "Hadir", value: "hadir" },
    { label: "Sakit", value: "sakit" },
    { label: "Izin", value: "izin" },
    { label: "Tidak Hadir", value: "tidak-hadir" },
    { label: "Alpha", value: "alpha" },
  ];

  const handleOpenEdit = (row: KehadiranRow) => {
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
      setRows(prev => prev.map(r => r.id === editingRow.id ? { ...r, status: editStatus } : r));
      setIsSubmitting(false);
      setIsEditOpen(false);
      setEditingRow(null);
      alert("Status kehadiran berhasil diperbarui!");
    }, 300);
  };

  const [isRekapOpen, setIsRekapOpen] = useState(false);

  const handleViewRekap = () => setIsRekapOpen(true);
  const handleCloseRekap = () => setIsRekapOpen(false);

  const handleExportRekap = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "REKAP KEHADIRAN SISWA\n";
    csvContent += `Tanggal: ${selectedTanggal}\n\n`;
    csvContent += "RINGKASAN,\n";
    csvContent += `Hadir,${totalHadir}\n`;
    csvContent += `Sakit,${totalSakit}\n`;
    csvContent += `Izin,${totalIzin}\n`;
    csvContent += `Alpha/Tidak Hadir,${totalAlpha}\n`;
    csvContent += `Total Siswa,${filteredRows.length}\n\n`;
    csvContent += "DETAIL KEHADIRAN\n";
    csvContent += "NISN,Nama Siswa,Mata Pelajaran,Status\n";

    filteredRows.forEach((row) => {
      csvContent += `${row.nisn},"${row.namaSiswa}",${row.mataPelajaran},${row.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Kehadiran_${selectedTanggal}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Rekap kehadiran berhasil diunduh");
  };

  return (
    <StaffLayout pageTitle={`Detail Kehadiran - ${kelasInfo.namaKelas}`} currentPage={currentPage} onMenuClick={onMenuClick} user={user} onLogout={onLogout}>
      <div style={{ position: "relative", minHeight: "100%", backgroundColor: "#FFFFFF", borderRadius: 12, overflow: "hidden", padding: isMobile ? 16 : 32, border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
        
        {/* Bar atas: tanggal + tombol */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <button
              type="button"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#E5E7EB", color: "#0F172A", border: "none", borderRadius: 8, padding: "12px 16px", fontWeight: 600, cursor: "pointer", fontSize: "14px", height: 48 }}
            >
              <img src="/icon/calender.png" alt="Calendar" style={{ width: 20, height: 20 }} />
              <span>{selectedTanggal}</span>
            </button>
            <FilterItem icon="" label={kelasInfo.namaKelas} value={selectedMapel || "Semua Mapel"} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Button label="Lihat Rekap" onClick={handleViewRekap} />
            {onBack && <Button label="Kembali" variant="secondary" onClick={onBack} />}
          </div>
        </div>

        {/* Filter Mata Pelajaran */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Filter Mata Pelajaran:</p>
          <select value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #D1D5DB" }}>
            <option value="">Semua Mapel</option>
            {MATA_PELAJARAN_LIST.map(mp => <option key={mp} value={mp}>{mp}</option>)}
          </select>
        </div>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
          <SummaryCard label="Hadir" value={totalHadir.toString()} color="#10B981" />
          <SummaryCard label="Izin" value={totalIzin.toString()} color="#F59E0B" />
          <SummaryCard label="Sakit" value={totalSakit.toString()} color="#3B82F6" />
          <SummaryCard label="Alpha" value={totalAlpha.toString()} color="#EF4444" />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredRows}
          onEdit={handleOpenEdit}
          keyField="id"
          emptyMessage="Belum ada data kehadiran siswa."
        />
      </div>

      {/* Modal Edit */}
      <FormModal isOpen={isEditOpen} onClose={handleCloseEdit} title="Edit Kehadiran" onSubmit={handleSubmitEdit} submitLabel="Simpan" isSubmitting={isSubmitting}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: 0, marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Pilih Kehadiran</p>
          <Select
            value={editStatus}
            onChange={(val) => setEditStatus(val as DetailStatusType)}
            options={statusOptions}
            placeholder="Pilih status kehadiran"
          />
        </div>
      </FormModal>

      <FormModal
        isOpen={isRekapOpen}
        onClose={handleCloseRekap}
        title="Rekap Kehadiran"
        showSubmitButton={false}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>
              Tanggal: {selectedTanggal}
            </div>
            <button
              type="button"
              onClick={handleExportRekap}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#1e40af",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Unduh Rekap
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
              gap: 12,
            }}
          >
            <SummaryCard label="Hadir" value={totalHadir.toString()} color="#10B981" />
            <SummaryCard label="Izin" value={totalIzin.toString()} color="#F59E0B" />
            <SummaryCard label="Sakit" value={totalSakit.toString()} color="#3B82F6" />
            <SummaryCard label="Alpha" value={totalAlpha.toString()} color="#EF4444" />
          </div>

          <div style={{ fontSize: 13, color: "#6B7280" }}>
            Total data: <strong>{filteredRows.length}</strong>
          </div>
        </div>
      </FormModal>
    </StaffLayout>
  );
}

/** Kartu ringkasan */
function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

