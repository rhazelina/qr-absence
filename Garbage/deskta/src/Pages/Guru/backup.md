
import { useState, useEffect } from 'react';
import GuruLayout from '../../component/Guru/GuruLayout';
import { StatusBadge } from '../../component/Shared/StatusBadge';
import EditIcon from '../../assets/Icon/Edit.png';

interface KehadiranSiswaGuruProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

interface KehadiranSiswa {
  id: string;
  nisn: string;
  nama: string;
  mapel: string;
  jam: string;
  tanggal: string;
  waktuScan: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpha';
}

export default function KehadiranSiswaGuru({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: KehadiranSiswaGuruProps) {
  const [selectedKelas, setSelectedKelas] = useState('XII Mekatronika 2');
  const [selectedJam, setSelectedJam] = useState('Jam Ke-1');
  const [selectedMatkul, setSelectedMapel] = useState('Semua');
  const [selectedTanggal, setSelectedTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const JAM_OPTIONS = ['Jam Ke-1','Jam Ke-2','Jam Ke-3','Jam Ke-4'];
  const MAPEL_OPTIONS = ['Semua','Matematika','Fisika','Bahasa Indonesia'];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [kehadiranData, setKehadiranData] = useState<KehadiranSiswa[]>([
    { id: '1', nisn: '1348576392', nama: 'Wito Suherman Suhermin', mapel: 'Matematika', jam: 'Jam Ke-1', tanggal: new Date().toISOString().slice(0,10), waktuScan: '07.00', status: 'hadir' },
    { id: '2', nisn: '1348576393', nama: 'Ahmad Fauzi', mapel: 'Matematika', jam: 'Jam Ke-1', tanggal: new Date().toISOString().slice(0,10), waktuScan: '07.05', status: 'hadir' },
    { id: '3', nisn: '1348576394', nama: 'Siti Nurhaliza', mapel: 'Fisika', jam: 'Jam Ke-2', tanggal: new Date().toISOString().slice(0,10), waktuScan: '-', status: 'sakit' },
    { id: '4', nisn: '1348576395', nama: 'Budi Santoso', mapel: 'Fisika', jam: 'Jam Ke-2', tanggal: new Date().toISOString().slice(0,10), waktuScan: '-', status: 'izin' },
    { id: '5', nisn: '1348576396', nama: 'Dewi Sartika', mapel: 'Bahasa Indonesia', jam: 'Jam Ke-3', tanggal: new Date().toISOString().slice(0,10), waktuScan: '-', status: 'alpha' },
    { id: '6', nisn: '1348576397', nama: 'Rizki Ramadhan', mapel: 'Bahasa Indonesia', jam: 'Jam Ke-3', tanggal: new Date().toISOString().slice(0,10), waktuScan: '-', status: 'alpha' },
    { id: '7', nisn: '1348576398', nama: 'Fitri Handayani', mapel: 'Matematika', jam: 'Jam Ke-4', tanggal: new Date().toISOString().slice(0,10), waktuScan: '-', status: 'sakit' },
  ]);

  const filteredData = kehadiranData.filter(s => 
    s.jam === selectedJam &&
    (selectedMatkul === 'Semua' || s.mapel === selectedMatkul) &&
    s.tanggal === selectedTanggal
  );

  const handleEdit = (item: KehadiranSiswa) => {
    popupAlert(`Edit absensi: ${item.nama}`);
  };

  const StatCard = ({ label, value, color, bgColor, icon }: any) => (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: color }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginTop: '4px' }}>{value}</div>
        </div>
        <div style={{ 
          padding: '10px', 
          borderRadius: '12px', 
          backgroundColor: bgColor, 
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <GuruLayout
      pageTitle="Kehadiran Siswa"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
        
        {/* Header & Filter Section */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          padding: '24px', 
          borderRadius: '16px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>Overview Kehadiran</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '14px' }}>
              {selectedKelas} • {new Date(selectedTanggal).toLocaleDateString('id-ID')}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
            <div style={styles.filterBtn}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: '8px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <input type="date" value={selectedTanggal} onChange={e => setSelectedTanggal(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 600, color: '#374151' }} />
            </div>
            <div style={styles.filterBtn}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: '8px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <select value={selectedJam} onChange={e => setSelectedJam(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 600, color: '#374151' }}>
                {JAM_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div style={styles.filterBtn}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: '8px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l-2 4h4l-2 4" /></svg>
              <select value={selectedMatkul} onChange={e => setSelectedMapel(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 600, color: '#374151' }}>
                {MAPEL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          <StatCard 
            label="Hadir" 
            value={filteredData.filter((s) => s.status === 'hadir').length} 
            color="#10B981" 
            bgColor="#ECFDF5"
            icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard 
            label="Sakit" 
            value={filteredData.filter((s) => s.status === 'sakit').length} 
            color="#3B82F6" 
            bgColor="#EFF6FF"
            icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard 
            label="Izin" 
            value={filteredData.filter((s) => s.status === 'izin').length} 
            color="#F59E0B" 
            bgColor="#FFFBEB"
            icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <StatCard 
            label="Alpha" 
            value={filteredData.filter((s) => s.status === 'alpha').length} 
            color="#EF4444" 
            bgColor="#FEF2F2"
            icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* Data Display */}
        {isMobile ? (
          // Mobile Card List
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredData.map((item) => (
              <div key={item.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                border: '1px solid #F3F4F6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    color: '#6B7280',
                    fontSize: '16px'
                  }}>
                    {item.nama.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1F2937' }}>{item.nama}</h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'monospace' }}>{item.nisn}</span>
                      <span style={{ fontSize: '12px', color: '#D1D5DB' }}>•</span>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>{item.waktuScan}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop Table
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={styles.th}>No</th>
                  <th style={styles.th}>NISN</th>
                  <th style={styles.th}>Nama Siswa</th>
                  <th style={styles.th}>Waktu Scan</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, idx) => (
                  <tr key={item.id} style={{ 
                    borderBottom: '1px solid #F3F4F6',
                    backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                  }}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={{ ...styles.td, fontFamily: 'monospace', color: '#4B5563' }}>{item.nisn}</td>
                    <td style={{ ...styles.td, fontWeight: '600', color: '#1F2937' }}>{item.nama}</td>
                    <td style={styles.td}>{item.waktuScan}</td>
                    <td style={styles.td}><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </GuruLayout>
  );
}

const styles = {
  th: {
    padding: '16px',
    textAlign: 'left' as const,
    fontSize: '12px',
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#374151'
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  actionBtn: {
    background: 'white',
    border: '1px solid #E5E7EB',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  }
};
