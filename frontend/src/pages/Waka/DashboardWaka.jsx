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
import apiService from "../../utils/api";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MONTHS_GANJIL = ["Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MONTHS_GENAP = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];

const emptyStats = { hadir: 0, izin: 0, sakit: 0, alfa: 0, pulang: 0 };

function buildChartData(trend = [], fallbackLabels = MONTHS_GANJIL) {
  const labels =
    Array.isArray(trend) && trend.length > 0
      ? trend.map((item) => item.month)
      : fallbackLabels;

  const sourceByLabel = new Map(
    (Array.isArray(trend) ? trend : []).map((item) => [item.month, item])
  );

  const getValue = (label, key) => sourceByLabel.get(label)?.[key] ?? 0;

  return {
    labels,
    datasets: [
      {
        label: "Hadir",
        data: labels.map((label) => getValue(label, "present")),
        backgroundColor: "#1FA83D",
        borderRadius: 6,
      },
      {
        label: "Izin",
        data: labels.map((label) => getValue(label, "izin")),
        backgroundColor: "#EDD329",
        borderRadius: 6,
      },
      {
        label: "Sakit",
        data: labels.map((label) => getValue(label, "sick")),
        backgroundColor: "#9A0898",
        borderRadius: 6,
      },
      {
        label: "Alfa",
        data: labels.map((label) => getValue(label, "absent")),
        backgroundColor: "#D90000",
        borderRadius: 6,
      },
      {
        label: "Pulang",
        data: labels.map((label) => getValue(label, "return")),
        backgroundColor: "#FF5F1A",
        borderRadius: 6,
      },
    ],
  };
}

function getSemesterMeta(semester) {
  const name = (semester?.name || "").toLowerCase();
  if (name.includes("genap")) {
    return { monthLabel: "Jan-Jun", fallbackLabels: MONTHS_GENAP };
  }
  return { monthLabel: "Jul-Des", fallbackLabels: MONTHS_GANJIL };
}

export default function DashboardWaka() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [statistik, setStatistik] = useState(emptyStats);
  const [chartData, setChartData] = useState(buildChartData([], MONTHS_GANJIL));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await apiService.getSemesters();
        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];
        setSemesters(list);

        if (list.length > 0) {
          const activeSemester = list.find((item) => item.active) || list[0];
          setSelectedSemesterId(String(activeSemester.id));
        }
      } catch (error) {
        console.error("Error fetching semesters:", error);
      }
    };

    fetchSemesters();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await apiService.getWakaDashboardSummary(
          selectedSemesterId || undefined
        );
        const statistikApi = response?.statistik || {};

        setStatistik({
          hadir: statistikApi.hadir || 0,
          izin: statistikApi.izin || 0,
          sakit: statistikApi.sakit || 0,
          alfa: statistikApi.alpha || 0,
          pulang: statistikApi.pulang || 0,
        });

        const selectedSemester = semesters.find(
          (item) => String(item.id) === String(selectedSemesterId)
        );
        const { fallbackLabels } = getSemesterMeta(selectedSemester);
        setChartData(buildChartData(response?.trend, fallbackLabels));
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
        setErrorMessage("Gagal memuat ringkasan dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedSemesterId, semesters]);

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
  const selectedSemester = semesters.find(
    (item) => String(item.id) === String(selectedSemesterId)
  );
  const selectedSemesterMeta = getSemesterMeta(selectedSemester);

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
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                className="semester-dropdown-chart"
              >
                {semesters.length === 0 ? (
                  <option value="">Semester ({selectedSemesterMeta.monthLabel})</option>
                ) : (
                  semesters.map((semester) => {
                    const { monthLabel } = getSemesterMeta(semester);
                    const year = semester?.school_year
                      ? `${semester.school_year.start_year}/${semester.school_year.end_year}`
                      : "";
                    return (
                      <option key={semester.id} value={semester.id}>
                        {semester.name} ({monthLabel}) {year}
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            {isLoading ? (
              <div className="dashboard-loading">Memuat dashboard...</div>
            ) : (
              <>
                {errorMessage && <div className="dashboard-error">{errorMessage}</div>}
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
                          precision: 0,
                        },
                      },
                    },
                  }}
                />
                {chartData.datasets.every((dataset) =>
                  dataset.data.every((value) => value === 0)
                ) && <div className="dashboard-empty">Belum ada data kehadiran pada periode ini.</div>}
              </>
            )}
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
