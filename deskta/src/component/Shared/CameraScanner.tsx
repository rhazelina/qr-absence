import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface CameraScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (errorMessage: string) => void;
}

export function CameraScanner({ onScanSuccess, onScanError }: CameraScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const containerId = "qr-reader";

    useEffect(() => {
        // Hapus instance lama jika ada sebelum membuat yang baru
        if (scannerRef.current) {
            scannerRef.current.clear().catch(e => console.error(e));
        }

        // Inisialisasi Html5QrcodeScanner
        // Menggunakan konfigurasi dasar tanpa react-wrapper untuk stabilitas optimal
        const scanner = new Html5QrcodeScanner(
            containerId,
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                supportedScanTypes: [0] // 0 = Html5QrcodeScanType.SCAN_TYPE_CAMERA
            },
      /* verbose= */ false
        );

        scannerRef.current = scanner;

        scanner.render(
            (decodedText) => {
                // Hentikan scanner setelah berhasil untuk mencegah scan berkali-kali jika dibutuhkan.
                // Biasanya onScanSuccess menangani logika pindah page.
                onScanSuccess(decodedText);
            },
            (error) => {
                if (onScanError) onScanError(error);
            }
        );

        return () => {
            // Cleanup saat komponen unmount
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            }
        };
    }, [onScanSuccess, onScanError]);

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
