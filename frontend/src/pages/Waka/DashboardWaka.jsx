import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  FaCheckCircle,
  FaInfoCircle,
  FaProcedures,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
  FaChartLine,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import PageWrapper from "../../components/ui/PageWrapper";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardWaka() {
  const [now, setNow] = useState(new Date());
  const [statistik, setStatistik] = useState({ hadir: 0, izin: 0, sakit: 0, alpha: 0, terlambat: 0 });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchData = async (signal) => {
    try {
      setIsLoading(true);
      setError(null);
      const { default: apiClient } = await import("../../services/api");
      const response = await apiClient.get('waka/dashboard/summary', { signal });
      const stats = response?.data?.statistik || { hadir: 0, izin: 0, sakit: 0, alpha: 0, terlambat: 0 };
      const trend = response?.data?.trend || [];

      setStatistik(stats);

      const labels = trend.map(t => t.month);
      const percentages = trend.map(t => t.percentage);

      setChartData({
        labels,
        datasets: [
          {
            label: "Persentase Kehadiran (%)",
            data: percentages,
            borderColor: "#4F46E5",
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#4F46E5",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Failed to fetch dashboard data:", error);
        setError("Gagal memuat data dashboard. Silakan coba lagi nanti.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    const interval = setInterval(() => fetchData(controller.signal), 60000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <PageWrapper className="flex flex-col bg-transparent font-sans">

      {/* MAIN CONTENT */}
      <div className="p-6 md:p-10 lg:p-12 max-w-[1400px] mx-auto space-y-10 w-full">

        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-white/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-1.5 bg-indigo-600 rounded-full"></span>
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight uppercase italic">Waka Dashboard</h1>
            </div>
            <p className="text-gray-500 font-medium ml-11">Monitor statistik kehadiran sekolah secara komprehensif.</p>
          </div>

          <div className="flex items-center gap-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 shadow-inner ml-auto lg:ml-0">
            <div className="text-right">
              <div className="text-3xl font-black text-indigo-600 font-mono tracking-tighter leading-none mb-1">
                {now.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm border border-gray-100"><FaClock /></div>
          </div>
        </div>

        {/* STATS STRIP */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-32 rounded-[2rem]"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl flex items-center gap-4 shadow-sm">
            <FaInfoCircle className="shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <StatsCard title="Hadir" value={statistik.hadir} icon={<FaCheckCircle />} color="emerald" />
            <StatsCard title="Izin" value={statistik.izin} icon={<FaInfoCircle />} color="amber" />
            <StatsCard title="Sakit" value={statistik.sakit} icon={<FaProcedures />} color="violet" />
            <StatsCard title="Alpha" value={statistik.alpha} icon={<FaTimesCircle />} color="red" />
            <StatsCard title="Terlambat" value={statistik.terlambat} icon={<FaClock />} color="orange" />
          </div>
        )}

        {/* ANALYTICS & WIDGETS */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Chart Area */}
          <div className="xl:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-10 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-4">
                <span className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><FaChartLine /></span>
                Tren Kehadiran 6 Bulan
              </h3>
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                <span className="px-6 py-2 bg-white text-indigo-600 rounded-xl text-xs font-black shadow-sm border border-gray-100 uppercase tracking-widest">Persentase (%)</span>
              </div>
            </div>

            <div className="flex-1 min-h-[350px]">
              {isLoading ? (
                <div className="w-full h-full bg-gray-50 rounded-[2rem] animate-pulse flex items-center justify-center">
                  <p className="text-gray-400 font-bold uppercase tracking-widest">Loading Chart...</p>
                </div>
              ) : (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 15,
                        cornerRadius: 16,
                        titleFont: { size: 14, weight: '900' },
                        bodyFont: { size: 13, weight: '600' },
                        callbacks: {
                          label: (context) => ` Kehadiran: ${context.parsed.y}%`
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#f8fafc', borderDash: [5, 5] },
                        ticks: { font: { weight: '700' }, callback: (value) => value + '%' }
                      },
                      x: { grid: { display: false }, ticks: { font: { weight: '700' } } }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Side Info / Activity */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[2.5rem] shadow-xl p-10 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-3">Tahun Ajaran</p>
                <h4 className="text-3xl font-black leading-tight mb-6">2025 / 2026 <br /><span className="text-indigo-200 opacity-60">Semester Genap</span></h4>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                </div>
                <p className="text-xs font-bold text-indigo-100 mt-4 italic opacity-80">Progres semester berjalan: 65%</p>
              </div>
              <FaCalendarAlt size={120} className="absolute -right-8 -bottom-8 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-10">
              <h4 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-6 flex items-center gap-3">
                <span className="w-2 h-6 bg-amber-400 rounded-full"></span>
                Aktivitas Terbaru
              </h4>
              <div className="space-y-6">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex gap-5 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0 group">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <FaInfoCircle size={14} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 font-bold leading-relaxed mb-1 group-hover:text-gray-900 transition-colors">Rekap mingguan kehadiran siswa telah digenerate.</p>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">2 jam yang lalu</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}

function StatsCard({ title, value, icon, color }) {
  const configs = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50",
    amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50",
    violet: "bg-violet-50 text-violet-600 border-violet-100 shadow-violet-100/50",
    red: "bg-red-50 text-red-600 border-red-100 shadow-red-100/50",
    orange: "bg-orange-50 text-orange-600 border-orange-100 shadow-orange-100/50",
  };
  const config = configs[color];

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative">
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-6 transition-all group-hover:scale-110 shadow-lg ${config}`}>
          {icon}
        </div>
        <h3 className="text-3xl font-black text-gray-800 tracking-tighter mb-1">{value}</h3>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
      </div>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 ${config.split(' ')[0]}`}></div>
    </div>
  );
}