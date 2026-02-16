import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
    onScan: (result: string) => void;
    onError?: (error: string) => void;
    isActive: boolean;
}

export default function QRScanner({ onScan, onError, isActive }: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasCamera, setHasCamera] = useState(true);

    useEffect(() => {
        if (!videoRef.current || !isActive) return;

        const qrScanner = new QrScanner(
            videoRef.current,
            (result) => {
                onScan(result.data);
                qrScanner.stop();
            },
            {
                returnDetailedScanResult: true,
                highlightScanRegion: true,
                highlightCodeOutline: true,
            }
        );


        // Start scanning
        qrScanner.start().catch((err) => {
            console.error('Failed to start QR scanner:', err);
            setHasCamera(false);
            onError?.('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
        });

        return () => {
            qrScanner.stop();
            qrScanner.destroy();
        };
    }, [isActive, onScan, onError]);

    if (!hasCamera) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                background: '#FEE',
                borderRadius: '12px',
                border: '2px dashed #D00',
            }}>
                <p style={{ color: '#D00', fontWeight: 600, marginBottom: '8px' }}>
                    ❌ Kamera Tidak Tersedia
                </p>
                <p style={{ color: '#666', fontSize: '14px' }}>
                    Pastikan browser memiliki izin akses kamera
                </p>
            </div>
        );
    }

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto',
        }}>
            <video
                ref={videoRef}
                style={{
                    width: '100%',
                    borderRadius: '12px',
                    border: '3px solid #0B2948',
                }}
            />
            <div style={{
                marginTop: '16px',
                textAlign: 'center',
                color: '#0B2948',
                fontWeight: 600,
            }}>
                📷 Arahkan kamera ke QR Code
            </div>
        </div>
    );
}
