import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import apiService from '../../utils/api';

export default function AttendanceClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await apiService.getAttendanceClassSummary(classId);
        setSummary(res.data || res || {});
      } catch (e) {
        console.error('Failed load class summary', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [classId]);

  return (
    <div className="attendance-class-detail">
      <NavbarWaka />
      <div className="container mx-auto p-4">
        <button onClick={() => navigate(-1)} className="btn btn-sm mb-4">Kembali</button>
        <h1 className="text-2xl font-bold mb-2">Ringkasan Kehadiran Kelas</h1>
        {loading ? (
          <p>Memuat...</p>
        ) : summary ? (
          <div>
            <p>Total hadir: {summary.present || summary.hadir || 0}</p>
            <p>Total izin: {summary.izin || 0}</p>
            <p>Total sakit: {summary.sick || 0}</p>
            <p>Total alfa: {summary.absent || 0}</p>
            <p>Total kembali: {summary.return || 0}</p>
            {/* further breakdowns could be added here */}
          </div>
        ) : (
          <p>Tidak ada data.</p>
        )}
      </div>
    </div>
  );
}
