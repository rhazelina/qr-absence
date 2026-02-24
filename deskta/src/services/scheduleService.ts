import { API_BASE_URL, handleResponse } from './api';

export interface ScheduleItem {
  id: number | string;
  subject: string;
  class: string;
  room: string;
  day: string;
  start_time: string;
  end_time: string;
  teacher?: {
    id: number | string | null;
    name: string;
  } | string;
}

export interface ScheduleResponse {
  status: string;
  items: ScheduleItem[];
  raw?: any;
}

const DAY_ALIAS_MAP: Record<string, string> = {
  monday: "Monday",
  senin: "Monday",
  tuesday: "Tuesday",
  selasa: "Tuesday",
  wednesday: "Wednesday",
  rabu: "Wednesday",
  thursday: "Thursday",
  kamis: "Thursday",
  friday: "Friday",
  jumat: "Friday",
  "jum'at": "Friday",
  saturday: "Saturday",
  sabtu: "Saturday",
  sunday: "Sunday",
  minggu: "Sunday",
};

export const normalizeScheduleDay = (day?: string): string => {
  if (!day) return "Unknown";
  const key = day.trim().toLowerCase();
  return DAY_ALIAS_MAP[key] || day;
};

export const getTodayScheduleDay = (): string =>
  normalizeScheduleDay(new Date().toLocaleDateString("en-US", { weekday: "long" }));

const getAuthHeaders = () => ({
  "Authorization": `Bearer ${localStorage.getItem("token")}`,
  "Accept": "application/json",
});

const getCurrentRole = (): string | null => {
  const rawUser = localStorage.getItem("currentUser");
  if (!rawUser) return null;

  try {
    const parsed = JSON.parse(rawUser);
    const role = String(parsed?.role || "").trim().toLowerCase();
    if (!role) return null;
    if (role === "pengurus-kelas") return "pengurus_kelas";
    if (role === "wali_kelas" || role === "walikelas") return "wakel";
    return role;
  } catch {
    return null;
  }
};

const toTeacher = (teacher: any): ScheduleItem["teacher"] => {
  if (!teacher) return undefined;
  if (typeof teacher === "string") return teacher;

  return {
    id: teacher.id ?? null,
    name: teacher.user?.name || teacher.name || "Guru",
  };
};

const normalizeItems = (items: any[], fallbackClassName = "-"): ScheduleItem[] => {
  return items
    .map((item, index) => {
      const id = item.id ?? item.schedule_id ?? `${item.day || "Unknown"}-${item.start_time || "00:00"}-${index}`;
      const day = normalizeScheduleDay(item.day || item.daily_schedule?.day || item.dailySchedule?.day || "Unknown");
      const subject = item.subject?.name || item.subject_name || item.subject || item.keterangan || "-";
      const className = item.class?.name || item.class_name || item.kelas?.name || item.class || fallbackClassName;

      return {
        id,
        subject,
        class: className,
        room: item.room || "-",
        day,
        start_time: item.start_time || "",
        end_time: item.end_time || "",
        teacher: toTeacher(item.teacher),
      } as ScheduleItem;
    })
    .sort((a, b) => {
      const dayOrder: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 7,
      };

      const byDay =
        (dayOrder[normalizeScheduleDay(a.day).toLowerCase()] || 99) -
        (dayOrder[normalizeScheduleDay(b.day).toLowerCase()] || 99);
      if (byDay !== 0) return byDay;

      return (a.start_time || "").localeCompare(b.start_time || "");
    });
};

const normalizeFromClassSchedule = (schedule: any): ScheduleItem[] => {
  if (!schedule || typeof schedule !== "object") {
    return [];
  }

  const className = schedule.class?.name || schedule.class_name || schedule.classRoom?.name || "-";
  const dailySchedules = schedule.dailySchedules || schedule.daily_schedules || [];
  const flattenedItems = dailySchedules.flatMap((daily: any) => {
    const day = daily.day || "Unknown";
    const scheduleItems = daily.scheduleItems || daily.schedule_items || [];

    return scheduleItems.map((item: any) => ({
      ...item,
      day,
    }));
  });

  return normalizeItems(flattenedItems, className);
};

const normalizeScheduleResponse = (payload: any): ScheduleResponse => {
  // Teacher style: { items: [...] }
  if (payload?.items && Array.isArray(payload.items)) {
    return {
      status: "success",
      items: normalizeItems(payload.items),
      raw: payload,
    };
  }

  // Class officer style: [...]
  if (Array.isArray(payload)) {
    return {
      status: "success",
      items: normalizeItems(payload),
      raw: payload,
    };
  }

  // Student style (legacy): ClassSchedule object with dailySchedules
  const classScheduleItems = normalizeFromClassSchedule(payload);
  return {
    status: "success",
    items: classScheduleItems,
    raw: payload,
  };
};

export const scheduleService = {
  getMySchedule: async (): Promise<ScheduleResponse> => {
    const response = await fetch(`${API_BASE_URL}/me/schedules`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const payload = await response.json();
      return normalizeScheduleResponse(payload);
    }

    const primaryError = await response.json().catch(() => ({} as any));
    const primaryMessage = primaryError?.message || "API request failed";
    const isNoActiveSchedule = response.status === 404 && /no active schedule found/i.test(primaryMessage);
    const role = getCurrentRole();

    // For student with no active class schedule, return empty list to avoid hard fail in dashboard.
    if (isNoActiveSchedule && role === "siswa") {
      return { status: "success", items: [] };
    }

    // For class officer, fallback to dedicated class schedule endpoint.
    if (role === "pengurus_kelas") {
      const classResponse = await fetch(`${API_BASE_URL}/me/class/schedules`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (classResponse.ok) {
        const classPayload = await classResponse.json();
        return normalizeScheduleResponse(classPayload);
      }

      const classError = await classResponse.json().catch(() => ({} as any));
      throw new Error(classError?.message || primaryMessage);
    }

    throw new Error(primaryMessage);
  },

  getMyHomeroomSchedules: async (): Promise<ScheduleResponse> => {
    const response = await fetch(`${API_BASE_URL}/me/homeroom/schedules`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const payload = await handleResponse(response);
    return normalizeScheduleResponse(payload);
  },

  getSchedule: async (id: string | number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getScheduleByClass: async (classId: string | number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/schedules/active`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createSchedule: async (data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/schedules`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateSchedule: async (id: string | number, data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  bulkUpsert: async (classId: string | number, data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/schedules/bulk`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteSchedule: async (id: string | number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
