import React from 'react';
import './JadwalWakel.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import jadwalImage from '../../assets/jadwal.png'; // Import gambar jadwal

const JadwalWakel = () => {
  // Data teacher tetap sama
  const teacher = {
    name: "Alifah Diantebes Aindra",
    nip: "0123456789"
  };

  return (
    <div className="jadwal-container">
      <NavbarWakel />
      <div className="jadwal-layout">
        {/* Sidebar Profile - Tidak berubah */}
        <div className="jadwal-sidebar">
          <div className="jadwal-profile-card">
            <div className="jadwal-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <h2 className="jadwal-teacher-name">{teacher.name}</h2>
            <p className="jadwal-teacher-nip">{teacher.nip}</p>
          </div>
        </div>

        {/* Main Content - Ganti dengan gambar */}
        <div className="jadwal-main">
          <h1 className="jadwal-title">Jadwal Pembelajaran</h1>
          
          <div className="schedule-image-container">
            <img 
              src={jadwalImage} 
              alt="Jadwal Pembelajaran" 
              className="jadwal-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JadwalWakel;