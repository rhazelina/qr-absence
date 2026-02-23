import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScannerState } from 'html5-qrcode';

interface CameraScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (errorMessage: string) => void;
}

export function CameraScanner({ onScanSuccess, onScanError }: CameraScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const containerId = "qr-reader";
    
    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
                    await scannerRef.current.stop();
                }
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
        setIsScanning(false);
    }, []);

    useEffect(() => {
        setIsScanning(true);
        
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error(e));
            }
        };
    }, []);

    useEffect(() => {
        // Skip if already scanning or scanner exists
        if (scannerRef.current || !isScanning) return;

        // Hapus instance lama jika ada sebelum membuat yang baru
        const cleanup = async () => {
            if (scannerRef.current) {
                try {
                    const state = scannerRef.current.getState();
                    if (state === Html5QrcodeScannerState.SCANNING) {
                        await scannerRef.current.stop();
                    }
                } catch (e) {
                    // Ignore
                }
                scannerRef.current.clear().catch(e => console.error(e));
                scannerRef.current = null;
            }
        };

        cleanup().then(() => {
            // Inisialisasi Html5QrcodeScanner
            const scanner = new Html5QrcodeScanner(
                containerId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [0]
                },
                false
            );

            scannerRef.current = scanner;

            scanner.render(
                async (decodedText) => {
                    // STOP scanner immediately after successful scan
                    await stopScanner();
                    // Then call the success handler
                    onScanSuccess(decodedText);
                },
                (error) => {
                    // Filter out noisy errors
                    if (onScanError && error?.toString()?.includes('NotFoundException') === false) {
                        onScanError(error.toString());
                    }
                }
            );
        });

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
                scannerRef.current = null;
            }
        };
    }, [isScanning, onScanSuccess, onScanError, stopScanner]);

    return (
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', overflow: 'hidden', borderRadius: '12px' }}>
            <div id={containerId} style={{ width: '100%', minHeight: "250px", border: "none" }} />
            <style>{`
        #${containerId}__scan_region img {
            display: none !important;
        }
        #${containerId} button {
            background-color: #2563EB;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 10px;
            font-weight: 600;
        }
        #${containerId} select {
            padding: 8px;
            border-radius: 8px;
            border: 1px solid #D1D5DB;
            margin-bottom: 10px;
            width: 100%;
        }
        #${containerId}__dashboard_section_csr span {
            display: none !important;
        }
      `}</style>
        </div>
    );
}
