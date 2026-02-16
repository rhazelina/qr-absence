// User and Authentication Types
export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  user_type?: string;
  role: string;
  nip?: string;
  nisn?: string;
  class_id?: number;
  is_class_officer?: boolean;
  homeroom_class_id?: number;
}

export interface LoginRequest {
  login: string; // Backend expects 'login' not 'identifier'
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Student Types
export interface Student {
  id: number;
  nisn: string;
  name: string;
  email?: string;
  phone?: string;
  class_id: number;
  is_class_officer: boolean;
  created_at: string;
  updated_at: string;
  class?: Class;
  user?: User; // Relationship to User model
}

// Teacher Types
export interface Teacher {
  id: number;
  nip: string;
  name: string;
  email?: string;
  phone?: string;
  homeroom_class_id?: number;
  schedule_image_url?: string;
  created_at: string;
  updated_at: string;
  homeroom_class?: Class;
  user?: User; // Relationship to User model
}

// Class Types
export interface Class {
  id: number;
  name: string;
  grade: number;
  label?: string;
  major_id: number;
  homeroom_teacher_id?: number;
  schedule_image_url?: string;
  created_at: string;
  updated_at: string;
  major?: Major;
  homeroom_teacher?: Teacher;
  students?: Student[]; // Relationship to StudentProfile (Student)
}

// Major Types
export interface Major {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

// Schedule Types
export interface Schedule {
  id: number;
  class_id: number;
  teacher_id: number;
  subject_id: number;
  room_id?: number;
  time_slot_id: number;
  day_of_week?: number;
  day?: string; // String day: Monday, Tuesday, etc.
  start_time: string;
  end_time: string;
  title?: string;
  subject_name?: string;
  room?: string; // Room as string
  created_at: string;
  updated_at: string;
  class?: Class;
  teacher?: Teacher;
  subject?: Subject;
  time_slot?: TimeSlot;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  slot_number: number;
  created_at: string;
  updated_at: string;
}

// Attendance Types
export interface Attendance {
  id: number;
  student_id: number;
  schedule_id: number;
  date: string;
  status: 'present' | 'absent' | 'sick' | 'excused';
  scanned_at?: string;
  notes?: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  schedule?: Schedule;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  sick: number;
  excused: number;
  late?: number;
  izin?: number;
  total?: number;
  percentage?: number;
}

export interface AttendanceHistory {
  status_summary: {
    status: string;
    total: number;
  }[];
  daily_summary: {
    day: string;
    status: string;
    total: number;
  }[];
}

// Dashboard Types
export interface AdminSummary {
  total_classes: number;
  total_students: number;
  total_teachers: number;
  total_rooms: number;
}

export interface StudentDashboard {
  attendance_summary: AttendanceSummary;
  today_schedules: Schedule[];
  recent_attendance: Attendance[];
}

export interface TeacherDashboard {
  today_schedules: Schedule[];
  total_teaching_today: number;
  attendance_summary?: AttendanceSummary;
}

export interface HomeroomDashboard {
  class: Class;
  students_count: number;
  attendance_summary: AttendanceSummary;
  today_schedules: Schedule[];
}

// QR Code Types
export interface QrCode {
  token: string;
  schedule_id: number;
  expires_at: string;
  created_at: string;
  schedule?: Schedule;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Query Parameters
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface StudentQueryParams extends PaginationParams {
  search?: string;
  class_id?: number;
  major_id?: number;
}

export interface TeacherQueryParams extends PaginationParams {
  search?: string;
}

export interface ClassQueryParams extends PaginationParams {
  search?: string;
  grade?: number;
  major_id?: number;
}

export interface AttendanceQueryParams {
  from?: string;
  to?: string;
  status?: string;
  date?: string;
}

export interface ScheduleQueryParams {
  date?: string;
  from?: string;
  to?: string;
}

// Error Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Waka Dashboard Types
export interface WakaStatistik {
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
  alpha: number;
  pulang: number;
  [key: string]: number;
}

export interface WakaTrend {
  label: string;
  hadir: number;
  izin: number;
  alpha: number;
  sakit: number;
  terlambat: number;
}

export interface WakaSummary {
  statistik: WakaStatistik;
  trend: WakaTrend[];
}

export interface ManualAttendanceRequest {
  attendee_type: 'student' | 'teacher';
  student_id?: string;
  teacher_id?: string;
  schedule_id: string;
  status: 'present' | 'late' | 'excused' | 'sick' | 'absent' | 'dinas' | 'izin' | 'pulang';
  date: string;
  reason?: string;
}

export interface QRCodeData {
  schedule_id: number;
  type: 'student' | 'teacher';
  expires_in_minutes?: number;
}
