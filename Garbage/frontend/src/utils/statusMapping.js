export const STATUS_CONFIG = {
  hadir: { label: 'Hadir', color: '#1FA83D', bgColor: '#DCFCE7' },
  present: { label: 'Hadir', color: '#1FA83D', bgColor: '#DCFCE7' },
  
  terlambat: { label: 'Terlambat', color: '#ACA40D', bgColor: '#FEF9C3' },
  late: { label: 'Terlambat', color: '#ACA40D', bgColor: '#FEF9C3' },
  
  izin: { label: 'Izin', color: '#ACA40D', bgColor: '#FEF9C3' },
  excused: { label: 'Izin', color: '#ACA40D', bgColor: '#FEF9C3' },
  dinas: { label: 'Izin', color: '#ACA40D', bgColor: '#FEF9C3' },
  
  sakit: { label: 'Sakit', color: '#520C8F', bgColor: '#F3E8FF' },
  sick: { label: 'Sakit', color: '#520C8F', bgColor: '#F3E8FF' },
  
  'tidak-hadir': { label: 'Tidak Hadir', color: '#D90000', bgColor: '#FEE2E2' },
  alpha: { label: 'Alpha', color: '#D90000', bgColor: '#FEE2E2' },
  absent: { label: 'Alpha', color: '#D90000', bgColor: '#FEE2E2' },
  
  pulang: { label: 'Pulang', color: '#2F85EB', bgColor: '#DBEAFE' },
  return: { label: 'Pulang', color: '#2F85EB', bgColor: '#DBEAFE' },
  
  default: { label: '-', color: '#6B7280', bgColor: '#F3F4F6' },
};

export const getStatusConfig = (status) => {
  const normalizedStatus = status?.toLowerCase() || 'default';
  
  // Hande special case mapping if needed
  if (normalizedStatus === 'tidak-hadir') return STATUS_CONFIG['tidak-hadir'];
  
  return STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.default;
};

export const getStatusLabel = (status) => {
  return getStatusConfig(status).label;
};

export const getStatusColor = (status) => {
  return getStatusConfig(status).color;
};
