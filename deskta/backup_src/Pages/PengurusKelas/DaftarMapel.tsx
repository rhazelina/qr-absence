import { useMemo, useState } from "react";
import { CalendarDays, School, BookOpen, QrCode, Plus } from "lucide-react";
import { Modal } from "../../component/Shared/Modal";

type Mapel = { id: string; name: string; kelas: string };

const mapelList: Mapel[] = [
  { id: "1", name: "Matematika", kelas: "XII Mekatronika 2" },
  { id: "2", name: "Matematika", kelas: "XII Mekatronika 2" },
  { id: "3", name: "Matematika", kelas: "XII Mekatronika 2" },
  { id: "4", name: "Matematika", kelas: "XII Mekatronika 2" },
];

function formatDDMMYYYY(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

export default function DaftarMapel() {
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

  const qrUrl = selectedMapel
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ABSENSI-${selectedMapel.id}-${new Date()
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

      {/* Modal QR */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)}>
        <div style={{ textAlign: "center", padding: 10 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
            QR Code Absensi
          </h3>
          <p style={{ color: "#64748B", marginBottom: 18 }}>
            {selectedMapel?.name} -{" "}
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <div
            style={{
              background: "#fff",
              padding: 18,
              borderRadius: 12,
              border: "2px dashed #CBD5E1",
              display: "inline-block",
              marginBottom: 18,
            }}
          >
            {selectedMapel && <img src={qrUrl} alt="QR Code" style={{ width: 250, height: 250, display: "block" }} />}
          </div>

          <button
            onClick={() => setIsQrModalOpen(false)}
            style={{
              padding: "10px 26px",
              background: "#0F172A",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Tutup
          </button>
        </div>
      </Modal>
    </div>
  );
}
