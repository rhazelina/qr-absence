import { useState, useRef } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { Button } from '../../component/Shared/Button';
import { SearchBox } from '../../component/Shared/Search';
import { Select } from '../../component/Shared/Select';
import { Table } from '../../component/Shared/Table';
import { TambahSiswaForm } from '../../component/Shared/Form/SiswaForm';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';

/* ===================== INTERFACE ===================== */
interface User {
  role: string;
  name: string;
}

interface Siswa {
  id: string;
  namaSiswa: string;
  nisn: string;
  jenisKelamin: string;
  jurusan: string;
  jurusanId: string;
  kelas: string;
  kelasId: string;
}

interface SiswaAdminProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  onNavigateToDetail?: (siswaId: string) => void;
}

/* ===================== OPTIONS ===================== */
const jurusanOptions = [
  { label: 'Mekatronika', value: 'MEK' },
  { label: 'Rekayasa Perangkat Lunak', value: 'RPL' },
  { label: 'Animasi', value: 'ANI' },
  { label: 'Broadcasting', value: 'BC' },
  { label: 'Elektronika Industri', value: 'EI' },
  { label: 'Teknik Komputer dan Jaringan', value: 'TKJ' },
  { label: 'Audio Video', value: 'AV' },
  { label: 'Desain Komunikasi Visual', value: 'DKV' },
];

const kelasOptions = [
  { label: 'Kelas 10', value: '10' },
  { label: 'Kelas 11', value: '11' },
  { label: 'Kelas 12', value: '12' },
];

/* ===================== DUMMY DATA ===================== */
const dummyData: Siswa[] = [
  { id: '1', namaSiswa: 'M. Wito Suherman', nisn: '2347839283', jenisKelamin: 'L', jurusan: 'Mekatronika', jurusanId: 'MEK', kelas: '10', kelasId: '10-MEK-1' },
  { id: '2', namaSiswa: 'Siti Nurhaliza', nisn: '2347839284', jenisKelamin: 'P', jurusan: 'Rekayasa Perangkat Lunak', jurusanId: 'RPL', kelas: '10', kelasId: '10-RPL-1' },
  { id: '3', namaSiswa: 'Ahmad Rizki', nisn: '2347839285', jenisKelamin: 'L', jurusan: 'Teknik Komputer dan Jaringan', jurusanId: 'TKJ', kelas: '11', kelasId: '11-TKJ-1' },
  { id: '4', namaSiswa: 'Dewi Lestari', nisn: '2347839286', jenisKelamin: 'P', jurusan: 'Desain Komunikasi Visual', jurusanId: 'DKV', kelas: '12', kelasId: '12-DKV-1' },
];

