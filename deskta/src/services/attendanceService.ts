import { API_BASE_URL, handleResponse } from './api';

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

export const attendanceService = {
  getDailyClassAttendance: async (classId: string, date: string): Promise<ClassAttendanceResponse> => {
    const response = await fetch(`${API_BASE_URL}/waka/classes/${classId}/attendance?date=${date}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
    });
    return handleResponse(response);
  },

  getStudentSummary: async (params?: { from?: string; to?: string; months?: number; group_by?: 'day' | 'week' | 'month' }): Promise<any> => {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/me/attendance/summary${query ? `?${query}` : ''}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
    });
    return handleResponse(response);
  },

  getTeachingSummary: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/me/attendance/teaching/summary`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
    });
    return handleResponse(response);
  },

  getHistory: async (params?: any): Promise<any> => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/me/attendance?${query}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
    });
    return handleResponse(response);
  },

  getScheduleStudents: async (scheduleId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/me/schedules/${scheduleId}/students`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
    });
    return handleResponse(response);
  },

  getTeachersDailyAttendance: async (date: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/waka/attendance/teachers/daily?date=${date}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
    });
    return handleResponse(response);
  },

  getTeacherAttendanceHistory: async (teacherId: string, params?: any): Promise<any> => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/attendance-history?${query}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
    });
    return handleResponse(response);
  },

  getWakaClassAttendanceSummary: async (classId: string, params?: any): Promise<any> => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/waka/classes/${classId}/attendance-summary?${query}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
    });
    return handleResponse(response);
  },

  getClassStudentsSummary: async (classId: string, params?: any): Promise<any> => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/students/attendance-summary?${query}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
    });
    return handleResponse(response);
  },

  getClassStudentsAbsences: async (classId: string, params?: any): Promise<any> => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/students/absences?${query}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
    });
    return handleResponse(response);
  },

  getMyHomeroomAttendance: async (params?: any): Promise<any> => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/me/homeroom/attendance?${query}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
    });
    return handleResponse(response);
  },

  getMyHomeroomStudents: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/me/homeroom/students`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
    });
    return handleResponse(response);
  },

  generateQrCode: async (scheduleId: string, type: string = 'student'): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/me/class/qr-token`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        schedule_id: scheduleId,
        type: type,
        expires_in_minutes: 15
      })
    });
    return handleResponse(response);
  },

  scanStudent: async (token: string, scheduleId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/attendance/scan-student`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        schedule_id: scheduleId
      })
    });
    return handleResponse(response);
  },

  scanQrToken: async (token: string, deviceId?: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/attendance/scan`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        device_id: deviceId,
      }),
    });
    return handleResponse(response);
  },

  manualAttendance: async (data: { schedule_id: number, student_id: number, status: string, date: string, reason?: string }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/attendance/manual`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attendee_type: 'student',
        schedule_id: data.schedule_id,
        student_id: data.student_id,
        status: data.status,
        date: data.date,
        reason: data.reason || null
      })
    });
    return handleResponse(response);
  },

  submitBulkAttendance: async (data: { schedule_id: number, date: string, items: Array<{ student_id: number, status: string, reason?: string }> }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/attendance/bulk-manual`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  uploadAttendanceDocument: async (attendanceId: number, file: File, type: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/attendance/${attendanceId}/document`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData
    });
    return handleResponse(response);
  },

  updateAttendanceStatus: async (attendanceId: string, status: string, reason?: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/attendance/${attendanceId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, reason: reason || null })
    });
    return handleResponse(response);
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
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
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
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json",
      },
      body: formData
    });
    return handleResponse(response);
  }
};
