import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoSchool from '../assets/Icon/logo smk.png';
import Inorasi from '../assets/Icon/INORASI2.png';
import HalamanUtama from '../assets/Icon/HalamanUtama.png';

interface LandingPageProps {
  onRoleSelect: (role: string) => void;
}

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'guru', label: 'Guru' },
  { value: 'siswa', label: 'Siswa' },
  { value: 'pengurus_kelas', label: 'Pengurus Kelas' },
  { value: 'waka', label: 'Waka Staff' },
  { value: 'wakel', label: 'Wali Kelas' },
];

export default function LandingPage({ onRoleSelect }: LandingPageProps) {
  const [selectedRole, setSelectedRole] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
      navigate('/login');
    }
  };

  const selectedRoleLabel =
    selectedRole
      ? ROLES.find(role => role.value === selectedRole)?.label
      : 'Masuk sebagai';

  return (
    <>
      {/* BACKGROUND FIXED */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url(${HalamanUtama})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* CONTENT */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Logo SMK */}
        <img
          src={LogoSchool}
          alt="Logo SMK"
          style={{
            position: 'absolute',
            top: '20px',
            right: '40px',
            width: '90px',
            height: 'auto',
            zIndex: 2,
          }}
        />

        <div
          style={{
            width: '100%',
            maxWidth: '560px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* JUDUL */}
          <h1
            style={{
              fontSize: 'clamp(36px, 5vw, 60px)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '2px',
              margin: 0,
              textShadow: '0 3px 8px rgba(0,0,0,0.3)',
            }}
          >
            ABSENSI
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 3vw, 24px)',
              fontWeight: 700,
              color: '#ffffff',
              margin: '8px 0 12px',
              letterSpacing: '1px',
            }}
          >
            SMKN 2 SINGOSARI
          </p>

          {/* LOGO INORASI */}
          <img
            src={Inorasi}
            alt="Inorasi"
            style={{
              width: '100%',
              maxWidth: '400px',
              height: 'auto',
              marginBottom: '32px',
            }}
          />

          {/* FORM */}
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div ref={dropdownRef} style={{ marginBottom: '24px' }}>
              <button
                ref={buttonRef}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: selectedRole
                    ? '2px solid #1E3A8A'
                    : '3px solid rgba(37, 99, 235, 0.8)',
                  backgroundColor: selectedRole ? '#0B2948' : '#ffffff',
                  color: selectedRole ? '#ffffff' : '#0F172A',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                {selectedRoleLabel}
                <span>{isDropdownOpen ? '▲' : '▼'}</span>
              </button>

              {isDropdownOpen && (
                <div
                  style={{
                    border: '2px solid rgba(37, 99, 235, 0.6)',
                    borderRadius: '12px',
                    marginTop: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                  }}
                >
                  {ROLES.map(role => (
                    <button
                      key={role.value}
                      onClick={() => {
                        setSelectedRole(role.value);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        border: 'none',
                        backgroundColor:
                          selectedRole === role.value ? '#1D4ED8' : '#ffffff',
                        color:
                          selectedRole === role.value ? '#ffffff' : '#0F172A',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '18px',
                fontWeight: 700,
                color: '#001F3E',
                backgroundColor: '#ffffff',
                cursor: selectedRole ? 'pointer' : 'not-allowed',
              }}
            >
              Lanjutkan
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
