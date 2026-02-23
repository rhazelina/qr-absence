package com.example.ritamesa

import com.google.common.truth.Truth.assertThat
import org.junit.Test
import java.text.SimpleDateFormat
import java.util.*

/**
 * Unit tests for business logic
 * Tests validation, data transformation, and utility functions used throughout the app
 */
class BusinessLogicTest {

    // ===== ATTENDANCE VALIDATION TESTS =====

    /**
     * Test valid attendance statuses according to API documentation
     */
    @Test
    fun testValidAttendanceStatus() {
        val validStatuses = listOf("present", "late", "excused", "sick", "absent", "izin")
        
        validStatuses.forEach { status ->
            assertThat(isValidAttendanceStatus(status)).isTrue()
        }
    }

    @Test
    fun testInvalidAttendanceStatus() {
        val invalidStatuses = listOf("pending", "unknown", "maybe", "")
        
        invalidStatuses.forEach { status ->
            assertThat(isValidAttendanceStatus(status)).isFalse()
        }
    }

    @Test
    fun testAttendanceStatusConverter() {
        val mapping = mapOf(
            "present" to "Hadir",
            "late" to "Terlambat",
            "absent" to "Absen",
            "sick" to "Sakit",
            "excused" to "Izin",
            "izin" to "Izin"
        )
        
        mapping.forEach { (status, display) ->
            assertThat(getAttendanceStatusDisplay(status)).isEqualTo(display)
        }
    }

    // ===== DATE VALIDATION TESTS =====

    @Test
    fun testIsValidDateFormat() {
        val validDates = listOf(
            "2026-02-20",
            "2025-01-01",
            "2026-12-31"
        )
        
        validDates.forEach { date ->
            assertThat(isValidDateFormat(date)).isTrue()
        }
    }

    @Test
    fun testIsInvalidDateFormat() {
        val invalidDates = listOf(
            "02-20-2026",
            "20/02/2026",
            "2026-02-30",
            "invalid-date",
            ""
        )
        
        invalidDates.forEach { date ->
            assertThat(isValidDateFormat(date)).isFalse()
        }
    }

    @Test
    fun testIsFutureDate() {
        val today = Calendar.getInstance()
        val tomorrow = Calendar.getInstance().apply { add(Calendar.DAY_OF_MONTH, 1) }
        val yesterday = Calendar.getInstance().apply { add(Calendar.DAY_OF_MONTH, -1) }
        
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        
        val tomorrowStr = dateFormat.format(tomorrow.time)
        val yesterdayStr = dateFormat.format(yesterday.time)
        
        assertThat(isFutureDate(tomorrowStr)).isTrue()
        assertThat(isFutureDate(yesterdayStr)).isFalse()
    }

    @Test
    fun testCannotRecordOnSunday() {
        // Create a date that is a Sunday
        val calendar = Calendar.getInstance().apply {
            // Find a Sunday
            while (get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY) {
                add(Calendar.DAY_OF_MONTH, 1)
            }
        }
        
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val sundayDate = dateFormat.format(calendar.time)
        
        assertThat(canRecordAttendanceOnDate(sundayDate)).isFalse()
    }

    @Test
    fun testCanRecordOnWeekday() {
        // Create a date that is NOT a Sunday
        val calendar = Calendar.getInstance().apply {
            // Skip to next weekday if today is Sunday
            if (get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY) {
                add(Calendar.DAY_OF_MONTH, 1)
            }
        }
        
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val weekdayDate = dateFormat.format(calendar.time)
        
        assertThat(canRecordAttendanceOnDate(weekdayDate)).isTrue()
    }

    // ===== VALIDATION LOGIC TESTS =====

    @Test
    fun testValidNISN() {
        val validNISN = listOf(
            "1234567890",
            "9876543210",
            "1111111111"
        )
        
        validNISN.forEach { nisn ->
            assertThat(isValidNISN(nisn)).isTrue()
        }
    }

    @Test
    fun testInvalidNISN() {
        val invalidNISN = listOf(
            "123456789",      // Too short
            "12345678901",    // Too long
            "123456789a",     // Contains letter
            "",
            "abcdefghij"      // All letters
        )
        
        invalidNISN.forEach { nisn ->
            assertThat(isValidNISN(nisn)).isFalse()
        }
    }

    @Test
    fun testValidEmail() {
        val validEmails = listOf(
            "user@example.com",
            "test.email@domain.co.id",
            "name+tag@example.com",
            "123@example.com"
        )
        
        validEmails.forEach { email ->
            assertThat(isValidEmail(email)).isTrue()
        }
    }

