import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Modal } from "../Modal";

type PopupType = "alert" | "confirm" | "prompt";

interface PopupOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  defaultValue?: string;
}

interface PopupState extends PopupOptions {
  type: PopupType;
}

interface PopupContextValue {
  alert: (message: string, options?: Omit<PopupOptions, "message">) => Promise<void>;
  confirm: (message: string, options?: Omit<PopupOptions, "message">) => Promise<boolean>;
  prompt: (message: string, options?: Omit<PopupOptions, "message">) => Promise<string | null>;
}

const PopupContext = createContext<PopupContextValue | null>(null);

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) {
    throw new Error("usePopup must be used within PopupProvider");
  }
  return ctx;
}

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const resolverRef = useRef<((value: unknown) => void) | null>(null);

  const openPopup = useCallback((next: PopupState) => {
    return new Promise<unknown>((resolve) => {
      resolverRef.current = resolve;
      setPopup(next);
      if (next.type === "prompt") {
        setPromptValue(next.defaultValue ?? "");
      }
    });
  }, []);

  const closePopup = useCallback((value: unknown) => {
    setPopup(null);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(value);
  }, []);

  const alert = useCallback(
    (message: string, options?: Omit<PopupOptions, "message">) =>
      openPopup({
        type: "alert",
        message,
        ...options,
      }).then(() => undefined),
    [openPopup]
  );

  const confirm = useCallback(
    (message: string, options?: Omit<PopupOptions, "message">) =>
      openPopup({
        type: "confirm",
        message,
        ...options,
      }).then((value) => Boolean(value)),
    [openPopup]
  );

  const prompt = useCallback(
    (message: string, options?: Omit<PopupOptions, "message">) =>
      openPopup({
        type: "prompt",
        message,
        ...options,
      }).then((value) => (typeof value === "string" ? value : null)),
    [openPopup]
  );

  const value = useMemo<PopupContextValue>(
    () => ({
      alert,
      confirm,
      prompt,
    }),
    [alert, confirm, prompt]
  );

  const isPrompt = popup?.type === "prompt";
  const title = popup?.title || (popup?.type === "confirm" ? "Konfirmasi" : "Pemberitahuan");

  const handleCancel = () => {
    if (!popup) return;
    if (popup.type === "confirm") {
      closePopup(false);
    } else if (popup.type === "prompt") {
      closePopup(null);
    } else {
      closePopup(undefined);
    }
  };

  const handleConfirm = () => {
    if (!popup) return;
    if (popup.type === "confirm") {
      closePopup(true);
    } else if (popup.type === "prompt") {
      closePopup(promptValue);
    } else {
      closePopup(undefined);
    }
  };

  return (
    <PopupContext.Provider value={value}>
      {children}
      <Modal isOpen={Boolean(popup)} onClose={handleCancel}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "20px 22px",
            border: "1px solid #E2E8F0",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{title}</div>
          <div style={{ marginTop: 10, fontSize: 14, color: "#475569", whiteSpace: "pre-wrap" }}>
            {popup?.message}
          </div>
          {isPrompt && (
            <input
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              placeholder={popup?.placeholder}
              autoFocus
              style={{
                marginTop: 14,
                width: "100%",
                borderRadius: 10,
                border: "1px solid #CBD5E1",
                padding: "10px 12px",
                fontSize: 14,
                color: "#0F172A",
                outline: "none",
                background: "#F8FAFC",
              }}
            />
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 18,
            }}
          >
            {popup?.type !== "alert" && (
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  color: "#0F172A",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {popup?.cancelText || "Batal"}
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "none",
                background: "#2563EB",
                color: "#FFFFFF",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {popup?.confirmText || "OK"}
            </button>
          </div>
        </div>
      </Modal>
    </PopupContext.Provider>
  );
}