/* ===================== COMPONENT ===================== */
export default function SiswaAdmin({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  onNavigateToDetail,
}: SiswaAdminProps) {
  const [searchValue, setSearchValue] = useState('');
  const [selectedJurusan, setSelectedJurusan] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siswaList, setSiswaList] = useState<Siswa[]>(dummyData);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ===================== FILTER ===================== */
  const filteredData = siswaList.filter((item) => {
    const matchSearch =
      item.namaSiswa.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.nisn.includes(searchValue);

    const matchJurusan = selectedJurusan ? item.jurusanId === selectedJurusan : true;
    const matchKelas = selectedKelas ? item.kelas === selectedKelas : true;

    return matchSearch && matchJurusan && matchKelas;
  });

  /* ===================== HANDLER ===================== */
  const handleImport = () => fileInputRef.current?.click();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        // Parse CSV header
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const namaSiswaIdx = headers.indexOf('nama siswa');
        const nisnIdx = headers.indexOf('nisn');
        const jenisKelaminIdx = headers.indexOf('jenis kelamin');
        const jurusanIdx = headers.indexOf('jurusan');
        const kelasIdx = headers.indexOf('kelas');

        if (namaSiswaIdx === -1 || nisnIdx === -1) {
          alert('File CSV harus memiliki kolom "Nama Siswa" dan "NISN"');
          return;
        }

        const newSiswa: Siswa[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());

          const jurusanValue = jurusanIdx !== -1 ? values[jurusanIdx] : '';
          const jurusanId = jurusanOptions.find(j => j.label.toLowerCase() === jurusanValue.toLowerCase())?.value || '';

          const newRecord: Siswa = {
            id: String(Math.max(...siswaList.map(s => parseInt(s.id) || 0)) + newSiswa.length + 1),
            namaSiswa: values[namaSiswaIdx],
            nisn: values[nisnIdx],
            jenisKelamin: jenisKelaminIdx !== -1 ? values[jenisKelaminIdx] : '',
            jurusan: jurusanValue,
            jurusanId: jurusanId,
            kelas: kelasIdx !== -1 ? values[kelasIdx] : '',
            kelasId: `${kelasIdx !== -1 ? values[kelasIdx] : ''}-${jurusanId}-1`,
          };
          newSiswa.push(newRecord);
        }

        setSiswaList([...siswaList, ...newSiswa]);
        alert(`${newSiswa.length} data siswa berhasil diimpor`);
      } catch (error) {
        alert('Error: Format file CSV tidak sesuai');
        console.error(error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportPDF = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Data Siswa Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #1E3A8A; }
          .date { text-align: center; color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #2563EB; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f5f7fa; }
          .footer { margin-top: 20px; text-align: right; color: #666; }
        </style>
      </head>
      <body>
        <h1>Laporan Data Siswa</h1>
        <div class="date">Tanggal: ${new Date().toLocaleDateString('id-ID')}</div>
        <table>
          <thead>
            <tr>
              <th>Nama Siswa</th>
              <th>NISN</th>
              <th>Konsentrasi Keahlian</th>
              <th>Kelas</th>
              <th>L / P</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map(siswa => `
              <tr>
                <td>${siswa.namaSiswa}</td>
                <td>${siswa.nisn}</td>
                <td>${siswa.jurusan}</td>
                <td>${siswa.kelas}</td>
                <td>${siswa.jenisKelamin}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Total Siswa: ${filteredData.length}</p>
          <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}</p>
        </div>
      </body>
      </html>
    `;

    // Open print dialog
    const newWindow = window.open('', '', 'width=900,height=600');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      setTimeout(() => {
        newWindow.print();
      }, 250);
    }
  };

  const handleExportCSV = () => {
    // Prepare CSV header
    const headers = ['Nama Siswa', 'NISN', 'Jenis Kelamin', 'Jurusan', 'Kelas'];
    const rows = filteredData.map(siswa => [
      siswa.namaSiswa,
      siswa.nisn,
      siswa.jenisKelamin,
      siswa.jurusan,
      siswa.kelas,
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Data_Siswa_${new Date().getTime()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  /* ===================== BUTTON STYLE (SAMA DENGAN GURUADMIN) ===================== */
  const buttonBaseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 20px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    height: '44px',
  } as const;


  /* ===================== TABLE ===================== */
  const columns = [
    { key: 'namaSiswa', label: 'Nama Siswa' },
    { key: 'nisn', label: 'NISN' },
    { key: 'jurusan', label: 'Konsentrasi Keahlian' },
    { key: 'kelas', label: 'Tingkatan Kelas' },
    { key: 'jenisKelamin', label: 'L / P' },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (_: any, row: Siswa) => (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpenActionId(openActionId === row.id ? null : row.id)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <MoreVertical size={22} strokeWidth={1.5} />
          </button>

          {openActionId === row.id && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                background: '#FFFFFF',
                borderRadius: 8,
                boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                minWidth: 180,
                zIndex: 10,
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
              }}
            >
              <button
                onClick={() => { setIsModalOpen(true); }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#0F172A',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  borderBottom: '1px solid #F1F5F9',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F0F4FF';
                  (e.currentTarget as HTMLButtonElement).style.color = '#2563EB';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                  (e.currentTarget as HTMLButtonElement).style.color = '#0F172A';
                }}
              >
                <Edit size={16} color="#64748B" strokeWidth={2} />
                Edit
              </button>
              <button
                onClick={() => { }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#0F172A',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  borderBottom: '1px solid #F1F5F9',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FEF2F2';
                  (e.currentTarget as HTMLButtonElement).style.color = '#DC2626';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                  (e.currentTarget as HTMLButtonElement).style.color = '#0F172A';
                }}
              >
                <Trash2 size={16} color="#64748B" strokeWidth={2} />
                Hapus
              </button>
              <button
                onClick={() => onNavigateToDetail?.(row.id)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#0F172A',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F0F4FF';
                  (e.currentTarget as HTMLButtonElement).style.color = '#059669';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                  (e.currentTarget as HTMLButtonElement).style.color = '#0F172A';
                }}
              >
                <Eye size={16} color="#64748B" strokeWidth={2} />
                Lihat
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      pageTitle="Data Siswa"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
      hideBackground
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 'clamp(16px, 3vw, 32px)',
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* FILTER */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Select label="Jurusan" value={selectedJurusan} onChange={setSelectedJurusan} options={jurusanOptions} placeholder="Semua Jurusan" />
          <Select label="Kelas" value={selectedKelas} onChange={setSelectedKelas} options={kelasOptions} placeholder="Semua Kelas" />
        </div>

        {/* SEARCH + ACTION */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 20 }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <SearchBox placeholder="Cari siswa..." value={searchValue} onChange={setSearchValue} />
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* IMPORT */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handleImport}
                style={{
                  ...buttonBaseStyle,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v12" />
                  <path d="m8 11 4 4 4-4" />
                  <path d="M20 21H4" />
                </svg>
                Import
              </button>
              <a
                href="/format-siswa.csv"
                download
                style={{ fontSize: '12px', color: '#3B82F6', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Unduh Format
              </a>
            </div>


            {/* EXPORT */}
            <button
              onClick={handleExportPDF}
              style={{
                ...buttonBaseStyle,
                border: 'none',
                backgroundColor: '#2563EB',
                color: 'white',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1D4ED8';
                e.currentTarget.style.boxShadow =
                  '0 6px 8px -1px rgba(37, 99, 235, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563EB';
                e.currentTarget.style.boxShadow =
                  '0 4px 6px -1px rgba(37, 99, 235, 0.2)';
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Ekspor PDF
            </button>

            <Button label="Tambahkan Siswa" onClick={() => setIsModalOpen(true)} />

            {/* CSV EXPORT */}
            <button
              onClick={handleExportCSV}
              style={{
                ...buttonBaseStyle,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="13" x2="8" y2="13" />
                <line x1="12" y1="17" x2="8" y2="17" />
                <polyline points="16 13 16 13" />
              </svg>
              Ekspor CSV
            </button>
          </div>
        </div>

        <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 0 1px #E5E7EB' }}>
          <Table columns={columns} data={filteredData} keyField="id" />
        </div>
      </div>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} accept=".csv" />

      <TambahSiswaForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => { }}
      />
    </AdminLayout>
  );
}
