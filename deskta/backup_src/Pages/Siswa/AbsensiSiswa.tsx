import { useState, useMemo } from "react";
import SiswaLayout from "../../component/Siswa/SiswaLayout";
import { Table } from "../../component/Shared/Table";
import { StatusBadge } from "../../component/Shared/StatusBadge";

type SiswaPage = "dashboard" | "jadwal-anda" | "notifikasi" | "absensi";

interface AbsensiSiswaProps {
  user: { name: string; phone: string };
  currentPage: SiswaPage;
  onMenuClick: (page: string) => void;
  onLogout: () => void;
}

interface AbsensiRecord {
  id: string;
  tanggal: string;
  jamPelajaran: string;
  mataPelajaran: string;
  namaSiswa: string;
  status: "alpha" | "izin" | "sakit" | "izin-sakit";
}

// Dummy data - nanti dari API
const dummyData: AbsensiRecord[] = [
  {
    id: "1",
    tanggal: "25-05-2025",
    jamPelajaran: "1-4",
    mataPelajaran: "Matematika",
    namaSiswa: "Budi Santoso",
    status: "alpha",
  },
  {
    id: "2",
    tanggal: "24-05-2025",
    jamPelajaran: "1-4",
    mataPelajaran: "Matematika",
    namaSiswa: "Siti Aminah",
    status: "alpha",
  },
  {
    id: "3",
    tanggal: "25-05-2025",
    jamPelajaran: "1-4",
    mataPelajaran: "Matematika",
    namaSiswa: "Rudi Hartono",
    status: "izin-sakit",
  },
  {
    id: "4",
    tanggal: "25-05-2025",
    jamPelajaran: "1-4",
    mataPelajaran: "Matematika",
    namaSiswa: "Dewi Sartika",
    status: "izin-sakit",
  },
  {
    id: "5",
    tanggal: "25-05-2025",
    jamPelajaran: "1-4",
    mataPelajaran: "Matematika",
    namaSiswa: "Ahmad Yani",
    status: "alpha",
  },
  {
    id: "6",
    tanggal: "25-05-2025",
    jamPelajaran: "1-4",
    mataPelajaran: "Matematika",
    namaSiswa: "Rina Nose",
    status: "alpha",
  },
  {
    id: "7",
    tanggal: "25-05-2025",
    jamPelajaran: "1-4",
    mataPelajaran: "Matematika",
    namaSiswa: "Sule Prikitiw",
    status: "alpha",
  },
];

export default function AbsensiSiswa({
  user,
  currentPage,
  onMenuClick,
  onLogout,
}: AbsensiSiswaProps) {
  const [selectedDate, setSelectedDate] = useState("");

  // Filter data berdasarkan tanggal (dummy logic)
  const filteredData = useMemo(() => {
    if (selectedDate) {
      // Mock filtering by date if needed, or just return all for now as dummy data is limited
      // return dummyData.filter(d => d.tanggal === selectedDate); // Format might differ
    }
    return dummyData;
  }, [selectedDate]);

  // Hitung summary
  const summary = useMemo(() => {
    const izin = filteredData.filter((d) => d.status === "izin" || d.status === "izin-sakit").length;
    const sakit = filteredData.filter((d) => d.status === "sakit" || d.status === "izin-sakit").length;
    const alpha = filteredData.filter((d) => d.status === "alpha").length;

    return { izin, sakit, alpha };
  }, [filteredData]);

  // Custom Status Badge untuk Izin/Sakit
  const renderStatus = (status: string) => {
    if (status === "izin-sakit") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 120,
            padding: "8px 14px",
            borderRadius: 999,
            fontSize: "13px",
            fontWeight: 600,
            color: "#1F2937",
            backgroundColor: "#FEF3C7",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          Izin/Sakit
        </span>
      );
    }
    return <StatusBadge status={status as any} />;
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
      key: "namaSiswa",
      label: "Nama Siswa",
    },
    {
      key: "status",
      label: "Status",
      render: (_: any, row: AbsensiRecord) => renderStatus(row.status),
    },
  ];

  return (
    <SiswaLayout
      pageTitle="Daftar Ketidakhadiran"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
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
        {/* Filter dan Summary Section */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          {/* Filter Periode */}
          <div style={{ minWidth: "200px" }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                Tanggal:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px',
                  outline: 'none',
                  color: '#1F2937',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* Izin Card */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "12px",
                padding: "16px 20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                minWidth: "100px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#64748B",
                  marginBottom: "8px",
                }}
              >
                Izin
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0B2948",
                }}
              >
                {summary.izin}
              </div>
            </div>

            {/* Sakit Card */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "12px",
                padding: "16px 20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                minWidth: "100px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#64748B",
                  marginBottom: "8px",
                }}
              >
                Sakit
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0B2948",
                }}
              >
                {summary.sakit}
              </div>
            </div>

            {/* Alpha Card */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "12px",
                padding: "16px 20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                minWidth: "100px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#64748B",
                  marginBottom: "8px",
                }}
              >
                Alpha
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0B2948",
                }}
              >
                {summary.alpha}
              </div>
            </div>
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



    </SiswaLayout>
  );
}