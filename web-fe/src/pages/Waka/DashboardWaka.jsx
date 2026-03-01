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

// ============================================================
// ⚙️  DUMMY DATA & MOCK (untuk testing) — hapus saat production
// ============================================================

// 🧪 Rekap statistik per semester — ganti dengan data dari API saat production
// Dihitung berdasarkan _DUMMY_REKAP dari KehadiranSiswaRekap (36 siswa XII RPL 1)
const _DUMMY_STATISTIK = {
  ganjil: { hadir: 612, izin: 22, sakit: 31, alfa: 9, pulang: 5,  dispen: 6  },
  genap:  { hadir: 588, izin: 18, sakit: 27, alfa: 6, pulang: 8,  dispen: 12 },
};

// 🧪 Data chart per bulan — ganti dengan data dari API saat production
const _DUMMY_CHART = {
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

// ============================================================
// 🔚 AKHIR DUMMY DATA
// ============================================================

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
    // 🧪 Gunakan dummy data — ganti dengan API call saat production
    // Contoh:
    // fetchStatistikData().then(data => setStatistikData(data));
    // fetchChartData().then(data => setChartData(data));

    setStatistikData(_DUMMY_STATISTIK);
    setChartData(_DUMMY_CHART);
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      navigate('/');
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