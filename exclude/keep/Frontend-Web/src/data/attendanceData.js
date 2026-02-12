// Data siswa kelas 12 RPL 2
export const studentList = [
  { id: 1, name: 'Ahmad Fauzi', nis: '2024001' },
  { id: 2, name: 'Siti Nurhaliza', nis: '2024002' },
  { id: 3, name: 'Budi Santoso', nis: '2024003' },
  { id: 4, name: 'Dewi Lestari', nis: '2024004' },
  { id: 5, name: 'Eko Prasetyo', nis: '2024005' },
  { id: 6, name: 'Fitri Handayani', nis: '2024006' },
  { id: 7, name: 'Gilang Ramadan', nis: '2024007' },
  { id: 8, name: 'Hana Permata', nis: '2024008' },
  { id: 9, name: 'Indra Kusuma', nis: '2024009' },
  { id: 10, name: 'Joko Widodo', nis: '2024010' }
];

// Data dummy kehadiran
export const dummyAttendanceRecords = [
  // ===== DATA HARI INI (11 Februari 2026) =====
  // Ahmad Fauzi
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  // Siti Nurhaliza
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Terlambat',
    statusColor: 'status-terlambat',
    reason: 'Terjebak macet di jalan',
    proofDocument: null,
    proofImage: null,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  // Budi Santoso
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Izin',
    statusColor: 'status-izin',
    reason: 'Keperluan keluarga mendadak',
    proofDocument: 'Surat izin orang tua',
    proofImage: 'https://via.placeholder.com/400x600/3b82f6/ffffff?text=Surat+Izin+Orang+Tua',
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Izin',
    statusColor: 'status-izin',
    reason: 'Keperluan keluarga mendadak',
    proofDocument: 'Surat izin orang tua',
    proofImage: 'https://via.placeholder.com/400x600/3b82f6/ffffff?text=Surat+Izin+Orang+Tua',
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  // Dewi Lestari
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Sakit',
    statusColor: 'status-sakit',
    reason: 'Demam dan flu',
    proofDocument: 'Surat keterangan dokter',
    proofImage: 'https://via.placeholder.com/400x600/22c55e/ffffff?text=Surat+Keterangan+Dokter',
    studentId: 4,
    studentName: 'Dewi Lestari',
    nis: '2024004'
  },
  // Eko Prasetyo
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Alpha',
    statusColor: 'status-alpha',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 5,
    studentName: 'Eko Prasetyo',
    nis: '2024005'
  },
  // Fitri Handayani
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 6,
    studentName: 'Fitri Handayani',
    nis: '2024006'
  },
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 6,
    studentName: 'Fitri Handayani',
    nis: '2024006'
  },
  // Gilang Ramadan
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Terlambat',
    statusColor: 'status-terlambat',
    reason: 'Bangun kesiangan',
    proofDocument: null,
    proofImage: null,
    studentId: 7,
    studentName: 'Gilang Ramadan',
    nis: '2024007'
  },
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Pulang',
    statusColor: 'status-pulang',
    reason: 'Merasa tidak enak badan',
    proofDocument: 'Surat izin dari guru BK',
    proofImage: 'https://via.placeholder.com/400x600/a855f7/ffffff?text=Surat+Izin+Guru+BK',
    studentId: 7,
    studentName: 'Gilang Ramadan',
    nis: '2024007'
  },
  // Hana Permata
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 8,
    studentName: 'Hana Permata',
    nis: '2024008'
  },
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 8,
    studentName: 'Hana Permata',
    nis: '2024008'
  },
  // Indra Kusuma
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Terlambat',
    statusColor: 'status-terlambat',
    reason: 'Terjebak macet',
    proofDocument: null,
    proofImage: null,
    studentId: 9,
    studentName: 'Indra Kusuma',
    nis: '2024009'
  },
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 9,
    studentName: 'Indra Kusuma',
    nis: '2024009'
  },
  // Joko Widodo
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 10,
    studentName: 'Joko Widodo',
    nis: '2024010'
  },
  {
    recordDate: '2026-02-11',
    date: '11/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Pulang',
    statusColor: 'status-pulang',
    reason: 'Merasa tidak enak badan saat jam pelajaran ke-6',
    proofDocument: 'Surat izin dari guru BK',
    proofImage: 'https://via.placeholder.com/400x600/a855f7/ffffff?text=Surat+Izin+Guru+BK',
    studentId: 10,
    studentName: 'Joko Widodo',
    nis: '2024010'
  },

  // ===== DATA MINGGU KE-4 FEBRUARI (10 Feb) =====
  // 10 Februari 2026 (Senin)
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Terlambat',
    statusColor: 'status-terlambat',
    reason: 'Ban motor kempes',
    proofDocument: null,
    proofImage: null,
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 4,
    studentName: 'Dewi Lestari',
    nis: '2024004'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 5,
    studentName: 'Eko Prasetyo',
    nis: '2024005'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 6,
    studentName: 'Fitri Handayani',
    nis: '2024006'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 7,
    studentName: 'Gilang Ramadan',
    nis: '2024007'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 8,
    studentName: 'Hana Permata',
    nis: '2024008'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 9,
    studentName: 'Indra Kusuma',
    nis: '2024009'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 10,
    studentName: 'Joko Widodo',
    nis: '2024010'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 4,
    studentName: 'Dewi Lestari',
    nis: '2024004'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 5,
    studentName: 'Eko Prasetyo',
    nis: '2024005'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 6,
    studentName: 'Fitri Handayani',
    nis: '2024006'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 7,
    studentName: 'Gilang Ramadan',
    nis: '2024007'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 8,
    studentName: 'Hana Permata',
    nis: '2024008'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 9,
    studentName: 'Indra Kusuma',
    nis: '2024009'
  },
  {
    recordDate: '2026-02-10',
    date: '10/02/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 10,
    studentName: 'Joko Widodo',
    nis: '2024010'
  },

  // ===== DATA MINGGU KE-3 FEBRUARI (3-9 Feb) =====
  // 7 Februari 2026 (Jumat)
  {
    recordDate: '2026-02-07',
    date: '07/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-02-07',
    date: '07/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Sakit',
    statusColor: 'status-sakit',
    reason: 'Flu dan batuk',
    proofDocument: 'Surat keterangan dokter',
    proofImage: 'https://via.placeholder.com/400x600/22c55e/ffffff?text=Surat+Keterangan+Dokter',
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-02-07',
    date: '07/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  {
    recordDate: '2026-02-07',
    date: '07/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 4,
    studentName: 'Dewi Lestari',
    nis: '2024004'
  },
  {
    recordDate: '2026-02-07',
    date: '07/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Terlambat',
    statusColor: 'status-terlambat',
    reason: 'Hujan deras',
    proofDocument: null,
    proofImage: null,
    studentId: 5,
    studentName: 'Eko Prasetyo',
    nis: '2024005'
  },
  {
    recordDate: '2026-02-07',
    date: '07/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 6,
    studentName: 'Fitri Handayani',
    nis: '2024006'
  },
  {
    recordDate: '2026-02-07',
    date: '07/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 7,
    studentName: 'Gilang Ramadan',
    nis: '2024007'
  },
  {
    recordDate: '2026-02-07',
    date: '07/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 8,
    studentName: 'Hana Permata',
    nis: '2024008'
  },
  {
    recordDate: '2026-02-07',
    date: '07/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 9,
    studentName: 'Indra Kusuma',
    nis: '2024009'
  },
  {
    recordDate: '2026-02-07',
    date: '07/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 10,
    studentName: 'Joko Widodo',
    nis: '2024010'
  },

  // 6 Februari 2026 (Kamis)
  {
    recordDate: '2026-02-06',
    date: '06/02/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-02-06',
    date: '06/02/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-02-06',
    date: '06/02/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Izin',
    statusColor: 'status-izin',
    reason: 'Acara keluarga',
    proofDocument: 'Surat izin orang tua',
    proofImage: 'https://via.placeholder.com/400x600/3b82f6/ffffff?text=Surat+Izin+Orang+Tua',
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  {
    recordDate: '2026-02-06',
    date: '06/02/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 4,
    studentName: 'Dewi Lestari',
    nis: '2024004'
  },
  {
    recordDate: '2026-02-06',
    date: '06/02/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 5,
    studentName: 'Eko Prasetyo',
    nis: '2024005'
  },
  {
    recordDate: '2026-02-06',
    date: '06/02/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Terlambat',
    statusColor: 'status-terlambat',
    reason: 'Membantu orangtua',
    proofDocument: null,
    proofImage: null,
    studentId: 6,
    studentName: 'Fitri Handayani',
    nis: '2024006'
  },
  {
    recordDate: '2026-02-06',
    date: '06/02/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 7,
    studentName: 'Gilang Ramadan',
    nis: '2024007'
  },
  {
    recordDate: '2026-02-06',
    date: '06/02/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 8,
    studentName: 'Hana Permata',
    nis: '2024008'
  },
  {
    recordDate: '2026-02-06',
    date: '06/02/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 9,
    studentName: 'Indra Kusuma',
    nis: '2024009'
  },
  {
    recordDate: '2026-02-06',
    date: '06/02/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 10,
    studentName: 'Joko Widodo',
    nis: '2024010'
  },

  // 5 Februari 2026 (Rabu)
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '1-4',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '1-4',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '1-4',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '1-4',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Alpha',
    statusColor: 'status-alpha',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 4,
    studentName: 'Dewi Lestari',
    nis: '2024004'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '1-4',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 5,
    studentName: 'Eko Prasetyo',
    nis: '2024005'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '1-4',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 6,
    studentName: 'Fitri Handayani',
    nis: '2024006'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '1-4',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 7,
    studentName: 'Gilang Ramadan',
    nis: '2024007'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '1-4',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Terlambat',
    statusColor: 'status-terlambat',
    reason: 'Antar adik ke sekolah',
    proofDocument: null,
    proofImage: null,
    studentId: 8,
    studentName: 'Hana Permata',
    nis: '2024008'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '1-4',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 9,
    studentName: 'Indra Kusuma',
    nis: '2024009'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '1-4',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 10,
    studentName: 'Joko Widodo',
    nis: '2024010'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '5-8',
    subject: 'Bahasa Inggris',
    teacher: 'Sarah Johnson S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '5-8',
    subject: 'Bahasa Inggris',
    teacher: 'Sarah Johnson S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '5-8',
    subject: 'Bahasa Inggris',
    teacher: 'Sarah Johnson S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '5-8',
    subject: 'Bahasa Inggris',
    teacher: 'Sarah Johnson S.pd',
    status: 'Pulang',
    statusColor: 'status-pulang',
    reason: 'Sakit kepala',
    proofDocument: 'Surat izin dari guru BK',
    proofImage: 'https://via.placeholder.com/400x600/a855f7/ffffff?text=Surat+Izin+Guru+BK',
    studentId: 4,
    studentName: 'Dewi Lestari',
    nis: '2024004'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '5-8',
    subject: 'Bahasa Inggris',
    teacher: 'Sarah Johnson S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 5,
    studentName: 'Eko Prasetyo',
    nis: '2024005'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '5-8',
    subject: 'Bahasa Inggris',
    teacher: 'Sarah Johnson S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 6,
    studentName: 'Fitri Handayani',
    nis: '2024006'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '5-8',
    subject: 'Bahasa Inggris',
    teacher: 'Sarah Johnson S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 7,
    studentName: 'Gilang Ramadan',
    nis: '2024007'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '5-8',
    subject: 'Bahasa Inggris',
    teacher: 'Sarah Johnson S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 8,
    studentName: 'Hana Permata',
    nis: '2024008'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '5-8',
    subject: 'Bahasa Inggris',
    teacher: 'Sarah Johnson S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 9,
    studentName: 'Indra Kusuma',
    nis: '2024009'
  },
  {
    recordDate: '2026-02-05',
    date: '05/02/26',
    period: '5-8',
    subject: 'Bahasa Inggris',
    teacher: 'Sarah Johnson S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 10,
    studentName: 'Joko Widodo',
    nis: '2024010'
  },

  // 4 Februari 2026 (Selasa)
  {
    recordDate: '2026-02-04',
    date: '04/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Terlambat',
    statusColor: 'status-terlambat',
    reason: 'Macet parah',
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-02-04',
    date: '04/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-02-04',
    date: '04/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  {
    recordDate: '2026-02-04',
    date: '04/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 4,
    studentName: 'Dewi Lestari',
    nis: '2024004'
  },
  {
    recordDate: '2026-02-04',
    date: '04/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 5,
    studentName: 'Eko Prasetyo',
    nis: '2024005'
  },
  {
    recordDate: '2026-02-04',
    date: '04/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 6,
    studentName: 'Fitri Handayani',
    nis: '2024006'
  },
  {
    recordDate: '2026-02-04',
    date: '04/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Sakit',
    statusColor: 'status-sakit',
    reason: 'Demam tinggi',
    proofDocument: 'Surat keterangan dokter',
    proofImage: 'https://via.placeholder.com/400x600/22c55e/ffffff?text=Surat+Keterangan+Dokter',
    studentId: 7,
    studentName: 'Gilang Ramadan',
    nis: '2024007'
  },
  {
    recordDate: '2026-02-04',
    date: '04/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 8,
    studentName: 'Hana Permata',
    nis: '2024008'
  },
  {
    recordDate: '2026-02-04',
    date: '04/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 9,
    studentName: 'Indra Kusuma',
    nis: '2024009'
  },
  {
    recordDate: '2026-02-04',
    date: '04/02/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 10,
    studentName: 'Joko Widodo',
    nis: '2024010'
  },

  // 3 Februari 2026 (Senin)
  {
    recordDate: '2026-02-03',
    date: '03/02/26',
    period: '1-4',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-02-03',
    date: '03/02/26',
    period: '1-4',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-02-03',
    date: '03/02/26',
    period: '1-4',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  {
    recordDate: '2026-02-03',
    date: '03/02/26',
    period: '1-4',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 4,
    studentName: 'Dewi Lestari',
    nis: '2024004'
  },
  {
    recordDate: '2026-02-03',
    date: '03/02/26',
    period: '1-4',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 5,
    studentName: 'Eko Prasetyo',
    nis: '2024005'
  },
  {
    recordDate: '2026-02-03',
    date: '03/02/26',
    period: '1-4',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 6,
    studentName: 'Fitri Handayani',
    nis: '2024006'
  },
  {
    recordDate: '2026-02-03',
    date: '03/02/26',
    period: '1-4',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 7,
    studentName: 'Gilang Ramadan',
    nis: '2024007'
  },
  {
    recordDate: '2026-02-03',
    date: '03/02/26',
    period: '1-4',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 8,
    studentName: 'Hana Permata',
    nis: '2024008'
  },
  {
    recordDate: '2026-02-03',
    date: '03/02/26',
    period: '1-4',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Izin',
    statusColor: 'status-izin',
    reason: 'Mengurus surat penting',
    proofDocument: 'Surat izin orang tua',
    proofImage: 'https://via.placeholder.com/400x600/3b82f6/ffffff?text=Surat+Izin+Orang+Tua',
    studentId: 9,
    studentName: 'Indra Kusuma',
    nis: '2024009'
  },
  {
    recordDate: '2026-02-03',
    date: '03/02/26',
    period: '1-4',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 10,
    studentName: 'Joko Widodo',
    nis: '2024010'
  },

  // ===== DATA JANUARI 2026 (untuk tren bulanan) =====
  {
    recordDate: '2026-01-31',
    date: '31/01/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-01-31',
    date: '31/01/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-01-31',
    date: '31/01/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  {
    recordDate: '2026-01-30',
    date: '30/01/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-01-30',
    date: '30/01/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Terlambat',
    statusColor: 'status-terlambat',
    reason: 'Motor mogok',
    proofDocument: null,
    proofImage: null,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-01-29',
    date: '29/01/26',
    period: '1-4',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-01-29',
    date: '29/01/26',
    period: '1-4',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Alpha',
    statusColor: 'status-alpha',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  {
    recordDate: '2026-01-28',
    date: '28/01/26',
    period: '1-4',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-01-28',
    date: '28/01/26',
    period: '1-4',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-01-28',
    date: '28/01/26',
    period: '5-8',
    subject: 'Kimia',
    teacher: 'Dr. Ani Widiastuti',
    status: 'Pulang',
    statusColor: 'status-pulang',
    reason: 'Merasa tidak enak badan saat jam pelajaran ke-6',
    proofDocument: 'Surat izin dari guru BK',
    proofImage: 'https://via.placeholder.com/400x600/a855f7/ffffff?text=Surat+Izin+Guru+BK',
    studentId: 3,
    studentName: 'Budi Santoso',
    nis: '2024003'
  },
  {
    recordDate: '2026-01-27',
    date: '27/01/26',
    period: '1-4',
    subject: 'Fisika',
    teacher: 'Budi Santoso S.pd',
    status: 'Sakit',
    statusColor: 'status-sakit',
    reason: 'Demam dan flu',
    proofDocument: 'Surat keterangan dokter',
    proofImage: 'https://via.placeholder.com/400x600/22c55e/ffffff?text=Surat+Keterangan+Dokter',
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nis: '2024002'
  },
  {
    recordDate: '2026-01-26',
    date: '26/01/26',
    period: '5-8',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza S.pd',
    status: 'Izin',
    statusColor: 'status-izin',
    reason: 'Keperluan keluarga mendadak',
    proofDocument: 'Surat izin orang tua',
    proofImage: 'https://via.placeholder.com/400x600/3b82f6/ffffff?text=Surat+Izin+Orang+Tua',
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  },
  {
    recordDate: '2026-01-25',
    date: '25/01/26',
    period: '1-4',
    subject: 'Matematika',
    teacher: 'Afifah Diantebas Andra S.pd',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nis: '2024001'
  }
];

// Fungsi untuk menghitung statistik hari ini
export const calculateDailyStats = (records = dummyAttendanceRecords) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayRecords = records.filter(record => {
    if (!record.recordDate) return false;
    const recordDate = new Date(record.recordDate);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  });

  // Menghitung unique students untuk setiap status
  const studentStatusMap = new Map();
  
  todayRecords.forEach(record => {
    const studentId = record.studentId;
    const status = record.status.toLowerCase();
    
    if (!studentStatusMap.has(studentId)) {
      studentStatusMap.set(studentId, new Set());
    }
    studentStatusMap.get(studentId).add(status);
  });

  const stats = {
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
    terlambat: 0,
    pulang: 0
  };

  // Prioritas status: alpha > sakit > izin > pulang > terlambat > hadir
  studentStatusMap.forEach((statuses) => {
    if (statuses.has('alpha')) {
      stats.alpha++;
    } else if (statuses.has('sakit')) {
      stats.sakit++;
    } else if (statuses.has('izin')) {
      stats.izin++;
    } else if (statuses.has('pulang')) {
      stats.pulang++;
    } else if (statuses.has('terlambat')) {
      stats.terlambat++;
    } else if (statuses.has('hadir')) {
      stats.hadir++;
    }
  });

  return stats;
};

