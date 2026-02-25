// src/Pages/WakaStaff/LihatGuru.tsx
import { useState, useEffect } from "react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { teacherService } from "../../services/teacherService";
import { Loader2 } from "lucide-react";
import DummyJadwal from "../../assets/Icon/DummyJadwal.png";
import { User } from "lucide-react";

interface Props {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  namaGuru?: string;
  noIdentitas?: string;
  jadwalImage?: string;
  guruId?: string;
  onBack?: () => void;
}

export default function LihatGuru({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  namaGuru,
  noIdentitas,
  jadwalImage,
  guruId,
  onBack,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (guruId) {
      fetchTeacherDetail();
    }
  }, [guruId]);

  const fetchTeacherDetail = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getTeacherById(guruId!);
      setTeacherData(response.data || response);
    } catch (error) {
      console.error("Failed to fetch teacher detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setImageError(false);
  }, [jadwalImage, teacherData]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <StaffLayout
      pageTitle="Detail Guru"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 32,
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                padding: "8px 16px",
                backgroundColor: "#F3F4F6",
                border: "none",
                borderRadius: 6,
                color: "#374151",
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 20
              }}
            >
              &larr; Kembali
            </button>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: '12px' }}>
              <Loader2 className="animate-spin" size={32} color="#10B981" />
              <span style={{ color: '#6B7280' }}>Memuat data guru...</span>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}>
                  {teacherData?.photo_url ? (
                    <img src={teacherData.photo_url} alt={teacherData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : <User size={40} color="#9CA3AF" />}
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
                    {teacherData?.name || namaGuru || teacherData?.nama_guru}
                  </h2>
                  <p style={{ color: '#6B7280', fontSize: '14px', margin: '4px 0 8px' }}>
                    {teacherData?.nip || noIdentitas || teacherData?.kode_guru || '-'}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(Array.isArray(teacherData?.jabatan) ? teacherData.jabatan : (teacherData?.role ? teacherData.role.split(' | ') : ['Guru'])).map((role: string, idx: number) => (
                      <span 
                        key={idx}
                        style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          backgroundColor: role === 'Wali Kelas' ? '#DBEAFE' : role === 'Guru' ? '#DCFCE7' : role === 'Waka' ? '#F3E8FF' : '#FEF3C7',
                          color: role === 'Wali Kelas' ? '#1E40AF' : role === 'Guru' ? '#166534' : role === 'Waka' ? '#6B21A8' : '#92400E',
                        }}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info Detail Grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px', marginBottom: '32px', backgroundColor: '#F9FAFB', padding: '24px', borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Mata Pelajaran</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>
                    {Array.isArray(teacherData?.subject) ? teacherData.subject.join(', ') : (teacherData?.subject || teacherData?.subject_name || '-')}
                  </span>
                </div>

                {teacherData?.jabatan?.includes('Wali Kelas') && teacherData.homeroom_class && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Wali Kelas Dari</span>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{teacherData.homeroom_class.name || '-'}</span>
                  </div>
                )}

                {teacherData?.jabatan?.includes('Kapro') && teacherData.konsentrasi_keahlian && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Kapro Program</span>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{teacherData.konsentrasi_keahlian}</span>
                  </div>
                )}

                {teacherData?.jabatan?.includes('Waka') && (teacherData.waka_field || teacherData.bidang) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Bidang Waka</span>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{teacherData.waka_field || teacherData.bidang}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Kontak</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{teacherData?.phone || teacherData?.email || '-'}</span>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", marginBottom: 16 }}>
                  Jadwal Mengajar
                </h3>
                <div style={{ display: "flex", justifyContent: "center", backgroundColor: "#F9FAFB", borderRadius: 8, padding: 20, border: "1px dashed #D1D5DB", position: "relative" }}>
                  {imageError || (!jadwalImage && !teacherData?.schedule_image_url) ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <img src={DummyJadwal} alt="No Schedule" style={{ width: 120, opacity: 0.5, marginBottom: 16 }} />
                      <p style={{ color: "#6B7280", fontSize: "14px" }}>Belum ada gambar jadwal yang diunggah.</p>
                    </div>
                  ) : (
                    <img
                      src={teacherData?.schedule_image_url || jadwalImage}
                      alt={`Jadwal ${namaGuru}`}
                      style={{ maxWidth: "100%", height: "auto", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      onError={handleImageError}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