    @Test
    fun testInvalidEmail() {
        val invalidEmails = listOf(
            "notanemail",
            "@example.com",
            "user@",
            "user@example",
            ""
        )
        
        invalidEmails.forEach { email ->
            assertThat(isValidEmail(email)).isFalse()
        }
    }

    // ===== ATTENDANCE CALCULATION TESTS =====

    @Test
    fun testCalculateAttendanceRate() {
        val totalSchedules = 20
        val presentDays = 18
        val expectedRate = 90.0f
        
        val rate = calculateAttendanceRate(presentDays, totalSchedules)
        assertThat(rate).isWithin(0.1f).of(expectedRate)
    }

    @Test
    fun testCalculateAttendanceRateZero() {
        val rate = calculateAttendanceRate(0, 10)
        assertThat(rate).isWithin(0.1f).of(0.0f)
    }

    @Test
    fun testCalculateAttendanceRateHundred() {
        val rate = calculateAttendanceRate(20, 20)
        assertThat(rate).isWithin(0.1f).of(100.0f)
    }

    @Test
    fun testCalculateAttendanceRateDivideByZero() {
        // Should handle division by zero gracefully
        val rate = calculateAttendanceRate(10, 0)
        assertThat(rate).isEqualTo(0.0f)
    }

    @Test
    fun testCountConsecutiveAbsences() {
        val attendanceRecords = listOf(
            "present",
            "present",
            "absent",
            "absent",
            "absent",
            "late",
            "absent"
        )
        
        val consecutiveAbsences = countConsecutiveAbsences(attendanceRecords)
        assertThat(consecutiveAbsences).isEqualTo(1) // Last absence doesn't count as consecutive from previous
    }

    // ===== QR CODE VALIDATION TESTS =====

    @Test
    fun testIsValidQRToken() {
        val validTokens = listOf(
            "qr_123456789",
            "token_abcdef123456",
            "AUTH_QR_ABC123"
        )
        
        validTokens.forEach { token ->
            assertThat(isValidQRToken(token)).isTrue()
        }
    }

    @Test
    fun testIsInvalidQRToken() {
        val invalidTokens = listOf(
            "",
            "   ",
            "a"  // Too short
        )
        
        invalidTokens.forEach { token ->
            assertThat(isValidQRToken(token)).isFalse()
        }
    }

    // ===== NAME/TEXT VALIDATION TESTS =====

    @Test
    fun testIsValidStudentName() {
        val validNames = listOf(
            "John Doe",
            "Muhammad Ali",
            "Maria Santoso",
            "Jean-Pierre",
            "O'Brien"
        )
        
        validNames.forEach { name ->
            assertThat(isValidStudentName(name)).isTrue()
        }
    }

    @Test
    fun testIsInvalidStudentName() {
        val invalidNames = listOf(
            "",
            "   ",
            "JD",  // Too short
            "123Numeric",
            "@#$%"
        )
        
        invalidNames.forEach { name ->
            assertThat(isValidStudentName(name)).isFalse()
        }
    }

    // ===== STATUS FILTER TESTS =====

    @Test
    fun testAttendanceStatusFiltering() {
        val records = listOf(
            Pair("present", 1),
            Pair("absent", 1),
            Pair("late", 1),
            Pair("sick", 1),
            Pair("present", 1),
            Pair("absent", 1)
        )
        
        val presentCount = records.count { it.first == "present" }
        val absentCount = records.count { it.first == "absent" }
        
        assertThat(presentCount).isEqualTo(2)
        assertThat(absentCount).isEqualTo(2)
    }

    @Test
    fun testFilterAttendanceByDateRange() {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val startDate = Calendar.getInstance().apply { add(Calendar.DAY_OF_MONTH, -5) }
        val endDate = Calendar.getInstance()
        
        val records = listOf(
            dateFormat.format(Calendar.getInstance().apply { add(Calendar.DAY_OF_MONTH, -3) }.time) to "present",
            dateFormat.format(Calendar.getInstance().apply { add(Calendar.DAY_OF_MONTH, -1) }.time) to "absent",
            dateFormat.format(Calendar.getInstance().time) to "present"
        )
        
        val filtered = records.filter { (date, _) ->
            val recordDate = dateFormat.parse(date)!!
            recordDate.after(startDate.time) && recordDate.before(endDate.time)
        }
        
        assertThat(filtered.size).isGreaterThan(0)
    }

    // ===== DATA FORMAT TESTS =====

