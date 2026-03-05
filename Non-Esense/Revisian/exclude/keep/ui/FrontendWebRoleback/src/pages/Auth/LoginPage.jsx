import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    additionalField: ''
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Data dummy untuk autentikasi
  const dummyUsers = {
    'admin': [
      { username: 'admin', password: 'admin123' }
    ],
    'waka': [
      { kodeGuru: 'WK001', password: 'waka123' },
      { kodeGuru: 'WK002', password: 'waka123' }
    ],
    'peserta-didik': [
      { nisn: '123' },
      { nisn: '0012345679' },
      { nisn: '0012345680' }
    ],
    'guru': [
      { kodeGuru: 'GR001', password: 'guru123' },
      { kodeGuru: 'GR002', password: 'guru123' },
      { kodeGuru: 'GR003', password: 'guru123' }
    ],
    'wali-kelas': [
      { kodeGuru: 'WK101', password: 'wakel123' },
      { kodeGuru: 'WK102', password: 'wakel123' }
    ],
    'pengurus-kelas': [
      { nisn: '123' },
      { nisn: '0012345682' }
    ]
  };

  // Konfigurasi untuk setiap role
  const roleConfig = {
    'admin': { 
      title: 'Admin',
      showWelcome: true,
      fields: [
        { name: 'identifier', label: 'Nama Pengguna', placeholder: 'Masukkan username', type: 'text' },
        { name: 'password', label: 'Kata Sandi', placeholder: 'Masukkan kata sandi', type: 'password' }
      ],
      dashboard: '/admin/dashboard'
    },
    'waka': { 
      title: 'Waka',
      showWelcome: true,
      fields: [
        { name: 'identifier', label: 'Kode Guru', placeholder: 'Masukkan kode guru', type: 'text' },
        { name: 'password', label: 'Kata Sandi', placeholder: 'Masukkan kata sandi', type: 'password' }
      ],
      dashboard: '/waka/dashboard'
    },
    'peserta-didik': { 
      title: 'Peserta Didik',
      showWelcome: true,
      fields: [
        { name: 'identifier', label: 'NISN', placeholder: 'Masukkan NISN', type: 'text' }
      ],
      dashboard: '/siswa/dashboard'
    },
    'guru': { 
      title: 'Guru',
      showWelcome: true,
      fields: [
        { name: 'identifier', label: 'Kode Guru', placeholder: 'Masukkan kode guru', type: 'text' },
        { name: 'password', label: 'Kata Sandi', placeholder: 'Masukkan password', type: 'password' }
      ],
      dashboard: '/guru/dashboard'
    },
    'wali-kelas': { 
      title: 'Wali Kelas',
      showWelcome: true,
      fields: [
        { name: 'identifier', label: 'Kode Guru', placeholder: 'Masukkan kode guru', type: 'text' },
        { name: 'password', label: 'Kata Sandi', placeholder: 'Masukkan password', type: 'password' }
      ],
      dashboard: '/walikelas/dashboard'
    },
    'pengurus-kelas': { 
      title: 'Pengurus Kelas',
      showWelcome: true,
      fields: [
        { name: 'identifier', label: 'NISN', placeholder: 'Masukkan NISN', type: 'text' }
      ],
      dashboard: '/pengurus-kelas/dashboard'
    }
  };

  const config = roleConfig[role] || roleConfig['admin'];

  // Fungsi validasi login
  const validateLogin = () => {
    const users = dummyUsers[role] || [];
    
    switch(role) {
      case 'admin':
        return users.some(user => 
          user.username === formData.identifier && 
          user.password === formData.password
        );
      
      case 'waka':
      case 'guru':
      case 'wali-kelas':
        return users.some(user => 
          user.kodeGuru === formData.identifier && 
          user.password === formData.password
        );
      
      case 'peserta-didik':
      case 'pengurus-kelas':
        return users.some(user => 
          user.nisn === formData.identifier
        );
      
      default:
        return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const emptyFields = config.fields.filter(field => !formData[field.name]);
    if (emptyFields.length > 0) {
      setError('Mohon isi semua field!');
      return;
    }

    // Validasi kredensial
    if (validateLogin()) {
      console.log('Login berhasil sebagai', role, formData);
      
      // Simpan data user ke localStorage
      localStorage.setItem('userRole', role);
      localStorage.setItem('userIdentifier', formData.identifier);
      
      // Navigate ke dashboard
      navigate(config.dashboard);
    } else {
      setError('NISN tidak ditemukan atau data login salah!');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleInputChange = (fieldName, value) => {
    setFormData({...formData, [fieldName]: value});
    setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page-container">
      {/* Header diluar box */}
      {config.showWelcome && (
        <div className="login-header">
          <h1 className="welcome-title">Selamat Datang</h1>
          <h1 className="welcome-subtitle">di Presensi Pembelajaran Digital</h1>
        </div>
      )}

      {/* Box form */}
      <div className="login-box">
        {/* Role Title */}
        <h3 className="role-title">{config.title}</h3>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Tampilkan error jika ada */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {config.fields.map((field, index) => (
            <div key={index} className="form-group">
              <label className="form-label">{field.label}</label>
              <div className="input-wrapper">
                <input 
                  type={field.type === 'password' && showPassword ? 'text' : field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="form-input"
                  required
                />
                {/* Toggle password visibility hanya untuk field password */}
                {field.type === 'password' && (
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-toggle"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      // Eye slash icon (hide)
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      // Eye icon (show)
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <div className="button-group">
            <button type="button" onClick={handleBack} className="back-button">
              Kembali
            </button>
            
            <button type="submit" className="login-button">
              Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;