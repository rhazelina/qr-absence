/*
  NOTE: Komponen JadwalModal sementara tidak digunakan dalam flow terbaru.
*/
import { Modal } from '../Modal';
import BookIcon from '../../../assets/Icon/open-book.png';
import userIcon from '../../../assets/Icon/user.png'; 

interface JadwalModalData {
  subject: string;
  className: string;
  jurusan?: string;
  jam?: string;
  statusGuru?: string;
}

interface JadwalModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: JadwalModalData | null;
  onMulaiAbsen?: () => void;
  onTidakBisaMengajar?: () => void;
}

export function JadwalModal({ 
  isOpen, 
  onClose, 
  data,
  onMulaiAbsen,
  onTidakBisaMengajar 
}: JadwalModalProps) {
  if (!data) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        style={{
          border: '3px solid #1e40af',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#0f172a',
            color: 'white',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={BookIcon}
              alt="Book"
              style={{
                width: '24px',
                height: '24px',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
              }}
            />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              {data.subject}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {data.className}
            </span>
            <img
              src={userIcon}
              alt="Building"
              style={{
                width: '20px',
                height: '20px',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', backgroundColor: 'white' }}>
          {/* Keterangan Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '12px',
              }}
            >
              Keterangan
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <InfoRow label="Mata Pelajaran" value={data.subject} />
              <InfoRow 
                label="Kelas/Jurusan" 
                value={data.jurusan || data.className || '-'} 
              />
              <InfoRow label="Jam ke-" value={data.jam || '-'} />
            </div>
          </div>

          {/* Status Guru Section */}
          <div>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '12px',
              }}
            >
              Status Guru
            </h3>
            <div
              style={{
                backgroundColor: '#10B981',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                display: 'inline-block',
                fontWeight: '600',
                fontSize: '14px',
                marginBottom: '8px',
              }}
            >
              {data.statusGuru || 'Hadir'}
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#6B7280',
                margin: 0,
                marginTop: '8px',
              }}
            >
              Anda terjadwal mengajar kelas ini
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (onMulaiAbsen) {
                onMulaiAbsen();
              }
              onClose();
            }}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#1e40af',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e3a8a';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e40af';
            }}
          >
            Mulai Absensi
          </button>
          {onTidakBisaMengajar && (
            <button
              type="button"
              onClick={() => {
                onTidakBisaMengajar();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#EF4444',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#DC2626';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#EF4444';
              }}
            >
              Tidak Bisa Mengajar
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        background: '#F1F5F9',
        borderRadius: '8px',
        padding: '12px 16px',
        border: '1px solid #E2E8F0',
      }}
    >
      <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
        {label}
      </span>
      <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '500' }}>
        {value}
      </span>
    </div>
  );
}
