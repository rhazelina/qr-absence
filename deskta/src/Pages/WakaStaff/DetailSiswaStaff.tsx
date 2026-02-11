// src/Pages/WakaStaff/DetailSiswaStaff.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import { FileText, FileSpreadsheet, GraduationCap } from "lucide-react";
import { getStatusConfig } from "../../utils/statusMapping";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { Button } from "../../component/Shared/Button";
import { Table } from "../../component/Shared/Table";
import { Modal } from "../../component/Shared/Modal";
import { usePopup } from "../../component/Shared/Popup/PopupProvider";

type DetailStatusType =
  | "hadir"
  | "terlambat"
  | "tidak-hadir"
  | "sakit"
  | "izin"
  | "alpha"
  | "pulang";

interface KehadiranRow {
  id: string;
  nisn: string;
  namaSiswa: string;
  mataPelajaran: string;
  namaGuru: string;
  status: DetailStatusType;
  keterangan?: string;
  waktuMasuk?: string;
  waktuKeluar?: string;
  lokasi?: string;
  jamPelajaran?: string;
  tanggal?: string;
}

interface DetailSiswaStaffProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  kelasId?: string;
  onBack?: () => void;
}

// Declare jsPDF types for CDN usage
declare global {
  interface Window {
    jspdf: {
      jsPDF: any;
    };
  }
}

// Icon mata untuk lihat detail
function EyeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path
        d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Icon X untuk tombol close
function XIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path
        d="M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DetailSiswaStaff({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  kelasId: _kelasId,
  onBack,
}: DetailSiswaStaffProps) {
  const { alert: popupAlert } = usePopup();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);

  // Tanggal otomatis update setiap hari
  const [selectedTanggal, setSelectedTanggal] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [selectedMapel, setSelectedMapel] = useState("");
  const [selectedGuru, setSelectedGuru] = useState("");
  const [jsPDFLoaded, setJsPDFLoaded] = useState(false);

  // State untuk dropdown ekspor
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Info dummy kelas
  const [kelasInfo, setKelasInfo] = useState({
    namaKelas: "Memuat...",
  });

  // ✅ Data dari backend
  const [rows, setRows] = useState<KehadiranRow[]>([]);

  // State untuk modal detail
  const [selectedRow, setSelectedRow] = useState<KehadiranRow | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!_kelasId) return;
      setLoading(true);
      try {
        const { attendanceService } = await import("../../services/attendance");
        const { classService } = await import("../../services/class");

        // 1. Get Class Info
        const classData = await classService.getClassById(_kelasId);
        setKelasInfo({
          namaKelas: classData.name || `${classData.grade} ${classData.label}`,
        });

        // 2. Get Attendance History for the date
        const response: any = await attendanceService.getClassAttendanceByDate(
          Number(_kelasId),
          selectedTanggal
        );

        const mappedRows: KehadiranRow[] = response.map((item: any) => ({
          id: item.id.toString(),
          nisn: item.student?.nis || "-",
          namaSiswa: item.student?.user?.name || "Siswa",
          mataPelajaran: item.schedule?.subject?.name || item.schedule?.subject_name || "-",
          namaGuru: item.schedule?.teacher?.user?.name || "-",
          status: (item.status === 'present' ? 'hadir' :
            item.status === 'late' ? 'hadir' :
              item.status === 'excused' ? 'izin' :
                item.status === 'sick' ? 'sakit' :
                  item.status === 'absent' ? 'alpha' :
                    item.status === 'alpha' ? 'alpha' :
                      item.status === 'dinas' ? 'izin' :
                        item.status === 'pulang' ? 'pulang' : 'alpha') as DetailStatusType,
          keterangan: item.reason || "-",
          waktuMasuk: item.checked_in_at ? item.checked_in_at.slice(0, 5) : "-",
          jamPelajaran: item.schedule?.start_time ? `${item.schedule.start_time.slice(0, 5)} - ${item.schedule.end_time.slice(0, 5)}` : "-",
          tanggal: item.date,
        }));

        setRows(mappedRows);
      } catch (error) {
        console.error("Failed to fetch student details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [_kelasId, selectedTanggal]);

  // Load jsPDF from CDN
  useEffect(() => {
    const loadJsPDF = () => {
      if (window.jspdf) {
        setJsPDFLoaded(true);
        return;
      }

      // Load jsPDF
      const script1 = document.createElement('script');
      script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script1.async = true;
      script1.onload = () => {
        // Load jsPDF-AutoTable
        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
        script2.async = true;
        script2.onload = () => {
          setJsPDFLoaded(true);
        };
        document.body.appendChild(script2);
      };
      document.body.appendChild(script1);
    };

    loadJsPDF();
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ AMBIL DAFTAR MAPEL & GURU DARI DATA
  const MATA_PELAJARAN_LIST = useMemo(() => {
    const mapelSet = new Set<string>();
    rows.forEach(row => {
      if (row.mataPelajaran) mapelSet.add(row.mataPelajaran);
    });
    return Array.from(mapelSet).sort();
  }, [rows]);

  const availableGurus = useMemo(() => {
    const guruSet = new Set<string>();
    rows.forEach(row => {
      if (!selectedMapel || row.mataPelajaran === selectedMapel) {
        if (row.namaGuru && row.namaGuru !== "-") guruSet.add(row.namaGuru);
      }
    });
    return Array.from(guruSet).sort();
  }, [selectedMapel, rows]);

  // Reset guru ketika ganti mapel
  useEffect(() => {
    setSelectedGuru("");
  }, [selectedMapel]);

  // Filter rows
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const mapelMatch = !selectedMapel || r.mataPelajaran === selectedMapel;
      const guruMatch = !selectedGuru || r.namaGuru === selectedGuru;
      return mapelMatch && guruMatch;
    });
  }, [rows, selectedMapel, selectedGuru]);

  // Summary
  const totalHadir = filteredRows.filter(r => r.status === "hadir").length;
  const totalIzin = filteredRows.filter(r => r.status === "izin").length;
  const totalSakit = filteredRows.filter(r => r.status === "sakit").length;
  const totalAlpha = filteredRows.filter(r => r.status === "alpha" || r.status === "tidak-hadir").length;
  const totalPulang = filteredRows.filter(r => r.status === "pulang").length;

  // Fungsi untuk mendapatkan style badge BOLD dengan klik
  const getStatusStyle = (status: string) => {
    const config = getStatusConfig(status);
    
    return {
      backgroundColor: config.color, // Default hadir
      color: "#FFFFFF",
      padding: "6px 16px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      border: "none",
      minWidth: "90px",
      textAlign: "center" as const,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: `0 2px 4px ${config.color}4D`,
      minHeight: "36px",
    };
  };

  // Fungsi untuk mendapatkan label status
  const getStatusLabel = (status: string) => {
    return getStatusConfig(status).label;
  };

  // Fungsi untuk mendapatkan teks penjelasan status
  const getStatusText = (status: string, waktuMasuk?: string) => {
    switch (status) {
      case "alpha":
      case "tidak-hadir":
        return "Siswa tidak hadir tanpa keterangan";
      case "izin":
        return "Siswa izin dengan keterangan";
      case "sakit":
        return "Siswa sakit dengan surat dokter";
      case "hadir":
        return waktuMasuk
          ? `Siswa hadir tepat waktu pada ${waktuMasuk}`
          : "Siswa hadir tepat waktu";
      case "pulang":
        return "Siswa pulang lebih awal karena ada kepentingan";
      default:
        return status;
    }
  };

  // Fungsi untuk mendapatkan warna status
  const getStatusColor = (status: string) => {
    return getStatusConfig(status).color;
  };

  // Fungsi untuk membuka modal detail
  const handleStatusClick = (row: KehadiranRow, e?: React.MouseEvent) => {
    e?.stopPropagation();
    console.log("Status diklik:", row);
    setSelectedRow(row);
    setIsDetailModalOpen(true);
  };

  // Komponen Status Button yang bisa diklik
  const StatusButton = ({ status, row }: { status: string; row: KehadiranRow }) => {
    const style = getStatusStyle(status === "alpha" ? "tidak-hadir" : status);

    return (
      <div
        onClick={(e) => handleStatusClick(row, e)}
        style={style}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.9";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
        }}
      >
        <EyeIcon size={14} />
        <span>{getStatusLabel(status)}</span>
      </div>
    );
  };

  // Kolom tabel - DENGAN KOLOM NAMA GURU
  const columns = useMemo(() => [
    { key: "nisn", label: "NISN" },
    { key: "namaSiswa", label: "Nama Siswa" },
    { key: "mataPelajaran", label: "Mata Pelajaran" },
    {
      key: "namaGuru",
      label: "Nama Guru",
      render: (value: string) => (
        <div style={{ fontWeight: 500 }}>{value || "-"}</div>
      ),
    },
    {
      key: "status",
      label: (
        <div style={{ textAlign: "center" }}>
          Status
        </div>
      ),
      render: (value: DetailStatusType, row: KehadiranRow) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <StatusButton status={value} row={row} />
        </div>
      ),
    },
  ], []);



  const handleExportPDF = async () => {
    if (!jsPDFLoaded || !window.jspdf) {
      await popupAlert("PDF library belum dimuat. Silakan coba lagi.");
      return;
    }

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Title
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text("REKAP KEHADIRAN SISWA", 14, 15);

      // Info
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Kelas: ${kelasInfo.namaKelas}`, 14, 25);
      doc.text(`Tanggal: ${selectedTanggal}`, 14, 32);

      if (selectedMapel) {
        const mapelText = selectedGuru
          ? `Mata Pelajaran: ${selectedMapel} (${selectedGuru})`
          : `Mata Pelajaran: ${selectedMapel}`;
        doc.text(mapelText, 14, 39);
      }

      // Summary
      const summaryY = selectedMapel ? 48 : 41;
      doc.setFont(undefined, 'bold');
      doc.text("RINGKASAN:", 14, summaryY);
      doc.setFont(undefined, 'normal');
      doc.text(`Hadir: ${totalHadir}`, 14, summaryY + 7);
      doc.text(`Sakit: ${totalSakit}`, 14, summaryY + 14);
      doc.text(`Izin: ${totalIzin}`, 14, summaryY + 21);
      doc.text(`Alpha/Tidak Hadir: ${totalAlpha}`, 14, summaryY + 28);
      doc.text(`Pulang: ${totalPulang}`, 14, summaryY + 35);
      doc.text(`Total Siswa: ${filteredRows.length}`, 14, summaryY + 42);

      // Table - DENGAN KOLOM NAMA GURU
      const tableData = filteredRows.map((row, idx) => {
        return [
          idx + 1,
          row.nisn,
          row.namaSiswa,
          row.mataPelajaran,
          row.namaGuru || "-",
          getStatusLabel(row.status)
        ];
      });

      (doc as any).autoTable({
        head: [['No', 'NISN', 'Nama Siswa', 'Mata Pelajaran', 'Nama Guru', 'Status']],
        body: tableData,
        startY: summaryY + 52,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 58, 95] },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 30 },
          2: { cellWidth: 50 },
          3: { cellWidth: 40 },
          4: { cellWidth: 35 },
          5: { cellWidth: 25 },
        },
      });

      // Save PDF
      const filename = `Rekap_Kehadiran_${kelasInfo.namaKelas}_${selectedTanggal.replace(/\//g, '-')}.pdf`;
      doc.save(filename);

      await popupAlert("PDF berhasil diunduh!");
      setShowExportDropdown(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      await popupAlert("Gagal membuat PDF: " + error);
    }
  };

  const handleExportCSV = async () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "REKAP KEHADIRAN SISWA\n";
    csvContent += `Kelas: ${kelasInfo.namaKelas}\n`;
    csvContent += `Tanggal: ${selectedTanggal}\n`;

    if (selectedMapel) {
      const mapelText = selectedGuru
        ? `Mata Pelajaran: ${selectedMapel} (${selectedGuru})`
        : `Mata Pelajaran: ${selectedMapel}`;
      csvContent += `${mapelText}\n`;
    }

    csvContent += "\nRINGKASAN,\n";
    csvContent += `Hadir,${totalHadir}\n`;
    csvContent += `Sakit,${totalSakit}\n`;
    csvContent += `Izin,${totalIzin}\n`;
    csvContent += `Alpha/Tidak Hadir,${totalAlpha}\n`;
    csvContent += `Pulang,${totalPulang}\n`;
    csvContent += `Total Siswa,${filteredRows.length}\n\n`;
    csvContent += "DETAIL KEHADIRAN\n";
    csvContent += "No,NISN,Nama Siswa,Mata Pelajaran,Nama Guru,Status\n";

    filteredRows.forEach((row, idx) => {
      csvContent += `${idx + 1},${row.nisn},"${row.namaSiswa}",${row.mataPelajaran},"${row.namaGuru || '-'}",${getStatusLabel(row.status)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Kehadiran_${kelasInfo.namaKelas}_${selectedTanggal.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    await popupAlert("Rekap kehadiran berhasil diunduh");
    setShowExportDropdown(false);
  };

  // Toggle dropdown ekspor
  const toggleExportDropdown = () => {
    setShowExportDropdown(!showExportDropdown);
  };

  // Komponen DetailRow untuk modal
  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 16,
      paddingBottom: 12,
      borderBottom: "1px solid #E5E7EB",
    }}>
      <div style={{ fontWeight: 600, color: "#374151", fontSize: "14px" }}>{label} :</div>
      <div style={{ fontWeight: 500, color: "#1F2937", fontSize: "14px" }}>
        {value || "-"}
      </div>
    </div>
  );

  return (
    <StaffLayout pageTitle={`Detail Kehadiran - ${kelasInfo.namaKelas}`} currentPage={currentPage} onMenuClick={onMenuClick} user={user} onLogout={onLogout}>
      <div style={{ position: "relative", minHeight: "100%", backgroundColor: "#FFFFFF", borderRadius: 12, overflow: "hidden", padding: isMobile ? 16 : 32, border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>

        {/* Bar atas: tanggal + card kelas + tombol */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>

            {/* DATE PICKER */}
            <input
              type="date"
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #D1D5DB",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            />

            {/* CARD KELAS */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: "linear-gradient(135deg, #1E3A5F 0%, #0B2948 100%)",
                borderRadius: 12,
                padding: "10px 16px",
                maxWidth: "fit-content",
                boxShadow: "0 4px 12px rgba(11, 41, 72, 0.3)",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: 8,
                }}
              >
                <GraduationCap size={20} color="#FFFFFF" strokeWidth={2.5} />
              </div>

              {/* Text */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    letterSpacing: "0.3px",
                  }}
                >
                  {kelasInfo.namaKelas}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "rgba(255, 255, 255, 0.85)",
                  }}
                >
                  {selectedMapel || "Semua Mapel"}
                  {selectedGuru && ` - ${selectedGuru}`}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, position: "relative" }}>
            {/* Dropdown Ekspor */}
            <div ref={exportDropdownRef} style={{ position: "relative" }}>
              <Button
                label="Ekspor"
                icon={<FileText size={16} />}
                onClick={toggleExportDropdown}
                style={{
                  backgroundColor: "#3B82F6",
                  borderColor: "#3B82F6",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              />
              {showExportDropdown && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "4px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  border: "1px solid #E5E7EB",
                  zIndex: 1000,
                  minWidth: "160px",
                  overflow: "hidden",
                }}>
                  <button
                    onClick={handleExportPDF}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom: "1px solid #E5E7EB",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      color: "#374151",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <FileText size={16} color="#EF4444" />
                    <span>Unduh PDF</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      color: "#374151",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <FileSpreadsheet size={16} color="#10B981" />
                    <span>Unduh CSV/Excel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tombol Lihat Rekap - BIRU */}
            <Button
              label="Lihat Rekap"
              icon={<FileText size={16} />}
              onClick={() => onMenuClick("rekap-kehadiran-siswa")}
              style={{
                backgroundColor: "#3B82F6",
                borderColor: "#3B82F6"
              }}
            />

            {onBack && <Button label="Kembali" variant="secondary" onClick={onBack} />}
          </div>
        </div>

        {/* Filter Mata Pelajaran + Guru */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14, color: "#374151" }}>Filter Data:</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Filter Mata Pelajaran */}
            <div style={{ flex: isMobile ? "1 1 100%" : "0 1 250px" }}>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6, fontSize: 13, color: "#6B7280" }}>
                Mata Pelajaran
              </label>
              <select
                value={selectedMapel}
                onChange={e => setSelectedMapel(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #D1D5DB",
                  fontSize: 14,
                  backgroundColor: "#FFFFFF",
                  cursor: "pointer",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#2563EB"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#D1D5DB"}
              >
                <option value="">Semua Mata Pelajaran</option>
                {MATA_PELAJARAN_LIST.map(mp => <option key={mp} value={mp}>{mp}</option>)}
              </select>
            </div>

            {/* Filter Guru */}
            <div style={{ flex: isMobile ? "1 1 100%" : "0 1 250px" }}>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6, fontSize: 13, color: "#6B7280" }}>
                Nama Guru
              </label>
              <select
                value={selectedGuru}
                onChange={e => setSelectedGuru(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #D1D5DB",
                  fontSize: 14,
                  backgroundColor: availableGurus.length === 0 ? "#F3F4F6" : "#FFFFFF",
                  cursor: availableGurus.length === 0 ? "not-allowed" : "pointer",
                  outline: "none",
                  transition: "border-color 0.2s",
                  opacity: availableGurus.length === 0 ? 0.6 : 1
                }}
                disabled={availableGurus.length === 0}
                onFocus={(e) => e.currentTarget.style.borderColor = "#2563EB"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#D1D5DB"}
              >
                <option value="">Semua Guru</option>
                {availableGurus.map(guru => <option key={guru} value={guru}>{guru}</option>)}
              </select>
              {availableGurus.length === 0 && (
                <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4, fontStyle: "italic" }}>
                  {selectedMapel ? "Tidak ada guru untuk mata pelajaran ini" : "Pilih mata pelajaran terlebih dahulu"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(5,1fr)", gap: 12, marginBottom: 16 }}>
          {/* BOLD COLORS - BUKAN SOFT PASTEL */}
          <SummaryCard label="Hadir" value={totalHadir.toString()} color="#1FA83D" /> {/* BOLD HIJAU */}
          <SummaryCard label="Izin" value={totalIzin.toString()} color="#ACA40D" /> {/* BOLD KUNING KEEMASAN */}
          <SummaryCard label="Sakit" value={totalSakit.toString()} color="#520C8F" /> {/* BOLD UNGU */}
          <SummaryCard label="Tidak Hadir" value={totalAlpha.toString()} color="#D90000" /> {/* BOLD MERAH */}
          <SummaryCard label="Pulang" value={totalPulang.toString()} color="#2F85EB" /> {/* BOLD BIRU */}
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            padding: isMobile ? 12 : 16,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            position: "relative",
            minHeight: "200px"
          }}
        >
          {loading && (
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(255,255,255,0.7)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontWeight: 600,
              color: "#1E3A5F"
            }}>
              <div className="animate-spin" style={{ width: 24, height: 24, border: "3px solid #1E3A5F", borderTopColor: "transparent", borderRadius: "50%" }} />
              Memuat data...
            </div>
          )}
          <Table
            columns={columns}
            data={filteredRows}
            onView={handleStatusClick}
            keyField="id"
            emptyMessage={loading ? "Memuat data..." : "Belum ada data kehadiran untuk kriteria ini."}
          />
        </div>
      </div>

      {/* Modal Detail Kehadiran */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        {selectedRow && (
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Header Modal */}
            <div style={{
              backgroundColor: "#0B2948",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#FFFFFF",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <EyeIcon size={24} />
                <h3 style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700,
                }}>
                  Detail Kehadiran
                </h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                <XIcon size={24} />
              </button>
            </div>

            {/* Content Modal */}
            <div style={{
              padding: 24,
              overflowY: "auto",
              flex: 1,
            }}>
              {/* Judul */}
              <h3 style={{
                margin: "0 0 20px 0",
                fontSize: "16px",
                fontWeight: 700,
                color: "#0B2948",
                textAlign: "center",
              }}>
                Detail Kehadiran
              </h3>

              {/* Tanggal */}
              <DetailRow label="Tanggal" value={selectedRow.tanggal || "25-01-2025"} />

              {/* Jam Pelajaran */}
              <DetailRow label="Jam Pelajaran" value={selectedRow.jamPelajaran || "1-4"} />

              {/* Nama Siswa */}
              <DetailRow label="Nama Siswa" value={selectedRow.namaSiswa} />

              {/* NISN */}
              <DetailRow label="NISN" value={selectedRow.nisn} />

              {/* Mata Pelajaran */}
              <DetailRow label="Mata Pelajaran" value={selectedRow.mataPelajaran} />

              {/* Waktu Hadir (hanya untuk status hadir) */}
              {selectedRow.status === "hadir" && selectedRow.waktuMasuk && (
                <DetailRow label="Waktu Hadir" value={selectedRow.waktuMasuk} />
              )}

              {/* Status */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 24,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
              }}>
                <div style={{ fontWeight: 600, color: "#374151", fontSize: "14px" }}>Status :</div>
                <div>
                  <span style={{
                    backgroundColor: getStatusColor(selectedRow.status),
                    color: "#FFFFFF",
                    padding: "6px 16px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    border: "none",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}>
                    {getStatusLabel(selectedRow.status)}
                  </span>
                </div>
              </div>

              {/* Garis pemisah */}
              <div style={{
                height: "1px",
                backgroundColor: "#E5E7EB",
                margin: "16px 0",
              }} />

              {/* Info Box - Sesuai dengan gambar */}
              <div style={{
                padding: "16px",
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  lineHeight: 1.5,
                }}>
                  {getStatusText(selectedRow.status, selectedRow.waktuMasuk)}
                </div>
              </div>

              {/* Keterangan tambahan untuk izin, sakit, dan pulang */}
              {(selectedRow.status === "izin" || selectedRow.status === "sakit" || selectedRow.status === "pulang") && selectedRow.keterangan && (
                <>
                  <div style={{
                    height: "1px",
                    backgroundColor: "#E5E7EB",
                    margin: "16px 0",
                  }} />
                  <div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 12,
                    }}>
                      Keterangan :
                    </div>
                    <div style={{
                      padding: "12px 16px",
                      backgroundColor: "#F9FAFB",
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: 14,
                        color: "#6B7280",
                        lineHeight: 1.5,
                      }}>
                        {selectedRow.keterangan}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Area Bukti Foto untuk izin, sakit, dan pulang */}
              {(selectedRow.status === "izin" || selectedRow.status === "sakit" || selectedRow.status === "pulang") && (
                <div style={{ marginTop: 24 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 12,
                  }}>
                    Bukti Foto :
                  </div>
                  <div style={{
                    padding: "40px 16px",
                    backgroundColor: "#F9FAFB",
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    minHeight: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#9CA3AF",
                      textAlign: "center",
                    }}>
                      [Area untuk menampilkan bukti foto]
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </StaffLayout>
  );
}

/** Kartu ringkasan dengan warna BOLD */
function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      backgroundColor: color, // BACKGROUND BOLD COLOR
      borderRadius: 12,
      padding: 16,
      boxShadow: "0 4px 8px rgba(0,0,0,0.15)"
    }}>
      <div style={{
        fontSize: 13,
        color: "#FFFFFF", // TEXT PUTIH
        marginBottom: 6,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        opacity: 0.9
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 28,
        fontWeight: 800,
        color: "#FFFFFF", // TEXT PUTIH
        textShadow: "0 2px 4px rgba(0,0,0,0.2)"
      }}>
        {value}
      </div>
    </div>
  );
}

