import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, ArrowLeft, PieChart, TrendingUp } from 'lucide-react';
import './DashboardSiswa.css';
import NavbarSiswa from '../../components/Siswa/NavbarSiswa';
import apiService from '../../utils/api';

const DashboardSiswa = () => {
  const [profile, setProfile] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState({});
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [me, sched, week, month] = await Promise.all([
          apiService.getProfile(),
          apiService.get('/student/schedule').catch(()=>null),
          apiService.get('/student/attendance/weekly-stats').catch(()=>null),
          apiService.get('/student/attendance/monthly-trend?months=6').catch(()=>null)
        ]);
        setProfile(me?.data||me);
        setScheduleData(sched);
        setWeeklyStats(week);
        setMonthlyTrend(month);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getTodaySubjectCount = () => {
    if (!scheduleData) return 0;
    if (Array.isArray(scheduleData)) return scheduleData.length;
    if (Array.isArray(scheduleData.schedules)) return scheduleData.schedules.length;
    return 0;
  };

  return (
    <div className="dashboard-container">
      <NavbarSiswa />
      {/* template layout with stats cards, schedule preview, charts etc. maintain css from kosongan */}
      {/* loading state show placeholder boxes */}
    </div>
  );
};

export default DashboardSiswa;
