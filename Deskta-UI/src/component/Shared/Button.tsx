import type { ReactNode } from "react";

interface ButtonProps {
  label: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}

export function Button({
  label,
  icon,
  iconPosition = "left",
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  style,
}: ButtonProps) {
  const baseStyles = {
    primary: {
      backgroundColor: "#2563EB",
      color: "white",
      border: "none",
    },
    secondary: {
      backgroundColor: "#6B7280",
      color: "white",
      border: "none",
    },
    danger: {
      backgroundColor: "#DC2626",
      color: "white",
      border: "none",
    },
  };

  const sizeStyles = {
    sm: { padding: "6px 12px", fontSize: "12px" },
    md: { padding: "10px 20px", fontSize: "14px" },
    lg: { padding: "12px 24px", fontSize: "16px" },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyles[variant],
        ...sizeStyles[size],
        borderRadius: "8px",
        fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.2s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        ...style,
      }}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        }
      }}
    >
      {icon && iconPosition === "left" && (
        <span style={{ display: "inline-flex" }}>{icon}</span>
      )}
      {label}
      {icon && iconPosition === "right" && (
        <span style={{ display: "inline-flex" }}>{icon}</span>
      )}
    </button>
  );
}
