import { useState } from 'react';
import WalikelasLayout from '../../component/Walikelas/layoutwakel';
import { FilterBar, FilterItem } from '../../component/Shared/FilterBar';
import { StatusBadge } from '../../component/Shared/StatusBadge';
import { FileText } from 'lucide-react';

interface InputAbsenWalikelasProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

interface Siswa {
  id: string;
  nisn: string;
  nama: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpha' | null;
}

export function InputAbsenWalikelas({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: InputAbsenWalikelasProps) {
  const selectedKelas = 'XII Mekatronika 2';
  const selectedJam = 'Jam Ke-1';
  const selectedTanggal = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const [siswaList, setSiswaList] = useState<Siswa[]>([
    { id: '1', nisn: '1348576392', nama: 'Wito Suherman Suhermin', status: null },
    { id: '2', nisn: '1348576393', nama: 'Ahmad Fauzi', status: null },
    { id: '3', nisn: '1348576394', nama: 'Siti Nurhaliza', status: null },
    { id: '4', nisn: '1348576395', nama: 'Budi Santoso', status: null },
    { id: '5', nisn: '1348576396', nama: 'Dewi Sartika', status: null },
    { id: '6', nisn: '1348576397', nama: 'Rizki Ramadhan', status: null },
  ]);

  const handleStatusChange = (id: string, status: Siswa['status']) => {
    setSiswaList(siswaList.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleSimpan = () => {
    const siswaWithStatus = siswaList.filter((s) => s.status !== null);
    if (siswaWithStatus.length === 0) {
      alert('Pilih status untuk minimal satu siswa!');
      return;
    }
    alert(`Data kehadiran berhasil disimpan untuk ${siswaWithStatus.length} siswa!`);
    onMenuClick('dashboard');
  };

  const handleBatal = () => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan? Perubahan tidak akan disimpan.')) {
      onMenuClick('dashboard');
    }
  };

  return (
    <WalikelasLayout
      pageTitle="Input Manual"
      currentPage={currentPage as any}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header  */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            padding: '20px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#2563EB',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={28} color="white" strokeWidth={2} />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '4px' }}>
              Input Manual Kehadiran
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              Pilih status kehadiran untuk setiap siswa
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ marginBottom: '24px' }}>
          <FilterBar>
            <FilterItem
              icon=""
              label="Kelas"
              value={`${selectedKelas}\n${selectedJam}`}
              onClick={() => alert('Pilih Kelas - Belum diimplementasikan')}
            />
            <FilterItem
              icon=""
              label="Jam"
              value={selectedJam}
              onClick={() => alert('Pilih Jam - Belum diimplementasikan')}
            />
            <FilterItem
              icon=""
              label="Tanggal"
              value={selectedTanggal}
              onClick={() => alert('Pilih Tanggal - Belum diimplementasikan')}
            />
          </FilterBar>
        </div>

        {/* Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
            marginBottom: '24px',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px' }}>No</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px' }}>NISN</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px' }}>Nama Siswa</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '100px' }}>Hadir</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '100px' }}>Sakit</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '100px' }}>Izin</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '100px' }}>Alpha</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '120px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {siswaList.map((siswa, idx) => (
                  <tr
                    key={siswa.id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      transition: 'background-color 0.2s',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#F3F4F6'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB'; }}
                  >
                    <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{idx + 1}</td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#374151', fontWeight: '400' }}>{siswa.nisn}</td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{siswa.nama}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <input type="radio" name={`status-${siswa.id}`} checked={siswa.status === 'hadir'} onChange={() => handleStatusChange(siswa.id, 'hadir')} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10B981' }} />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <input type="radio" name={`status-${siswa.id}`} checked={siswa.status === 'sakit'} onChange={() => handleStatusChange(siswa.id, 'sakit')} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#3B82F6' }} />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <input type="radio" name={`status-${siswa.id}`} checked={siswa.status === 'izin'} onChange={() => handleStatusChange(siswa.id, 'izin')} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#F59E0B' }} />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <input type="radio" name={`status-${siswa.id}`} checked={siswa.status === 'alpha'} onChange={() => handleStatusChange(siswa.id, 'alpha')} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#EF4444' }} />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {siswa.status ? (
                        <StatusBadge status={siswa.status === 'alpha' ? 'tidak-hadir' : siswa.status as any} />
                      ) : (
                        <span style={{ color: '#9CA3AF', fontSize: '12px' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', padding: '20px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <button
            onClick={handleBatal}
            style={{ padding: '12px 32px', border: '2px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#FFFFFF', color: '#374151', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
          >
            Batal
          </button>
          <button
            onClick={handleSimpan}
            style={{ padding: '12px 32px', border: 'none', borderRadius: '8px', backgroundColor: '#2563EB', color: '#FFFFFF', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)' }}
          >
            Simpan Absensi
          </button>
        </div>
      </div>
    </WalikelasLayout>
  );
}

// import { useState } from 'react';
// import WalikelasLayout from '../../component/Walikelas/layoutwakel';
// import { FilterBar, FilterItem } from '../../component/Shared/FilterBar';
// import { StatusBadge } from '../../component/Shared/StatusBadge';
// import InputManualIcon from '../../assets/Icon/inputmanual.png';

// interface InputAbsenWalikelasProps {
//   user: { name: string; role: string };
//   onLogout: () => void;
//   currentPage: string;
//   onMenuClick: (page: string) => void;
// }

// interface Siswa {
//   id: string;
//   nisn: string;
//   nama: string;
//   status: 'hadir' | 'sakit' | 'izin' | 'alpha' | null;
// }

// export default function InputAbsenWalikelas({
//   user,
//   onLogout,
//   currentPage,
//   onMenuClick,
// }: InputAbsenWalikelasProps) {
//   const [selectedKelas, setSelectedKelas] = useState('XII Mekatronika 2');
//   const [selectedJam, setSelectedJam] = useState('Jam Ke-1');
//   const [selectedTanggal, setSelectedTanggal] = useState(new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }));
//   const [siswaList, setSiswaList] = useState<Siswa[]>([
//     { id: '1', nisn: '1348576392', nama: 'Wito Suherman Suhermin', status: null },
//     { id: '2', nisn: '1348576393', nama: 'Ahmad Fauzi', status: null },
//     { id: '3', nisn: '1348576394', nama: 'Siti Nurhaliza', status: null },
//     { id: '4', nisn: '1348576395', nama: 'Budi Santoso', status: null },
//     { id: '5', nisn: '1348576396', nama: 'Dewi Sartika', status: null },
//     { id: '6', nisn: '1348576397', nama: 'Rizki Ramadhan', status: null },
//   ]);

//   const handleStatusChange = (id: string, status: Siswa['status']) => {
//     setSiswaList(siswaList.map((s) => (s.id === id ? { ...s, status } : s)));
//   };

//   const handleSimpan = () => {
//     const siswaWithStatus = siswaList.filter((s) => s.status !== null);
//     if (siswaWithStatus.length === 0) {
//       alert('Pilih status untuk minimal satu siswa!');
//       return;
//     }
//     alert(`Data kehadiran berhasil disimpan untuk ${siswaWithStatus.length} siswa!`);
//     onMenuClick('dashboard');
//   };

//   const handleBatal = () => {
//     if (window.confirm('Apakah Anda yakin ingin membatalkan? Perubahan tidak akan disimpan.')) {
//       onMenuClick('dashboard');
//     }
//   };

//   return (
//     <WalikelasLayout
//       pageTitle="Input Manual"
//       currentPage={currentPage as any}
//       onMenuClick={onMenuClick}
//       user={user}
//       onLogout={onLogout}
//     >
//       <div style={{ position: 'relative', zIndex: 2 }}>
//         {/* Header  */}
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '16px',
//             marginBottom: '24px',
//             padding: '20px',
//             backgroundColor: '#FFFFFF',
//             borderRadius: '12px',
//             border: '1px solid #E5E7EB',
//             boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
//           }}
//         >
//           <div
//             style={{
//               width: '48px',
//               height: '48px',
//               backgroundColor: '#2563EB',
//               borderRadius: '10px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               flexShrink: 0,
//             }}
//           >
//             <img
//               src={InputManualIcon}
//               alt="Input Manual"
//               style={{
//                 width: '28px',
//                 height: '28px',
//                 objectFit: 'contain',
//                 filter: 'brightness(0) invert(1)',
//               }}
//             />
//           </div>
//           <div>
//             <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '4px' }}>
//               Input Manual Kehadiran
//             </h2>
//             <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
//               Pilih status kehadiran untuk setiap siswa
//             </p>
//           </div>
//         </div>

