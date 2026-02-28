// dataManager.js - Centralized data management untuk absensi (Updated with real class data)

// Database siswa berdasarkan kelas (dari foto absen real)
const siswaDatabase = {
  // Data dari foto pertama - XII RPL 2
  'XII RPL 2': [
    { nisn: '7152/1043.063', nama: 'Laura Lavida Loca' },
    { nisn: '7153/1044.063', nama: 'Lely Sagita' },
    { nisn: '7154/1045.063', nama: 'Maya Mellinda Wijayanti' },
    { nisn: '7156/1047.063', nama: 'Moch. Abyl Gustian' },
    { nisn: '7157/1048.063', nama: 'Muhammad Aminullah' },
    { nisn: '7158/1049.063', nama: 'Muhammad Azka Fadli Atthaya' },
    { nisn: '7159/1050.063', nama: 'Muhammad Hadi Firmansyah' },
    { nisn: '7160/1051.063', nama: 'Muhammad Harris Maulana Saputra' },
    { nisn: '7161/1052.063', nama: 'Muhammad Ibnu Raffi Ahdan' },
    { nisn: '7162/1053.063', nama: 'Muhammad Reyhan Alhadiansyah' },
    { nisn: '7163/1054.063', nama: 'Muhammad Wisnu Dewandaru' },
    { nisn: '7164/1055.063', nama: 'Nabila Ramadhani' },
    { nisn: '7165/1056.063', nama: 'Nadia Sinta Devi Oktavia' },
    { nisn: '7166/1057.063', nama: 'Nadjwa Kirana Firdaus' },
    { nisn: '7167/1058.063', nama: 'Nindi Narita Maulidya' },
    { nisn: '7168/1059.063', nama: 'Niswatul Khoiriyah' },
    { nisn: '7169/1060.063', nama: 'Noverita Pascalia Rahma' },
    { nisn: '7170/1061.063', nama: 'Novita Andriani' },
    { nisn: '7171/1062.063', nama: 'Novita Azzahra' },
    { nisn: '7172/1063.063', nama: 'Nurul Khasanah' },
    { nisn: '7173/1064.063', nama: 'Rachel Aluna Meizha' },
    { nisn: '7174/1065.063', nama: 'Raena Westi Dheanofa Herliani' },
    { nisn: '7175/1066.063', nama: 'Rayhanun' },
    { nisn: '7176/1067.063', nama: 'Rayyan Daffa Al Affani' },
    { nisn: '7177/1068.063', nama: 'Rhameyzha Alea Chalila Putri Edward' },
    { nisn: '7178/1069.063', nama: 'Rheisya Mauliddiva Putri' },
    { nisn: '7179/1070.063', nama: 'Rheyyan Ramadhan I.P' },
    { nisn: '7180/1071.063', nama: 'Risky Ramadhani' },
    { nisn: '7181/1072.063', nama: 'Rita Aura Agustina' },
    { nisn: '7182/1073.063', nama: 'Rizky Ramadhani' },
    { nisn: '7184/1075.063', nama: "Sa'idhatul Hasana" },
    { nisn: '7185/1076.063', nama: 'Shisilia Ismu Putri' },
    { nisn: '7186/1077.063', nama: 'Suci Ramadani Indriansyah' },
    { nisn: '7187/1078.063', nama: 'Talitha Nudia Rismatullah' },
  ],
  
  // Data dari foto kedua - XII RPL 1
  'XII RPL 1': [
    { nisn: '7115/1006.063', nama: 'Abrory Akbar Al Batami' },
    { nisn: '7116/1007.063', nama: 'Afif Firmansyah' },
    { nisn: '7117/1008.063', nama: 'Agies Widyawati' },
    { nisn: '7118/1009.063', nama: 'Agil Rifatul Haq' },
    { nisn: '7119/1010.063', nama: 'Akh. Septian Ramadhan' },
    { nisn: '7120/1011.063', nama: 'Alya Fitri Larasati' },
    { nisn: '7122/1013.063', nama: 'Anastasya Dyah Ayu Proboningrum' },
    { nisn: '7123/1014.063', nama: 'Anisa Puspitasari' },
    { nisn: '7124/1015.063', nama: 'Anissa Prisilvia Tahara' },
    { nisn: '7125/1016.063', nama: 'Aqilla Maulidyah' },
    { nisn: '7126/1017.063', nama: 'Aqlina Failia Lifara Aizani' },
    { nisn: '7127/1018.063', nama: 'Aristia Faren Rafaela' },
    { nisn: '7128/1019.063', nama: 'Asyharli Kahfi Dewanda' },
    { nisn: '7129/1020.063', nama: 'Athaar Putra Ruhenda' },
    { nisn: '7130/1021.063', nama: 'Avriliana Anjani' },
    { nisn: '7131/1022.063', nama: 'Azhar Anisatul Jannah' },
    { nisn: '7132/1023.063', nama: 'Bintang Firman Ardana' },
    { nisn: '7133/1024.063', nama: 'Callista Shafa Ramadhani' },
    { nisn: '7134/1025.063', nama: 'Chevy Aprilia Hutabarat' },
    { nisn: '7135/1026.063', nama: 'Cindi Tri Prasetyo' },
    { nisn: '7136/1027.063', nama: 'Cintya Karina Putri' },
    { nisn: '7137/1028.063', nama: 'Dhia Mirza Fandhiono' },
    { nisn: '7138/1029.063', nama: 'Diandhika Dwi Pranata' },
    { nisn: '7139/1030.063', nama: 'Fairuz Quds Zahran Firdaus' },
    { nisn: '7140/1031.063', nama: 'Fardan Rasyah Islami' },
    { nisn: '7141/1032.063', nama: 'Fatchur Rohman Rofian' },
    { nisn: '7142/1033.063', nama: 'Fidatul Avina' },
    { nisn: '7143/1034.063', nama: 'Firil Zulfa Azzahra' },
    { nisn: '7144/1035.063', nama: 'Hapsari Ismartoyo' },
    { nisn: '7145/1036.063', nama: 'Havid Abdilah Surahmad' },
    { nisn: '7146/1037.063', nama: 'Ignacia Zandra' },
    { nisn: '7147/1038.063', nama: 'Iqbal Lazuardi' },
    { nisn: '7148/1039.063', nama: 'Iqlimahda Tanzilla Finan Diva' },
    { nisn: '7149/1040.063', nama: 'Irdina Marsya Mazarina' },
    { nisn: '7150/1041.063', nama: 'Isabel Cahaya Hati' },
    { nisn: '7151/1042.063', nama: "Khoirun Ni'Mah Nurul Hidayah" },
  ],
}

