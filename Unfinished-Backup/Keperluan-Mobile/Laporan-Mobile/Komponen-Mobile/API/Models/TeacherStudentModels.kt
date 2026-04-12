package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName
import com.google.gson.annotations.JsonAdapter
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import java.lang.reflect.Type

// ===== CUSTOM DESERIALIZER untuk Major =====
class MajorDeserializer : JsonDeserializer<MajorInfo?> {
    override fun deserialize(
        json: JsonElement?,
        typeOfT: Type?,
        context: JsonDeserializationContext?
    ): MajorInfo? {
        return when {
            json == null || json.isJsonNull -> null
            json.isJsonObject -> {
                // Jika berupa object, parse sebagai MajorInfo
                context?.deserialize<MajorInfo>(json, MajorInfo::class.java)
            }
            json.isJsonPrimitive -> {
                // Jika berupa string, buat MajorInfo dengan name dari string tersebut
                val majorName = json.asString
                MajorInfo(id = null, name = majorName, code = null)
            }
            else -> null
        }
    }
}

// ===== CUSTOM DESERIALIZER untuk Jabatan =====
class JabatanDeserializer : JsonDeserializer<String> {
    override fun deserialize(
        json: JsonElement?,
        typeOfT: Type?,
        context: JsonDeserializationContext?
    ): String {
        return when {
            json == null || json.isJsonNull -> "Guru"
            json.isJsonArray -> {
                // Jika array, ambil elemen pertama
                val array = json.asJsonArray
                if (array.size() > 0) array[0].asString else "Guru"
            }
            json.isJsonPrimitive -> json.asString
            else -> "Guru"
        }
    }
}

// ===== TEACHER MODELS =====
data class TeacherResource(
    val id: Int?,
    val name: String?,
    val nip: String?,
    @SerializedName("kode_guru")
    val kodeGuru: String?,
    val email: String?,
    val phone: String?,

    // FIX: Handle jabatan yang bisa berupa string atau array
    @JsonAdapter(JabatanDeserializer::class)
    val jabatan: String = "Guru",

    @SerializedName("homeroom_class_id")
    val homeroomClassId: Int? = null,

    // FIX: Handle major yang bisa berupa string atau object
    @JsonAdapter(MajorDeserializer::class)
    val major: MajorInfo? = null,

    @SerializedName("created_at")
    val createdAt: String?,
    val bidang: String? = null,
    @SerializedName("konsentrasi_keahlian")
    val konsentrasiKeahlian: String? = null
)

data class StoreTeacherRequest(
    val name: String,
    val nip: String,
    @SerializedName("kode_guru")
    val kodeGuru: String? = null,
    val email: String,
    val phone: String? = null,
    @SerializedName("major_id")
    val majorId: Int? = null,
    val jabatan: String = "Guru",
    @SerializedName("homeroom_class_id")
    val homeroomClassId: Int? = null,
    val bidang: String? = null,
    @SerializedName("konsentrasi_keahlian")
    val konsentrasiKeahlian: String? = null
)

data class UpdateTeacherRequest(
    val name: String? = null,
    val nip: String? = null,
    @SerializedName("kode_guru")
    val kodeGuru: String? = null,
    val email: String? = null,
    val phone: String? = null,
    @SerializedName("major_id")
    val majorId: Int? = null,
    val jabatan: String? = null,
    @SerializedName("homeroom_class_id")
    val homeroomClassId: Int? = null,
    val bidang: String? = null,
    @SerializedName("konsentrasi_keahlian")
    val konsentrasiKeahlian: String? = null
)

data class TeacherImportRequest(
    val file: String
)

data class TeacherImportResponse(
    val imported: Int? = null,
    val skipped: Int? = null,
    val errors: List<String>? = null
)

// ===== STUDENT MODELS =====
data class StudentResource(
    val id: Int?,
    val name: String?,
    val nisn: String?,
    val nis: String?,
    val gender: String? = null,
    @SerializedName("class")
    val studentClass: ClassInfo? = null,
    @SerializedName("class_id")
    val classId: Int? = null,
    @SerializedName("class_name")
    val className: String? = null,

    // FIX: Gunakan custom deserializer untuk major
    @JsonAdapter(MajorDeserializer::class)
    val major: MajorInfo? = null,

    @SerializedName("major_id")
    val majorId: Int? = null,

    @SerializedName("major_name")
    val majorName: String? = null,

    @SerializedName("parent_phone")
    val parentPhone: String? = null,
    val address: String? = null,
    val email: String? = null,
    val grade: String? = null,
    @SerializedName("is_class_officer")
    val isClassOfficer: Boolean? = null,
    @SerializedName("date_of_birth")
    val dateOfBirth: String? = null,
    @SerializedName("created_at")
    val createdAt: String? = null
) {
    fun getKelasName(): String = studentClass?.name ?: className ?: "-"

    fun displayMajorName(): String =
        major?.name ?: majorName ?:
        major?.let { "${it.code} - ${it.name}" } ?: "-"
}

data class StoreStudentRequest(
    val name: String,
    val nisn: String,
    val nis: String? = null,
    val gender: String? = null,
    val email: String? = null,
    @SerializedName("class_id")
    val classId: Int,
    @SerializedName("major_id")
    val majorId: Int? = null,
    @SerializedName("parent_phone")
    val parentPhone: String? = null,
    val address: String? = null,
    @SerializedName("date_of_birth")
    val dateOfBirth: String? = null
)

data class UpdateStudentRequest(
    val name: String? = null,
    val nisn: String? = null,
    val nis: String? = null,
    val gender: String? = null,
    val email: String? = null,
    @SerializedName("class_id")
    val classId: Int? = null,
    @SerializedName("major_id")
    val majorId: Int? = null,
    @SerializedName("parent_phone")
    val parentPhone: String? = null,
    val address: String? = null,
    @SerializedName("date_of_birth")
    val dateOfBirth: String? = null
)

data class StudentImportRequest(
    val file: String
)

data class StudentImportResponse(
    val imported: Int? = null,
    val skipped: Int? = null,
    val errors: List<String>? = null
)

// ===== LEAVE PERMISSION MODELS =====
data class StudentLeavePermission(
    val id: Int?,
    val student: StudentInfo?,
    @SerializedName("class")
    val studentClass: ClassInfo? = null,
    val type: String?,
    @SerializedName("start_time")
    val startTime: String?,
    @SerializedName("end_time")
    val endTime: String?,
    val reason: String?,
    val status: String?,
    @SerializedName("created_at")
    val createdAt: String?,
    @SerializedName("returned_at")
    val returnedAt: String?
)

data class CreateLeavePermissionRequest(
    @SerializedName("student_id")
    val studentId: Int,
    val type: String,
    val reason: String,
    @SerializedName("start_time")
    val startTime: String? = null,
    @SerializedName("end_time")
    val endTime: String? = null,
    @SerializedName("is_early_leave")
    val isEarlyLeave: Boolean? = null
)

data class UpdateLeavePermissionRequest(
    val reason: String? = null,
    val status: String? = null
)