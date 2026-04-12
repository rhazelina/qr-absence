package com.example.ritamesa.api.repositories

import android.content.Context
import android.util.Log
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*

class DashboardRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    companion object {
        private const val TAG = "DashboardRepository"
    }

    @Suppress("UNCHECKED_CAST")
    suspend fun getStudentDashboard(): Result<StudentDashboard> {
        Log.d(TAG, "getStudentDashboard called")
        return try {
            val rawResponse = apiService.getStudentDashboardRaw()
            if (!rawResponse.isSuccessful) {
                Log.w(TAG, "getStudentDashboard HTTP ${rawResponse.code()}, fallback ke jadwal")
                return buildStudentDashboardFromSchedules()
            }

            val body = rawResponse.body()
            if (body != null) {
                Result.Success(parseStudentDashboardFromMap(body))
            } else {
                buildStudentDashboardFromSchedules()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading student dashboard: ${e.message}", e)
            buildStudentDashboardFromSchedules()
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseStudentDashboardFromMap(body: Map<String, Any>): StudentDashboard {
        val rawSchedules = body["schedule_today"] as? List<*> ?: emptyList<Any>()
        val items = rawSchedules.mapNotNull { raw ->
            val item = raw as? Map<*, *> ?: return@mapNotNull null
            try {
                val id = (item["id"] as? Double)?.toInt() ?: item["id"] as? Int
                val subjectName = when (val s = item["subject"]) {
                    is Map<*, *> -> s["name"] as? String
                    is String -> s
                    else -> null
                } ?: item["subject_name"] as? String ?: "Mata Pelajaran"

                val teacherName = when (val t = item["teacher"]) {
                    is Map<*, *> -> (t["user"] as? Map<*, *>)?.get("name") as? String ?: t["name"] as? String
                    is String -> t
                    else -> null
                }

                val teacherInfo = teacherName?.let {
                    TeacherInfo(id = null, name = it, nip = null, kodeGuru = null)
                }

                val room = when (val r = item["room"]) {
                    is Map<*, *> -> r["name"] as? String
                    is String -> r
                    else -> null
                }

                val status = item["status"] as? String
                val isCheckedIn = item["is_checked_in"] as? Boolean
                    ?: (status?.lowercase() in listOf("present", "late"))

                TodayScheduleItem(
                    id = id,
                    subjectName = subjectName,
                    startTime = item["start_time"] as? String,
                    endTime = item["end_time"] as? String,
                    room = room,
                    teacher = teacherInfo,
                    attendanceStatus = status,
                    isCheckedIn = isCheckedIn
                )
            } catch (e: Exception) {
                Log.e(TAG, "Error mapping student dashboard item: ${e.message}", e)
                null
            }
        }

        return StudentDashboard(
            todayAttendance = null,
            todaySchedules = items,
            notice = body["notice"] as? String
        )
    }

    private suspend fun buildStudentDashboardFromSchedules(): Result<StudentDashboard> {
        return try {
            val response = apiService.getTodaysSchedule()
            if (!response.isSuccessful) {
                return Result.Error(Exception("HTTP ${response.code()}"), "Gagal memuat jadwal")
            }

            val scheduleList = response.body()?.data ?: emptyList()
            val scheduleItems = scheduleList.map { s ->
                TodayScheduleItem(
                    id = s.id,
                    subjectName = s.subjectName ?: "Mata Pelajaran",
                    startTime = s.startTime,
                    endTime = s.endTime,
                    room = s.roomName,
                    teacher = s.teacher,
                    attendanceStatus = null,
                    isCheckedIn = false
                )
            }

            Result.Success(
                StudentDashboard(
                    todayAttendance = null,
                    todaySchedules = scheduleItems,
                    notice = null
                )
            )
        } catch (e: Exception) {
            Result.Error(e, e.message ?: "Gagal memuat jadwal hari ini")
        }
    }

    suspend fun getTeacherDashboard(): Result<TeacherDashboard> {
        Log.d(TAG, "getTeacherDashboard called")

        val primaryDashboard: TeacherDashboard? = try {
            val primaryResponse = apiService.getTeacherDashboard()
            if (primaryResponse.isSuccessful) {
                primaryResponse.body()
            } else {
                null
            }
        } catch (e: Exception) {
            Log.w(TAG, "Primary teacher dashboard error: ${e.message}")
            null
        }

        if (primaryDashboard != null) {
            Log.d(TAG, "Teacher dashboard primary OK")
            return Result.Success(primaryDashboard)
        }

        val aliasDashboard: TeacherDashboard? = try {
            val aliasResponse = apiService.getGuruDashboard()
            if (aliasResponse.isSuccessful) {
                aliasResponse.body()
            } else {
                null
            }
        } catch (e: Exception) {
            Log.w(TAG, "Alias teacher dashboard error: ${e.message}")
            null
        }

        if (aliasDashboard != null) {
            Log.d(TAG, "Teacher dashboard alias OK")
            return Result.Success(aliasDashboard)
        }

        return buildTeacherDashboardFromSchedules()
    }

    private suspend fun buildTeacherDashboardFromSchedules(): Result<TeacherDashboard> {
        return try {
            val response = apiService.getTodaysSchedule()
            if (!response.isSuccessful) {
                return Result.Success(TeacherDashboard(todayStatistics = null, todaySchedules = null))
            }

            val scheduleList = response.body()?.data ?: emptyList()
            val scheduleItems = scheduleList.map { s ->
                TeachingScheduleItem(
                    id = s.id,
                    `class` = s.`class`,
                    subjectName = s.subjectName ?: "-",
                    startTime = s.startTime ?: "00:00",
                    endTime = s.endTime ?: "00:00",
                    room = s.roomName,
                    attendanceCount = null
                )
            }

            Result.Success(
                TeacherDashboard(
                    todayStatistics = TeacherStatistics(
                        totalStudentsPresent = 0,
                        totalStudentsAbsent = 0,
                        totalStudentsLate = 0,
                        totalClassesToday = scheduleItems.size
                    ),
                    todaySchedules = scheduleItems
                )
            )
        } catch (e: Exception) {
            Result.Success(TeacherDashboard(todayStatistics = null, todaySchedules = null))
        }
    }

    suspend fun getHomeroomDashboard(): Result<HomeroomDashboard> {
        return try {
            val response = apiService.getHomeroomDashboard()
            when {
                response.isSuccessful -> {
                    val data = response.body()
                    if (data != null) {
                        Result.Success(data)
                    } else {
                        Result.Error(Exception("Data homeroom dashboard kosong"), "Data homeroom dashboard kosong")
                    }
                }
                response.code() == 404 -> {
                    Result.Error(Exception("Homeroom tidak ditemukan"), "Homeroom tidak ditemukan")
                }
                else -> {
                    Result.Error(Exception("HTTP ${response.code()}"), "HTTP ${response.code()}")
                }
            }
        } catch (e: Exception) {
            Result.Error(e, e.message ?: "Gagal memuat dashboard wali kelas")
        }
    }

    suspend fun getHomeroomDashboard2(): Result<HomeroomDashboard> = getHomeroomDashboard()

    suspend fun getWakaDashboard(): Result<WakaDashboard> {
        return try {
            val response = apiService.getWakaDashboard()
            if (!response.isSuccessful) {
                return Result.Error(Exception("HTTP ${response.code()}"), "HTTP ${response.code()}")
            }

            val data = response.body()?.data
            if (data != null) {
                Result.Success(data)
            } else {
                Result.Error(Exception("Data dashboard waka kosong"), "Data dashboard waka kosong")
            }
        } catch (e: Exception) {
            Result.Error(e, e.message ?: "Gagal memuat dashboard waka")
        }
    }

    suspend fun getWakaAttendanceSummary(
        startDate: String? = null,
        endDate: String? = null
    ): Result<AttendanceSummary> {
        return try {
            val response = apiService.getWakaAttendanceSummaryRaw(startDate, endDate)
            if (!response.isSuccessful) {
                return Result.Error(Exception("HTTP ${response.code()}"), "HTTP ${response.code()}")
            }

            val body = response.body()
            if (body != null) {
                Result.Success(body.toAttendanceSummary())
            } else {
                Result.Success(AttendanceSummary())
            }
        } catch (e: Exception) {
            Result.Error(e, e.message ?: "Gagal memuat summary waka")
        }
    }

    suspend fun getAdminDashboard(): Result<AdminDashboard> {
        return try {
            val response = apiService.getAdminDashboard()
            if (!response.isSuccessful) {
                return Result.Error(Exception("HTTP ${response.code()}"), "HTTP ${response.code()}")
            }

            val wrapper = response.body()
                ?: return Result.Error(Exception("Response body null"), "Response body null")

            val wrappedData = wrapper.data
            if (wrappedData != null) {
                return Result.Success(wrappedData)
            }

            val attendanceMap = wrapper.attendanceToday
            val present = attendanceMap?.get("present") ?: 0
            val absent = attendanceMap?.get("absent") ?: 0
            val late = attendanceMap?.get("late") ?: 0
            val sick = attendanceMap?.get("sick") ?: 0
            val excused = attendanceMap?.get("excused") ?: attendanceMap?.get("izin") ?: 0
            val total = present + absent + late + sick + excused
            val attendanceRate = if (total > 0) ((present + late).toFloat() / total.toFloat()) * 100f else null

            val fallback = wrapper.toAdminDashboard() ?: AdminDashboard(
                totalStudents = wrapper.studentsCount ?: wrapper.totalStudents,
                totalTeachers = wrapper.teachersCount ?: wrapper.totalTeachers,
                totalClasses = wrapper.classesCount ?: wrapper.totalClasses,
                majorsCount = wrapper.majorsCount,
                todayAttendanceRate = attendanceRate
            )

            Result.Success(fallback)
        } catch (e: Exception) {
            Result.Error(e, e.message ?: "Gagal memuat dashboard admin")
        }
    }

    suspend fun getClassDashboard(): Result<ClassDashboard> {
        return try {
            val response = apiService.getMyClassDashboard()
            if (!response.isSuccessful) {
                return Result.Error(Exception("HTTP ${response.code()}"), "HTTP ${response.code()}")
            }

            val data = response.body()?.data
            if (data != null) {
                Result.Success(data)
            } else {
                Result.Error(Exception("Data dashboard kelas kosong"), "Data dashboard kelas kosong")
            }
        } catch (e: Exception) {
            Result.Error(e, e.message ?: "Gagal memuat dashboard kelas")
        }
    }

    suspend fun getStudentsFollowUp(): Result<List<StudentFollowUp>> {
        return try {
            val response = apiService.getStudentsFollowUp()
            if (!response.isSuccessful) {
                return Result.Error(Exception("HTTP ${response.code()}"), "HTTP ${response.code()}")
            }

            Result.Success(response.body()?.data ?: emptyList())
        } catch (e: Exception) {
            Result.Error(e, e.message ?: "Gagal memuat data follow up")
        }
    }

    suspend fun getMonthlyStatistics(): Result<Map<String, Any>> {
        return try {
            val response = apiService.getMonthlyStatistics()
            if (!response.isSuccessful) {
                return Result.Error(Exception("HTTP ${response.code()}"), "HTTP ${response.code()}")
            }

            Result.Success(response.body()?.data ?: emptyMap())
        } catch (e: Exception) {
            Result.Error(e, e.message ?: "Gagal memuat statistik bulanan")
        }
    }
}
