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
import api from "../../utils/api";
import { clearAuth } from "../../utils/auth";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DEFAULT_STATISTIK = {
  ganjil: { hadir: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0, dispen: 0 },
  genap: { hadir: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0, dispen: 0 },
};

const DEFAULT_CHART = {
  ganjil: {
    labels: ["Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    datasets: [
      {
        label: "Hadir",
        data: [95, 102, 98, 110, 105, 102],
        backgroundColor: "#22c55e",
        borderRadius: 6,
      },
      {
        label: "Sakit",
        data: [5, 4, 7, 3, 6, 6],
        backgroundColor: "#a855f7",
        borderRadius: 6,
      },
      {
        label: "Izin",
        data: [3, 5, 4, 4, 3, 3],
        backgroundColor: "#eab308",
        borderRadius: 6,
      },
      {
        label: "Alfa",
        data: [2, 1, 2, 1, 2, 1],
        backgroundColor: "#ef4444",
        borderRadius: 6,
      },
      {
        label: "Pulang",
        data: [1, 1, 1, 0, 1, 1],
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      },
      {
        label: "Dispen",
        data: [1, 1, 2, 1, 0, 1],
        backgroundColor: "#ec4899",
        borderRadius: 6,
      },
    ],
  },
  genap: {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        label: "Hadir",
        data: [98, 97, 100, 96, 105, 92],
        backgroundColor: "#22c55e",
        borderRadius: 6,
      },
      {
        label: "Sakit",
        data: [4, 5, 6, 5, 4, 3],
        backgroundColor: "#a855f7",
        borderRadius: 6,
      },
      {
        label: "Izin",
        data: [3, 3, 4, 3, 3, 2],
        backgroundColor: "#eab308",
        borderRadius: 6,
      },
      {
        label: "Alfa",
        data: [1, 1, 2, 1, 0, 1],
        backgroundColor: "#ef4444",
        borderRadius: 6,
      },
      {
        label: "Pulang",
        data: [2, 1, 2, 1, 1, 1],
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      },
      {
        label: "Dispen",
        data: [2, 2, 3, 2, 2, 1],
        backgroundColor: "#ec4899",
        borderRadius: 6,
      },
    ],
  },
};

export default function DashboardWaka() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [selectedSemester, setSelectedSemester] = useState("ganjil");
  const [statistikData, setStatistikData] = useState({ ganjil: {}, genap: {} });
  const [chartData, setChartData] = useState({ ganjil: { labels: [], datasets: [] }, genap: { labels: [], datasets: [] } });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const summary = await api.get('/waka/dashboard/summary');
        const stats = {
          hadir: summary?.hadir || 0,
          izin: summary?.izin || 0,
          sakit: summary?.sakit || 0,
          alfa: summary?.alpha || summary?.alfa || 0,
          pulang: summary?.pulang || 0,
          dispen: summary?.dispen || 0,
        };
        setStatistikData({ ganjil: stats, genap: stats });
      } catch {
        setStatistikData(DEFAULT_STATISTIK);
      }

      try {
        const summary = await api.get('/waka/attendance/summary');
        const statusRows = Array.isArray(summary?.status_summary) ? summary.status_summary : [];
        const stat = { hadir: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0, dispen: 0 };
        statusRows.forEach((row) => {
          const key = String(row.status || '').toLowerCase();
          const total = Number(row.total || 0);
          if (key === 'present') stat.hadir += total;
          if (key === 'late') stat.hadir += total;
          if (key === 'izin' || key === 'excused') stat.izin += total;
          if (key === 'sick') stat.sakit += total;
          if (key === 'absent') stat.alfa += total;
          if (key === 'return') stat.pulang += total;
          if (key === 'dinas') stat.dispen += total;
        });
        const buildSeries = (labels) => ({
          labels,
          datasets: [
            { label: "Hadir", data: labels.map(() => stat.hadir), backgroundColor: "#22c55e", borderRadius: 6 },
            { label: "Sakit", data: labels.map(() => stat.sakit), backgroundColor: "#a855f7", borderRadius: 6 },
            { label: "Izin", data: labels.map(() => stat.izin), backgroundColor: "#eab308", borderRadius: 6 },
            { label: "Alfa", data: labels.map(() => stat.alfa), backgroundColor: "#ef4444", borderRadius: 6 },
            { label: "Pulang", data: labels.map(() => stat.pulang), backgroundColor: "#3b82f6", borderRadius: 6 },
            { label: "Dispen", data: labels.map(() => stat.dispen), backgroundColor: "#ec4899", borderRadius: 6 },
          ]
        });
        setChartData({
          ganjil: buildSeries(["Jul", "Agu", "Sep", "Okt", "Nov", "Des"]),
          genap: buildSeries(["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"]),
        });
      } catch {
        setChartData(DEFAULT_CHART);
      }
    };
    load();
  }, []);

  const statistik = statistikData[selectedSemester] || {};
  const data = chartData[selectedSemester] || { labels: [], datasets: [] };

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
      clearAuth();
      sessionStorage.clear();
      navigate('/login');
      alert('Anda telah berhasil logout');
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
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
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
              <Mini title="Hadir"  value={statistik.hadir  ?? 0} cls="hadir"  />
              <Mini title="Izin"   value={statistik.izin   ?? 0} cls="izin"   />
              <Mini title="Sakit"  value={statistik.sakit  ?? 0} cls="sakit"  />
              <Mini title="Alfa"   value={statistik.alfa   ?? 0} cls="alfa"   />
              <Mini title="Pulang" value={statistik.pulang ?? 0} cls="pulang" />
              <Mini title="Dispen" value={statistik.dispen ?? 0} cls="dispen" />
            </div>
          </div>

          {/* CHART */}
          <div className="dashboard-chart">
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
                  legend: { position: "top" },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 20 },
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
