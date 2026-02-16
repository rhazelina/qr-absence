import { useState } from 'react';
import { Modal } from '../Shared/Modal';
import QRScanner from '../Shared/QRScanner';
import apiClient from '../../services/api';
import { usePopup } from '../Shared/Popup/PopupProvider';

interface QRScanButtonProps {
    onSuccess?: () => void;
}

export default function QRScanButton({ onSuccess }: QRScanButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const { alert: popupAlert } = usePopup();

    const handleScan = async (qrData: string) => {
        try {
            setIsScanning(true);

            // Call attendance scan API
            const response = await apiClient.post('/attendance/scan', {
                qr_token: qrData,
            });

            popupAlert(`Status: ${response.data.status || 'Hadir'}`, {
                title: '✅ Absensi Berhasil!',
            });

            setIsModalOpen(false);
            onSuccess?.();
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const error = err as any;
            popupAlert(error.response?.data?.message || 'QR Code tidak valid atau sudah kadaluarsa', {
                title: '❌ Gagal Absen',
            });
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0B2948 0%, #1e5a8e 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(11, 41, 72, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    zIndex: 1000,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(11, 41, 72, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(11, 41, 72, 0.4)';
                }}
            >
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                </svg>
            </button>

            {/* QR Scanner Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: '16px' }}>
                        📷 Scan QR Code Absensi
                    </div>
                    {isScanning ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{
                                fontSize: '48px',
                                animation: 'spin 1s linear infinite',
                            }}>
                                ⏳
                            </div>
                            <p style={{ marginTop: '16px', color: '#666' }}>
                                Memproses absensi...
                            </p>
                        </div>
                    ) : (
                        <>
                            <QRScanner
                                onScan={handleScan}
                                onError={(error) => {
                                    popupAlert(error, {
                                        title: '⚠️ Peringatan',
                                    });
                                }}
                                isActive={isModalOpen}
                            />
                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                background: '#F0F9FF',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#0369A1',
                                textAlign: 'center',
                            }}>
                                💡 Pastikan QR code terlihat jelas di kamera
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </>
    );
}
