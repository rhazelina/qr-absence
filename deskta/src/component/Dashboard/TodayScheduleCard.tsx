import React from 'react';
import { Clock, BookOpen, GraduationCap } from 'lucide-react';
import type { DashboardScheduleItem } from '../../types/dashboard';

interface TodayScheduleCardProps {
  items: DashboardScheduleItem[];
  loading?: boolean;
}

const TodayScheduleCard: React.FC<TodayScheduleCardProps> = ({ items, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Tidak ada jadwal hari ini
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nikmati hari liburmu atau cek jadwal esok hari.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-500" />
          Jadwal Hari Ini
        </h2>
        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full uppercase tracking-wider">
          {items.length} Mata Pelajaran
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group relative flex items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
          >
            <div className="mr-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm group-hover:bg-blue-500 transition-colors duration-200">
              <GraduationCap className="w-6 h-6 text-gray-400 group-hover:text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate mb-0.5">
                {item.mapel}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {item.guru}
              </p>
            </div>

            <div className="text-right ml-4">
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {item.start} - {item.end}
              </div>
              <div className={`text-[10px] font-medium uppercase mt-1 px-2 py-0.5 rounded-md inline-block ${
                item.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                item.status === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                item.status === 'none' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {item.status === 'present' ? 'Hadir' : 
                 item.status === 'late' ? 'Terlambat' : 
                 item.status === 'none' ? 'Belum Absen' :
                 item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayScheduleCard;
