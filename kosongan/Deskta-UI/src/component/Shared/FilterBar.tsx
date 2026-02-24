import type { ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "24px",
        flexWrap: "wrap",
        alignItems: "flex-end",
      }}
    >
      {children}
    </div>
  );
}

interface FilterItemProps {
  icon?: string;
  label: string;
  value: string;
  onClick?: () => void;
  iconComponent?: ReactNode;
}

export function FilterItem({
  icon,
  label,
  value,
  onClick,
  iconComponent,
}: FilterItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 16px",
        backgroundColor: "#E5E7EB",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        color: "#1F2937",
        fontWeight: "500",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "#D1D5DB";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "#E5E7EB";
      }}
    >
      {iconComponent ||
        (icon && <span style={{ fontSize: "18px" }}>{icon}</span>)}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "12px", color: "#6B7280" }}>{label}</span>
        <span style={{ fontSize: "14px", fontWeight: "600" }}>{value}</span>
      </div>
    </button>
  );
}