    @Test
    fun testFormatDateDisplay() {
        val isoDate = "2026-02-20"
        val display = formatDateForDisplay(isoDate)
        
        assertThat(display).contains("20")
        assertThat(display).contains("2026")
    }

    @Test
    fun testFormatTimeDisplay() {
        val isoTime = "2026-02-20T14:30:00Z"
        val display = formatTimeForDisplay(isoTime)
        
        assertThat(display).contains("14")
        assertThat(display).contains("30")
    }

    // ===== PAGINATION TESTS =====

    @Test
    fun testCalculatePageCount() {
        val totalItems = 100
        val itemsPerPage = 20
        val expectedPages = 5
        
        val pages = calculatePageCount(totalItems, itemsPerPage)
        assertThat(pages).isEqualTo(expectedPages)
    }

    @Test
    fun testCalculatePageCountWithRemainder() {
        val totalItems = 101
        val itemsPerPage = 20
        val expectedPages = 6  // 5 full pages + 1 partial
        
        val pages = calculatePageCount(totalItems, itemsPerPage)
        assertThat(pages).isEqualTo(expectedPages)
    }

    @Test
    fun testIsLastPage() {
        val currentPage = 5
        val totalPages = 5
        
        assertThat(isLastPage(currentPage, totalPages)).isTrue()
        assertThat(isLastPage(4, totalPages)).isFalse()
    }
}

// ===== HELPER FUNCTIONS FOR TESTING =====

fun isValidAttendanceStatus(status: String): Boolean {
    return status in listOf("present", "late", "excused", "sick", "absent", "izin")
}

fun getAttendanceStatusDisplay(status: String): String {
    return when (status) {
        "present" -> "Hadir"
        "late" -> "Terlambat"
        "absent" -> "Absen"
        "sick" -> "Sakit"
        "excused", "izin" -> "Izin"
        else -> status
    }
}

fun isValidDateFormat(date: String): Boolean {
    return try {
        val format = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        format.isLenient = false
        format.parse(date)
        true
    } catch (e: Exception) {
        false
    }
}

fun isFutureDate(date: String): Boolean {
    return try {
        val format = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val dateObj = format.parse(date) ?: return false
        val today = Calendar.getInstance().time
        dateObj.after(today)
    } catch (e: Exception) {
        false
    }
}

fun canRecordAttendanceOnDate(date: String): Boolean {
    return try {
        val format = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val dateObj = format.parse(date) ?: return false
        val calendar = Calendar.getInstance().apply { time = dateObj }
        // Cannot record on Sunday (DAY_OF_WEEK = 1)
        calendar.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY
    } catch (e: Exception) {
        false
    }
}

fun isValidNISN(nisn: String): Boolean {
    return nisn.length == 10 && nisn.all { it.isDigit() }
}

fun isValidEmail(email: String): Boolean {
    return email.contains("@") && email.contains(".") && 
           email.indexOf("@") < email.lastIndexOf(".") &&
           !email.startsWith("@") && !email.endsWith("@") &&
           !email.endsWith(".")
}

fun calculateAttendanceRate(presentDays: Int, totalSchedules: Int): Float {
    return if (totalSchedules == 0) 0.0f else (presentDays.toFloat() / totalSchedules) * 100
}

fun countConsecutiveAbsences(records: List<String>): Int {
    return if (records.isEmpty()) 0 else {
        var count = 0
        for (i in records.size - 1 downTo 0) {
            if (records[i] == "absent") count++ else break
        }
        count
    }
}

fun isValidQRToken(token: String): Boolean {
    return token.isNotBlank() && token.length >= 8
}

fun isValidStudentName(name: String): Boolean {
    return name.trim().length >= 3 && name.all { it.isLetter() || it.isWhitespace() || it == '-' || it == '\'' }
}

fun formatDateForDisplay(date: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val outputFormat = SimpleDateFormat("dd MMMM yyyy", Locale("id", "ID"))
        val dateObj = inputFormat.parse(date) ?: return date
        outputFormat.format(dateObj)
    } catch (e: Exception) {
        date
    }
}

fun formatTimeForDisplay(isoTime: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault())
        val outputFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
        val dateObj = inputFormat.parse(isoTime) ?: return isoTime
        outputFormat.format(dateObj)
    } catch (e: Exception) {
        isoTime
    }
}

fun calculatePageCount(totalItems: Int, itemsPerPage: Int): Int {
    return if (itemsPerPage == 0) 0 else (totalItems + itemsPerPage - 1) / itemsPerPage
}

fun isLastPage(currentPage: Int, totalPages: Int): Boolean {
    return currentPage >= totalPages
}
