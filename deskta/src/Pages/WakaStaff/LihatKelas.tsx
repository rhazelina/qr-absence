// src/Pages/WakaStaff/LihatKelas.tsx
import { useState, useEffect } from "react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { ArrowLeft, Loader2 } from "lucide-react";
import DummyJadwal from "../../assets/Icon/DummyJadwal.png";
import { masterService } from "../../services/masterService";

interface Props {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  kelasId?: string;
  kelas?: string;
  waliKelas?: string;
  jadwalImage?: string;
  onBack?: () => void;
}

export default function LihatKelas({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  kelasId,
  kelas = "X Mekatronika 1",
  waliKelas = "-",
  jadwalImage,
  onBack,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!kelasId) return;

    const fetchClassDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await masterService.getClassById(kelasId);
        setClassData(response?.data || response || null);
      } catch (err: any) {
        setError(err?.message || "Gagal memuat detail kelas.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetail();
  }, [kelasId]);

  useEffect(() => {
    setImageError(false);
  }, [jadwalImage, classData]);

  const handleImageError = () => {
    setImageError(true);
  };

  const withCacheBuster = (url?: string | null, version?: string) => {
    if (!url) return url;
    if (url.includes("t=") || url.includes("v=")) return url;
    const suffix = version ? `v=${encodeURIComponent(version)}` : `t=${Date.now()}`;
    return `${url}${url.includes("?") ? "&" : "?"}${suffix}`;
  };

  const resolvedClassName = classData?.name || classData?.class_name || kelas;
  const resolvedHomeroom = classData?.homeroom_teacher_name || waliKelas || "-";
  const resolvedMajor = classData?.major_name || classData?.major?.name || classData?.major?.code || "-";
  const resolvedImage = withCacheBuster(
    classData?.schedule_image_url || jadwalImage,
    classData?.updated_at
  );

  return (
    <StaffLayout
      pageTitle="Jadwal Kelas"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {onBack && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={onBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 8,
                border: "2px solid #0B2948",
                background: "#FFFFFF",
                fontWeight: 600,
                fontSize: 14,
                color: "#0B2948",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0B2948";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
                e.currentTarget.style.color = "#0B2948";
              }}
            >
              <ArrowLeft size={18} />
              <span>Kembali</span>
            </button>
          </div>
        )}

        <div
          style={{
            background: "#0B2948",
            borderRadius: 20,
            padding: "22px 28px",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          {resolvedClassName}
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: "14px 16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13, color: "#64748B" }}>
            Wali Kelas
            <div style={{ fontSize: 14, color: "#111827", fontWeight: 700, marginTop: 2 }}>
              {resolvedHomeroom}
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#64748B" }}>
            Konsentrasi Keahlian
            <div style={{ fontSize: 14, color: "#111827", fontWeight: 700, marginTop: 2 }}>
              {resolvedMajor}
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#64748B" }}>
            Catatan
            <div style={{ fontSize: 14, color: "#111827", fontWeight: 600, marginTop: 2 }}>
              Jadwal ditampilkan sebagai gambar (PNG / JPG / JPEG)
            </div>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: 14, padding: 16 }}>
          {loading ? (
            <div
              style={{
                width: "100%",
                minHeight: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 10,
                color: "#6B7280",
              }}
            >
              <Loader2 size={28} className="animate-spin" />
              <span>Memuat detail kelas...</span>
            </div>
          ) : error ? (
            <div
              style={{
                width: "100%",
                minHeight: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#B91C1C",
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          ) : imageError || !resolvedImage ? (
            <div
              style={{
                width: "100%",
                maxWidth: 1200,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 400,
                backgroundColor: "#F3F4F6",
                borderRadius: 8,
                border: "2px dashed #D1D5DB",
              }}
            >
              <img
                src={DummyJadwal}
                alt="Jadwal Kelas"
                style={{ width: "100%", maxWidth: 1200, display: "block" }}
              />
            </div>
          ) : (
            <img
              src={`${resolvedImage}${resolvedImage.includes('?') ? '&' : '?'}t=${Date.now()}`}
              alt="Jadwal Kelas"
              style={{
                width: "100%",
                maxWidth: 1200,
                margin: "0 auto",
                display: "block",
                borderRadius: 8,
              }}
              onError={handleImageError}
            />
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