// Fungsi untuk menghitung tren bulanan (untuk Dashboard Pengurus Kelas)
export const calculateMonthlyTrend = (records = dummyAttendanceRecords) => {
  const monthlyData = {};
  const totalStudents = studentList.length;

  records.forEach(record => {
    if (!record.recordDate) return;
    
    const date = new Date(record.recordDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: date.toLocaleDateString('id-ID', { month: 'short' }),
        hadir: new Set(),
        total: 0
      };
    }
    
    monthlyData[monthKey].total++;
    
    if (record.status.toLowerCase() === 'hadir') {
      monthlyData[monthKey].hadir.add(record.studentId);
    }
  });

  // Convert to array dan hitung persentase
  const trendArray = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Ambil 6 bulan terakhir
    .map(([key, data]) => ({
      month: data.month,
      hadir: data.hadir.size,
      total: data.total,
      percentage: Math.round((data.hadir.size / totalStudents) * 100)
    }));

  return trendArray;
};

// Fungsi untuk menghitung statistik mingguan per siswa (untuk Dashboard Siswa)
export const calculateWeeklyStatsForStudent = (studentId, records = dummyAttendanceRecords) => {
  // Hitung tanggal awal minggu ini (Senin)
  const today = new Date();
  const currentDay = today.getDay();
  const diff = currentDay === 0 ? -6 : 1 - currentDay; // Jika Minggu, mundur 6 hari
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  // Filter records untuk siswa ini minggu ini
  const weekRecords = records.filter(record => {
    if (!record.recordDate || record.studentId !== studentId) return false;
    const recordDate = new Date(record.recordDate);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate >= monday;
  });

  // Hitung status menggunakan Map untuk menghindari duplikasi hari yang sama
  const dailyStatus = new Map();
  
  weekRecords.forEach(record => {
    const dateKey = record.recordDate;
    const status = record.status.toLowerCase();
    
    if (!dailyStatus.has(dateKey)) {
      dailyStatus.set(dateKey, status);
    } else {
      // Prioritas: alpha > sakit > izin > pulang > terlambat > hadir
      const currentStatus = dailyStatus.get(dateKey);
      const priority = { alpha: 6, sakit: 5, izin: 4, pulang: 3, terlambat: 2, hadir: 1 };
      if ((priority[status] || 0) > (priority[currentStatus] || 0)) {
        dailyStatus.set(dateKey, status);
      }
    }
  });

  const stats = {
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
    terlambat: 0,
    pulang: 0
  };

  dailyStatus.forEach((status) => {
    if (stats.hasOwnProperty(status)) {
      stats[status]++;
    }
  });

  return stats;
};

