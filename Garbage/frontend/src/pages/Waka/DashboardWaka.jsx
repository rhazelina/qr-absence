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
import { authService } from '../../services/auth';
import { wakaService } from '../../services/waka';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DashboardWaka() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [statistik, setStatistik] = useState({
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
    pulang: 0,
  });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch Semesters on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const semesterData = await wakaService.getSemesters();
        const list = semesterData.data || [];
        setSemesters(list);
        
        // Find active semester
        const active = list.find(s => s.active);
        if (active) {
          setSelectedSemester(active.id);
        } else if (list.length > 0) {
          setSelectedSemester(list[0].id);
        }
      } catch (error) {
        console.error("Error fetching semesters:", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSemester && semesters.length > 0) return;

      setLoading(true);
      try {
        const data = await wakaService.getDashboardSummary({ 
          semester_id: selectedSemester 
        });
        setStatistik(data.statistik);

        const labels = data.trend.map(item => item.month);
        
        setChartData({
          labels: labels,
          datasets: [
            {
              label: "Hadir",
              data: data.trend.map(item => item.present),
              backgroundColor: "#1FA83D",
            },
            {
              label: "Izin",
              data: data.trend.map(item => item.izin),
              backgroundColor: "#d8bf1a",
            },
            {
              label: "Sakit",
              data: data.trend.map(item => item.sick),
              backgroundColor: "#9A0898",
            },
            {
              label: "Alpha",
              data: data.trend.map(item => item.absent),
              backgroundColor: "#D90000",
            },
            {
              label: "Pulang",
              data: data.trend.map(item => item.return),
              backgroundColor: "#FF5F1A",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSemester]);

  const tanggal = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleLogout = () => {
    // Konfirmasi logout
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    
    if (confirmLogout) {
      // Redirect ke halaman login
      authService.logout();
      navigate('/login');
      
      // Optional: tampilkan pesan
      alert('Anda telah berhasil logout');
    }
  };

  const jam = now.toLocaleTimeString("id-ID");

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

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
              <div className="dashboard-semester">
                <select 
                  value={selectedSemester} 
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="semester-select"
                >
                  <option value="">Pilih Semester</option>
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>
                      Semester {s.name} {s.school_year?.name} {s.active ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
              </div>
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
            <Bar
              data={chartData}
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