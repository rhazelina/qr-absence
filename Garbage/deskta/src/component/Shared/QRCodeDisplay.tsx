import QRCode from 'react-qr-code';

interface QRCodeDisplayProps {
    value: string;
    size?: number;
    title?: string;
    expiresAt?: string;
}

export default function QRCodeDisplay({
    value,
    size = 256,
    title = 'QR Code Absensi',
    expiresAt
}: QRCodeDisplayProps) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '24px',
            background: '#FFF',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
            <h3 style={{
                margin: 0,
                color: '#0B2948',
                fontSize: '18px',
                fontWeight: 700,
            }}>
                {title}
            </h3>

            <div style={{
                padding: '16px',
                background: '#FFF',
                borderRadius: '12px',
                border: '2px solid #E5E7EB',
            }}>
                <QRCode value={value} size={size} />
            </div>

            {expiresAt && (
                <div style={{
                    fontSize: '14px',
                    color: '#666',
                    textAlign: 'center',
                }}>
                    <p style={{ margin: '4px 0', fontWeight: 600 }}>
                        ⏰ Berlaku hingga:
                    </p>
                    <p style={{ margin: '4px 0', color: '#0B2948' }}>
                        {new Date(expiresAt).toLocaleString('id-ID')}
                    </p>
                </div>
            )}

            <div style={{
                fontSize: '12px',
                color: '#999',
                textAlign: 'center',
                maxWidth: '300px',
            }}>
                Scan QR code ini untuk melakukan absensi
            </div>
        </div>
    );
}
