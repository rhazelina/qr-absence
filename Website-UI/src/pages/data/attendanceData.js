// Data siswa kelas 12 RPL 2
// Data siswa kelas 12 RPL 2
export const studentList = [
  { 
    id: 1, 
    name: 'Maya Melinda Wijayanti', 
    nis: '0078658367' 
  }
];


// Data dummy kehadiran
export const dummyAttendanceRecords = [
  // ===== 13 Februari 2026 =====
  {
    recordDate: '2026-02-13',
    date: '13/02/26',
    period: '3-5',
    subject: 'MPKK',
    teacher: 'RR. Henning Gratyanis A., S.Pd.',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Maya Melinda Wijayanti',
    nis: '0078658367'
  },
  {
    recordDate: '2026-02-13',
    date: '13/02/26',
    period: '6-8',
    subject: 'MPKK',
    teacher: 'Devi Artanti, S.Pd., Gr.',
    status: 'Hadir',
    statusColor: 'status-hadir',
    reason: null,
    proofDocument: null,
    proofImage: null,
    studentId: 1,
    studentName: 'Maya Melinda Wijayanti',
    nis: '0078658367'
  },
  {
    recordDate: '2026-02-13',
    date: '13/02/26',
    period: '9-10',
    subject: 'MPKK',
    teacher: 'Alifah Diantebes Aindra, S.Pd.',
    status: 'Izin',
    statusColor: 'status-izin',
    reason: 'Ada keperluan keluarga',
    proofDocument: 'Surat izin orang tua',
    proofImage: 'https://via.placeholder.com/400x600/3b82f6/ffffff?text=Surat+Izin',
    studentId: 1,
    studentName: 'Maya Melinda Wijayanti',
    nis: '0078658367'
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