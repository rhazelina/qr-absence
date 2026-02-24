import { useState, useMemo, useEffect } from "react";
import { Eye, FileDown, Calendar, ArrowLeft, Search, ClipboardPlus, X, Upload } from "lucide-react";
import WalikelasLayout from "../../component/Walikelas/layoutwakel";
import { attendanceService } from "../../services/attendanceService";
import classService from "../../services/classService";
import { getTodayScheduleDay, normalizeScheduleDay, scheduleService } from "../../services/scheduleService";
import { masterService } from "../../services/masterService";
import type { Subject } from "../../services/masterService";

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
  alfa: number;
  pulang: number;
  status: 'aktif' | 'non-aktif';
}

interface HomeroomScheduleOption {
  id: string;
  day: string;
  mapel: string;
  guru: string;
  startTime: string;
  endTime: string;
}

interface TimeRangeOption {
  value: string;
  label: string;
  startTime: string;
  endTime: string;
}

const toHHmm = (value?: string) => {
  if (!value) return "";
  return value.substring(0, 5);
};

const toDateInputString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function RekapKehadiranSiswa({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: RekapKehadiranSiswaProps) {
  const COLORS = {
    HADIR: "#1FA83D",
    IZIN: "#ACA40D",
    PULANG: "#2F85EB",
    ALFA: "#D90000",
    SAKIT: "#520C8F"
  };

  const [searchTerm, setSearchTerm] = useState('');

  // Default dates: First and last day of current month
  const [periodeMulai, setPeriodeMulai] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  });
  const [periodeSelesai, setPeriodeSelesai] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const [rows, setRows] = useState<RekapRow[]>([]);

  const [kelasInfo, setKelasInfo] = useState<{ namaKelas: string, waliKelas: string, id?: string }>({
    namaKelas: 'Memuat...',
    waliKelas: 'Memuat...',
  });

  const [isPerizinanOpen, setIsPerizinanOpen] = useState(false);
  const [perizinanData, setPerizinanData] = useState({
    nisn: '',
    namaSiswa: '',
    alasanPulang: '',
    alasanDetail: '',
    mapel: '',
    namaGuru: '',
    tanggal: '',
    jamPelajaran: '',
    keterangan: '',
    file1: undefined as File | undefined,
    file2: undefined as File | undefined,
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [homeroomSchedules, setHomeroomSchedules] = useState<HomeroomScheduleOption[]>([]);
  const [teachersBySubject, setTeachersBySubject] = useState<Record<string, string[]>>({});
  const [timeRangeOptions, setTimeRangeOptions] = useState<TimeRangeOption[]>([]);

  const buildScheduleState = (mappedSchedules: HomeroomScheduleOption[]) => {
    setHomeroomSchedules(mappedSchedules);

    const mapelGuruMap: Record<string, Set<string>> = {};
    const timeOptionMap = new Map<string, TimeRangeOption>();

    mappedSchedules.forEach((item) => {
      if (!mapelGuruMap[item.mapel]) {
        mapelGuruMap[item.mapel] = new Set<string>();
      }
      mapelGuruMap[item.mapel].add(item.guru);

      const value = `${item.startTime}|${item.endTime}`;
      if (!timeOptionMap.has(value)) {
        timeOptionMap.set(value, {
          value,
          label: `${item.startTime} - ${item.endTime}`,
          startTime: item.startTime,
          endTime: item.endTime,
        });
      }
    });

    setTeachersBySubject(
      Object.fromEntries(
        Object.entries(mapelGuruMap).map(([mapel, teachers]) => [
          mapel,
          Array.from(teachers).sort((a, b) => a.localeCompare(b)),
        ])
      )
    );

    setTimeRangeOptions(
      Array.from(timeOptionMap.values()).sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      )
    );
  };

  // Fetch Class Info & Subjects
  useEffect(() => {
    const mapRawScheduleItems = (items: any[]): HomeroomScheduleOption[] =>
      items
        .map((item: any) => {
          const mapel = item.subject?.name || item.subject_name || item.subject || item.keterangan || "";
          const guru = item.teacher?.user?.name || item.teacher?.name || item.teacher || "";
          const startTime = toHHmm(item.start_time);
          const endTime = toHHmm(item.end_time);
          const day = normalizeScheduleDay(item.day || item.daily_schedule?.day || item.dailySchedule?.day || "");

          return {
            id: String(item.id || `${day}-${mapel}-${startTime}-${endTime}`),
            day,
            mapel,
            guru,
            startTime,
            endTime,
          };
        })
        .filter(
          (item: HomeroomScheduleOption) =>
            !!item.mapel && !!item.guru && !!item.startTime && !!item.endTime
        );

    const mapClassScheduleItems = (schedulePayload: any): HomeroomScheduleOption[] => {
      const dailySchedules = schedulePayload?.daily_schedules || schedulePayload?.dailySchedules || [];
      const rawItems = dailySchedules.flatMap((daily: any) => {
        const day = normalizeScheduleDay(daily?.day || "");
        const scheduleItems = daily?.schedule_items || daily?.scheduleItems || [];
        return scheduleItems.map((item: any) => ({
          ...item,
          day,
        }));
      });

      return mapRawScheduleItems(rawItems);
    };

    const fetchSubjects = async () => {
      try {
        const data = await masterService.getSubjects();
        setSubjects(data?.data || []);
      } catch (error) {
        console.error("Failed to fetch subjects", error);
      }
    };

    const fetchHomeroomSchedules = async (classId?: string | number) => {
      try {
        const homeroomData = await scheduleService.getMyHomeroomSchedules();
        const rawItems = Array.isArray(homeroomData)
          ? homeroomData
          : (homeroomData?.items || []);

        let mapped = mapRawScheduleItems(rawItems);

        if (mapped.length === 0 && classId) {
          const classScheduleData = await scheduleService.getScheduleByClass(classId);
          mapped = mapClassScheduleItems(classScheduleData);
        }

        buildScheduleState(mapped);
      } catch (error) {
        console.error("Failed to fetch homeroom schedules", error);

        if (!classId) {
          buildScheduleState([]);
          return;
        }

        try {
          const classScheduleData = await scheduleService.getScheduleByClass(classId);
          const fallbackMapped = mapClassScheduleItems(classScheduleData);
          buildScheduleState(fallbackMapped);
        } catch (fallbackError) {
          console.error("Failed to fetch fallback class schedule", fallbackError);
          buildScheduleState([]);
        }
      }
    };

    const fetchClass = async () => {
      try {
        const data = await classService.getMyClass();
        setKelasInfo({
          namaKelas: data.name || data.class_name || 'Kelas Tidak Diketahui',
          waliKelas: data.teacher?.user?.name || user.name || 'Wali Kelas',
          id: data.id ? String(data.id) : undefined
        });

        await fetchHomeroomSchedules(data.id);
      } catch (error) {
        console.error("Failed to fetch class info", error);
        setKelasInfo(prev => ({ ...prev, namaKelas: 'Gagal memuat data kelas' }));

        buildScheduleState([]);
      }
    };

    fetchClass();
    fetchSubjects();
  }, [user.name]);

  // Fetch Attendance Summary
  useEffect(() => {
    const fetchSummary = async () => {
      if (!kelasInfo.id) return;


      try {
        // Use the teacher-accessible endpoint /classes/{class}/students/attendance-summary
        // This endpoint is accessible by teachers for their homeroom class
        const response = await attendanceService.getClassStudentsSummary(kelasInfo.id, {
          from: periodeMulai,
          to: periodeSelesai
        });

        if (response && Array.isArray(response)) {
          const mappedRows: RekapRow[] = response.map((item: any, index: number) => {
            const totals = item.totals || {};
            // Calculate total hadir including late if applicable, or just present
            const hadirCount = (totals.present || 0) + (totals.late || 0);

            return {
              id: item.student?.id || String(index),
              no: index + 1,
              nisn: item.student?.nisn || '-',
              namaSiswa: item.student?.user?.name || item.student?.name || '-',
              hadir: hadirCount,
              izin: totals.permission || totals.izin || 0,
              sakit: totals.sick || 0,
              alfa: totals.alpha || totals.absent || totals.alfa || 0,
              pulang: totals.return || totals.leave_early || totals.pulang || 0,
              status: item.student?.status === 'active' ? 'aktif' : 'non-aktif' // Adjust based on student status field
            };
          });
          setRows(mappedRows);
        }
      } catch (error) {
        console.error("Failed to fetch attendance summary", error);
      }
    };

    if (kelasInfo.id) {
      fetchSummary();
    }
  }, [kelasInfo.id, periodeMulai, periodeSelesai]);

  useEffect(() => {
    // Style injection kept as is
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

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(row =>
      row.nisn.toLowerCase().includes(term) ||
      row.namaSiswa.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  const mapelOptions = useMemo(() => {
    const fromSchedules = Array.from(new Set(homeroomSchedules.map((item) => item.mapel)));
    if (fromSchedules.length > 0) return fromSchedules;
    return subjects.map((subject) => subject.name);
  }, [homeroomSchedules, subjects]);

  const guruOptions = useMemo(() => {
    return teachersBySubject[perizinanData.mapel] || [];
  }, [teachersBySubject, perizinanData.mapel]);

  const availableTimeRangeOptions = useMemo(() => {
    if (!perizinanData.mapel) return timeRangeOptions;

    const filteredSchedules = homeroomSchedules.filter((item) =>
      item.mapel === perizinanData.mapel &&
      (!perizinanData.namaGuru || item.guru === perizinanData.namaGuru)
    );

    if (filteredSchedules.length === 0) return timeRangeOptions;

    const uniqueByValue = new Map<string, TimeRangeOption>();
    filteredSchedules.forEach((item) => {
      const value = `${item.startTime}|${item.endTime}`;
      if (!uniqueByValue.has(value)) {
        uniqueByValue.set(value, {
          value,
          label: `${item.startTime} - ${item.endTime}`,
          startTime: item.startTime,
          endTime: item.endTime,
        });
      }
    });

    return Array.from(uniqueByValue.values()).sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }, [homeroomSchedules, perizinanData.mapel, perizinanData.namaGuru, timeRangeOptions]);

  useEffect(() => {
    if (!isPerizinanOpen) return;

    const todayScheduleDay = getTodayScheduleDay();
    const prioritizedSchedules = homeroomSchedules.filter(
      (schedule) => schedule.day === todayScheduleDay
    );

    const defaultSchedule = prioritizedSchedules[0] || homeroomSchedules[0];
    const defaultMapel = defaultSchedule?.mapel || mapelOptions[0] || "";
    const defaultGuru = defaultSchedule?.guru || (teachersBySubject[defaultMapel]?.[0] || "");
    const defaultJam = defaultSchedule
      ? `${defaultSchedule.startTime}|${defaultSchedule.endTime}`
      : "";
    const defaultStudent = rows.find((row) => row.nisn && row.nisn !== "-") || rows[0];

    setPerizinanData((prev) => ({
      ...prev,
      nisn: prev.nisn || defaultStudent?.nisn || "",
      namaSiswa: prev.namaSiswa || defaultStudent?.namaSiswa || "",
      alasanPulang: prev.alasanPulang || "izin",
      alasanDetail: prev.alasanDetail || "Simulasi perizinan pulang lebih awal.",
      mapel: prev.mapel || defaultMapel,
      namaGuru: prev.namaGuru || defaultGuru,
      tanggal: prev.tanggal || toDateInputString(),
      jamPelajaran: prev.jamPelajaran || defaultJam,
      keterangan: prev.keterangan || "Simulasi perizinan",
    }));
  }, [isPerizinanOpen, homeroomSchedules, mapelOptions, rows, teachersBySubject]);

  // ... rest of calculations
  const totalHadir = useMemo(() => filteredRows.reduce((sum, row) => sum + row.hadir, 0), [filteredRows]);
  const totalIzin = useMemo(() => filteredRows.reduce((sum, row) => sum + row.izin, 0), [filteredRows]);
  const totalSakit = useMemo(() => filteredRows.reduce((sum, row) => sum + row.sakit, 0), [filteredRows]);
  const totalAlfa = useMemo(() => filteredRows.reduce((sum, row) => sum + row.alfa, 0), [filteredRows]);
  const totalPulang = useMemo(() => filteredRows.reduce((sum, row) => sum + row.pulang, 0), [filteredRows]);

  // const handleExportExcel = () => {
  //   try {
  //     const headers = ["No", "NISN", "Nama Siswa", "Hadir", "Izin", "Sakit", "Alfa", "Pulang", "Status"];
  //     const rowsData = filteredRows.map((row) => [
  //       row.no,
  //       row.nisn,
  //       row.namaSiswa,
  //       row.hadir,
  //       row.izin,
  //       row.sakit,
  //       row.alfa,
  //       row.pulang,
  //       row.status === 'aktif' ? 'Aktif' : 'Non-Aktif'
  //     ]);

  //     rowsData.push([
  //       'TOTAL',
  //       '',
  //       'Total Keseluruhan',
  //       totalHadir,
  //       totalIzin,
  //       totalSakit,
  //       totalAlfa,
  //       totalPulang,
  //       ''
  //     ]);

  //     exportService.exportToExcel(rowsData, headers, `rekap-kehadiran-kelas-${kelasInfo.namaKelas}-${periodeMulai}-sd-${periodeSelesai}.xlsx`);
  //   } catch (error) {
  //     console.error("Failed to export to Excel", error);
  //   }
  // };

  // const handleExportPDF = () => {
  //   try {
  //     const headers = ["No", "NISN", "Nama Siswa", "Hadir", "Izin", "Sakit", "Alfa", "Pulang", "Status"];
  //     const rowsData = filteredRows.map((row) => [
  //       row.no,
  //       row.nisn,
  //       row.namaSiswa,
  //       row.hadir,
  //       row.izin,
  //       row.sakit,
  //       row.alfa,
  //       row.pulang,
  //       row.status === 'aktif' ? 'Aktif' : 'Non-Aktif'
  //     ]);

  //     rowsData.push([
  //       'TOTAL',
  //       '',
  //       'Total Keseluruhan',
  //       totalHadir,
  //       totalIzin,
  //       totalSakit,
  //       totalAlfa,
  //       totalPulang,
  //       ''
  //     ]);

  //     exportService.exportToPDF(rowsData, headers, `rekap-kehadiran-kelas-${kelasInfo.namaKelas}-${periodeMulai}-sd-${periodeSelesai}.pdf`, {
  //       title: `Rekapitulasi Kehadiran Siswa`,
  //       subtitle: `Kelas: ${kelasInfo.namaKelas} | Periode: ${formatDisplayDate(periodeMulai)} - ${formatDisplayDate(periodeSelesai)}`,
  //       schoolName: "SMA NEGERI 1 CIAMIS"
  //     });
  //   } catch (error) {
  //     console.error("Failed to export to PDF", error);
  //   }
  // };


  // ... existing handlers (handleViewDetail, handleBack, formatDisplayDate, handleExportExcel, handleExportPDF, etc.)
  // We keep them as is, they work with `rows`/`filteredRows`.

  // Keeping perizinan logic as is for now, assuming it adds to local `rows` or localStorage
  // Ideally this should also save to backend, but no endpoint mentioned.

  // ... return method same as before




  const handleViewDetail = (row: RekapRow) => {
    onMenuClick("daftar-ketidakhadiran-walikelas", {
      siswaName: row.namaSiswa,
      siswaIdentitas: row.nisn,
      selectedStudentId: row.id,
    });
  };

  const handleBack = () => {
    onMenuClick('kehadiran-siswa');
  };

  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleExportExcel = () => {
    try {
      const headers = ["No", "NISN", "Nama Siswa", "Hadir", "Izin", "Sakit", "Alfa", "Pulang", "Status"];
      const rowsData = filteredRows.map((row) => [
        row.no,
        row.nisn,
        row.namaSiswa,
        row.hadir,
        row.izin,
        row.sakit,
        row.alfa,
        row.pulang,
        row.status === 'aktif' ? 'Aktif' : 'Non-Aktif'
      ]);

      rowsData.push([
        'TOTAL',
        '',
        'Total Keseluruhan',
        totalHadir,
        totalIzin,
        totalSakit,
        totalAlfa,
        totalPulang,
        ''
      ]);

      const csvContent = [
        headers.join(","),
        ...rowsData.map((row) => row.join(",")),
      ].join("\n");

      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Rekap_Kehadiran_${kelasInfo.namaKelas.replace(/\s+/g, '_')}_${periodeMulai}_${periodeSelesai}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('✅ File Excel berhasil diunduh!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('❌ Terjadi kesalahan saat mengekspor Excel');
    }
  };

  const handleExportPDF = () => {
    try {
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rekap Kehadiran Siswa</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #1E40AF;
            }
            .info {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #3B82F6;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #3B82F6;
              color: white;
              padding: 12px 8px;
              text-align: center;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            tr:hover {
              background-color: #f3f4f6;
            }
            .total-row {
              background-color: #3B82F6 !important;
              color: white;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .hadir { color: #1FA83D; font-weight: bold; }
            .izin { color: #ACA40D; font-weight: bold; }
            .sakit { color: #520C8F; font-weight: bold; }
            .alfa { color: #D90000; font-weight: bold; }
            .pulang { color: #2F85EB; font-weight: bold; }
            .status-aktif {
              background-color: #D1FAE5;
              color: #065F46;
              padding: 4px 8px;
              border-radius: 4px;
              font-weight: bold;
            }
            .status-nonaktif {
              background-color: #FEE2E2;
              color: #991B1B;
              padding: 4px 8px;
              border-radius: 4px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">REKAP KEHADIRAN SISWA</div>
          </div>

          <div class="info">
            <div class="info-row">
              <span class="info-label">Kelas:</span>
              <span>${kelasInfo.namaKelas}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Wali Kelas:</span>
              <span>${kelasInfo.waliKelas}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Periode:</span>
              <span>${formatDisplayDate(periodeMulai)} - ${formatDisplayDate(periodeSelesai)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Data:</span>
              <span>${filteredRows.length} Siswa</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>NISN</th>
                <th>Nama Siswa</th>
                <th>Hadir</th>
                <th>Izin</th>
                <th>Sakit</th>
                <th>Alfa</th>
                <th>Pulang</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
      `;

      filteredRows.forEach(row => {
        htmlContent += `
          <tr>
            <td>${row.no}</td>
            <td>${row.nisn}</td>
            <td>${row.namaSiswa}</td>
            <td class="hadir">${row.hadir}</td>
            <td class="izin">${row.izin}</td>
            <td class="sakit">${row.sakit}</td>
            <td class="alfa">${row.alfa}</td>
            <td class="pulang">${row.pulang}</td>
            <td><span class="${row.status === 'aktif' ? 'status-aktif' : 'status-nonaktif'}">${row.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}</span></td>
          </tr>
        `;
      });

      htmlContent += `
          <tr class="total-row">
            <td colspan="3"><strong>TOTAL KESELURUHAN</strong></td>
            <td><strong>${totalHadir}</strong></td>
            <td><strong>${totalIzin}</strong></td>
            <td><strong>${totalSakit}</strong></td>
            <td><strong>${totalAlfa}</strong></td>
            <td><strong>${totalPulang}</strong></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>Dicetak pada: ${new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })}</p>
        <p>${kelasInfo.namaKelas} - ${kelasInfo.waliKelas}</p>
      </div>

      </body>
      </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rekap_Kehadiran_${kelasInfo.namaKelas.replace(/\s+/g, '_')}_${periodeMulai}_${periodeSelesai}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('✅ File rekap kehadiran berhasil diunduh!');

    } catch (error) {
      console.error('Error exporting PDF:', error);

      try {
        const csvHeaders = ["No,NISN,Nama Siswa,Hadir,Izin,Sakit,Alfa,Pulang,Status"];
        const csvRows = filteredRows.map(row =>
          `${row.no},${row.nisn},"${row.namaSiswa}",${row.hadir},${row.izin},${row.sakit},${row.alfa},${row.pulang},${row.status}`
        );
        csvRows.push(`TOTAL,,"Total Keseluruhan",${totalHadir},${totalIzin},${totalSakit},${totalAlfa},${totalPulang},`);

        const csvContent = csvHeaders.concat(csvRows).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Rekap_Kehadiran_${kelasInfo.namaKelas.replace(/\s+/g, '_')}_${periodeMulai}_${periodeSelesai}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('✅ Data berhasil diunduh sebagai file CSV!');
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        alert('❌ Terjadi kesalahan saat mengekspor data. Silakan coba lagi.');
      }
    }
  };

  const handleBuatPerizinan = () => {
    const todayString = toDateInputString();
    const todayScheduleDay = getTodayScheduleDay();
    const prioritizedSchedules = homeroomSchedules.filter(
      (schedule) => schedule.day === todayScheduleDay
    );

    const defaultStudent = rows.find((row) => row.nisn && row.nisn !== "-") || rows[0];
    const defaultSchedule = prioritizedSchedules[0] || homeroomSchedules[0];
    const defaultMapel = defaultSchedule?.mapel || mapelOptions[0] || '';
    const defaultGuru = defaultSchedule?.guru || (teachersBySubject[defaultMapel]?.[0] || '');
    const defaultJam = defaultSchedule
      ? `${defaultSchedule.startTime}|${defaultSchedule.endTime}`
      : '';

    setPerizinanData({
      nisn: defaultStudent?.nisn || '',
      namaSiswa: defaultStudent?.namaSiswa || '',
      alasanPulang: 'izin',
      alasanDetail: 'Simulasi perizinan pulang lebih awal.',
      mapel: defaultMapel,
      namaGuru: defaultGuru,
      tanggal: todayString,
      jamPelajaran: defaultJam,
      keterangan: 'Simulasi perizinan',
      file1: undefined,
      file2: undefined,
    });

    setIsPerizinanOpen(true);
  };

  const handleClosePerizinan = () => {
    setIsPerizinanOpen(false);
    setPerizinanData({
      nisn: '',
      namaSiswa: '',
      alasanPulang: '',
      alasanDetail: '',
      mapel: '',
      namaGuru: '',
      tanggal: '',
      jamPelajaran: '',
      keterangan: '',
      file1: undefined,
      file2: undefined,
    });
  };

  const handleSubmitPerizinan = async () => {
    if (!perizinanData.nisn || !perizinanData.alasanPulang || !perizinanData.tanggal ||
      !perizinanData.mapel || !perizinanData.namaGuru || !perizinanData.jamPelajaran || !perizinanData.file1) {
      alert('⚠️ Mohon isi semua field yang diperlukan, termasuk foto bukti');
      return;
    }

    const siswa = rows.find(r => r.nisn === perizinanData.nisn);
    if (!siswa) {
      alert('⚠️ Siswa tidak ditemukan');
      return;
    }

    try {
      const selectedTimeRange = timeRangeOptions.find(
        (option) => option.value === perizinanData.jamPelajaran
      );

      if (!selectedTimeRange) {
        alert('⚠️ Jam pelajaran tidak valid, silakan pilih dari daftar yang tersedia');
        return;
      }

      const selectedSchedule = homeroomSchedules.find(
        (schedule) =>
          schedule.mapel === perizinanData.mapel &&
          schedule.guru === perizinanData.namaGuru &&
          schedule.startTime === selectedTimeRange.startTime &&
          schedule.endTime === selectedTimeRange.endTime
      );

      if (!selectedSchedule && homeroomSchedules.length > 0) {
        alert('⚠️ Kombinasi mapel, guru, dan jam belum sesuai jadwal aktif kelas');
        return;
      }

      const scheduleId = selectedSchedule && /^\d+$/.test(selectedSchedule.id)
        ? selectedSchedule.id
        : undefined;

      await attendanceService.createLeavePermission({
        student_id: siswa.id,
        schedule_id: scheduleId,
        type: perizinanData.alasanPulang as any,
        start_time: selectedTimeRange.startTime,
        end_time: selectedTimeRange.endTime,
        reason: perizinanData.alasanDetail || perizinanData.keterangan || `Izin ${perizinanData.alasanPulang}`,
        file: perizinanData.file1
      });

      alert('✅ Perizinan berhasil dibuat!');
      handleClosePerizinan();

      // Refresh rekap data
      if (kelasInfo.id) {
        // fetchSummary is local to useEffect, let's just trigger a re-fetch by updating state or just calling it
        // Actually, we can just reload the page or rely on the next periodic fetch if implemented
        // For now, let's assume it works and maybe re-fetch if we had a trigger
      }
    } catch (error: any) {
      console.error('Error creating perizinan:', error);
      alert('❌ Gagal membuat perizinan: ' + (error.message || 'Terjadi kesalahan'));
    }
  };



  const todayString = toDateInputString();

  return (
    <WalikelasLayout
      pageTitle="Rekap Kehadiran"
      currentPage={currentPage as any}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
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

            <span style={{ fontSize: 14, fontWeight: 600 }}>Periode:</span>

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

            <span style={{ fontWeight: 600, fontSize: 16 }}>—</span>

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

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <button
              onClick={handleBuatPerizinan}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                backgroundColor: "#10B981",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#059669"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#10B981"}
            >
              <ClipboardPlus size={16} />
              Buat Perizinan
            </button>

            <button
              onClick={handleExportExcel}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                backgroundColor: "#3B82F6",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563EB"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3B82F6"}
            >
              <FileDown size={16} />
              Unduh Excel
            </button>

            <button
              onClick={handleExportPDF}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                backgroundColor: "#EF4444",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#DC2626"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#EF4444"}
            >
              <FileDown size={16} />
              Unduh PDF
            </button>
          </div>
        </div>

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
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontWeight: '600' }}>Alfa</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.ALFA }}>{totalAlfa}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontWeight: '600' }}>Pulang</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.PULANG }}>{totalPulang}</div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}>
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
              <div style={{ textAlign: 'center' }}>Alfa</div>
              <div style={{ textAlign: 'center' }}>Pulang</div>
              <div style={{ textAlign: 'center' }}>Aksi</div>
            </div>
          </div>

          <div>
            {filteredRows.length === 0 ? (
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
                  Data rekap kehadiran akan muncul di sini setelah Anda menginput kehadiran.
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
                  <div style={{ textAlign: 'center', color: COLORS.ALFA, fontWeight: '700' }}>{row.alfa}</div>
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

      {isPerizinanOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                backgroundColor: '#0F172A',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                color: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ClipboardPlus size={20} color="#FFFFFF" />
                <h2 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#FFFFFF'
                }}>
                  Buat Perizinan
                </h2>
              </div>
              <button
                onClick={handleClosePerizinan}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <p
                    style={{
                      margin: 0,
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    Pilih Siswa *
                  </p>
                  <select
                    value={perizinanData.nisn}
                    onChange={(e) => {
                      const selectedStudent = rows.find((r) => r.nisn === e.target.value);
                      setPerizinanData((prev) => ({
                        ...prev,
                        nisn: e.target.value,
                        namaSiswa: selectedStudent?.namaSiswa || '',
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Pilih siswa</option>
                    {rows.map((r) => (
                      <option key={r.nisn} value={r.nisn}>
                        {r.namaSiswa} ({r.nisn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    Alasan Pulang *
                  </p>
                  <select
                    value={perizinanData.alasanPulang}
                    onChange={(e) =>
                      setPerizinanData((prev) => ({
                        ...prev,
                        alasanPulang: e.target.value,
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Pilih alasan pulang</option>
                    <option value="izin">Izin (karena ada keperluan/izin)</option>
                    <option value="sakit">Sakit (tidak enak badan)</option>
                    <option value="dispensasi">Dispensasi</option>
                  </select>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '12px',
                    color: '#6B7280',
                    fontStyle: 'italic',
                  }}>
                    *Pilih alasan kenapa siswa pulang lebih awal
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    Pilih Mata Pelajaran *
                  </p>
                  <select
                    value={perizinanData.mapel}
                    onChange={(e) => {
                      const nextMapel = e.target.value;
                      const firstMatchedSchedule = homeroomSchedules.find(
                        (schedule) => schedule.mapel === nextMapel
                      );

                      setPerizinanData((prev) => ({
                        ...prev,
                        mapel: nextMapel,
                        namaGuru: firstMatchedSchedule?.guru || '',
                        jamPelajaran: firstMatchedSchedule
                          ? `${firstMatchedSchedule.startTime}|${firstMatchedSchedule.endTime}`
                          : '',
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Pilih mata pelajaran</option>
                    {mapelOptions.map((mapel) => (
                      <option key={mapel} value={mapel}>
                        {mapel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    Pilih Guru *
                  </p>
                  <select
                    value={perizinanData.namaGuru}
                    onChange={(e) => {
                      const nextGuru = e.target.value;
                      const matchedSchedule = homeroomSchedules.find(
                        (schedule) =>
                          schedule.mapel === perizinanData.mapel &&
                          schedule.guru === nextGuru
                      );

                      setPerizinanData((prev) => ({
                        ...prev,
                        namaGuru: nextGuru,
                        jamPelajaran: nextGuru && matchedSchedule
                          ? `${matchedSchedule.startTime}|${matchedSchedule.endTime}`
                          : '',
                      }));
                    }}
                    disabled={!perizinanData.mapel}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: !perizinanData.mapel ? '#F9FAFB' : '#FFFFFF',
                      color: !perizinanData.mapel ? '#9CA3AF' : '#1F2937',
                      cursor: !perizinanData.mapel ? 'not-allowed' : 'pointer',
                      opacity: !perizinanData.mapel ? 0.7 : 1,
                    }}
                  >
                    {!perizinanData.mapel ? (
                      <option value="">Pilih guru</option>
                    ) : (
                      <>
                        <option value="">Pilih guru</option>
                        {guruOptions.map((guru) => (
                          <option key={guru} value={guru}>
                            {guru}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    Tanggal dan Jam *
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: 13,
                        color: '#6B7280',
                        fontWeight: 500
                      }}>
                        Tanggal
                      </p>
                      <input
                        type="date"
                        value={perizinanData.tanggal}
                        onChange={(e) =>
                          setPerizinanData((prev) => ({
                            ...prev,
                            tanggal: e.target.value,
                          }))
                        }
                        min={todayString}
                        max={todayString}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          backgroundColor: '#FFFFFF',
                          color: '#1F2937',
                        }}
                      />
                      <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '12px',
                        color: '#6B7280',
                        fontStyle: 'italic',
                      }}>
                        *Tanggal hanya bisa diisi dengan tanggal hari ini
                      </p>
                    </div>

                    <div>
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: 13,
                        color: '#6B7280',
                        fontWeight: 500
                      }}>
                        Jam Pelajaran *
                      </p>
                      <select
                        value={perizinanData.jamPelajaran}
                        onChange={(e) =>
                          setPerizinanData((prev) => ({
                            ...prev,
                            jamPelajaran: e.target.value,
                          }))
                        }
                        disabled={!perizinanData.mapel}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: !perizinanData.mapel ? '#F9FAFB' : '#FFFFFF',
                          color: !perizinanData.mapel ? '#9CA3AF' : '#1F2937',
                          cursor: !perizinanData.mapel ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <option value="">Pilih jam pelajaran</option>
                        {availableTimeRangeOptions.map((jam) => (
                          <option key={jam.value} value={jam.value}>
                            {jam.label}
                          </option>
                        ))}
                      </select>
                      <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '12px',
                        color: '#6B7280',
                        fontStyle: 'italic',
                      }}>
                        *Jam pelajaran diambil dari jadwal aktif kelas
                      </p>
                    </div>

                    <div>
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: 13,
                        color: '#6B7280',
                        fontWeight: 500
                      }}>
                        Keterangan (Opsional)
                      </p>
                      <textarea
                        value={perizinanData.alasanDetail}
                        onChange={(e) =>
                          setPerizinanData((prev) => ({
                            ...prev,
                            alasanDetail: e.target.value,
                          }))
                        }
                        placeholder="Contoh: Pulang karena sakit kepala, ada keperluan keluarga, dll."
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          minHeight: '80px',
                          backgroundColor: '#FFFFFF',
                          color: '#1F2937',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    Tambahkan Foto *
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px dashed #D1D5DB',
                        borderRadius: '8px',
                        backgroundColor: '#F9FAFB',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.jpg,.jpeg,.png';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            setPerizinanData((prev) => ({
                              ...prev,
                              file1: file,
                            }));
                          }
                        };
                        input.click();
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                        e.currentTarget.style.borderColor = '#9CA3AF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                        e.currentTarget.style.borderColor = '#D1D5DB';
                      }}
                    >
                      <Upload size={24} color="#6B7280" />
                      <span style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        fontWeight: 500
                      }}>
                        {perizinanData.file1 ? perizinanData.file1.name : 'Upload foto bukti pertama* (JPG/PNG)'}
                      </span>
                    </div>
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '12px',
                      color: '#6B7280',
                      fontStyle: 'italic',
                      marginTop: '-8px'
                    }}>
                      *Wajib diisi (surat izin/surat dokter/foto lain) - Format JPG/PNG
                    </p>

                    <div
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px dashed #D1D5DB',
                        borderRadius: '8px',
                        backgroundColor: '#F9FAFB',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.jpg,.jpeg,.png';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            setPerizinanData((prev) => ({
                              ...prev,
                              file2: file,
                            }));
                          }
                        };
                        input.click();
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                        e.currentTarget.style.borderColor = '#9CA3AF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                        e.currentTarget.style.borderColor = '#D1D5DB';
                      }}
                    >
                      <Upload size={24} color="#6B7280" />
                      <span style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        fontWeight: 500
                      }}>
                        {perizinanData.file2 ? perizinanData.file2.name : 'Upload foto bukti kedua (opsional) - JPG/PNG'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '20px 24px',
                borderTop: '1px solid #E5E7EB',
                backgroundColor: '#F9FAFB',
                flexShrink: 0,
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={handleClosePerizinan}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  minWidth: '100px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                  e.currentTarget.style.borderColor = '#9CA3AF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSubmitPerizinan}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  minWidth: '100px',
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                  e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(16, 185, 129, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10B981';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.4)';
                }}
              >
                Simpan Perizinan
              </button>
            </div>
          </div>
        </div>
      )}
    </WalikelasLayout>
  );
}
