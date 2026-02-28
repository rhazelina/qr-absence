import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import apiService from '../../utils/api';

export default function ApproveAbsence() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAbsenceRequests();
      setRequests(res.data || res || []);
    } catch (e) {
      console.error('Error fetching absence requests', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await apiService.approveAbsenceRequest(id);
      fetchRequests();
    } catch (e) {
      console.error('approve error', e);
    }
  };

  const handleReject = async (id) => {
    try {
      await apiService.rejectAbsenceRequest(id);
      fetchRequests();
    } catch (e) {
      console.error('reject error', e);
    }
  };

  return (
    <div className="approve-absence-page">
      <NavbarAdmin />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Persetujuan Izin</h1>
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Tanggal</th>
                <th className="py-2 px-4 border-b">Guru</th>
                <th className="py-2 px-4 border-b">Alasan</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td className="py-2 px-4 border-b">{r.date}</td>
                  <td className="py-2 px-4 border-b">{r.teacher?.user?.name || '-'}</td>
                  <td className="py-2 px-4 border-b">{r.reason}</td>
                  <td className="py-2 px-4 border-b">{r.status_label || r.status}</td>
                  <td className="py-2 px-4 border-b">
                    {r.status === 'pending' && (
                      <>
                        <button className="btn btn-sm mr-2" onClick={() => handleApprove(r.id)}>Setujui</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleReject(r.id)}>Tolak</button>
                      </>
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
