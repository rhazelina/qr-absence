import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Eye, X, Users, ZoomIn } from 'lucide-react';
import NavbarPengurus from "../../components/PengurusKelas/NavbarPengurus";
import './RiwayatKelas.css';

import apiService from '../../utils/api';

function Riwayat() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(0);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [stats, setStats] = useState({ hadir:0, terlambat:0, izin:0, sakit:0, alpha:0, pulang:0 });
  const [isLoading, setIsLoading] = useState(true);
  const maxDate = today.toISOString().split('T')[0];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const resp = await apiService.getMyClassStudents();
        const list = Array.isArray(resp) ? resp : resp.data || [];
        setStudentList(list.map(s => ({ id: s.id, name: s.user?.name||'-', nis: s.nis||'-' })));
      } catch (e) {
        console.error('Error fetching students', e);
      }
    };
    fetchStudents();
    window.scrollTo(0,0);
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      try {
        const params = { start_date:startDate, end_date:endDate };
        if (selectedStudent !== 0) params.student_id = selectedStudent;
        const resp = await apiService.getMyClassAttendanceHistory(params);
        const records = Array.isArray(resp) ? resp : resp.data || [];
        const formatted = records.map(rec => ({
          id: rec.id,
          date: formatDateDisplay(rec.created_at),
          period: rec.schedule?.period || '-',
          subject: rec.schedule?.subject?.name || '-',
          teacher: rec.schedule?.teacher?.user?.name || '-',
          status: rec.status_label || rec.status,
          statusColor: getStatusColor(rec.status_label || rec.status),
          reason: rec.reason || null,
          proofImage: rec.proof_url || null,
          studentName: rec.student?.user?.name || '',
          nis: rec.student?.nis || ''
        }));
        setAttendanceRecords(formatted);
        const newStats = { hadir:0, terlambat:0, izin:0, sakit:0, alpha:0, pulang:0 };
        formatted.forEach(r => {
          const s = (r.status||'').toLowerCase();
          if (s.includes('hadir')||s.includes('present')) newStats.hadir++;
          else if (s.includes('terlambat')||s.includes('late')) newStats.terlambat++;
          else if (s.includes('izin')||s.includes('permission')) newStats.izin++;
          else if (s.includes('sakit')||s.includes('sick')) newStats.sakit++;
          else if (s.includes('alpha')||s.includes('absent')) newStats.alpha++;
          else if (s.includes('pulang')||s.includes('return')) newStats.pulang++;
        });
        setStats(newStats);
      } catch (e) {
        console.error('Error fetching attendance data', e);
        setAttendanceRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendanceData();
  }, [startDate, endDate, selectedStudent]);

  const getStatusColor = (status) => {
    const map = { Hadir:'status-hadir', Izin:'status-izin', Sakit:'status-sakit', Alpha:'status-alpha', Terlambat:'status-terlambat', Pulang:'status-pulang' };
    return map[status]||'';
  };

  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2,'0');
    const month = String(date.getMonth()+1).padStart(2,'0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const handleStartDateChange = (e) => {
    const newDate = e.target.value;
    if (new Date(newDate) > new Date()) return;
    setStartDate(newDate);
    if (new Date(endDate) < new Date(newDate)) setEndDate(newDate);
  };
  const handleEndDateChange = (e) => {
    const newDate = e.target.value;
    if (new Date(newDate) > new Date()) return;
    if (new Date(newDate) >= new Date(startDate)) setEndDate(newDate);
  };

  return (
    <div className="riwayat-container">
      <NavbarPengurus />
      <div className="riwayat-content">
        <div className="riwayat-header">
          <div className="filters">
            <div className="date-filter">
              <Calendar />
              <button onClick={() => setShowDatePicker(!showDatePicker)} className="date-button">
                {startDate} - {endDate} <ChevronDown />
              </button>
              {showDatePicker && (
                <div className="date-picker">
                  <input type="date" value={startDate} max={maxDate} onChange={handleStartDateChange} />
                  <input type="date" value={endDate} max={maxDate} onChange={handleEndDateChange} />
                  <button onClick={() => setShowDatePicker(false)}>Terapkan</button>
                </div>
              )}
            </div>

            <div className="student-filter">
              <Users />
              <button onClick={() => setShowStudentPicker(!showStudentPicker)} className="student-button">
                {selectedStudent === 0 ? 'Semua Siswa' : studentList.find(s=>s.id===selectedStudent)?.name} <ChevronDown />
              </button>
              {showStudentPicker && (
                <div className="student-picker">
                  <div onClick={() => handleStudentSelect(0)}>Semua Siswa</div>
                  {studentList.map(s => (
                    <div key={s.id} onClick={() => handleStudentSelect(s.id)}>{s.name}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="stats-cards">
            <div className="stat-card hadir">Hadir: {stats.hadir}</div>
            <div className="stat-card terlambat">Terlambat: {stats.terlambat}</div>
            <div className="stat-card izin">Izin: {stats.izin}</div>
            <div className="stat-card sakit">Sakit: {stats.sakit}</div>
            <div className="stat-card alpha">Alpha: {stats.alpha}</div>
            <div className="stat-card pulang">Pulang: {stats.pulang}</div>
          </div>
        </div>

        <div className="records-table">
          {isLoading ? <p>Memuat...</p> : (
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Pelajaran</th>
                  <th>Guru</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map(r => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.subject}</td>
                    <td>{r.teacher}</td>
                    <td className={r.statusColor}>{r.status}</td>
                    <td>
                      <button onClick={() => { setSelectedRecord(r); setShowModal(true); }}><Eye /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}><X /></button>
            <h2>Detail Presensi</h2>
            <p><strong>Tanggal:</strong> {selectedRecord.date}</p>
            <p><strong>Pelajaran:</strong> {selectedRecord.subject}</p>
            <p><strong>Status:</strong> {selectedRecord.status}</p>
            {selectedRecord.reason && <p><strong>Alasan:</strong> {selectedRecord.reason}</p>}
            {selectedRecord.proofImage && (
              <img src={selectedRecord.proofImage} alt="Bukti" onClick={()=>setZoomedImage(selectedRecord.proofImage)} />
            )}
          </div>
        </div>
      )}

      {zoomedImage && (
        <div className="zoom-overlay" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="Zoom" />
        </div>
      )}
    </div>
  );
}

export default Riwayat;