// Storage key untuk localStorage
const STORAGE_KEY = 'absensi_history';

// Fungsi untuk mendapatkan semua history absensi
export const getAbsensiHistory = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

// Fungsi untuk menyimpan absensi
export const saveAbsensi = (jadwalId, tanggal, kelas, mataPelajaran, jamKe, dataAbsensi) => {
  const history = getAbsensiHistory();
  const key = `${jadwalId}_${tanggal}`;
  
  history[key] = {
    jadwalId,
    tanggal,
    kelas,
    mataPelajaran,
    jamKe,
    dataAbsensi,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return true;
};

// Fungsi untuk mengambil absensi berdasarkan jadwal dan tanggal
export const getAbsensiByJadwal = (jadwalId, tanggal) => {
  const history = getAbsensiHistory();
  const key = `${jadwalId}_${tanggal}`;
  return history[key] || null;
};

// Fungsi untuk generate data siswa dengan status default atau history
export const generateSiswaList = (kelas, jadwalId, tanggal) => {
  const siswaDasar = siswaDatabase[kelas] || [];
  
  // Cek apakah ada history absensi
  const existingAbsensi = getAbsensiByJadwal(jadwalId, tanggal);
  
  if (existingAbsensi) {
    // Jika ada history, gunakan data tersebut
    return existingAbsensi.dataAbsensi;
  }
  
  // Jika tidak ada history, generate data baru dengan status default
  return siswaDasar.map((siswa, index) => ({
    no: index + 1,
    nisn: siswa.nisn,
    nama: siswa.nama,
    status: 'hadir', // Default status
    keterangan: null,
    dokumen: null
  }));
};

// Fungsi untuk mendapatkan ringkasan absensi (untuk dashboard)
export const getAbsensiSummary = (tanggal) => {
  const history = getAbsensiHistory();
  const summaries = [];
  
  Object.keys(history).forEach(key => {
    const data = history[key];
    if (data.tanggal === tanggal) {
      const hadir = data.dataAbsensi.filter(s => s.status === 'hadir').length;
      const sakit = data.dataAbsensi.filter(s => s.status === 'sakit').length;
      const izin = data.dataAbsensi.filter(s => s.status === 'izin').length;
      const alfa = data.dataAbsensi.filter(s => s.status === 'alfa').length;
      const terlambat = data.dataAbsensi.filter(s => s.status === 'terlambat').length;
      const pulang = data.dataAbsensi.filter(s => s.status === 'pulang').length;
      
      summaries.push({
        jadwalId: data.jadwalId,
        kelas: data.kelas,
        mataPelajaran: data.mataPelajaran,
        jamKe: data.jamKe,
        stats: { hadir, sakit, izin, alfa, terlambat, pulang },
        total: data.dataAbsensi.length
      });
    }
  });
  
  return summaries;
};

// Fungsi untuk cek apakah jadwal sudah pernah diabsen
export const isJadwalCompleted = (jadwalId, tanggal) => {
  const absensi = getAbsensiByJadwal(jadwalId, tanggal);
  return absensi !== null;
};

// Fungsi untuk mendapatkan daftar siswa berdasarkan kelas
export const getSiswaByKelas = (kelas) => {
  return siswaDatabase[kelas] || [];
};

// Fungsi untuk reset semua data (untuk testing/development)
export const resetAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('All attendance data has been reset');
};

