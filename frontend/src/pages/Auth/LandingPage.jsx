import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaUserShield, FaChalkboardTeacher, FaUserGraduate, FaUserTie, FaUserCog, FaUsers, FaArrowRight } from 'react-icons/fa';
import PageWrapper from '../../components/ui/PageWrapper';

// Import assets
import logo from "../../assets/logo.png";
import ino from "../../assets/ino.png";
import rasi from "../../assets/rasi.png";

const LandingPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setIsDropdownOpen(false);
    const roleRoutes = {
      'Admin': '/login/admin',
      'Waka': '/login/waka',
      'Peserta Didik': '/login/siswa',
      'Guru': '/login/guru',
      'Wali Kelas': '/login/wakel',
      'Pengurus Kelas': '/login/pengurus_kelas'
    };
    navigate(roleRoutes[role]);
  };

  const roles = [
    { label: 'Admin', icon: <FaUserShield />, color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'Waka', icon: <FaUserTie />, color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { label: 'Guru', icon: <FaChalkboardTeacher />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Wali Kelas', icon: <FaUserCog />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Pengurus Kelas', icon: <FaUsers />, color: 'bg-orange-50 text-orange-600 border-orange-100' },
    { label: 'Peserta Didik', icon: <FaUserGraduate />, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  ];

  return (
    <PageWrapper className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 md:p-12 font-sans relative">

      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl flex flex-col items-center">

        {/* LOGO & HERO TITLE */}
        <div className="flex flex-col items-center text-center mb-16 space-y-8 animate-fade-in-down">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl border border-white/50 hover:scale-110 transition-transform duration-500 cursor-pointer group">
            <img src={logo} alt="SMKN 2 Singosari Logo" className="w-28 h-28 md:w-36 md:h-36 object-contain filter drop-shadow-xl group-hover:rotate-6 transition-transform" />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none italic uppercase">
              Presensi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900">Pembelajaran Digital</span>
            </h1>
            <div className="h-2 w-32 bg-amber-400 mx-auto rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
            <h2 className="text-xl md:text-2xl font-black text-gray-500 tracking-[0.3em] uppercase">SMKN 2 SINGOSARI</h2>
          </div>
        </div>

        {/* INTERACTIVE AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 items-center justify-items-center gap-12 w-full max-w-5xl mb-20">

          {/* MASCOT LEFT */}
          <div className="hidden lg:block relative group animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-3xl group-hover:opacity-100 transition-opacity"></div>
            <img src={rasi} alt="Rasi Mascot" className="relative w-64 h-auto object-contain z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] transform group-hover:scale-105 transition-transform duration-700" />
            <div className="mt-6 text-center">
              <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-black uppercase tracking-widest border border-orange-200">RASI</span>
            </div>
          </div>

          {/* MAIN ACTION CARD */}
          <div className="relative w-full max-w-md group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 rounded-[2.5rem] blur-xl opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 p-10 flex flex-col items-center">
              <h3 className="text-2xl font-black text-gray-800 mb-8 text-center uppercase tracking-tight flex items-center gap-3">
                <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                Akses Masuk
                <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
              </h3>

              <div className="w-full space-y-4">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-black text-gray-700 transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-100/50 group/btn outline-none
                    ${isDropdownOpen ? 'ring-2 ring-blue-500 bg-white shadow-xl' : ''}`}
                >
                  <span className="tracking-tight uppercase">Pilih Peran Anda</span>
                  <FaChevronDown className={`transform transition-transform duration-500 ${isDropdownOpen ? 'rotate-180 text-blue-600' : 'text-gray-400 group-hover/btn:text-blue-500'}`} />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${isDropdownOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="grid grid-cols-1 gap-2 p-2 mt-2 bg-gray-50/50 rounded-2xl border border-gray-100">
                    {roles.map((role) => (
                      <button
                        key={role.label}
                        onClick={() => handleRoleSelect(role.label)}
                        className="flex items-center justify-between px-6 py-4 text-left rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 group/role"
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-10 h-10 ${role.color} rounded-xl flex items-center justify-center text-lg shadow-sm border group-hover/role:shadow-md transition-all`}>
                            {role.icon}
                          </span>
                          <span className="font-black text-gray-700 text-sm uppercase tracking-widest group-hover/role:text-blue-700 transition-colors">{role.label}</span>
                        </div>
                        <FaArrowRight className="text-gray-300 opacity-0 group-hover/role:opacity-100 group-hover/role:translate-x-1 transition-all text-xs" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 p-4 bg-blue-50 rounded-2xl border border-blue-100/50 w-full text-center">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Sistem Verifikasi Otomatis</p>
              </div>
            </div>
          </div>

          {/* MASCOT RIGHT */}
          <div className="hidden lg:block relative group animate-float animation-delay-2000">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl group-hover:opacity-100 transition-opacity"></div>
            <img src={ino} alt="Ino Mascot" className="relative w-64 h-auto object-contain z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] transform group-hover:scale-105 transition-transform duration-700" />
            <div className="mt-6 text-center">
              <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest border border-blue-200">INO</span>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="fixed bottom-8 w-full text-center z-10">
        <div className="inline-block px-10 py-3 bg-white/50 backdrop-blur-md rounded-full border border-white/50 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 tracking-[0.5em] uppercase">&copy; {new Date().getFullYear()} SMKN 2 SINGOSARI • KREATIF & INOVATIF</p>
        </div>
      </footer>


      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </PageWrapper>
  );
};

export default LandingPage;