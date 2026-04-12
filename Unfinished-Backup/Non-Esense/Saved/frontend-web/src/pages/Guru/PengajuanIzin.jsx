import React, { useState, useEffect } from 'react';
import NavbarGuru from '../../components/Guru/NavbarGuru';
import apiService from '../../utils/api';

export default function PengajuanIzin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: '',
    reason: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiService.getLeavePermissions();
      setRequests(res.data || res || []);
    } catch (e) {
      console.error('Error fetching leave requests', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiService.createLeavePermission(formData);
      setFormData({ date: '', reason: '' });
      fetchRequests();
    } catch (e) {
      console.error('submit error', e);
      setError(e.data?.message || 'Gagal mengajukan izin');
    }
  };

  return (
    <div className="pengajuan-izin-page">
      <NavbarGuru />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Pengajuan Izin Guru</h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-3">
            <label>Tanggal</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-3">
            <label>Alasan</label>
            <textarea
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="border px-2 py-1 w-full"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button className="btn btn-primary">Ajukan</button>
        </form>

        <h2 className="text-xl font-semibold mb-2">Riwayat Pengajuan</h2>
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Tanggal</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Alasan</th>
                <th className="py-2 px-4 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td className="py-2 px-4 border-b">{r.date}</td>
                  <td className="py-2 px-4 border-b">{r.status_label || r.status}</td>
                  <td className="py-2 px-4 border-b">{r.reason}</td>
                  <td className="py-2 px-4 border-b">
                    {r.status === 'pending' || r.status === 'MENUNGGU' ? (
                      <button
                        className="text-red-600 hover:underline"
                        onClick={async () => {
                          try {
                            await apiService.cancelLeavePermission(r.id);
                            fetchRequests();
                          } catch (e) {
                            console.error('cancel error', e);
                          }
                        }}
                      >Batalkan</button>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
