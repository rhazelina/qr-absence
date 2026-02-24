import { API_BASE_URL, getHeaders, handleResponse } from './api';
import type { TodayScheduleResponse, AttendanceStatsResponse } from '../types/dashboard';

export const dashboardService = {
  getAdminSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/summary`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getWakaDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/waka/dashboard/summary`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getAttendanceSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/attendance/summary`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getStudentDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/me/dashboard/summary`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getClassDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/me/class/dashboard`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getScheduleToday: async (): Promise<TodayScheduleResponse> => {
    const response = await fetch(`${API_BASE_URL}/me/dashboard/schedule-today`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getAttendanceStats: async (): Promise<AttendanceStatsResponse> => {
    const response = await fetch(`${API_BASE_URL}/me/dashboard/attendance-stats`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};
