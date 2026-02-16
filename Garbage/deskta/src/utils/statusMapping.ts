export type StatusType = 
  | 'hadir' 
  | 'terlambat' 
  | 'tidak-hadir' 
  | 'sakit' 
  | 'izin' 
  | 'alpha' 
  | 'pulang'
  | 'absent'
  | 'present'
  | 'sick'
  | 'excused'
  | 'return';

export interface StatusConfig {
  label: string;
  color: string;
  bgColor?: string;
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
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

export const getStatusConfig = (status: string): StatusConfig => {
  const normalizedStatus = status?.toLowerCase() || 'default';
  
  // Hande special case mapping if needed
  if (normalizedStatus === 'tidak-hadir') return STATUS_CONFIG['tidak-hadir'];
  
  return STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.default;
};

export const getStatusLabel = (status: string): string => {
  return getStatusConfig(status).label;
};

export const getStatusColor = (status: string): string => {
  return getStatusConfig(status).color;
};

export const STATUS_BACKEND_TO_FRONTEND: Record<string, string> = Object.entries(STATUS_CONFIG).reduce((acc, [key, value]) => {
  acc[key] = value.label;
  return acc;
}, {} as Record<string, string>);

export const STATUS_COLORS_HEX: Record<string, string> = Object.entries(STATUS_CONFIG).reduce((acc, [key, value]) => {
  acc[key] = value.color;
  return acc;
}, {} as Record<string, string>);

export const STATUS_FRONTEND_TO_BACKEND: Record<string, string> = {
  'hadir': 'present',
  'sakit': 'sick',
  'izin': 'permission',
  'alpha': 'absent',
  'pulang': 'return',
  'terlambat': 'late',
};