//         {/* Filter Bar */}
//         <div style={{ marginBottom: '24px' }}>
//           <FilterBar>
//             <FilterItem
//               icon=""
//               label="Kelas"
//               value={`${selectedKelas}\n${selectedJam}`}
//               onClick={() => alert('Pilih Kelas - Belum diimplementasikan')}
//             />
//             <FilterItem
//               icon=""
//               label="Jam"
//               value={selectedJam}
//               onClick={() => alert('Pilih Jam - Belum diimplementasikan')}
//             />
//             <FilterItem
//               icon=""
//               label="Tanggal"
//               value={selectedTanggal}
//               onClick={() => alert('Pilih Tanggal - Belum diimplementasikan')}
//             />
//           </FilterBar>
//         </div>

//         {/* Table */}
//         <div
//           style={{
//             backgroundColor: '#FFFFFF',
//             borderRadius: '12px',
//             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//             overflow: 'hidden',
//             border: '1px solid #E5E7EB',
//             marginBottom: '24px',
//           }}
//         >
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
//               <thead>
//                 <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
//                   <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px' }}>No</th>
//                   <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px' }}>NISN</th>
//                   <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px' }}>Nama Siswa</th>
//                   <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '100px' }}>Hadir</th>
//                   <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '100px' }}>Sakit</th>
//                   <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '100px' }}>Izin</th>
//                   <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '100px' }}>Alpha</th>
//                   <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '120px' }}>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {siswaList.map((siswa, idx) => (
//                   <tr
//                     key={siswa.id}
//                     style={{
//                       borderBottom: '1px solid #F3F4F6',
//                       transition: 'background-color 0.2s',
//                       backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
//                     }}
//                     onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#F3F4F6'; }}
//                     onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB'; }}
//                   >
//                     <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{idx + 1}</td>
//                     <td style={{ padding: '16px', fontSize: '14px', color: '#374151', fontWeight: '400' }}>{siswa.nisn}</td>
//                     <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{siswa.nama}</td>
//                     <td style={{ padding: '16px', textAlign: 'center' }}>
//                       <input type="radio" name={`status-${siswa.id}`} checked={siswa.status === 'hadir'} onChange={() => handleStatusChange(siswa.id, 'hadir')} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10B981' }} />
//                     </td>
//                     <td style={{ padding: '16px', textAlign: 'center' }}>
//                       <input type="radio" name={`status-${siswa.id}`} checked={siswa.status === 'sakit'} onChange={() => handleStatusChange(siswa.id, 'sakit')} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#3B82F6' }} />
//                     </td>
//                     <td style={{ padding: '16px', textAlign: 'center' }}>
//                       <input type="radio" name={`status-${siswa.id}`} checked={siswa.status === 'izin'} onChange={() => handleStatusChange(siswa.id, 'izin')} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#F59E0B' }} />
//                     </td>
//                     <td style={{ padding: '16px', textAlign: 'center' }}>
//                       <input type="radio" name={`status-${siswa.id}`} checked={siswa.status === 'alpha'} onChange={() => handleStatusChange(siswa.id, 'alpha')} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#EF4444' }} />
//                     </td>
//                     <td style={{ padding: '16px', textAlign: 'center' }}>
//                       {siswa.status ? (
//                         <StatusBadge status={siswa.status === 'alpha' ? 'tidak-hadir' : siswa.status as any} />
//                       ) : (
//                         <span style={{ color: '#9CA3AF', fontSize: '12px' }}>-</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', padding: '20px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
//           <button
//             onClick={handleBatal}
//             style={{ padding: '12px 32px', border: '2px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#FFFFFF', color: '#374151', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
//           >
//             Batal
//           </button>
//           <button
//             onClick={handleSimpan}
//             style={{ padding: '12px 32px', border: 'none', borderRadius: '8px', backgroundColor: '#2563EB', color: '#FFFFFF', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)' }}
//           >
//             Simpan Absensi
//           </button>
//         </div>
//       </div>
//     </WalikelasLayout>
//   );
// }