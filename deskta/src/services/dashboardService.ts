import { API_BASE_URL, fetchWithAuth, getHeaders, handleResponse } from './api';
import type { TodayScheduleResponse, AttendanceStatsResponse } from '../types/dashboard';

const getDashboard = async <T = any>(path: string): Promise<T> =>
  fetchWithAuth(`${API_BASE_URL}${path}`, { method: 'GET' });

const fetchDashboardResponse = (path: string) =>
  fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: getHeaders(),
  });

const unwrapPayload = (payload: any) => payload?.data && typeof payload.data === 'object' ? payload.data : payload;

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeAdminSummary = (payload: any) => {
  const root = unwrapPayload(payload) || {};
  return {
    ...root,
    classes_count: toNumber(root.classes_count),
    students_count: toNumber(root.students_count),
    teachers_count: toNumber(root.teachers_count),
    rooms_count: toNumber(root.rooms_count),
  };
};

const normalizeTeacherDashboard = (payload: any) => {
  const root = unwrapPayload(payload) || {};
  return {
    ...root,
    school_hours: root.school_hours || {
      start_time: '07:00',
      end_time: '15:00',
    },
    schedule_today: Array.isArray(root.schedule_today) ? root.schedule_today : [],
    attendance_summary: root.attendance_summary || {},
  };
};

const normalizeClassDashboard = (payload: any) => {
  const root = unwrapPayload(payload) || {};
  return {
    ...root,
    dailyStats: root.dailyStats || root.statistik || {},
    monthlyTrend: Array.isArray(root.monthlyTrend)
      ? root.monthlyTrend
      : Array.isArray(root.trend)
        ? root.trend
      : [],
  };
};

type AttendanceRow = {
  status?: string;
  date?: string;
  checked_in_at?: string;
};

const toDateString = (value?: string): string | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
};

const mapStatusKey = (status?: string): keyof typeof STATUS_BUCKET_MAP | null => {
  const key = String(status || '').toLowerCase();
  if (!key) return null;
  if (key in STATUS_BUCKET_MAP) return key as keyof typeof STATUS_BUCKET_MAP;
  return null;
};

const STATUS_BUCKET_MAP = {
  present: 'hadir',
  late: 'terlambat',
  permission: 'izin',
  excused: 'izin',
  izin: 'izin',
  sick: 'sakit',
  absent: 'alpha',
  return: 'pulang',
  dispen: 'dispen',
  dinas: 'dispen',
} as const;

const makeEmptyStats = () => ({
  hadir: 0,
  terlambat: 0,
  izin: 0,
  sakit: 0,
  alpha: 0,
  pulang: 0,
  dispen: 0,
});

const normalizeClassDashboardFromAttendance = (payload: any) => {
  const records: AttendanceRow[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }

  const monthlyMap = months.reduce<Record<string, ReturnType<typeof makeEmptyStats>>>((acc, monthKey) => {
    acc[monthKey] = makeEmptyStats();
    return acc;
  }, {});

  const dailyStats = makeEmptyStats();

  records.forEach((row) => {
    const bucketKey = mapStatusKey(row.status);
    if (!bucketKey) return;
    const statField = STATUS_BUCKET_MAP[bucketKey];
    const dateValue = toDateString(row.date || row.checked_in_at);
    if (!dateValue) return;

    const monthKey = dateValue.slice(0, 7);
    if (monthlyMap[monthKey]) {
      monthlyMap[monthKey][statField] += 1;
    }

    if (dateValue === today) {
      dailyStats[statField] += 1;
    }
  });

  const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'short' });
  const monthlyTrend = months.map((monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    const labelDate = new Date(year, (month || 1) - 1, 1);
    const row = monthlyMap[monthKey] || makeEmptyStats();
    return {
      month: monthLabel.format(labelDate),
      ...row,
    };
  });

  return {
    date: today,
    dailyStats,
    monthlyTrend,
  };
};

type WakaStatusRow = {
  status?: string;
  total?: number | string;
};

const normalizeWakaFallback = (payload: any) => {
  const statusSummary: WakaStatusRow[] = Array.isArray(payload?.status_summary)
    ? payload.status_summary
    : Array.isArray(payload?.data?.status_summary)
      ? payload.data.status_summary
      : [];

  const totals = statusSummary.reduce<Record<string, number>>((acc, row) => {
    const key = String(row?.status || '').toLowerCase();
    if (!key) return acc;
    acc[key] = toNumber(row?.total);
    return acc;
  }, {});

  return {
    date: new Date().toISOString().slice(0, 10),
    statistik: {
      hadir: (totals.present || 0),
      terlambat: (totals.late || 0),
      izin: (totals.izin || 0) + (totals.permission || 0) + (totals.excused || 0),
      sakit: (totals.sick || 0),
      alpha: (totals.absent || 0),
      pulang: (totals.return || 0),
    },
    trend: [],
    daily_stats: [],
  };
};

