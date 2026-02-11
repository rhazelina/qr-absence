import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, ArrowLeft, LogOut, PieChart, TrendingUp, Camera } from 'lucide-react';
import './DashboardSiswa.css';
import NavbarSiswa from '../../components/Siswa/NavbarSiswa';
// import { authHelpers } from '../../utils/authHelpers';

import attendanceService from '../../services/attendance';
import { authHelpers } from '../../utils/authHelpers';
import { authService } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeSVG } from 'qrcode.react';

// SVG Avatar Component untuk Profil - Basic Icon
const ProfileIcon = ({ gender, size = 80 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#E5E7EB"/>
      <circle cx="12" cy="9" r="4" fill="#9CA3AF"/>
      <path d="M4 20c0-4 3-6 8-6s8 2 8 6" fill="#9CA3AF"/>
    </svg>
  );
};

// Subjects Modal - Menampilkan gambar jadwal
const SubjectsModal = ({ isOpen, onClose, scheduleImage = null }) => {
  if (!isOpen) return null;

  return (
    <div className="siswa-overlay-modal-semua-riwayat" onClick={onClose}>
      <NavbarSiswa />
      <div className="siswa-modal-semua-riwayat" style={{ 
        maxWidth: '800px', 
        maxHeight: 'calc(100vh - 105px)',
        width: '90%',
        margin: '0 auto'
      }} onClick={(e) => e.stopPropagation()}>
        <div className="siswa-header-semua-riwayat">
          <button onClick={onClose} className="siswa-tombol-kembali">
            <ArrowLeft size={32} />
          </button>
          <h2>Jadwal Pembelajaran</h2>
        </div>
        
        <div className="siswa-kartu-semua-riwayat" style={{ 
          overflowX: 'auto', 
          overflowY: 'auto',
          padding: '24px',
          maxHeight: 'calc(100vh - 205px)'
        }}>
          {scheduleImage ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              alignItems: 'center'
            }}>
              <div style={{
                width: '100%',
                maxWidth: '650px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                border: '2px solid #e5e7eb'
              }}>
                <img 
                  src={scheduleImage} 
                  alt="Jadwal Pembelajaran" 
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              background: '#f9fafb',
              borderRadius: '16px',
              border: '3px dashed #d1d5db',
              minHeight: '400px'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <BookOpen size={60} color="#9ca3af" />
              </div>
              
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#374151',
                marginBottom: '12px'
              }}>Belum Ada Jadwal</h3>
              
              <p style={{
                fontSize: '15px',
                color: '#6b7280',
                textAlign: 'center',
                maxWidth: '400px'
              }}>
                Jadwal pembelajaran belum tersedia
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Line Chart Component - Untuk tren kehadiran bulanan pribadi siswa
const LineChart = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const chartHeight = 240;
  const chartWidth = 600;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  
  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: '#f9fafb',
        borderRadius: '12px',
        border: '2px dashed #d1d5db'
      }}>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
          Belum ada data tren bulanan
        </p>
      </div>
    );
  }
  
  const maxValue = Math.max(...data.map(d => d.percentage));
  const minValue = Math.min(...data.map(d => d.percentage));
  const range = maxValue - minValue || 10;
  
  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1)) * (chartWidth - padding.left - padding.right);
    const y = padding.top + ((maxValue + 5 - item.percentage) / (range + 10)) * (chartHeight - padding.top - padding.bottom);
    return { x, y, ...item };
  });

  const linePath = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`;

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((val) => {
          const y = padding.top + ((100 - val) / 100) * (chartHeight - padding.top - padding.bottom);
          return (
            <line
              key={val}
              x1={padding.left}
              y1={y}
              x2={chartWidth - padding.right}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}

        {[0, 25, 50, 75, 100].map((val) => {
          const y = padding.top + ((100 - val) / 100) * (chartHeight - padding.top - padding.bottom);
          return (
            <text
              key={val}
              x={padding.left - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="12"
              fill="#6b7280"
            >
              {val}%
            </text>
          );
        })}

        <path d={areaPath} fill="url(#lineGradient)" />
        <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r="5" fill="white" stroke="#3b82f6" strokeWidth="3" style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(point)} onMouseLeave={() => setHoveredPoint(null)} />
            <circle cx={point.x} cy={point.y} r="15" fill="transparent" style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(point)} onMouseLeave={() => setHoveredPoint(null)} />
            <text x={point.x} y={point.y - 15} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1f2937">
              {point.percentage}%
            </text>
            <text x={point.x} y={chartHeight - padding.bottom + 25} textAnchor="middle" fontSize="13" fontWeight="600" fill="#6b7280">
              {point.month}
            </text>
          </g>
        ))}

        {points.length > 1 && (
          <g>
            {(() => {
              const firstPoint = points[0];
              const lastPoint = points[points.length - 1];
              const trend = lastPoint.percentage - firstPoint.percentage;
              const trendColor = trend >= 0 ? '#22c55e' : '#ef4444';
              const trendText = trend >= 0 ? `+${trend.toFixed(1)}%` : `${trend.toFixed(1)}%`;
              
              return (
                <text x={chartWidth - padding.right} y={padding.top - 10} textAnchor="end" fontSize="14" fontWeight="bold" fill={trendColor}>
                  {trendText} {trend >= 0 ? '↑' : '↓'}
                </text>
              );
            })()}
          </g>
        )}
      </svg>
      
      {hoveredPoint && (
        <div style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          background: 'white', padding: '16px 20px', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)', border: '2px solid #3b82f6',
          pointerEvents: 'none', zIndex: 1000, minWidth: '200px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px',
            textAlign: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
            {hoveredPoint.month}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Persentase:</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>{hoveredPoint.percentage}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Hadir:</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>{hoveredPoint.hadir} hari</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Total Hari:</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>{hoveredPoint.total} hari</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Donut Chart Component - Untuk statistik mingguan
const DonutChart = ({ data }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  
  if (total === 0) {
    return (
      <div className="siswa-chart-tidak-ada-data">
        <p>Belum ada data minggu ini</p>
      </div>
    );
  }

  const percentages = {
    hadir: (data.hadir / total) * 100,
    izin: (data.izin / total) * 100,
    sakit: (data.sakit / total) * 100,
    alpha: (data.alpha / total) * 100,
    terlambat: (data.terlambat / total) * 100,
    pulang: (data.pulang / total) * 100
  };

  const colors = {
    hadir: '#1FA83D',
    izin: '#EDD329',
    sakit: '#9A0898',
    alpha: '#D90000',
    terlambat: '#FF5F1A', 
    pulang: '#243CB5'
  };

  const labels = {
    hadir: 'Hadir',
    izin: 'Izin',
    sakit: 'Sakit',
    alpha: 'Alpha',
    terlambat: 'Terlambat',
    pulang: 'Pulang'
  };

  let cumulativePercent = 0;
  const gradientStops = Object.keys(percentages).map(key => {
    const start = cumulativePercent;
    cumulativePercent += percentages[key];
    return `${colors[key]} ${start}% ${cumulativePercent}%`;
  }).join(', ');

  const handleMouseMove = (e) => {
    const chart = e.currentTarget;
    const rect = chart.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    const normalizedAngle = (angle + 90 + 360) % 360;
    
    const outerRadius = 75;
    const innerRadius = 50;
    const distance = Math.sqrt(x * x + y * y);
    
    if (distance >= innerRadius && distance <= outerRadius) {
      let cumulative = 0;
      for (const [key, percent] of Object.entries(percentages)) {
        cumulative += percent;
        if (normalizedAngle < (cumulative / 100) * 360) {
          setHoveredSegment({ label: labels[key], value: data[key], color: colors[key] });
          break;
        }
      }
    } else {
      setHoveredSegment(null);
    }
  };

  return (
    <div className="siswa-pembungkus-chart-donut" style={{ width: '180px', height: '180px' }}>
      <div 
        className="siswa-chart-donut"
        style={{ 
          background: `conic-gradient(${gradientStops})`,
          width: '150px',
          height: '150px'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredSegment(null)}
      >
        <div className="siswa-dalam-chart" style={{ width: '100px', height: '100px' }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{total}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600' }}>Total Hari</div>
          </div>
        </div>
      </div>
      
      {hoveredSegment && (
        <div className="siswa-tooltip-chart">
          <div className="siswa-warna-tooltip" style={{ background: hoveredSegment.color }}></div>
          <div className="siswa-konten-tooltip">
            <div className="siswa-label-tooltip">{hoveredSegment.label}</div>
            <div className="siswa-nilai-tooltip">{hoveredSegment.value} hari</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Profile Modal Component
const ProfileModal = ({ isOpen, onClose, profile, onLogout, currentProfileImage, onUpdateProfileImage }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar!');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB!');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (!profileImage) return;
    setIsUploading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUpdateProfileImage(previewImage);
      setPreviewImage(null);
      setProfileImage(null);
      alert('Foto profil berhasil diperbarui!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal mengupload foto. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setProfileImage(null);
  };

  const handleDeleteProfileImage = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus foto profil?')) return;
    setIsUploading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onUpdateProfileImage(null);
      alert('Foto profil berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Gagal menghapus foto. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="siswa-overlay-modal-semua-riwayat" onClick={onClose}>
      <div className="siswa-modal-semua-riwayat" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="siswa-header-semua-riwayat">
          <button onClick={onClose} className="siswa-tombol-kembali">
            <ArrowLeft size={32} />
          </button>
          <h2>Info Akun</h2>
        </div>
        
        <div className="siswa-kartu-semua-riwayat">
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            marginBottom: '32px', padding: '24px', background: '#f9fafb', borderRadius: '16px'
          }}>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div style={{
                width: '150px', height: '150px', borderRadius: '50%', background: '#e8e8e8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', border: '4px solid white', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                {previewImage ? (
                  <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : currentProfileImage ? (
                  <img src={currentProfileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ProfileIcon gender={profile.gender} size={80} />
                )}
              </div>
              <label htmlFor="profile-upload" style={{
                position: 'absolute', bottom: '5px', right: '5px', width: '40px', height: '40px',
                borderRadius: '50%', background: '#1e3a8a', border: '3px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                color: 'white', opacity: isUploading ? 0.5 : 1
              }}>
                <Camera size={20} />
              </label>
              <input id="profile-upload" type="file" accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageChange} disabled={isUploading} style={{ display: 'none' }} />
            </div>
            
            {previewImage && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleSaveImage} disabled={isUploading} style={{
                  padding: '10px 20px', background: isUploading ? '#9ca3af' : '#22c55e',
                  color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600',
                  cursor: isUploading ? 'not-allowed' : 'pointer', fontSize: '14px', transition: 'all 0.2s'
                }}>
                  {isUploading ? 'Menyimpan...' : 'Simpan Foto'}
                </button>
                <button onClick={handleRemoveImage} disabled={isUploading} style={{
                  padding: '10px 20px', background: isUploading ? '#9ca3af' : '#ef4444',
                  color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600',
                  cursor: isUploading ? 'not-allowed' : 'pointer', fontSize: '14px', transition: 'all 0.2s'
                }}>Batal</button>
              </div>
            )}
            
            {!previewImage && currentProfileImage && (
              <button onClick={handleDeleteProfileImage} disabled={isUploading} style={{
                padding: '10px 20px', background: 'transparent', color: '#ef4444',
                border: '2px solid #ef4444', borderRadius: '8px', fontWeight: '600',
                cursor: isUploading ? 'not-allowed' : 'pointer', fontSize: '14px', transition: 'all 0.2s'
              }}>
                {isUploading ? 'Menghapus...' : 'Hapus Foto'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>Nama Lengkap</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{profile.name}</div>
            </div>

            <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>Kelas</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{profile.kelas}</div>
            </div>

            <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>Nomor Induk Siswa</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{profile.id}</div>
            </div>
          </div>

          <button onClick={onLogout} disabled={isUploading} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '12px', padding: '16px 24px',
            background: isUploading ? '#9ca3af' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: '700',
            cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }}
          onMouseOver={(e) => {
            if (!isUploading) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!isUploading) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}>
            <LogOut size={20} />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
};


// Daily Schedule Component
const DailySchedule = ({ day, date, schedule }) => (
  <div className="siswa-kartu-kehadiran">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <h3 className="siswa-judul-kehadiran">Jadwal Hari Ini</h3>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div className="siswa-lencana-waktu"><Calendar size={16} /><span>{date}</span></div>
        <div className="siswa-lencana-waktu"><BookOpen size={16} /><span>{day}</span></div>
      </div>
    </div>
    <div className="siswa-area-jadwal">
      {schedule.length > 0 ? (
        schedule.map((item, index) => (
          <div key={index} className="siswa-item-jadwal">
            <div className="siswa-waktu-jadwal">
              <span className="siswa-jam-mulai">{item.start_time}</span>
              <span className="siswa-pemisah-waktu"></span>
              <span className="siswa-jam-selesai">{item.end_time}</span>
            </div>
            <div className="siswa-info-pelajaran">
              <h4 className="siswa-nama-mapel">{item.subject}</h4>
              <p className="siswa-nama-guru">{item.teacher}</p>
            </div>
            <div className={`siswa-status-absen status-${item.status}`}>
              {item.status === 'none' ? 'Belum Absen' : item.status_label || item.status}
            </div>
          </div>
        ))
      ) : (
        <div className="siswa-jadwal-kosong">Tidak ada jadwal hari ini</div>
      )}
    </div>
  </div>
);

// Stats Section Component
const StatsSection = ({ weeklyStats, monthlyTrend }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
    <div className="siswa-kartu-kehadiran">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp color="white" size={24} />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Tren Kehadiran Bulanan</h3>
      </div>
      <LineChart data={monthlyTrend} />
    </div>

    <div className="siswa-kartu-kehadiran">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PieChart color="white" size={24} />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Statistik Minggu Ini</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'center' }}>
        <div style={{ flex: '0 0 auto' }}>
          <DonutChart data={weeklyStats} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1' }}>
          {[
            { label: 'Hadir', value: weeklyStats.hadir, color: '#1FA83D' },
            { label: 'Terlambat', value: weeklyStats.terlambat, color: '#FF5F1A' },
            { label: 'Izin', value: weeklyStats.izin, color: '#EDD329' },
            { label: 'Sakit', value: weeklyStats.sakit, color: '#9A0898' },
            { label: 'Alpha', value: weeklyStats.alpha, color: '#D90000' }
          ].map((stat, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', background: stat.color, borderRadius: '50%' }}></div>
              <div style={{ flex: 1, fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>{stat.label}</div>
              <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: 'bold' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Action Card Component
const ActionCard = ({ title, description, icon: Icon, onClick, color }) => (
  <button className="siswa-kartu-aksi" onClick={onClick} style={{ borderLeft: `6px solid ${color}` }}>
    <div className="siswa-ikon-aksi" style={{ background: `${color}15`, color: color }}>
      <Icon size={28} />
    </div>
    <div className="siswa-teks-aksi">
      <h4 style={{ color: color }}>{title}</h4>
      <p>{description}</p>
    </div>
  </button>
);

// Action Section Component
const ActionSection = ({ onScanMasuk, onScanPulang, onGenerateSubjectQR }) => (
  <div className="siswa-petak-aksi" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
    <ActionCard title="Presensi Masuk" description="Scan QR Code Sekolah" icon={Camera} onClick={onScanMasuk} color="#10b981" />
    <ActionCard title="Presensi Pulang" description="Scan QR Code Sekolah" icon={Camera} onClick={onScanPulang} color="#f59e0b" />
    <ActionCard title="Mata Pelajaran" description="Tampilkan QR Kehadiran" icon={Clock} onClick={onGenerateSubjectQR} color="#1e3a8a" />
  </div>
);

// Camera Modal Component
const CameraModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let html5QrCode;
    if (isOpen) {
      setError(null);
      setScanning(true);
      html5QrCode = new Html5Qrcode("reader");
      const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      html5QrCode.start({ facingMode: "environment" }, qrConfig,
        (decodedText) => {
          setScanning(false);
          html5QrCode.stop().then(() => onScanSuccess(decodedText));
        },
        (errorMessage) => {}
      ).catch(err => {
        console.error("Error starting QR scanner:", err);
        setError("Kamera tidak dapat diakses.");
        setScanning(false);
      });
    }
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Error stopping scanner:", err));
      }
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="siswa-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="siswa-box-modal" onClick={e => e.stopPropagation()}>
        <div className="siswa-kepala-modal">
          <h2 className="siswa-judul-modal">Scan QR Code</h2>
          <button className="siswa-tutup-modal" onClick={onClose}>&times;</button>
        </div>
        <div className="siswa-konten-modal">
          <div id="reader" style={{ width: '100%', minHeight: '300px', borderRadius: '12px', overflow: 'hidden' }}></div>
          {error && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</p>}
          <p className="siswa-instruksi-modal">{scanning ? "Arahkan kamera ke QR Code presensi" : "Memproses..."}</p>
        </div>
      </div>
    </div>
  );
};

// QR Generator Modal Component
const QRGeneratorModal = ({ isOpen, onClose, token }) => {
  if (!isOpen) return null;
  return (
    <div className="siswa-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="siswa-box-modal" onClick={e => e.stopPropagation()}>
        <div className="siswa-kepala-modal">
          <h2 className="siswa-judul-modal">QR Code Saya</h2>
          <button className="siswa-tutup-modal" onClick={onClose}>&times;</button>
        </div>
        <div className="siswa-konten-modal" style={{ textAlign: 'center' }}>
          <div className="siswa-pembungkus-qr" style={{ padding: '20px', background: 'white', borderRadius: '16px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            {token ? <QRCodeSVG value={token} size={250} /> : <div className="siswa-pemuat-qr">Menghasilkan QR...</div>}
          </div>
          <p className="siswa-instruksi-modal" style={{ marginTop: '20px' }}>Tunjukkan QR ini ke petugas/guru</p>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard
const Dashboard = () => {
  const navigate = useNavigate();
  const [showSubjects, setShowSubjects] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [qrToken, setQrToken] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [profileImage, setProfileImage] = useState(null);
  
  const [user, setUser] = useState(authHelpers.getUserData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dash, summary] = await Promise.all([
        attendanceService.getStudentClassDashboard(),
        attendanceService.getMyAttendanceSummary()
      ]);
      
      setDashboardData(dash);
      setAttendanceSummary(summary);
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
      setError('Gagal mengambil data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleScanSuccess = async (decodedText) => {
    setShowCamera(false);
    try {
      setLoading(true);
      await attendanceService.scanQRCode(decodedText);
      alert('Presensi berhasil!');
      fetchDashboardData(); // Refresh data
    } catch (err) {
      console.error('Scan error:', err);
      alert(err.response?.data?.message || 'Gagal melakukan presensi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    try {
      setLoading(true);
      // For student daily QR or generic token, we might not need scheduleId 
      // depends on backend. api.php says POST /qrcodes/generate.
      // QrCodeController likely handles logic.
      const response = await attendanceService.generateQRToken();
      setQrToken(response.token || response.data?.token);
      setShowQRGenerator(true);
    } catch (err) {
      console.error('Generate QR error:', err);
      alert('Gagal menghasilkan QR Code.');
    } finally {
      setLoading(false);
    }
  };

  // Process monthly trend from backend summary
  const monthlyTrend = React.useMemo(() => {
    if (!attendanceSummary?.daily_summary) return [];
    
    // Group daily summary into months if needed, or if backend already provides monthly.
    // Based on summaryMe code, it returns daily_summary.
    // Let's transform daily to monthly for the chart if needed, 
    // but the chart expects [{ month: 'Jan', percentage: 95, ... }]
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyData = {};
    
    attendanceSummary.daily_summary.forEach(item => {
      const date = new Date(item.day);
      const monthIdx = date.getMonth();
      const monthName = months[monthIdx];
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = { month: monthName, total: 0, hadir: 0 };
      }
      
      monthlyData[monthName].total += parseInt(item.total);
      if (['present', 'late'].includes(item.status)) {
        monthlyData[monthName].hadir += parseInt(item.total);
      }
    });
    
    return Object.values(monthlyData).map(m => ({
      ...m,
      percentage: m.total > 0 ? Math.round((m.hadir / m.total) * 100) : 0
    }));
  }, [attendanceSummary]);

  // Process weekly stats
  const weeklyStats = React.useMemo(() => {
    const defaultStats = { hadir: 0, terlambat: 0, pulang: 0, izin: 0, sakit: 0, alpha: 0 };
    if (!attendanceSummary?.status_summary) return defaultStats;
    
    attendanceSummary.status_summary.forEach(item => {
      const status = item.status;
      const count = parseInt(item.total);
      
      if (status === 'present') defaultStats.hadir += count;
      else if (status === 'late') defaultStats.terlambat += count;
      else if (status === 'izin') defaultStats.izin += count;
      else if (status === 'sick') defaultStats.sakit += count;
      else if (status === 'absent') defaultStats.alpha += count;
      // Add more as needed
    });
    
    return defaultStats;
  }, [attendanceSummary]);

  const formatDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[currentDateTime.getDay()]}, ${currentDateTime.getDate()} ${months[currentDateTime.getMonth()]} ${currentDateTime.getFullYear()}`;
  };

  const formatTime = () => {
    return currentDateTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      try {
        await authService.logout();
        navigate('/');
      } catch (error) {
        console.error('Logout error:', error);
        navigate('/');
      }
    }
  };

  const handleUpdateProfileImage = (newImageUrl) => {
    setProfileImage(newImageUrl);
  };

  const dashboardProfile = {
    name: user?.name || 'Siswa',
    kelas: dashboardData?.student?.class_name || '-',
    id: dashboardData?.student?.nis || '-',
    gender: user?.gender || 'laki-laki'
  };

  return (
    <>
      <NavbarSiswa />
      <div className="siswa-dashboard-utama">
        <div className="siswa-bagian-profil">
          <div className="siswa-konten-profil" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
            <div className="siswa-pembungkus-avatar">
              <div className="siswa-avatar-profil">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="siswa-gambar-avatar" />
                ) : (
                  <div className="siswa-ikon-avatar">
                    <ProfileIcon gender={dashboardProfile.gender} size={80} />
                  </div>
                )}
              </div>
            </div>
            <h1 className="siswa-nama-profil">{loading ? '...' : dashboardProfile.name}</h1>
            <h3 className="siswa-kelas-profil">{loading ? '...' : dashboardProfile.kelas}</h3>
            <p className="siswa-id-profil">{loading ? '...' : dashboardProfile.id}</p>
          </div>

          <button className="btn-logout" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Keluar
          </button>
        </div>

        <main className="siswa-dashboard-konten">
          <div className="siswa-dashboard-grid">
            <div className="siswa-bagian-konten">
              <DailySchedule 
                day={dashboardData?.day_name || 'Hari Ini'} 
                date={formatDate()}
                schedule={dashboardData?.schedule_today || []} 
              />
              
              <StatsSection 
                weeklyStats={weeklyStats} 
                monthlyTrend={monthlyTrend} 
              />
              
              <ActionSection 
                onScanMasuk={() => setShowCamera(true)}
                onScanPulang={() => setShowCamera(true)}
                onGenerateSubjectQR={handleGenerateQR}
              />
            </div>
          </div>
        </main>

        <CameraModal 
          isOpen={showCamera} 
          onClose={() => setShowCamera(false)}
          onScanSuccess={handleScanSuccess}
        />
        
        <QRGeneratorModal 
          isOpen={showQRGenerator} 
          onClose={() => setShowQRGenerator(false)} 
          token={qrToken}
        />
        
        <SubjectsModal isOpen={showSubjects} onClose={() => setShowSubjects(false)} 
          classId={dashboardData?.student?.class_id} />
        
        <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} 
          profile={dashboardProfile} currentProfileImage={profileImage}
          onUpdateProfileImage={handleUpdateProfileImage} onLogout={handleLogout} />
      </div>
    </>
  );
};

export default Dashboard;