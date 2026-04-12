import { useState, useRef } from 'react';
import { Modal } from '../Modal';
import QRIcon from '../../../assets/Icon/qr_code.png';

interface AbsenGuruModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
  onManualSubmit: () => void;
}

type TabType = 'qr' | 'manual';

export function AbsenGuruModal({ isOpen, onClose, onSubmit, onManualSubmit }: AbsenGuruModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('qr');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [manualSubmitted, setManualSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'qr' && selectedFile) {
      onSubmit(selectedFile);
      setSelectedFile(null);
      onClose();
    } else if (activeTab === 'manual') {
      setManualSubmitted(true);
      setTimeout(() => {
        onManualSubmit();
        setManualSubmitted(false);
        onClose();
      }, 1500);
    }
  };

  const resetAndClose = () => {
    setSelectedFile(null);
    setManualSubmitted(false);
    setActiveTab('qr');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          marginBottom: '24px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#EFF6FF',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563EB'
          }}>
            <img src={QRIcon} alt="QR" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0 }}>
            Absensi Guru
          </h2>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: '#F3F4F6', 
          borderRadius: '12px', 
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setActiveTab('qr')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: activeTab === 'qr' ? 'white' : 'transparent',
              color: activeTab === 'qr' ? '#2563EB' : '#6B7280',
              fontWeight: '600',
              border: 'none',
              boxShadow: activeTab === 'qr' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Upload QR
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: activeTab === 'manual' ? 'white' : 'transparent',
              color: activeTab === 'manual' ? '#2563EB' : '#6B7280',
              fontWeight: '600',
              border: 'none',
              boxShadow: activeTab === 'manual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Manual Request
          </button>
        </div>

        {activeTab === 'qr' ? (
          <>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
              Silakan unggah QR Code yang diberikan oleh <strong>Pengurus Kelas</strong> untuk melakukan absensi kehadiran mengajar.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? '#2563EB' : '#D1D5DB'}`,
                borderRadius: '16px',
                padding: '32px 24px',
                backgroundColor: isDragging ? '#EFF6FF' : '#F9FAFB',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '24px'
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              
              {selectedFile ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '8px', 
                    overflow: 'hidden', 
                    backgroundColor: '#E5E7EB',
                    marginBottom: '8px'
                  }}>
                    <img 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    {selectedFile.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: '500' }}>
                    Klik untuk ganti file
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#2563EB">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <span style={{ color: '#2563EB', fontWeight: '600' }}>Klik untuk upload</span>
                    <span style={{ color: '#6B7280' }}> atau drag & drop</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>PNG, JPG up to 5MB</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: '20px 0', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {manualSubmitted ? (
               <div style={{ 
                padding: '20px', 
                backgroundColor: '#ECFDF5', 
                borderRadius: '12px',
                border: '1px solid #A7F3D0',
                color: '#065F46'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>Permintaan Terkirim</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>Menunggu validasi Pengurus Kelas.</p>
              </div>
            ) : (
              <>
                <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
                  Jika tidak memiliki QR Code, Anda dapat mengajukan permintaan absensi manual. <br/>
                  <strong>Pengurus Kelas</strong> akan memvalidasi kehadiran Anda.
                </p>
                <div style={{ 
                  backgroundColor: '#FFFBEB', 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: '1px solid #FEF3C7',
                  marginBottom: '16px'
                }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#92400E' }}>
                    Pastikan Anda sudah berada di dalam kelas sebelum melakukan permintaan ini.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={resetAndClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '12px',
              color: '#374151',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={(activeTab === 'qr' && !selectedFile) || (activeTab === 'manual' && manualSubmitted)}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: (activeTab === 'qr' && !selectedFile) || (activeTab === 'manual' && manualSubmitted) ? '#9CA3AF' : '#2563EB',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '600',
              cursor: (activeTab === 'qr' && !selectedFile) || (activeTab === 'manual' && manualSubmitted) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              boxShadow: (activeTab === 'qr' && selectedFile) || (activeTab === 'manual' && !manualSubmitted) ? '0 4px 6px -1px rgba(37, 99, 235, 0.2)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {activeTab === 'qr' ? 'Kirim Absensi' : (manualSubmitted ? 'Terkirim' : 'Minta Validasi')}
          </button>
        </div>
      </div>
    </Modal>
  );
}