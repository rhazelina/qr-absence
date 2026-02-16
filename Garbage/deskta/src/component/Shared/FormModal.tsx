import { type ReactNode } from "react";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  titleStyle?: React.CSSProperties;
  showSubmitButton?: boolean;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  maxHeight?: string;
  topOffset?: string;
  bottomMargin?: string; // ⬅️ TAMBAH PROP BARU untuk margin bawah
  onReset?: () => void;
  resetLabel?: string;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = "Tambahkan",
  isSubmitting = false,
  titleStyle = {},
  showSubmitButton = true,
  style,
  contentStyle,
  // ⬇️ JARAK ATAS: TETAP atau SEDIKIT DITAMBAH
  topOffset = "14vh",
  // ⬇️ TINGGI MODAL: DITAMBAH BANYAK untuk lebih panjang ke bawah
  maxHeight = "83vh", // ⬅️ DARI 55vh KE 85vh (30% lebih tinggi!)
  // ⬇️ MARGIN BAWAH: TAMBAH untuk ruang di bawah modal
  // ⬇️ MARGIN BAWAH: TAMBAH untuk ruang di bawah modal
  bottomMargin = "20px",
  onReset,
  resetLabel = "Reset",
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "flex-start", // ⬅️ PENTING: flex-start
        justifyContent: "center",
        zIndex: 9999,
        // ⬇️ JARAK ATAS: TETAP, TAMBAH MARGIN BAWAH
        padding: `${topOffset} 20px ${bottomMargin} 20px`, // ⬅️ Tambah bottomMargin
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          // ⬇️ TINGGI: DITAMBAH BANYAK!
          maxHeight: maxHeight, // ⬅️ SEKARANG 85vh (sangat tinggi!)
          display: "flex",
          flexDirection: "column",
          border: "3px solid #1e40af",
          borderRadius: "16px",
          overflow: "hidden",
          backgroundColor: "white",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#0f172a",
            color: "white",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            borderBottom: "3px solid #1e40af",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              margin: 0,
              ...titleStyle,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              padding: "0",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            type="button"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content - AREA KONTEN LEBIH BESAR */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            // ⬇️ AREA KONTEN: DITAMBAH KARENA MODAL LEBIH TINGGI
            maxHeight: `calc(${maxHeight} - 130px)`, // ⬅️ Untuk header+footer
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{
              padding: "24px",
              backgroundColor: "white",
              // ⬇️ MINIMAL HEIGHT: TAMBAH agar konten cukup panjang
              minHeight: "350px",
              ...contentStyle,
            }}>
              {children}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            backgroundColor: "white",
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            borderTop: "1px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "2px solid #1e40af",
              backgroundColor: "white",
              color: "#1e40af",
              fontWeight: "600",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontSize: "14px",
              minWidth: "100px",
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            Batal
          </button>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={isSubmitting}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "2px solid #ea580c", // Orange for reset
                backgroundColor: "white",
                color: "#ea580c",
                fontWeight: "600",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "14px",
                minWidth: "100px",
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              {resetLabel}
            </button>
          )}
          {showSubmitButton && (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#1e40af",
                color: "white",
                fontWeight: "600",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "14px",
                minWidth: "100px",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Menyimpan..." : submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}