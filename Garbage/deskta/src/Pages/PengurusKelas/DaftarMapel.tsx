import { useMemo, useState } from "react";
import { CalendarDays, School, BookOpen, QrCode, Plus } from "lucide-react";
import { Modal } from "../../component/Shared/Modal";
import { QRCodeSVG } from "qrcode.react";

type Mapel = { id: string; name: string; kelas: string };



function formatDDMMYYYY(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

export default function DaftarMapel() {
  const [mapelList] = useState<Mapel[]>([
    { id: "1", name: "Matematika", kelas: "XII Mekatronika 2" },
    { id: "2", name: "Bahasa Indonesia", kelas: "XII Mekatronika 2" },
    { id: "3", name: "Bahasa Inggris", kelas: "XII Mekatronika 2" },
    { id: "4", name: "Kejuruan", kelas: "XII Mekatronika 2" },
  ]);
  const today = useMemo(() => new Date(), []);
  const todayStr = formatDDMMYYYY(today);

  const kelasInfo = {
    namaKelas: "X Mekatronika 1",
    waliKelas: "Ewit Erniyah S.pd",
  };

  const [selectedMapel, setSelectedMapel] = useState<Mapel | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleGenerateQr = (m: Mapel) => {
    setSelectedMapel(m);
    setIsQrModalOpen(true);
  };

  const qrData = selectedMapel
    ? `ABSENSI-${selectedMapel.id}-${new Date()
        .toISOString()
        .split("T")[0]}`
    : "";

  return (
    <div style={{ padding: "22px 24px 28px" }}>
      {/* Tanggal */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 10,
          background: "#D1D5DB",
          color: "#0F172A",
          fontWeight: 800,
          boxShadow: "0 2px 0 rgba(0,0,0,0.10)",
        }}
      >
        <CalendarDays size={22} />
        <span>{todayStr}</span>
      </div>

      {/* Box Kelas */}
      <div
        style={{
          marginTop: 12,
          width: 330,
          background: "#062A4A",
          borderRadius: 10,
          padding: "14px 14px",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "rgba(255,255,255,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <School size={20} color="#fff" />
        </div>

        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{kelasInfo.namaKelas}</div>
          <div style={{ fontWeight: 600, opacity: 0.9, marginTop: 4 }}>{kelasInfo.waliKelas}</div>
        </div>
      </div>

      {/* List Mapel */}
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
        {mapelList.map((m) => (
          <div
            key={m.id}
            style={{
              background: "#FFFFFF",
              borderRadius: 10,
              border: "2px solid #D1D5DB",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 3px 0 rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* icon kiri */}
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  background: "#2F80ED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BookOpen size={22} color="#fff" />
              </div>

              {/* text */}
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A" }}>{m.name}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", opacity: 0.8, marginTop: 4 }}>
                  {m.kelas}
                </div>
              </div>
            </div>

            {/* icon QR + plus kanan */}
            <button
              type="button"
              onClick={() => handleGenerateQr(m)}
              aria-label="Generate QR"
              style={{
                width: 54,
                height: 54,
                borderRadius: 12,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              <span style={{ position: "relative", width: 26, height: 26, display: "inline-block" }}>
                <QrCode size={26} color="#0F172A" />
                <span style={{ position: "absolute", right: -8, bottom: -8 }}>
                  <Plus size={16} color="#0F172A" />
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal QR - DENGAN BACKGROUND PUTIH */}
      <Modal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)}
        maxWidth="380px"
      >
        <div style={{ 
          padding: "24px",
          background: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h3 style={{ 
              fontSize: 20, 
              fontWeight: 800, 
              color: "#0F172A", 
              marginBottom: 8
            }}>
              KODE QR UNTUK PRESENSI
            </h3>
            
            <div style={{ 
              fontSize: 14, 
              color: "#64748B",
              marginBottom: 4
            }}>
              {selectedMapel?.name}
            </div>
            
            <div style={{ 
              fontSize: 13, 
              color: "#64748B",
              fontWeight: 600
            }}>
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          {/* QR Code */}
          <div style={{ 
            padding: 20,
            marginBottom: 24,
            textAlign: "center",
            background: "#F8FAFC",
            borderRadius: "12px",
            border: "1px solid #E5E7EB"
          }}>
            {selectedMapel && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <QRCodeSVG 
                  value={qrData} 
                  size={250}
                  level="H"
                  includeMargin={true}
                  fgColor="#2F80ED"
                />
              </div>
            )}
          </div>

          {/* Tombol Tutup */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => setIsQrModalOpen(false)}
              style={{
                padding: "12px 40px",
                background: "#0F172A",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 15,
                width: "100%",
                maxWidth: "200px"
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}