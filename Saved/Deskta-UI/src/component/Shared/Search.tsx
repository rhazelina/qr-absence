import { Search } from "lucide-react";

interface SearchBoxProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
}

export function SearchBox({
  placeholder = "Cari...",
  value,
  onChange,
  onSearch,
}: SearchBoxProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "#E5E7EB",
        padding: "8px 12px",
        borderRadius: "6px",
        width: "70%",
      }}
    >
      <Search size={16} color="#6B7280" strokeWidth={2} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter" && onSearch) {
            onSearch(value);
          }
        }}
        style={{
          flex: 1,
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
          fontSize: "14px",
          color: "#1F2937",
        }}
      />
    </div>
  );
}
