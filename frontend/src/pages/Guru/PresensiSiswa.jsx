import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSave,
  FaUserGraduate,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaProcedures,
  FaFileAlt
} from 'react-icons/fa';
import CustomAlert from '../../components/Common/CustomAlert';
import { getAttendanceBySchedule, createManualAttendance } from '../../services/attendance';
import echo from '../../utils/echo';
import PageWrapper from '../../components/ui/PageWrapper';

function PresensiSiswa() {
  const location = useLocation();
  const navigate = useNavigate();
  const scheduleData = location.state || {};
  const { id, kelas, mataPelajaran, jamKe, tanggal } = scheduleData;
  const hasScheduleData = !!id;

  const [siswaList, setSiswaList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('view'); // 'view' or 'input'
  const [showKeteranganModal, setShowKeteranganModal] = useState(false);
  const [currentSiswaIndex, setCurrentSiswaIndex] = useState(null);
  const [keteranganTipe, setKeteranganTipe] = useState('');
  const [keteranganForm, setKeteranganForm] = useState({ alasan: '', jam: '', jamKe: '' });
  const [alertState, setAlertState] = useState({ show: false, type: 'info', title: '', message: '', action: null });

  // Load attendance data
  const fetchAttendance = useCallback(async (signal) => {
    setIsLoading(true);
    try {
      const data = await getAttendanceBySchedule(id, { signal });
      setSiswaList(data);
      if (data.length > 0 && data.every(s => s.status === 'absent' && !s.attendance_id)) {
        setMode('input');
      } else {
        setMode('view');
      }
    } catch (error) {
      if (error && error.name !== 'AbortError') {
        console.error("Error fetching attendance:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, setIsLoading]);

  // Load attendance data
  useEffect(() => {
    const controller = new AbortController();

    if (hasScheduleData) {
      fetchAttendance(controller.signal);

      // Listen for real-time updates
      const channel = echo.private(`schedule.${id}`)
        .listen('AttendanceRecorded', (e) => {
          console.log('Real-time attendance recorded:', e);
          fetchAttendance(controller.signal);
        });

      return () => {
        channel.stopListening('AttendanceRecorded');
        controller.abort();
      };
    }
  }, [id, hasScheduleData, fetchAttendance]);

  const handleStatusChange = (index, status) => {
    const newList = [...siswaList];
    newList[index].status = status;
    setSiswaList(newList);

    if (status === 'late' || status === 'pulang') {
      setCurrentSiswaIndex(index);
      setKeteranganTipe(status);
      setKeteranganForm({
        alasan: newList[index].keterangan?.alasan || '',
        jam: newList[index].keterangan?.jam || '',
        jamKe: newList[index].keterangan?.jamKe || ''
      });
      setShowKeteranganModal(true);
    }
  };

  const handleSimpanKeterangan = () => {
    const newList = [...siswaList];
    newList[currentSiswaIndex].keterangan = { ...keteranganForm };
    setSiswaList(newList);
    setShowKeteranganModal(false);
  };

  const handleSimpan = async () => {
    setAlertState({
      show: true,
      type: 'confirm',
      title: 'Simpan Presensi',
      message: 'Apakah Anda yakin data presensi sudah benar?',
      action: 'save'
    });
  };

  const handleConfirmAction = async () => {
    if (alertState.action === 'save') {
      setIsLoading(true);
      try {
        await createManualAttendance(id, siswaList);
        setAlertState({ show: true, type: 'success', title: 'Berhasil', message: 'Data presensi berhasil disimpan.' });
        setMode('view');
        fetchAttendance();
      } catch (error) {
        console.error("Error saving manual attendance:", error);
        setAlertState({ show: true, type: 'error', title: 'Gagal', message: 'Gagal menyimpan data presensi.' });
      } finally {
        setIsLoading(false);
      }
    }
    closeAlert();
  };

  const closeAlert = () => setAlertState(prev => ({ ...prev, show: false }));

  const getStatusBadge = (siswa) => {
    const status = siswa.status.toLowerCase();
    const badges = {
      present: { label: 'Hadir', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <FaCheckCircle /> },
      sick: { label: 'Sakit', class: 'bg-violet-100 text-violet-700 border-violet-200', icon: <FaProcedures /> },
      izin: { label: 'Izin', class: 'bg-blue-100 text-blue-700 border-blue-200', icon: <FaInfoCircle /> },
      excused: { label: 'Izin', class: 'bg-blue-100 text-blue-700 border-blue-200', icon: <FaInfoCircle /> },
      absent: { label: 'Alpha', class: 'bg-red-100 text-red-700 border-red-200', icon: <FaTimesCircle /> },
      late: { label: 'Terlambat', class: 'bg-amber-100 text-amber-700 border-amber-200', icon: <FaExclamationTriangle /> },
      pulang: { label: 'Pulang', class: 'bg-orange-100 text-orange-700 border-orange-200', icon: <FaArrowLeft /> },
    };

    const config = badges[status] || badges.absent;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  if (!hasScheduleData) {
    return (
      <PageWrapper className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-3">Sesi Tidak Ditemukan</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Informasi jadwal mengajar tidak tersedia. Silakan pilih jadwal kembali dari dashboard.</p>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            onClick={() => navigate('/guru/dashboard')}
          >
            <FaArrowLeft /> Kembali ke Dashboard
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="container mx-auto p-4 md:p-8 space-y-6 max-w-7xl font-sans">
      <CustomAlert
        isOpen={alertState.show}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={handleConfirmAction}
        confirmLabel="Ya, Lanjutkan"
        cancelLabel="Batal"
      />

      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate('/guru/dashboard')}
            className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all group shadow-sm"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black text-gray-800">{kelas}</h2>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black border border-blue-100 uppercase tracking-widest">
                Jam Ke-{jamKe}
              </span>
            </div>
            <p className="text-gray-500 font-bold flex items-center gap-2 italic">
              <FaBook className="text-blue-400" /> {mataPelajaran}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-inner">
            <FaCalendarAlt className="text-blue-500" />
            <span className="text-sm font-black text-gray-700">{tanggal}</span>
          </div>

          {mode === 'input' ? (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              onClick={handleSimpan}
            >
              <FaSave /> SIMPAN ABSENSI
            </button>
          ) : (
            <button
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-amber-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              onClick={() => setMode('input')}
            >
              <FaEdit /> UBAH DATA
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT - TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <FaUserGraduate className="text-blue-600" /> Daftar Hadir Siswa
          </h3>
          <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
            TOTAL: {siswaList.length} SISWA
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr className="border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center w-16">No</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Siswa</th>
                {mode === 'input' ? (
                  <>
                    <th className="px-4 py-5 text-center text-xs font-black text-emerald-500 uppercase tracking-widest">Hadir</th>
                    <th className="px-4 py-5 text-center text-xs font-black text-violet-500 uppercase tracking-widest">Sakit</th>
                    <th className="px-4 py-5 text-center text-xs font-black text-blue-500 uppercase tracking-widest">Izin</th>
                    <th className="px-4 py-5 text-center text-xs font-black text-red-500 uppercase tracking-widest">Alpha</th>
                    <th className="px-4 py-5 text-center text-xs font-black text-amber-500 uppercase tracking-widest">Telat</th>
                    <th className="px-4 py-5 text-center text-xs font-black text-orange-500 uppercase tracking-widest">Pulang</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Keterangan</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {siswaList.map((siswa, index) => (
                <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-6 text-sm font-black text-gray-300 text-center">{index + 1}</td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-gray-800 leading-tight">{siswa.nama}</span>
                      <span className="text-[10px] font-mono text-gray-400 mt-0.5 tracking-tighter">NISN: {siswa.nisn}</span>
                    </div>
                  </td>

                  {mode === 'input' ? (
                    ['present', 'sick', 'izin', 'absent', 'late', 'pulang'].map((statusKey) => (
                      <td key={statusKey} className="px-4 py-6 text-center">
                        <label className="relative flex items-center justify-center cursor-pointer group">
                          <input
                            type="radio"
                            name={`status-${index}`}
                            checked={
                              (statusKey === 'izin' && (siswa.status === 'izin' || siswa.status === 'excused')) ||
                              siswa.status === statusKey
                            }
                            onChange={() => handleStatusChange(index, statusKey)}
                            className="peer sr-only"
                          />
                          <div className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center
                                        ${statusKey === 'present' ? 'peer-checked:bg-emerald-500 peer-checked:border-emerald-500 border-emerald-100 text-transparent peer-checked:text-white group-hover:bg-emerald-50' : ''}
                                        ${statusKey === 'sick' ? 'peer-checked:bg-violet-500 peer-checked:border-violet-500 border-violet-100 text-transparent peer-checked:text-white group-hover:bg-violet-50' : ''}
                                        ${statusKey === 'izin' ? 'peer-checked:bg-blue-500 peer-checked:border-blue-500 border-blue-100 text-transparent peer-checked:text-white group-hover:bg-blue-50' : ''}
                                        ${statusKey === 'absent' ? 'peer-checked:bg-red-500 peer-checked:border-red-500 border-red-100 text-transparent peer-checked:text-white group-hover:bg-red-50' : ''}
                                        ${statusKey === 'late' ? 'peer-checked:bg-amber-500 peer-checked:border-amber-500 border-amber-100 text-transparent peer-checked:text-white group-hover:bg-amber-50' : ''}
                                        ${statusKey === 'pulang' ? 'peer-checked:bg-orange-500 peer-checked:border-orange-500 border-orange-100 text-transparent peer-checked:text-white group-hover:bg-orange-50' : ''}
                                    `}>
                            <FaCheckCircle size={14} />
                          </div>
                        </label>
                      </td>
                    ))
                  ) : (
                    <>
                      <td className="px-6 py-6 text-center">{getStatusBadge(siswa)}</td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          {siswa.keterangan?.alasan ? (
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                              {siswa.keterangan.alasan}
                              {siswa.keterangan.jam && <span className="ml-2 font-black">({siswa.keterangan.jam})</span>}
                            </span>
                          ) : (
                            <span className="text-gray-300 italic text-xs">-</span>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL KETERANGAN */}
      {showKeteranganModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowKeteranganModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-black flex items-center gap-2">
                <FaFileAlt /> Keterangan
              </h2>
              <button className="text-white/60 hover:text-white text-3xl leading-none" onClick={() => setShowKeteranganModal(false)}>&times;</button>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-inner">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                  <FaUserGraduate size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Siswa</p>
                  <p className="text-sm font-black text-gray-800">{siswaList[currentSiswaIndex]?.nama}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Alasan Khusus</label>
                <textarea
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none h-32 resize-none transition-all text-sm font-medium"
                  value={keteranganForm.alasan}
                  onChange={(e) => setKeteranganForm({ ...keteranganForm, alasan: e.target.value })}
                  placeholder="Contoh: Terlambat karena ban bocor, atau Pulang karena sakit demam..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {keteranganTipe === 'late' && (
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Jam Tiba di Kelas</label>
                    <div className="relative">
                      <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm font-black"
                        value={keteranganForm.jam}
                        onChange={(e) => setKeteranganForm({ ...keteranganForm, jam: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {keteranganTipe === 'pulang' && (
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Pulang Jam Pelajaran Ke-</label>
                    <select
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm font-black appearance-none"
                      value={keteranganForm.jamKe}
                      onChange={(e) => setKeteranganForm({ ...keteranganForm, jamKe: e.target.value })}
                    >
                      <option value="">Pilih Jam Ke-</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(j => <option key={j} value={j}>Jam Ke-{j}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  className="flex-1 px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-black text-sm transition-all"
                  onClick={() => setShowKeteranganModal(false)}
                >
                  BATAL
                </button>
                <button
                  className="flex-[2] px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95"
                  onClick={handleSimpanKeterangan}
                >
                  SIMPAN KETERANGAN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

export default PresensiSiswa;