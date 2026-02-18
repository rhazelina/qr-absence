// src/Pages/WakaStaff/components/ScheduleDetail.tsx

type Cell = { label: string; sub?: string };
type ScheduleGrid = Cell[][]; // [row][col]

interface Props {
  title: string;
  subtitle?: string;
  pills?: string[];
  headers: string[]; // kolom (mis. jam ke-1,2,3,..)
  rows: string[]; // baris (mis. Senin..Sabtu)
  grid: ScheduleGrid; // sama panjang dengan rows x headers
}

export function ScheduleDetail({
  title,
  subtitle,
  pills = [],
  headers,
  rows,
  grid,
}: Props) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
        padding: 16,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h2>
        {subtitle && (
          <p style={{ margin: "4px 0", color: "#475569" }}>{subtitle}</p>
        )}
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}
        >
          {pills.map((p) => (
            <span
              key={p}
              style={{
                padding: "6px 10px",
                borderRadius: 10,
                background: "#0f172a",
                color: "#fff",
                fontSize: 12,
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{ borderCollapse: "collapse", minWidth: 700, width: "100%" }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #e2e8f0",
                  padding: 8,
                  background: "#f8fafc",
                }}
              >
                Hari
              </th>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    border: "1px solid #e2e8f0",
                    padding: 8,
                    background: "#f8fafc",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                <td
                  style={{
                    border: "1px solid #e2e8f0",
                    padding: 8,
                    fontWeight: 600,
                  }}
                >
                  {r}
                </td>
                {grid[ri].map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      border: "1px solid #e2e8f0",
                      padding: 8,
                      background: "#e5e7eb",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{cell.label}</div>
                    {cell.sub && (
                      <div style={{ fontSize: 12, color: "#475569" }}>
                        {cell.sub}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
