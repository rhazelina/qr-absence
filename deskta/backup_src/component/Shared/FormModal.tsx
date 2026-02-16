import { type ReactNode } from "react";
import { Modal } from "./Modal";

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
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        style={{
          border: "3px solid #1e40af",
          borderRadius: "16px",
          overflow: "hidden",
        }}
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
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: 0, ...titleStyle }}>
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

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px", backgroundColor: "white" }}>
            {children}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "16px 24px",
              backgroundColor: "white",
              display: "flex",
              gap: "12px",
              justifyContent: "center",
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
            {showSubmitButton && (
              <button
                type="submit"
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
        </form>
      </div>
    </Modal>
  );
}

