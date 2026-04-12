export interface DashboardScheduleItem {
  id: number;
  mapel: string;
  guru: string;
  start: string;
  end: string;
  status: string;
  checked_in_at?: string;
}

export interface TodayScheduleResponse {
  date: string;
  day: string;
  items: DashboardScheduleItem[];
}

export interface AttendanceDailyStat {
  date: string;
  day_label: string;
  present: number;
  late: number;
  sick: number;
  excused: number;
  absent: number;
}

export interface WeeklyAttendanceSummary {
  present: number;
  late: number;
  sick: number;
  excused: number;
  absent: number;
  total: number;
}

export interface AttendanceStatsResponse {
  monthly_chart: AttendanceDailyStat[];
  weekly_stats: WeeklyAttendanceSummary;
}