// Fungsi untuk menghitung tren bulanan per siswa (untuk Dashboard Siswa)
export const calculateMonthlyTrendForStudent = (studentId, records = dummyAttendanceRecords) => {
  const monthlyData = {};

  // Filter records untuk siswa ini
  const studentRecords = records.filter(record => record.studentId === studentId);

  studentRecords.forEach(record => {
    if (!record.recordDate) return;
    
    const date = new Date(record.recordDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: date.toLocaleDateString('id-ID', { month: 'short' }),
        days: new Map(),
        totalDays: 0
      };
    }
    
    const dateKey = record.recordDate;
    const status = record.status.toLowerCase();
    
    // Track status per hari (ambil yang paling prioritas)
    if (!monthlyData[monthKey].days.has(dateKey)) {
      monthlyData[monthKey].days.set(dateKey, status);
    } else {
      const currentStatus = monthlyData[monthKey].days.get(dateKey);
      const priority = { alpha: 6, sakit: 5, izin: 4, pulang: 3, terlambat: 2, hadir: 1 };
      if ((priority[status] || 0) > (priority[currentStatus] || 0)) {
        monthlyData[monthKey].days.set(dateKey, status);
      }
    }
  });

  // Hitung total hadir per bulan
  Object.keys(monthlyData).forEach(monthKey => {
    const data = monthlyData[monthKey];
    let hadirCount = 0;
    
    data.days.forEach((status) => {
      data.totalDays++;
      if (status === 'hadir') {
        hadirCount++;
      }
    });
    
    data.hadir = hadirCount;
  });

  // Convert to array dan hitung persentase
  const trendArray = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Ambil 6 bulan terakhir
    .map(([key, data]) => ({
      month: data.month,
      hadir: data.hadir,
      total: data.totalDays,
      percentage: data.totalDays > 0 ? Math.round((data.hadir / data.totalDays) * 100) : 0
    }));

  return trendArray;
};