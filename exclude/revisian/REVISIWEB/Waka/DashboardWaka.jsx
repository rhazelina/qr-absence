import { useState, useEffect, useMemo } from "react";
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
  
  // State untuk data dari API
  const [statistikData, setStatistikData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update jam setiap detik
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Ganti dengan endpoint API yang sesuai
        // const token = localStorage.getItem('token');
        // const response = await fetch('YOUR_API_ENDPOINT/dashboard', {
        //   headers: {
        //     'Authorization': `Bearer ${token}`
        //   }
        // });
        
        // if (!response.ok) throw new Error('Gagal memuat data');
        // const data = await response.json();

        // Contoh struktur data yang diharapkan dari API:
        // setStatistikData(data.statistik); 
        // setChartData(data.chart);

        // Sementara set data kosong
        setStatistikData({
          ganjil: { hadir: 0, izin: 0, sakit: 0, alpha: 0, pulang: 0 },
          genap: { hadir: 0, izin: 0, sakit: 0, alpha: 0, pulang: 0 }
        });

        setChartData({
          ganjil: {
            hadir: [0, 0, 0, 0, 0, 0],
            izin: [0, 0, 0, 0, 0, 0],
            sakit: [0, 0, 0, 0, 0, 0],
            alpha: [0, 0, 0, 0, 0, 0],
            pulang: [0, 0, 0, 0, 0, 0]
          },
          genap: {
            hadir: [0, 0, 0, 0, 0, 0],
            izin: [0, 0, 0, 0, 0, 0],
            sakit: [0, 0, 0, 0, 0, 0],
            alpha: [0, 0, 0, 0, 0, 0],
            pulang: [0, 0, 0, 0, 0, 0]
          }
        });

      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat memuat data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Fetch sekali saat component mount

  // Statistik yang ditampilkan berdasarkan semester
  const statistik = useMemo(() => {
    if (!statistikData) return { hadir: 0, izin: 0, sakit: 0, alpha: 0, pulang: 0 };
    return selectedSemester === "ganjil" ? statistikData.ganjil : statistikData.genap;
  }, [statistikData, selectedSemester]);

  // Data chart yang dioptimasi dengan useMemo
  const data = useMemo(() => {
    if (!chartData) {
      return {
        labels: [],
        datasets: []
      };
    }

    const currentData = selectedSemester === "ganjil" ? chartData.ganjil : chartData.genap;
    const labels = selectedSemester === "ganjil" 
      ? ["Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
      : ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];

    return {
      labels,
      datasets: [
        {
          label: "Hadir",
          data: currentData.hadir,
          backgroundColor: "#1FA83D",
        },
        {
          label: "Izin",
          data: currentData.izin,
          backgroundColor: "#EDD329",
        },
        {
          label: "Sakit",
          data: currentData.sakit,
          backgroundColor: "#9A0898",
        },
        {
          label: "Alpha",
          data: currentData.alpha,
          backgroundColor: "#D90000",
        },
        {
          label: "Pulang",
          data: currentData.pulang,
          backgroundColor: "#FF5F1A",
        },
      ],
    };
  }, [chartData, selectedSemester]);

  // Chart options yang dioptimasi dengan useMemo
  const chartOptions = useMemo(() => ({
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
  }), []);

  const tanggal = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const jam = now.toLocaleTimeString("id-ID");

  const handleLogout = () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      navigate('/');
      
      alert('Anda telah berhasil keluar');
    }
  };

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
          {/* Loading State */}
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner">Memuat data...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
              <button onClick={() => window.location.reload()}>Coba Lagi</button>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <>
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
                  <Mini title="Alpha" value={statistik.alpha} cls="alpha" />
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
                
                <Bar data={data} options={chartOptions} />
              </div>
            </>
          )}
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