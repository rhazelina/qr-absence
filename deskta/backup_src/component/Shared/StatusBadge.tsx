type StatusType = 'hadir' | 'terlambat' | 'tidak-hadir' | 'sakit' | 'izin' | 'tanpa-keterangan';

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig: Record<StatusType, { label: string; color: string; bgColor: string }> = {
  hadir: { label: 'Hadir', color: '#065F46', bgColor: '#D1FAE5' },
  terlambat: { label: 'Terlambat', color: '#92400E', bgColor: '#FEF3C7' },
  'tidak-hadir': { label: 'Tidak Hadir', color: '#991B1B', bgColor: '#FEE2E2' },
  sakit: { label: 'Sakit', color: '#1E40AF', bgColor: '#DBEAFE' },
  izin: { label: 'Izin', color: '#7C2D12', bgColor: '#FED7AA' },
  'tanpa-keterangan': { label: 'Tanpa Keterangan', color: '#991B1B', bgColor: '#FEE2E2' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig['tidak-hadir'];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,          // samakan lebar minimal badge
        padding: '8px 14px',    // padding konsisten
        borderRadius: 999,      // bentuk pill
        fontSize: '13px',
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.bgColor,
        textAlign: 'center',
        lineHeight: 1.2,
      }}
    >
      {config.label}
    </span>
  );
}
