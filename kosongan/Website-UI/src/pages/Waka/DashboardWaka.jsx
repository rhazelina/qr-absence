import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { FaUser } from "react-icons/fa";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "./DashboardWaka.css";
import { useNavigate } from "react-router-dom";
import NavbarWaka from "../../components/Waka/NavbarWaka";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DashboardWaka() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [selectedSemester, setSelectedSemester] = useState("ganjil");
  const [statistikData, setStatistikData] = useState({
    ganjil: { hadir: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 },
    genap: { hadir: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 }
  });
  const [chartData, setChartData] = useState({
    ganjil: {
      labels: ["Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
      datasets: []
    },
    genap: {
      labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
      datasets: []
    }
  });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // TODO: Fetch data dari API
  useEffect(() => {
    // fetchStatistikData();
    // fetchChartData();
  }, []);

  // Pilih data berdasarkan semester yang dipilih
  const statistik = statistikData[selectedSemester];
  const data = chartData[selectedSemester];

  const tanggal = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleLogout = () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      navigate('/');
      
      alert('Anda telah berhasil logout');
    }
  };

  const jam = now.toLocaleTimeString("id-ID");

  return (
    <div className="dashboard-page">
      <NavbarWaka />
      <div className="dashboard-containerr">
        {/* SIDEBAR */}
        <aside className="dashboard-sidebar">
          <div className="dashboard-profile">
            <div className="dashboard-avatar">
              <FaUser />
            </div>
            <p>
              WAKA
              <br />
              KESISWAAN
            </p>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Keluar
          </button>
        </aside>

        {/* CONTENT */}
        <main className="dashboard-content">
          {/* TOP ROW */}
          <div className="dashboard-top">
            {/* DATE BOX */}
            <div className="dashboard-datebox">
              <div className="dashboard-date">{tanggal}</div>
              <div className="dashboard-clock">{jam}</div>
            </div>

            {/* MINI STATS */}
            <div className="dashboard-mini-wrapper">
              <Mini title="Hadir" value={statistik.hadir} cls="hadir" />
              <Mini title="Izin" value={statistik.izin} cls="izin" />
              <Mini title="Sakit" value={statistik.sakit} cls="sakit" />
              <Mini title="Alfa" value={statistik.alfa} cls="alfa" />
              <Mini title="Pulang" value={statistik.pulang} cls="pulang" />
            </div>
          </div>

          {/* CHART */}
          <div className="dashboard-chart">
            {/* Dropdown Semester di pojok kanan atas chart */}
            <div className="chart-header">
              <select 
                value={selectedSemester} 
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="semester-dropdown-chart"
              >
                <option value="">Pilih Semester</option>
                <option value="ganjil">Semester Ganjil (Jul-Des)</option>
                <option value="genap">Semester Genap (Jan-Jun)</option>
              </select>
            </div>
            
            <Bar
              data={data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 5,
                    },
                  },
                },
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function Mini({ title, value, cls }) {
  return (
    <div className={`dashboard-mini ${cls}`}>
      <span>{title}</span>
      <b>{value}</b>
    </div>
  );
}