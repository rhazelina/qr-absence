interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Pilih...",
}: SelectProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {label && (
        <label
          style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 12px",
          border: "1px solid #D1D5DB",
          borderRadius: "6px",
          fontSize: "14px",
          backgroundColor: "white",
          color: "#1F2937",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
