import type { ReactNode } from "react";
import { Edit, Trash2, Eye } from "lucide-react";

interface Column {
  key: string;
  label: ReactNode;
  render?: (value: any, row: any) => ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  emptyMessage?: string;
  keyField?: string;
}

export function Table({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  emptyMessage = "Data tidak ditemukan",
  keyField = "id",
}: TableProps) {
  const hasActions = onEdit || onDelete || onView;

  if (data.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "48px 24px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}></div>
        <p style={{ color: "#6B7280", fontSize: "16px" }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "600px",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#F3F4F6",
                borderBottom: "2px solid #E5E7EB",
              }}
            >
              <th
                style={{
                  padding: "16px",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  width: "50px",
                }}
              >
                No
              </th>

              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  {col.label}
                </th>
              ))}

              {hasActions && (
                <th
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    width: "120px",
                  }}
                >
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row[keyField] || idx}
                style={{
                  borderBottom: "1px solid #E5E7EB",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  (
                    e.currentTarget as HTMLTableRowElement
                  ).style.backgroundColor = "#F9FAFB";
                }}
                onMouseLeave={(e) => {
                  (
                    e.currentTarget as HTMLTableRowElement
                  ).style.backgroundColor = "transparent";
                }}
              >
                <td
                  style={{
                    padding: "16px",
                    fontSize: "14px",
                    color: "#1F2937",
                  }}
                >
                  {idx + 1}
                </td>

                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "16px",
                      fontSize: "14px",
                      color: "#1F2937",
                    }}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] || "-")}
                  </td>
                ))}

                {hasActions && (
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      display: "flex",
                      gap: "4px",
                      justifyContent: "center",
                    }}
                  >
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Edit"
                      >
                        <Edit size={18} strokeWidth={2} color="#1F2937" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Delete"
                      >
                        <Trash2 size={18} strokeWidth={2} color="#1F2937" />
                      </button>
                    )}
                    {onView && (
                      <button
                        onClick={() => onView(row)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="View"
                      >
                        <Eye size={18} strokeWidth={2} color="#1F2937" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
