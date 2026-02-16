import { useState, useMemo } from "react";
import { Table } from "../../component/Shared/Table";

interface AbsensiRecord {
  id: string;
  tanggal: string;
  jamPelajaran: string;
  mataPelajaran: string;
  guru: string;
  status: "alpha" | "izin" | "sakit" | "izin-sakit" | "pulang";
}

// Dummy data - nanti dari API
const dummyData: AbsensiRecord[] = [
  {
    id: "1",
    tanggal: "25-05-2025",
    jamPelajaran: "1-4",
    mataPelajaran: "Matematika",
    guru: "Alifah Diantebes Aindra S.pd",
    status: "alpha",
  },
  {
    id: "2",
    tanggal: "24-05-2025",
    jamPelajaran: "1-4",
    mataPelajaran: "Matematika",
    guru: "Alifah Diantebes Aindra S.pd",
    status: "alpha",
  },
  {
    id: "3",
    tanggal: "25-05-2025",
    jamPelajaran: "1-4",
    mataPelajaran: "Matematika",
    guru: "Alifah Diantebes Aindra S.pd",
    status: "izin-sakit",
  },
  {
    id: "4",
    tanggal: "25-05-2025",
    jamPelajaran: "1-4",
    mataPelajaran: "Matematika",
    guru: "Alifah Diantebes Aindra S.pd",
    status: "izin-sakit",
  },
  {
    id: "5",
    tanggal: "25-05-2025",
    jamPelajaran: "1-4",
    mataPelajaran: "Matematika",
    guru: "Alifah Diantebes Aindra S.pd",
    status: "alpha",
  },
  {
    id: "6",
    tanggal: "25-05-2025",
    jamPelajaran: "1-4",
    mataPelajaran: "Matematika",
    guru: "Alifah Diantebes Aindra S.pd",
    status: "alpha",
  },
];

function CalendarIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 2V5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 2V5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 9.09H20.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TidakHadirPenguruskelas() {
  const [startDate, setStartDate] = useState("2025-05-25");
  const [endDate, setEndDate] = useState("2025-05-25");

  // Filter data (dummy)
  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return dummyData;

    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to end of day to include the full day
    end.setHours(23, 59, 59, 999);

    return dummyData.filter((item) => {
      // Convert DD-MM-YYYY to Date object
      const [day, month, year] = item.tanggal.split("-").map(Number);
      const itemDate = new Date(year, month - 1, day);
      
      return itemDate >= start && itemDate <= end;
    });
  }, [startDate, endDate]);

  // Hitung summary
  const summary = useMemo(() => {
    const pulang = filteredData.filter((d) => d.status === "pulang").length;
    const izin = filteredData.filter((d) => d.status === "izin").length;
    const sakit = filteredData.filter((d) => d.status === "sakit" || d.status === "izin-sakit").length;
    const alpha = filteredData.filter((d) => d.status === "alpha").length;
    
    return { pulang, izin, sakit, alpha };
  }, [filteredData]);

  // Custom Status Renderer
  const renderStatus = (status: string) => {
    let bgColor = "#EF4444"; // Default Red (Alpha)
    let label = "Alpha";
    let textColor = "#FFFFFF";

    if (status === "izin-sakit" || status === "izin" || status === "sakit") {
      bgColor = "#EAB308"; // Yellow/Gold
      label = "Izin/Sakit";
    } else if (status === "pulang") {
      bgColor = "#3B82F6"; // Blue
      label = "Pulang";
    }

    return (
      <span
        style={{
          display: "inline-block",
          minWidth: "100px",
          padding: "8px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 600,
          color: textColor,
          backgroundColor: bgColor,
          textAlign: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {label}
      </span>
    );
  };

  const columns = [
    {
      key: "tanggal",
      label: "Tanggal",
    },
    {
      key: "jamPelajaran",
      label: "Jam Pelajaran",
    },
    {
      key: "mataPelajaran",
      label: "Mata Pelajaran",
    },
    {
      key: "guru",
      label: "Guru",
    },
    {
      key: "status",
      label: "Status",
      render: (_: any, row: AbsensiRecord) => renderStatus(row.status),
      align: "center" as const,
    },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        zIndex: 1,
      }}
    >
      
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          
          <div
            style={{
              background: "#0B2948",
              borderRadius: "8px",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              gap: "20px",
              color: "white",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: "700",
                fontSize: "16px",
              }}
            >
              <CalendarIcon />
              <span>Periode :</span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  background: "#E2E8F0",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  color: "#0F172A",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#0F172A",
                    fontWeight: "600",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    colorScheme: "light",
                  }}
                />
              </div>
              
              <span style={{ fontWeight: "bold" }}>--</span>
              
              <div
                style={{
                  background: "#E2E8F0",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  color: "#0F172A",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#0F172A",
                    fontWeight: "600",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    colorScheme: "light",
                  }}
                />
              </div>
            </div>
          </div>

         
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <SummaryCard label="Pulang" value={summary.pulang} />
            <SummaryCard label="Izin" value={summary.izin} />
            <SummaryCard label="Sakit" value={summary.sakit} />
            <SummaryCard label="Alpha" value={summary.alpha} />
          </div>
        </div>

        {/* Tabel Absensi */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <Table
          columns={columns}
          data={filteredData}
          emptyMessage="Tidak ada data ketidakhadiran"
          keyField="id"
        />
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "12px",
        padding: "12px 24px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        minWidth: "100px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#0F172A",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: 800,
          color: "#0B2948",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
