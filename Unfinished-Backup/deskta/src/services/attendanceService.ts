import { API_BASE_URL, fetchWithAuth, getHeaders, handleResponse } from './api';

export interface AttendanceItem {
  schedule: {
    id: string;
    start_time: string;
    end_time: string;
    subject_name: string;
    teacher: {
      id: string;
      user: {
        name: string;
      }
    }
  };
  attendances: Array<{
    id: string;
    student: {
      id: string;
      user: {
        name: string;
      };
      nisn: string;
    };
    status: string;
    checked_in_at: string;
    date: string;
  }>;
}

export interface ClassAttendanceResponse {
  class: {
    id: string;
    name: string;
  };
  date: string;
  day: string;
  items: AttendanceItem[];
}

const toQuery = (params?: Record<string, any>): string => {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.append(key, String(value));
  });
  const raw = query.toString();
  return raw ? `?${raw}` : '';
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const authFormHeaders = () => {
  const headers = getHeaders() as Record<string, string>;
  delete headers['Content-Type'];
  return headers;
};

export const attendanceService = {
  getDailyClassAttendance: async (classId: string, date: string): Promise<ClassAttendanceResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/waka/classes/${classId}/attendance?date=${encodeURIComponent(date)}`, {
      method: "GET",
    });
  },

  getStudentSummary: async (params?: { from?: string; to?: string; months?: number; group_by?: 'day' | 'week' | 'month' }): Promise<any> => {
    const query = toQuery(params as Record<string, any>);
    const primary = await fetch(`${API_BASE_URL}/me/attendance/summary${query}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (primary.status < 500) {
      return handleResponse(primary);
    }

    // Fallback path for runtime 5xx from summary endpoint
    const fallback = await fetch(`${API_BASE_URL}/me/dashboard/attendance-stats`, {
      method: "GET",
      headers: getHeaders(),
    });
    const statsPayload = await handleResponse(fallback);

    const monthlyChart = Array.isArray(statsPayload?.monthly_chart) ? statsPayload.monthly_chart : [];
    const weekly = statsPayload?.weekly_stats || {};
    const present = toNumber(weekly.present);
    const late = toNumber(weekly.late);
    const sick = toNumber(weekly.sick);
    const excused = toNumber(weekly.excused);
    const absent = toNumber(weekly.absent);

    return {
      status: "success",
      data: {
        trend: monthlyChart.map((item: any) => ({
          month: item?.day_label || item?.date || "-",
          hadir: toNumber(item?.present),
          izin: toNumber(item?.excused),
          sakit: toNumber(item?.sick),
          alpha: toNumber(item?.absent),
          pulang: 0,
          dispen: 0,
        })),
        statistik: {
          hadir: Math.max(0, present - late),
          terlambat: late,
          izin: excused,
          sakit: sick,
          alpha: absent,
          pulang: 0,
          dispen: 0,
        },
      },
      status_summary: [
        { status: "present", total: Math.max(0, present - late) },
        { status: "late", total: late },
        { status: "sick", total: sick },
        { status: "excused", total: excused },
        { status: "absent", total: absent },
      ],
    };
  },

  getTeachingSummary: async (): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/me/attendance/teaching/summary`, {
      method: "GET",
    });
  },

  getHistory: async (params?: any): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/me/attendance${toQuery(params)}`, {
      method: "GET",
    });
  },

  getScheduleStudents: async (scheduleId: string): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/me/schedules/${scheduleId}/students`, {
      method: "GET",
    });
  },

  getTeachersDailyAttendance: async (date: string): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/waka/attendance/teachers/daily?date=${encodeURIComponent(date)}`, {
      method: "GET",
    });
  },

  getTeacherAttendanceHistory: async (teacherId: string, params?: any): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/teachers/${teacherId}/attendance-history${toQuery(params)}`, {
      method: "GET",
    });
  },

  getWakaClassAttendanceSummary: async (classId: string, params?: any): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/waka/classes/${classId}/attendance-summary${toQuery(params)}`, {
      method: "GET",
    });
  },

  getClassStudentsSummary: async (classId: string, params?: any): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/classes/${classId}/students/attendance-summary${toQuery(params)}`, {
      method: "GET",
    });
  },

  getClassStudentsAbsences: async (classId: string, params?: any): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/classes/${classId}/students/absences${toQuery(params)}`, {
      method: "GET",
    });
  },

  getMyHomeroomAttendance: async (params?: any): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/me/homeroom/attendance${toQuery(params)}`, {
      method: "GET",
    });
  },

  getMyHomeroomStudents: async (): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/me/homeroom/students`, {
      method: "GET",
    });
  },

  generateQrCode: async (scheduleId: string, type: string = 'student', expiresInMinutes: number = 15): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/me/class/qr-token`, {
      method: "POST",
      body: JSON.stringify({
        schedule_id: scheduleId,
        type: type,
        expires_in_minutes: expiresInMinutes
      })
    });
  },

  scanStudent: async (token: string, scheduleId: string): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/attendance/scan-student`, {
      method: "POST",
      body: JSON.stringify({
        token: token,
        schedule_id: scheduleId
      })
    });
  },

  scanQrToken: async (token: string, deviceId?: number): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/attendance/scan`, {
      method: "POST",
      body: JSON.stringify({
        token,
        device_id: deviceId,
      }),
    });
  },

  closeSchedule: async (scheduleId: string | number): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/me/schedules/${scheduleId}/close`, {
      method: "POST",
    });
  },

  manualAttendance: async (data: { schedule_id: number, student_id: number, status: string, date: string, reason?: string }): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/attendance/manual`, {
      method: "POST",
      body: JSON.stringify({
        attendee_type: 'student',
        schedule_id: data.schedule_id,
        student_id: data.student_id,
        status: data.status,
        date: data.date,
        reason: data.reason || null
      })
    });
  },

  submitBulkAttendance: async (data: { schedule_id: number, date: string, items: Array<{ student_id: number, status: string, reason?: string }> }): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/attendance/bulk-manual`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  uploadAttendanceDocument: async (attendanceId: number, file: File, type: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/attendance/${attendanceId}/document`, {
      method: "POST",
      headers: authFormHeaders(),
      body: formData
    });
    return handleResponse(response);
  },

  updateAttendanceStatus: async (attendanceId: string, status: string, reason?: string): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/attendance/${attendanceId}`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason: reason || null })
    });
  },

  createStudentLeave: async (scheduleId: string, studentId: string, data: { type: string, reason?: string, file?: File }): Promise<any> => {
    const formData = new FormData();
    formData.append('type', data.type);
    if (data.reason) {
      formData.append('reason', data.reason);
    }
    if (data.file) {
      formData.append('attachment', data.file);
    }

    const response = await fetch(`${API_BASE_URL}/me/schedules/${scheduleId}/students/${studentId}/leave`, {
      method: "POST",
      headers: authFormHeaders(),
      body: formData
    });
    return handleResponse(response);
  },

  createLeavePermission: async (data: { student_id: string, schedule_id?: string, type: string, start_time: string, end_time?: string, reason?: string, file?: File }): Promise<any> => {
    const formData = new FormData();
    formData.append('student_id', data.student_id);
    if (data.schedule_id) {
      formData.append('schedule_id', data.schedule_id);
    }
    formData.append('type', data.type);
    formData.append('start_time', data.start_time);
    if (data.end_time) {
      formData.append('end_time', data.end_time);
    }
    if (data.reason) {
      formData.append('reason', data.reason);
    }
    if (data.file) {
      formData.append('attachment', data.file);
    }

    const response = await fetch(`${API_BASE_URL}/leave-permissions`, {
      method: "POST",
      headers: authFormHeaders(),
      body: formData
    });
    return handleResponse(response);
  }
,
  createAbsenceRequest: async (data: { type: string, start_date: string, end_date: string, reason?: string, file?: File }): Promise<any> => {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('start_date', data.start_date);
    formData.append('end_date', data.end_date);
    if (data.reason) {
      formData.append('reason', data.reason);
    }
    if (data.file) {
      formData.append('attachment', data.file);
    }

    const response = await fetch(`${API_BASE_URL}/absence-requests`, {
      method: "POST",
      headers: authFormHeaders(),
      body: formData
    });
    return handleResponse(response);
  }
};