// Fungsi untuk export data (untuk backup)
export const exportData = () => {
  const history = getAbsensiHistory();
  const dataStr = JSON.stringify(history, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `absensi_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};

// Fungsi untuk import data (restore dari backup)
export const importData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { success: true, message: 'Data berhasil diimport' };
  } catch (error) {
    return { success: false, message: 'Format data tidak valid' };
  }
};

// Fungsi untuk mendapatkan statistik keseluruhan
export const getOverallStatistics = () => {
  const history = getAbsensiHistory();
  const stats = {
    totalSessions: 0,
    totalStudents: 0,
    totalHadir: 0,
    totalSakit: 0,
    totalIzin: 0,
    totalAlfa: 0,
    totalTerlambat: 0,
    totalPulang: 0,
  };
  
  Object.keys(history).forEach(key => {
    const data = history[key];
    stats.totalSessions++;
    stats.totalStudents += data.dataAbsensi.length;
    stats.totalHadir += data.dataAbsensi.filter(s => s.status === 'hadir').length;
    stats.totalSakit += data.dataAbsensi.filter(s => s.status === 'sakit').length;
    stats.totalIzin += data.dataAbsensi.filter(s => s.status === 'izin').length;
    stats.totalAlfa += data.dataAbsensi.filter(s => s.status === 'alfa').length;
    stats.totalTerlambat += data.dataAbsensi.filter(s => s.status === 'terlambat').length;
    stats.totalPulang += data.dataAbsensi.filter(s => s.status === 'pulang').length;
  });
  
  return stats;
};

export default {
  getAbsensiHistory,
  saveAbsensi,
  getAbsensiByJadwal,
  generateSiswaList,
  getAbsensiSummary,
  isJadwalCompleted,
  getSiswaByKelas,
  resetAllData,
  exportData,
  importData,
  getOverallStatistics
};