import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import apiService from '../../utils/api';

export default function AttendanceExport() {
  const [classes, setClasses] = useState([]);
  const [params, setParams] = useState({ from: '', to: '', class_id: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.getClasses({ per_page: 1000 });
        setClasses(res.data || res || []);
      } catch (e) {
        console.error('Failed to load classes', e);
      }
    })();
  }, []);

  const handleExport = async (type) => {
    setLoading(true);
    try {
      let response;
      if (type === 'excel') {
        response = await apiService.exportAttendance(params);
      } else if (type === 'pdf') {
        response = await apiService.exportAttendancePdf(params);
      } else if (type === 'recap') {
        response = await apiService.getAttendanceRecap(params);
      }
      // if server returns file, download logic would go here
      console.log('export result', response);
      alert('Permintaan ekspor dikirim. Periksa konsol/log server.');
    } catch (e) {
      console.error('export error', e);
      alert('Ekspor gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-export-page">
      <NavbarAdmin />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Ekspor / Rekap Absensi</h1>
        <div className="mb-4">
          <label>Tanggal Mulai</label>
          <input type="date" value={params.from} onChange={e => setParams({...params, from: e.target.value})} className="border px-2 py-1" />
        </div>
        <div className="mb-4">
          <label>Tanggal Selesai</label>
          <input type="date" value={params.to} onChange={e => setParams({...params, to: e.target.value})} className="border px-2 py-1" />
        </div>
        <div className="mb-4">
          <label>Kelas (opsional)</label>
          <select value={params.class_id} onChange={e => setParams({...params, class_id: e.target.value})} className="border px-2 py-1">
            <option value="">-- Semua --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name || c.class_name || c.major?.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => handleExport('excel')} disabled={loading}>Download Excel</button>
          <button className="btn btn-primary" onClick={() => handleExport('pdf')} disabled={loading}>Download PDF</button>
          <button className="btn" onClick={() => handleExport('recap')} disabled={loading}>Tampilkan Rekap</button>
        </div>
      </div>
    </div>
  );
}