const normalizeWakaDashboard = (payload: any) => {
  const root = unwrapPayload(payload) || {};
  return {
    date: root.date || new Date().toISOString().slice(0, 10),
    statistik: {
      hadir: toNumber(root?.statistik?.hadir),
      terlambat: toNumber(root?.statistik?.terlambat),
      izin: toNumber(root?.statistik?.izin),
      sakit: toNumber(root?.statistik?.sakit),
      alpha: toNumber(root?.statistik?.alpha),
      pulang: toNumber(root?.statistik?.pulang),
    },
    trend: Array.isArray(root?.trend) ? root.trend : [],
    daily_stats: Array.isArray(root?.daily_stats) ? root.daily_stats : [],
  };
};

export const dashboardService = {
  getAdminSummary: async () => {
    const payload = await getDashboard('/admin/summary');
    return normalizeAdminSummary(payload);
  },

  getWakaDashboard: async () => {
    const primaryResponse = await fetchDashboardResponse('/waka/dashboard/summary');

    // Runtime safeguard: fallback if primary waka dashboard endpoint returns 5xx
    if (primaryResponse.status >= 500) {
      const fallback = await fetchDashboardResponse('/waka/attendance/summary');
      const fallbackPayload = await handleResponse(fallback);
      return normalizeWakaFallback(fallbackPayload);
    }

    const payload = await handleResponse(primaryResponse);
    return normalizeWakaDashboard(payload);
  },

  getTeacherDashboard: async () => {
    const primary = await fetchDashboardResponse('/me/teacher/dashboard');
    if (primary.status < 500) {
      const payload = await handleResponse(primary);
      return normalizeTeacherDashboard(payload);
    }

    const fallbackPaths = ['/me/dashboard/teacher-summary', '/guru/dashboard'];
    let lastResponse = primary;

    for (const path of fallbackPaths) {
      const fallback = await fetchDashboardResponse(path);
      lastResponse = fallback;
      if (fallback.status < 500) {
        const payload = await handleResponse(fallback);
        return normalizeTeacherDashboard(payload);
      }
    }

    return handleResponse(lastResponse);
  },

  getAttendanceSummary: async () => {
    return getDashboard('/attendance/summary');
  },

  getStudentDashboard: async () => {
    const primary = await fetchDashboardResponse('/me/dashboard/summary');
    if (primary.status < 500) {
      return handleResponse(primary);
    }

    const [scheduleToday, attendanceStats] = await Promise.all([
      fetchDashboardResponse('/me/dashboard/schedule-today'),
      fetchDashboardResponse('/me/dashboard/attendance-stats'),
    ]);

    const schedulePayload = await handleResponse(scheduleToday);
    const statsPayload = await handleResponse(attendanceStats);
    return {
      schedule_today: Array.isArray(schedulePayload?.schedule_today) ? schedulePayload.schedule_today : [],
      attendance_stats: statsPayload || {},
      date: schedulePayload?.date || new Date().toISOString().slice(0, 10),
      day_name: schedulePayload?.day_name || '',
      student: schedulePayload?.student || null,
      school_hours: schedulePayload?.school_hours || null,
    };
  },

  getClassDashboard: async () => {
    const primary = await fetchDashboardResponse('/me/class/dashboard');
    if (primary.status < 500) {
      const payload = await handleResponse(primary);
      return normalizeClassDashboard(payload);
    }

    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth() - 5, 1);
    const from = start.toISOString().slice(0, 10);
    const to = end.toISOString().slice(0, 10);

    const fallback = await fetchDashboardResponse(`/me/class/attendance?from=${from}&to=${to}`);
    const fallbackPayload = await handleResponse(fallback);
    return normalizeClassDashboardFromAttendance(fallbackPayload);
  },

  getScheduleToday: async (): Promise<TodayScheduleResponse> => {
    return getDashboard<TodayScheduleResponse>('/me/dashboard/schedule-today');
  },

  getAttendanceStats: async (): Promise<AttendanceStatsResponse> => {
    return getDashboard<AttendanceStatsResponse>('/me/dashboard/attendance-stats');
  }
};
