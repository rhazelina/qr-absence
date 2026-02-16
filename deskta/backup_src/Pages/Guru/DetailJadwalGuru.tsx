import { useMemo, useState } from "react";
import GuruLayout from "../../component/Guru/GuruLayout";

interface LihatJadwalGuruProps {
  user: { name: string; role: string };
  currentPage: string;
  onMenuClick: (page: string) => void;
  onLogout: () => void;
}

type Cell = { label: string; sub?: string };
type ScheduleGrid = Cell[][];

const SUBJECT_COLORS: Record<string, string> = {
  MTK: "#bbf7d0",     
  FISIKA: "#fecaca", 
  KIMIA: "#e9d5ff",   
  BIOLOGI: "#bfdbfe", 
  "B.IND": "#fef3c7", 
  "B.ING": "#fed7aa", 
};

export default function LihatJadwalGuru({
  user,
  currentPage,
  onMenuClick,
  onLogout,
}: LihatJadwalGuruProps) {
  const [selectedClass, setSelectedClass] = useState<string>("X Mekatronika 1");

  const CLASS_CONFIG: Record<string, { waliKelas: string; timeSlots: string[] }> = {
    "X Mekatronika 1": {
      waliKelas: "Ewit Erniyah S.pd",
      timeSlots: Array.from({ length: 10 }, (_, i) => {
        const start = 7 + i;
        const end = 8 + i;
        return `${start.toString().padStart(2, "0")}.00-${end.toString().padStart(2, "0")}.00`;
      }),
    },
    "XI Mekatronika 2": {
      waliKelas: "Wali Kelas XI Mekatronika 2",
      timeSlots: Array.from({ length: 9 }, (_, i) => {
        const start = 7 + i;
        const end = 8 + i;
        return `${start.toString().padStart(2, "0")}.00-${end.toString().padStart(2, "0")}.00`;
      }),
    },
    "XII Mekatronika 2": {
      waliKelas: "Wali Kelas XII Mekatronika 2",
      timeSlots: Array.from({ length: 8 }, (_, i) => {
        const start = 7 + i;
        const end = 8 + i;
        return `${start.toString().padStart(2, "0")}.00-${end.toString().padStart(2, "0")}.00`;
      }),
    },
    "XII Mekatronika 1": {
      waliKelas: "Wali Kelas XII Mekatronika 1",
      timeSlots: Array.from({ length: 12 }, (_, i) => {
        const start = 7 + i;
        const end = 8 + i;
        return `${start.toString().padStart(2, "0")}.00-${end.toString().padStart(2, "0")}.00`;
      }),
    },
  };

  const kelasInfo = {
    namaKelas: selectedClass,
    waliKelas: CLASS_CONFIG[selectedClass]?.waliKelas || "-",
  };

  const waktuJadwal = useMemo(() => {
    const cfg = CLASS_CONFIG[selectedClass];
    return cfg ? cfg.timeSlots : [];
  }, [selectedClass]);

  const headers = useMemo(() => Array.from({ length: waktuJadwal.length }, (_, i) => (i + 1).toString()), [waktuJadwal.length]);
  const rows = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const grid: ScheduleGrid = useMemo(() => {
    const schedule: ScheduleGrid = [];
    for (let i = 0; i < rows.length; i++) {
      schedule[i] = [];
      for (let j = 0; j < headers.length; j++) {
        schedule[i][j] = { label: "", sub: "" };
      }
    }

    // Senin
    schedule[0][0] = { label: "MTK", sub: "RR.Henning Gratyanis S.pd" };
    schedule[0][2] = { label: "FISIKA", sub: "RR.Henning Gratyanis S.pd" };
    schedule[0][4] = { label: "KIMIA", sub: "RR.Henning Gratyanis S.pd" };
    schedule[0][6] = { label: "BIOLOGI", sub: "RR.Henning Gratyanis S.pd" };

    // Selasa
    schedule[1][0] = { label: "B.IND", sub: "RR.Henning Gratyanis S.pd" };
    schedule[1][2] = { label: "MTK", sub: "RR.Henning Gratyanis S.pd" };
    schedule[1][4] = { label: "B.ING", sub: "RR.Henning Gratyanis S.pd" };
    schedule[1][6] = { label: "FISIKA", sub: "RR.Henning Gratyanis S.pd" };

    // Rabu
    schedule[2][0] = { label: "KIMIA", sub: "RR.Henning Gratyanis S.pd" };
    schedule[2][3] = { label: "BIOLOGI", sub: "RR.Henning Gratyanis S.pd" };
    schedule[2][6] = { label: "MTK", sub: "RR.Henning Gratyanis S.pd" };

    return schedule;
  }, []);

  return (
    <GuruLayout
      pageTitle="Jadwal Kelas"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            background: "#0B2948",
            borderRadius: 12,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 21H21M5 21V7L13 2L21 7V21M5 21H9M21 21H17M9 21V13H15V21M9 21H15"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div>
              <div style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 700, marginBottom: 4 }}>
                {kelasInfo.namaKelas}
              </div>
              <div style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px", fontWeight: 500 }}>
                {kelasInfo.waliKelas}
              </div>
            </div>
            <div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{
                  background: "white",
                  color: "#0F172A",
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  padding: "8px 12px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {Object.keys(CLASS_CONFIG).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                minWidth: 160 + headers.length * 120,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #E2E8F0",
                      padding: "12px 16px",
                      background: "#F8FAFC",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#0F172A",
                      textAlign: "left",
                    }}
                  >
                    Hari
                  </th>
                  {headers.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        border: "1px solid #E2E8F0",
                        padding: "12px 8px",
                        background: "#F8FAFC",
                        fontWeight: 700,
                        fontSize: "14px",
                        color: "#0F172A",
                        textAlign: "center",
                        minWidth: 100,
                      }}
                    >
                      <div>{h}</div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          color: "#64748B",
                          marginTop: 4,
                        }}
                      >
                        ({waktuJadwal[i]})
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    <td
                      style={{
                        border: "1px solid #E2E8F0",
                        padding: "12px 16px",
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#0F172A",
                        background: "#FFFFFF",
                      }}
                    >
                      {row}
                    </td>
                    {grid[ri].map((cell, ci) => (
                      <td
                        key={ci}
                        style={{
                          border: "1px solid #E2E8F0",
                          padding: "12px 8px",
                          background: cell.label
                            ? SUBJECT_COLORS[cell.label] || "#E5E7EB"
                            : "#FFFFFF",
                          textAlign: "center",
                          verticalAlign: "top",
                        }}
                      >
                        {cell.label && (
                          <>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: "14px",
                                color: "#0F172A",
                                marginBottom: 4,
                              }}
                            >
                              {cell.label}
                            </div>
                            {cell.sub && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#475569",
                                  fontWeight: 500,
                                }}
                              >
                                {cell.sub}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}



// ====== LEGACY CODE - DO NOT DELETE ======
// import { useMemo, useState } from "react";
// import GuruLayout from "../../component/Guru/GuruLayout";

// interface LihatJadwalGuruProps {
//   user: { name: string; role: string };
//   currentPage: string;
//   onMenuClick: (page: string) => void;
//   onLogout: () => void;
// }

// type Cell = { label: string; sub?: string };
// type ScheduleGrid = Cell[][];

// const SUBJECT_COLORS: Record<string, string> = {
//   MTK: "#bbf7d0",      // hijau muda
//   FISIKA: "#fecaca",  // merah muda
//   KIMIA: "#e9d5ff",   // ungu muda
//   BIOLOGI: "#bfdbfe", // biru muda
//   "B.IND": "#fef3c7", // kuning muda
//   "B.ING": "#fed7aa", // oranye muda
// };

// export default function LihatJadwalGuru({
//   user,
//   currentPage,
//   onMenuClick,
//   onLogout,
// }: LihatJadwalGuruProps) {
//   const [selectedClass, setSelectedClass] = useState<string>("X Mekatronika 1");

//   const CLASS_CONFIG: Record<string, { waliKelas: string; timeSlots: string[] }> = {
//     "X Mekatronika 1": {
//       waliKelas: "Ewit Erniyah S.pd",
//       timeSlots: Array.from({ length: 10 }, (_, i) => {
//         const start = 7 + i;
//         const end = 8 + i;
//         return `${start.toString().padStart(2, "0")}.00-${end.toString().padStart(2, "0")}.00`;
//       }),
//     },
//     "XI Mekatronika 2": {
//       waliKelas: "Wali Kelas XI Mekatronika 2",
//       timeSlots: Array.from({ length: 9 }, (_, i) => {
//         const start = 7 + i;
//         const end = 8 + i;
//         return `${start.toString().padStart(2, "0")}.00-${end.toString().padStart(2, "0")}.00`;
//       }),
//     },
//     "XII Mekatronika 2": {
//       waliKelas: "Wali Kelas XII Mekatronika 2",
//       timeSlots: Array.from({ length: 8 }, (_, i) => {
//         const start = 7 + i;
//         const end = 8 + i;
//         return `${start.toString().padStart(2, "0")}.00-${end.toString().padStart(2, "0")}.00`;
//       }),
//     },
//     "XII Mekatronika 1": {
//       waliKelas: "Wali Kelas XII Mekatronika 1",
//       timeSlots: Array.from({ length: 12 }, (_, i) => {
//         const start = 7 + i;
//         const end = 8 + i;
//         return `${start.toString().padStart(2, "0")}.00-${end.toString().padStart(2, "0")}.00`;
//       }),
//     },
//   };

//   const kelasInfo = {
//     namaKelas: selectedClass,
//     waliKelas: CLASS_CONFIG[selectedClass]?.waliKelas || "-",
//   };

//   const waktuJadwal = useMemo(() => {
//     const cfg = CLASS_CONFIG[selectedClass];
//     return cfg ? cfg.timeSlots : [];
//   }, [selectedClass]);

//   const headers = useMemo(() => Array.from({ length: waktuJadwal.length }, (_, i) => (i + 1).toString()), [waktuJadwal.length]);
//   const rows = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

//   const grid: ScheduleGrid = useMemo(() => {
//     const schedule: ScheduleGrid = [];
//     for (let i = 0; i < rows.length; i++) {
//       schedule[i] = [];
//       for (let j = 0; j < headers.length; j++) {
//         schedule[i][j] = { label: "", sub: "" };
//       }
//     }

//     // Senin
//     schedule[0][0] = { label: "MTK", sub: "RR.Henning Gratyanis S.pd" };
//     schedule[0][2] = { label: "FISIKA", sub: "RR.Henning Gratyanis S.pd" };
//     schedule[0][4] = { label: "KIMIA", sub: "RR.Henning Gratyanis S.pd" };
//     schedule[0][6] = { label: "BIOLOGI", sub: "RR.Henning Gratyanis S.pd" };

//     // Selasa
//     schedule[1][0] = { label: "B.IND", sub: "RR.Henning Gratyanis S.pd" };
//     schedule[1][2] = { label: "MTK", sub: "RR.Henning Gratyanis S.pd" };
//     schedule[1][4] = { label: "B.ING", sub: "RR.Henning Gratyanis S.pd" };
//     schedule[1][6] = { label: "FISIKA", sub: "RR.Henning Gratyanis S.pd" };

//     // Rabu
//     schedule[2][0] = { label: "KIMIA", sub: "RR.Henning Gratyanis S.pd" };
//     schedule[2][3] = { label: "BIOLOGI", sub: "RR.Henning Gratyanis S.pd" };
//     schedule[2][6] = { label: "MTK", sub: "RR.Henning Gratyanis S.pd" };

//     return schedule;
//   }, []);

//   return (
//     <GuruLayout
//       pageTitle="Jadwal Kelas"
//       currentPage={currentPage}
//       onMenuClick={onMenuClick}
//       user={user}
//       onLogout={onLogout}
//     >
//       <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
//         <div
//           style={{
//             background: "#0B2948",
//             borderRadius: 12,
//             padding: "20px 24px",
//             display: "flex",
//             alignItems: "center",
//             gap: 16,
//             boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//           }}
//         >
//           <div
//             style={{
//               width: 40,
//               height: 40,
//               borderRadius: 8,
//               background: "rgba(255, 255, 255, 0.1)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               flexShrink: 0,
//             }}
//           >
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//               <path
//                 d="M3 21H21M5 21V7L13 2L21 7V21M5 21H9M21 21H17M9 21V13H15V21M9 21H15"
//                 stroke="white"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </div>

//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
//             <div>
//               <div style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 700, marginBottom: 4 }}>
//                 {kelasInfo.namaKelas}
//               </div>
//               <div style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px", fontWeight: 500 }}>
//                 {kelasInfo.waliKelas}
//               </div>
//             </div>
//             <div>
//               <select
//                 value={selectedClass}
//                 onChange={(e) => setSelectedClass(e.target.value)}
//                 style={{
//                   background: "white",
//                   color: "#0F172A",
//                   borderRadius: 8,
//                   border: "1px solid #E2E8F0",
//                   padding: "8px 12px",
//                   fontSize: "14px",
//                   fontWeight: 600,
//                 }}
//               >
//                 {Object.keys(CLASS_CONFIG).map((k) => (
//                   <option key={k} value={k}>{k}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         <div
//           style={{
//             background: "#FFFFFF",
//             borderRadius: 12,
//             boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
//             overflow: "hidden",
//           }}
//         >
//           <div style={{ overflowX: "auto" }}>
//             <table
//               style={{
//                 borderCollapse: "collapse",
//                 width: "100%",
//                 minWidth: 160 + headers.length * 120,
//               }}
//             >
//               <thead>
//                 <tr>
//                   <th
//                     style={{
//                       border: "1px solid #E2E8F0",
//                       padding: "12px 16px",
//                       background: "#F8FAFC",
//                       fontWeight: 700,
//                       fontSize: "14px",
//                       color: "#0F172A",
//                       textAlign: "left",
//                     }}
//                   >
//                     Hari
//                   </th>
//                   {headers.map((h, i) => (
//                     <th
//                       key={i}
//                       style={{
//                         border: "1px solid #E2E8F0",
//                         padding: "12px 8px",
//                         background: "#F8FAFC",
//                         fontWeight: 700,
//                         fontSize: "14px",
//                         color: "#0F172A",
//                         textAlign: "center",
//                         minWidth: 100,
//                       }}
//                     >
//                       <div>{h}</div>
//                       <div
//                         style={{
//                           fontSize: "11px",
//                           fontWeight: 500,
//                           color: "#64748B",
//                           marginTop: 4,
//                         }}
//                       >
//                         ({waktuJadwal[i]})
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {rows.map((row, ri) => (
//                   <tr key={ri}>
//                     <td
//                       style={{
//                         border: "1px solid #E2E8F0",
//                         padding: "12px 16px",
//                         fontWeight: 600,
//                         fontSize: "14px",
//                         color: "#0F172A",
//                         background: "#FFFFFF",
//                       }}
//                     >
//                       {row}
//                     </td>
//                     {grid[ri].map((cell, ci) => (
//                       <td
//                         key={ci}
//                         style={{
//                           border: "1px solid #E2E8F0",
//                           padding: "12px 8px",
//                           background: cell.label
//                             ? SUBJECT_COLORS[cell.label] || "#E5E7EB"
//                             : "#FFFFFF",
//                           textAlign: "center",
//                           verticalAlign: "top",
//                         }}
//                       >
//                         {cell.label && (
//                           <>
//                             <div
//                               style={{
//                                 fontWeight: 700,
//                                 fontSize: "14px",
//                                 color: "#0F172A",
//                                 marginBottom: 4,
//                               }}
//                             >
//                               {cell.label}
//                             </div>
//                             {cell.sub && (
//                               <div
//                                 style={{
//                                   fontSize: "12px",
//                                   color: "#475569",
//                                   fontWeight: 500,
//                                 }}
//                               >
//                                 {cell.sub}
//                               </div>
//                             )}
//                           </>
//                         )}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </GuruLayout>
//   );
// }