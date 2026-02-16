import { useState, useMemo, useEffect } from "react";
import { Eye, FileDown, Calendar, ArrowLeft, Search } from "lucide-react";
import WalikelasLayout from "../../component/Walikelas/layoutwakel";
import { usePopup } from "../../component/Shared/Popup/PopupProvider";
import { dashboardService } from "../../services/dashboard";
import { attendanceService } from "../../services/attendance";

interface RekapKehadiranSiswaProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string, payload?: any) => void;
}

interface RekapRow {
  id: string;
  no: number;
  nisn: string;
  namaSiswa: string;
  hadir: number;
  izin: number;
  sakit: number;
  tidakHadir: number;
  pulang: number;
  status: 'aktif' | 'non-aktif';
}

export function RekapKehadiranSiswa({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: RekapKehadiranSiswaProps) {
  const { alert: popupAlert } = usePopup();
  const [searchTerm, setSearchTerm] = useState('');

  // Default dates: First and last day of current month
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

  const [periodeMulai, setPeriodeMulai] = useState(firstDay);
  const [periodeSelesai, setPeriodeSelesai] = useState(lastDay);
  const [isLoading, setIsLoading] = useState(false);

  // Data kelas
  const [kelasInfo, setKelasInfo] = useState({
    id: 0,
    namaKelas: 'Memuat...',
    waliKelas: user.name,
  });

  // Warna sesuai revisi
  const COLORS = {
    HADIR: "#1FA83D",
    IZIN: "#ACA40D",
    PULANG: "#2F85EB",
    TIDAK_HADIR: "#D90000",
    SAKIT: "#520C8F"
  };

  // Data rows
  const [rows, setRows] = useState<RekapRow[]>([]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Get Homeroom Class Info
        const classData = await dashboardService.getMyHomeroom();
        setKelasInfo({
          id: classData.id,
          namaKelas: classData.name,
          waliKelas: classData.homeroom_teacher?.user?.name || user.name,
        });

        // 2. Get Students Summary
        if (classData.id) {
          const response = await attendanceService.getClassStudentsSummary(classData.id, {
            from: periodeMulai,
            to: periodeSelesai
          });

          // Assume response.data is the array of students with summary
          // Adjust based on actual API response structure. 
          // If response.data.data exists, use that.
          const studentsData = (response.data as any).data || response.data;

          if (Array.isArray(studentsData)) {
            const mappedRows: RekapRow[] = studentsData.map((item: any, index: number) => ({
              id: item.id.toString(),
              no: index + 1,
              nisn: item.nisn || '-',
              namaSiswa: item.name,
              hadir: item.attendance_summary?.present || 0,
              izin: (item.attendance_summary?.izin || 0) + (item.attendance_summary?.excused || 0),
              sakit: item.attendance_summary?.sick || 0,
              tidakHadir: (item.attendance_summary?.absent || 0) + (item.attendance_summary?.alpha || 0),
              pulang: (item.attendance_summary?.pulang || 0) + (item.attendance_summary?.dinas || 0), // Adjust mapping if needed
              status: 'aktif' // Default active
            }));
            setRows(mappedRows);
          }
        }

      } catch (error) {
        console.error("Error fetching rekap data:", error);
        // await popupAlert("Gagal memuat data rekap kehadiran."); // Optional: suppress error popup on load
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [periodeMulai, periodeSelesai, user.name]);

  useEffect(() => {
    // Inject CSS untuk ubah icon kalender jadi putih
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-date-input::-webkit-calendar-picker-indicator {
        filter: invert(1) brightness(100) !important;
        opacity: 1 !important;
        cursor: pointer !important;
      }
      .custom-date-input::-webkit-inner-spin-button,
      .custom-date-input::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .custom-date-input {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Filter rows berdasarkan pencarian
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;

    const term = searchTerm.toLowerCase();
    return rows.filter(row =>
      row.nisn.toLowerCase().includes(term) ||
      row.namaSiswa.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  // Hitung total
  const totalHadir = useMemo(() => filteredRows.reduce((sum, row) => sum + row.hadir, 0), [filteredRows]);
  const totalIzin = useMemo(() => filteredRows.reduce((sum, row) => sum + row.izin, 0), [filteredRows]);
  const totalSakit = useMemo(() => filteredRows.reduce((sum, row) => sum + row.sakit, 0), [filteredRows]);
  const totalTidakHadir = useMemo(() => filteredRows.reduce((sum, row) => sum + row.tidakHadir, 0), [filteredRows]);
  const totalPulang = useMemo(() => filteredRows.reduce((sum, row) => sum + row.pulang, 0), [filteredRows]);

  // Handler untuk klik tombol aksi (mata) - navigasi ke DaftarKetidakhadiranWaliKelas
  const handleViewDetail = (row: RekapRow) => {
    onMenuClick("daftar-ketidakhadiran-walikelas", {
      siswaName: row.namaSiswa,
      siswaIdentitas: row.nisn,
      studentId: row.id, // Pass studentId for detail page fetching
    });
  };

  const handleBack = () => {
    onMenuClick('kehadiran-siswa');
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Fungsi untuk mengekspor Excel (CSV)
  const handleExportExcel = async () => {
    try {
      // Buat data untuk Excel
      const headers = ["No", "NISN", "Nama Siswa", "Hadir", "Izin", "Sakit", "Tidak Hadir", "Pulang", "Status"];
      const rowsData = filteredRows.map((row) => [
        row.no,
        row.nisn,
        row.namaSiswa,
        row.hadir,
        row.izin,
        row.sakit,
        row.tidakHadir,
        row.pulang,
        row.status === 'aktif' ? 'Aktif' : 'Non-Aktif'
      ]);

      // Tambahkan baris total
      rowsData.push([
        'TOTAL',
        '',
        'Total Keseluruhan',
        totalHadir,
        totalIzin,
        totalSakit,
        totalTidakHadir,
        totalPulang,
        ''
      ]);

      // Gabungkan headers dan rows
      const csvContent = [
        headers.join(","),
        ...rowsData.map((row) => row.join(",")),
      ].join("\n");

      // Tambahkan BOM untuk support Unicode di Excel
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

      // Buat download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Rekap_Kehadiran_${kelasInfo.namaKelas.replace(/\s+/g, '_')}_${periodeMulai}_${periodeSelesai}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await popupAlert("✅ File Excel berhasil diunduh!");
    } catch (error) {
      console.error('Error exporting CSV:', error);
      await popupAlert("❌ Terjadi kesalahan saat mengekspor Excel");
    }
  };

  // Fungsi untuk mengekspor PDF
  const handleExportPDF = async () => {
    try {
      // Import jsPDF secara dinamis
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      // Buat dokumen PDF dengan orientasi landscape
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header - Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('REKAP KEHADIRAN SISWA', pageWidth / 2, 15, { align: 'center' });

      // Info Kelas
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Kelas: ${kelasInfo.namaKelas}`, 14, 25);
      doc.text(`Wali Kelas: ${kelasInfo.waliKelas}`, 14, 31);

      // Periode (kanan atas)
      doc.text(`Periode: ${formatDisplayDate(periodeMulai)} - ${formatDisplayDate(periodeSelesai)}`, pageWidth - 14, 25, { align: 'right' });

      // Garis pemisah
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(14, 35, pageWidth - 14, 35);

      // Tabel Data Siswa
      const tableData = filteredRows.map(row => [
        row.no.toString(),
        row.nisn,
        row.namaSiswa,
        row.hadir.toString(),
        row.izin.toString(),
        row.sakit.toString(),
        row.tidakHadir.toString(),
        row.pulang.toString(),
        row.status === 'aktif' ? 'Aktif' : 'Non-Aktif'
      ]);

      // Add summary row
      tableData.push([
        'TOTAL',
        '',
        'Total Keseluruhan',
        totalHadir.toString(),
        totalIzin.toString(),
        totalSakit.toString(),
        totalTidakHadir.toString(),
        totalPulang.toString(),
        ''
      ]);

      (doc as any).autoTable({
        startY: 40,
        head: [['No', 'NISN', 'Nama Siswa', 'Hadir', 'Izin', 'Sakit', 'Tidak Hadir', 'Pulang', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 25, halign: 'left' },
          2: { cellWidth: 60, halign: 'left' },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 18, halign: 'center' },
          5: { cellWidth: 18, halign: 'center' },
          6: { cellWidth: 25, halign: 'center' },
          7: { cellWidth: 18, halign: 'center' },
          8: { cellWidth: 22, halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { left: 14, right: 14 },
        footStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        didParseCell: function (data: any) {
          // Highlight total row
          if (data.row.index === filteredRows.length) {
            data.cell.styles.fillColor = [59, 130, 246];
            data.cell.styles.textColor = 255;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });

      // Footer - Timestamp
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      const timestamp = new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      doc.text(`Dicetak pada: ${timestamp}`, 14, pageHeight - 10);

      // Nomor halaman
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          pageWidth - 14,
          pageHeight - 10,
          { align: 'right' }
        );
      }

      // Download PDF - langsung download otomatis
      const filename = `Rekap_Kehadiran_${kelasInfo.namaKelas.replace(/\s+/g, '_')}_${periodeMulai}_${periodeSelesai}.pdf`;

      // Simpan dan download langsung
      doc.save(filename);

      await popupAlert("✅ File PDF berhasil diunduh!");
    } catch (error) {
      console.error('Error exporting PDF:', error);
      await popupAlert("❌ Terjadi kesalahan saat mengekspor PDF. Pastikan library jsPDF sudah terinstall.");
    }
  };

  return (
    <WalikelasLayout
      pageTitle="Rekap Kehadiran"
      currentPage={currentPage as any}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      {/* Button Kembali */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={handleBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #D1D5DB",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            color: "#374151",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F3F4F6";
            e.currentTarget.style.borderColor = "#9CA3AF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FFFFFF";
            e.currentTarget.style.borderColor = "#D1D5DB";
          }}
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
      </div>

      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 32,
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {/* Kelas Info - KIRI */}
          <div
            style={{
              backgroundColor: "#062A4A",
              borderRadius: 12,
              padding: "14px 20px",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="white"
                stroke="white"
                strokeWidth="0.5"
              >
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {kelasInfo.namaKelas}
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                {kelasInfo.waliKelas}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{
            position: 'relative',
            width: '300px',
          }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF',
            }} />
            <input
              type="text"
              placeholder="Cari NISN atau nama siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#FFFFFF',
                color: '#111827',
              }}
            />
          </div>
        </div>

        {/* Periode dan Export */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {/* Periode Box - Navy Style */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              backgroundColor: "#062A4A",
              padding: "10px 16px",
              borderRadius: 10,
              color: "#FFFFFF",
            }}
          >
            {/* Icon Kalender */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 6,
              }}
            >
              <Calendar size={18} />
            </div>

            {/* Label Periode */}
            <span style={{ fontSize: 14, fontWeight: 600 }}>Periode:</span>

            {/* Start Date */}
            <input
              type="date"
              value={periodeMulai}
              onChange={(e) => setPeriodeMulai(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.3)",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                colorScheme: "dark",
              }}
              className="custom-date-input"
            />

            {/* Separator */}
            <span style={{ fontWeight: 600, fontSize: 16 }}>—</span>

            {/* End Date */}
            <input
              type="date"
              value={periodeSelesai}
              onChange={(e) => setPeriodeSelesai(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.3)",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                colorScheme: "dark",
              }}
              className="custom-date-input"
            />
          </div>

          {/* Export Buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <button
              onClick={handleExportExcel}
              disabled={isLoading || rows.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                backgroundColor: (isLoading || rows.length === 0) ? "#9CA3AF" : "#10B981",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: (isLoading || rows.length === 0) ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isLoading && rows.length > 0) e.currentTarget.style.backgroundColor = "#059669";
              }}
              onMouseLeave={(e) => {
                if (!isLoading && rows.length > 0) e.currentTarget.style.backgroundColor = "#10B981";
              }}
            >
              <FileDown size={16} />
              Unduh Excel
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isLoading || rows.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                backgroundColor: (isLoading || rows.length === 0) ? "#9CA3AF" : "#EF4444",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: (isLoading || rows.length === 0) ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isLoading && rows.length > 0) e.currentTarget.style.backgroundColor = "#DC2626";
              }}
              onMouseLeave={(e) => {
                if (!isLoading && rows.length > 0) e.currentTarget.style.backgroundColor = "#EF4444";
              }}
            >
              <FileDown size={16} />
              Unduh PDF
            </button>
          </div>
        </div>

        {/* Statistik Total */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '16px',
          }}>
            Total Keseluruhan
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '16px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontWeight: '600' }}>Hadir</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.HADIR }}>{totalHadir}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontWeight: '600' }}>Izin</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.IZIN }}>{totalIzin}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontWeight: '600' }}>Sakit</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.SAKIT }}>{totalSakit}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontWeight: '600' }}>Tidak Hadir</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.TIDAK_HADIR }}>{totalTidakHadir}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontWeight: '600' }}>Pulang</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.PULANG }}>{totalPulang}</div>
            </div>
          </div>
        </div>

        {/* Tabel Rekap Kehadiran */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}>
          {/* Header Tabel */}
          <div style={{
            backgroundColor: '#F9FAFB',
            padding: '14px 20px',
            borderBottom: '2px solid #E5E7EB',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '50px 130px minmax(180px, 1fr) 80px 80px 80px 100px 80px 80px',
              gap: '12px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#374151',
              letterSpacing: '0.3px',
            }}>
              <div>No</div>
              <div>NISN</div>
              <div>Nama Siswa</div>
              <div style={{ textAlign: 'center' }}>Hadir</div>
              <div style={{ textAlign: 'center' }}>Izin</div>
              <div style={{ textAlign: 'center' }}>Sakit</div>
              <div style={{ textAlign: 'center' }}>Tidak Hadir</div>
              <div style={{ textAlign: 'center' }}>Pulang</div>
              <div style={{ textAlign: 'center' }}>Aksi</div>
            </div>
          </div>

          {/* Body Tabel */}
          <div>
            {isLoading ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7280' }}>
                Memuat data...
              </div>
            ) : filteredRows.length === 0 ? (
              <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#9CA3AF',
                fontSize: '14px',
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  opacity: 0.3,
                }}>
                  📋
                </div>
                <p style={{ margin: 0, fontWeight: '500' }}>
                  Belum ada data kehadiran siswa.
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#B9B9B9' }}>
                  Filter mungkin perlu disesuaikan atau belum ada data untuk periode ini.
                </p>
              </div>
            ) : (
              filteredRows.map((row, idx) => (
                <div
                  key={row.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '50px 130px minmax(180px, 1fr) 80px 80px 80px 100px 80px 80px',
                    gap: '12px',
                    padding: '14px 20px',
                    fontSize: '14px',
                    borderBottom: idx < filteredRows.length - 1 ? '1px solid #F3F4F6' : 'none',
                    backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#FFFFFF' : '#FAFBFC'}
                >
                  <div style={{ color: '#6B7280', fontWeight: '500' }}>{row.no}</div>
                  <div style={{ color: '#374151', fontWeight: '500' }}>{row.nisn}</div>
                  <div style={{ color: '#111827', fontWeight: '600' }}>{row.namaSiswa}</div>
                  <div style={{ textAlign: 'center', color: COLORS.HADIR, fontWeight: '700' }}>{row.hadir}</div>
                  <div style={{ textAlign: 'center', color: COLORS.IZIN, fontWeight: '700' }}>{row.izin}</div>
                  <div style={{ textAlign: 'center', color: COLORS.SAKIT, fontWeight: '700' }}>{row.sakit}</div>
                  <div style={{ textAlign: 'center', color: COLORS.TIDAK_HADIR, fontWeight: '700' }}>{row.tidakHadir}</div>
                  <div style={{ textAlign: 'center', color: COLORS.PULANG, fontWeight: '700' }}>{row.pulang}</div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <button
                      onClick={() => handleViewDetail(row)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        transition: 'all 0.2s',
                        color: '#374151',
                        fontWeight: '500',
                        fontSize: '13px',
                        gap: '6px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                        e.currentTarget.style.color = '#1E40AF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#374151';
                      }}
                      title="Lihat detail ketidakhadiran"
                    >
                      <Eye size={16} />
                      <span>Lihat</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </WalikelasLayout>
  );
}
