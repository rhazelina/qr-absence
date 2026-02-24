import React from 'react';
import { PieChart, CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';
import type { WeeklyAttendanceSummary } from '../../types/dashboard';

interface AttendanceWeeklyStatsProps {
  stats: WeeklyAttendanceSummary;
  loading?: boolean;
}

const AttendanceWeeklyStats: React.FC<AttendanceWeeklyStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Hadir', 
      value: stats.present, 
      icon: CheckCircle2, 
      color: 'text-green-600 dark:text-green-400', 
      bg: 'bg-green-50 dark:bg-green-900/20' 
    },
    { 
      label: 'Terlambat', 
      value: stats.late, 
      icon: Clock, 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-50 dark:bg-amber-900/20' 
    },
    { 
      label: 'Izin/Sakit', 
      value: stats.excused + stats.sick, 
      icon: AlertCircle, 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-50 dark:bg-blue-900/20' 
    },
    { 
      label: 'Alpha', 
      value: stats.absent, 
      icon: XCircle, 
      color: 'text-red-600 dark:text-red-400', 
      bg: 'bg-red-50 dark:bg-red-900/20' 
    },
  ];

  const hasData = stats.total > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <PieChart className="w-6 h-6 text-indigo-500" />
          Ringkasan Minggu Ini
        </h2>
        {hasData && (
          <span className="text-sm font-semibold text-gray-400">
            Total {stats.total} Sesi
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-full mb-3">
                <PieChart className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada data minggu ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {statCards.map((card, index) => (
            <div 
              key={index} 
              className={`${card.bg} rounded-2xl p-4 transition-transform hover:scale-[1.02] duration-200 cursor-default`}
            >
              <div className="flex items-center justify-between mb-2">
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-gray-100">
                {card.value}
              </div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
                {card.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasData && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">Presentasi Kehadiran</span>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                      {Math.round((stats.present / stats.total) * 100)}%
                  </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full" 
                    style={{ width: `${(stats.present / stats.total) * 100}%` }}
                  />
              </div>
          </div>
      )}
    </div>
  );
};

export default AttendanceWeeklyStats;
