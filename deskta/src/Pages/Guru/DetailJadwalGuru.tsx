import { useEffect, useMemo, useState } from "react";
import GuruLayout from "../../component/Guru/GuruLayout";
import type { Schedule } from "../../types/api";
import DummyJadwal from "../../assets/Icon/DummyJadwal.png";
import { isCancellation } from "../../utils/errorHelpers";

interface LihatJadwalGuruProps {
  user: { name: string; role: string };
  currentPage: string;
  onMenuClick: (page: string) => void;
  onLogout: () => void;
}





export default function LihatJadwalGuru({
  user,
  currentPage,
  onMenuClick,
  onLogout,
}: LihatJadwalGuruProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");


  // Fetch Schedules
  useEffect(() => {
    const controller = new AbortController();
    const fetchSchedules = async () => {
      try {
        const { dashboardService } = await import('../../services/dashboard');
        // Fetch all schedules for this teacher
        const data = await dashboardService.getTeacherSchedules(
          {},
          { signal: controller.signal }
        );
        setSchedules(data);

        // Default to first class found if any
        if (data.length > 0 && !selectedClassId) {
          // Sort by day or something if needed, but for now just pick the first one's class
          const firstClassParams = data.find((s: any) => s.class_id)?.class_id;
          if (firstClassParams) setSelectedClassId(firstClassParams.toString());
        }
      } catch (error: any) {
        if (!isCancellation(error)) {
          console.error("Failed to fetch schedules", error);
        }
      }
    };
    fetchSchedules();
    return () => controller.abort();
  }, []);

  // Extract unique classes from schedules
  const availableClasses = useMemo(() => {
    const classes = new Map();
    schedules.forEach(s => {
      if (s.class && s.class.id) {
        classes.set(s.class.id.toString(), s.class.name);
      }
    });
    return Array.from(classes.entries()).map(([id, name]) => ({ id, name }));
  }, [schedules]);



  // Get selected class name
  const selectedClassName = useMemo(() => {
    return availableClasses.find(c => c.id === selectedClassId)?.name || "Pilih Kelas";
  }, [availableClasses, selectedClassId]);



  return (
    <GuruLayout
      pageTitle="Jadwal Kelas"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            background: "#0B2948",
            borderRadius: 12,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 21H21M5 21V7L13 2L21 7V21M5 21H9M21 21H17M9 21V13H15V21M9 21H15"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div>
              <div style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 700, marginBottom: 4 }}>
                {selectedClassName}
              </div>
              <div style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px", fontWeight: 500 }}>
                {/* Wali kelas info not readily available in schedule object, omitted for now or fetch if crucial */}
                Tahun Ajaran Aktif
              </div>
            </div>
            <div>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{
                  background: "white",
                  color: "#0F172A",
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  padding: "8px 12px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {availableClasses.length === 0 && <option value="">Tidak ada jadwal</option>}
                {availableClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <img
            src={DummyJadwal}
            alt="Jadwal Pelajaran"
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '1200px', // Optional: limit max width if image is too large
              borderRadius: '8px'
            }}
          />
        </div>
      </div>
    </GuruLayout>
  );
}