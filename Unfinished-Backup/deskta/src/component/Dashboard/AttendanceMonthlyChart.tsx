import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';
import type { AttendanceDailyStat } from '../../types/dashboard';

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

interface AttendanceMonthlyChartProps {
  data: AttendanceDailyStat[];
  loading?: boolean;
}

const AttendanceMonthlyChart: React.FC<AttendanceMonthlyChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
      </div>
    );
  }

  // Check if there is any actual attendance data
  const hasData = data.some(d => d.present > 0 || d.late > 0 || d.sick > 0 || d.excused > 0 || d.absent > 0);

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-[400px] flex flex-col items-center justify-center text-center">
        <div className="bg-gray-50 dark:bg-gray-900/40 p-5 rounded-full mb-4 group hover:scale-110 transition-transform duration-300">
          <BarChart3 className="w-10 h-10 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Belum ada data kehadiran bulanan
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px]">
          Data statistik kehadiran Anda akan muncul di sini setelah ada riwayat absen.
        </p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.day_label),
    datasets: [
      {
        label: 'Hadir',
        data: data.map(d => d.present),
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 3,
      },
      {
          label: 'Izin/Sakit',
          data: data.map(d => d.sick + d.excused),
          borderColor: 'rgb(245, 158, 11)', // amber-500
          backgroundColor: 'rgba(245, 158, 11, 0.05)',
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
          borderDash: [5, 5],
      }
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          },
          color: 'rgb(107, 114, 128)' // gray-500
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: (context) => {
            return ` ${context.dataset.label}: ${context.parsed.y} Sesi`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
          font: {
            size: 11
          },
          color: 'rgb(156, 163, 175)' // gray-400
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          font: {
            size: 11
          },
          color: 'rgb(156, 163, 175)', // gray-400
          stepSize: 1
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tren Kehadiran Bulanan</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Statisitik kehadiran Anda bulan ini</p>
        </div>
      </div>
      
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AttendanceMonthlyChart;
