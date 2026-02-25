import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaFilter,
  FaRedo,
  FaEye,
  FaEdit,
  FaChevronLeft,
  FaChevronRight,
  FaIdCard,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import './JadwalGuruIndex.css';
import apiService from '../../utils/api';
import NavbarWaka from '../../components/Waka/NavbarWaka';

const JadwalGuruIndex = () => {
  const navigate = useNavigate();
  const [dataGuru, setDataGuru] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchKode, setSearchKode] = useState('');
  const [searchNama, setSearchNama] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getTeachers();

      // Handle different response structures
      const data = response.data || response;

      setDataGuru(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    let filtered = dataGuru;

    if (searchKode) {
      const lower = searchKode.toLowerCase();
      filtered = filtered.filter(guru =>
        (guru.code?.toLowerCase() || '').includes(lower) ||
        (guru.nip?.toLowerCase() || '').includes(lower)
      );
    }

    if (searchNama) {
      const lower = searchNama.toLowerCase();
      filtered = filtered.filter(guru =>
        (guru.name?.toLowerCase() || '').includes(lower)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchKode, searchNama, dataGuru]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleReset = () => {
    setSearchKode('');
    setSearchNama('');
    fetchTeachers();
  };

  const handleView = (id) => {
    navigate(`/waka/jadwal-guru/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/waka/jadwal-guru/${id}/edit`);
  };

  return (
    <>
      <NavbarWaka />
      <div className="jadwal-guru-index-root">
        <div className="jadwal-guru-index-header">
          <h1 className="jadwal-guru-index-title">Jadwal Pembelajaran Guru</h1>
          <p className="jadwal-guru-index-subtitle">Kelola dan lihat jadwal pembelajaran per guru</p>
        </div>

        {/* FILTER CARD */}
        <div className="jadwal-guru-index-filter-card">
          <div className="jadwal-guru-index-filter-grid">
            {/* Search Kode */}
            <div className="jadwal-guru-index-filter-group">
              <label className="jadwal-guru-index-label">
                <FaIdCard className="mr-2 inline" /> Cari Kode Guru
              </label>
              <input
                type="text"
                placeholder="Contoh: GR001"
                className="jadwal-guru-index-input"
                value={searchKode}
                onChange={(e) => setSearchKode(e.target.value)}
              />
            </div>

            {/* Search Nama */}
            <div className="jadwal-guru-index-filter-group">
              <label className="jadwal-guru-index-label">
                <FaUser className="mr-2 inline" /> Cari Nama Guru
              </label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso"
                className="jadwal-guru-index-input"
                value={searchNama}
                onChange={(e) => setSearchNama(e.target.value)}
              />
            </div>
          </div>

          {(searchKode || searchNama) && (
            <div className="jadwal-guru-index-reset-wrapper">
              <button
                onClick={handleReset}
                className="jadwal-guru-index-reset-btn"
              >
                <FaRedo className="mr-2 inline" /> Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* TABLE CARD */}
        <div className="jadwal-guru-index-table-card">
          <div className="jadwal-guru-index-table-header flex justify-between items-center">
            <h3>Daftar Guru ({filteredData.length})</h3>
          </div>

          <div className="jadwal-guru-index-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kode Guru</th>
                  <th>Nama Guru</th>
                  <th className="whitespace-nowrap">Peran</th>
                  <th>Mata Pelajaran</th>
                  <th>Kontak</th>
                  <th>Status Jadwal</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="jadwal-guru-index-loading">
                      <i className="fas fa-spinner fa-spin"></i>
                      <p>Memuat data guru...</p>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((guru, index) => (
                    <tr key={guru.id}>
                      <td className="guru-no">{indexOfFirstItem + index + 1}</td>
                      <td className="guru-kode">
                        <span className="jadwal-guru-index-badge-blue">
                          {guru.code || guru.nip || '-'}
                        </span>
                      </td>
                      <td className="guru-nama">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                            {guru.photo_url ? (
                              <img src={guru.photo_url} alt={guru.name} className="w-full h-full object-cover"/>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">
                                {guru.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 leading-tight">{guru.name}</p>
                            <p className="text-[10px] text-gray-400">{guru.nip || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="guru-peran">
                        <div className="flex gap-1 flex-wrap">
                          {(Array.isArray(guru.jabatan) ? guru.jabatan : (guru.role ? guru.role.split(' | ') : ['Guru'])).map((role, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                              style={{
                                backgroundColor: role === 'Wali Kelas' ? '#DBEAFE' : role === 'Guru' ? '#DCFCE7' : role === 'Waka' ? '#F3E8FF' : '#FEF3C7',
                                color: role === 'Wali Kelas' ? '#1E40AF' : role === 'Guru' ? '#166534' : role === 'Waka' ? '#6B21A8' : '#92400E',
                              }}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="guru-mapel">
                        <div className="text-xs text-gray-600">
                          {Array.isArray(guru.subject) 
                            ? guru.subject.join(', ') 
                            : (guru.subject || guru.subject_name || <span className="text-gray-400">-</span>)}
                        </div>
                      </td>
                      <td className="guru-kontak">
                        <div className="flex flex-col text-[10px] space-y-0.5">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                             <FaEnvelope className="text-gray-400 shrink-0" size={10} />
                             <span className="truncate">{guru.email || '-'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                             <FaPhone className="text-gray-400 shrink-0" size={10} />
                             <span>{guru.phone || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="guru-status text-center">
                        {guru.schedule_image_url || guru.schedule_image_path ? (
                          <span className="jadwal-guru-index-badge-green inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap">
                            <FaCheckCircle className="shrink-0" /> Tersedia
                          </span>
                        ) : (
                          <span className="jadwal-guru-index-badge-orange inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap">
                            <FaExclamationCircle className="shrink-0" /> Belum Ada
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="jadwal-guru-index-action">
                          <button 
                            className="jadwal-guru-index-btn-view" 
                            title="Lihat Detail"
                            onClick={() => handleView(guru.id)}
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="jadwal-guru-index-btn-edit" 
                            title="Edit Jadwal"
                            onClick={() => handleEdit(guru.id)}
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="jadwal-guru-index-empty text-center py-8">
                      <i className="far fa-folder-open text-3xl text-gray-300 block mb-2"></i>
                      <p>Tidak ada data guru ditemukan</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center p-4 gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                <FaChevronLeft />
              </button>
              <div className="px-4 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                Halaman {currentPage} dari {totalPages}
              </div>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JadwalGuruIndex;