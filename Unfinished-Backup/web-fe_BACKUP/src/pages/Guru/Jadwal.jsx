import React from 'react';
import './Jadwal.css';
import NavbarGuru from '../../components/Guru/NavbarGuru';
import jadwalImage from '../../assets/jadwal.png';

const Jadwal = () => {
  return (
    <div className="jadwal-container">
      <NavbarGuru />
      
      <div className="jadwal-wrapper">
        <div className="jadwal-layout">
          {/* Sidebar Profile */}
          <div className="jadwal-sidebar">
            <div className="jadwal-profile-card">
              <div className="jadwal-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="jadwal-teacher-info">
                <h2 className="jadwal-teacher-name"></h2>
                <p className="jadwal-teacher-nip"></p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="jadwal-main">
            <div className="schedule-image-container">
              <img 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jadwal;