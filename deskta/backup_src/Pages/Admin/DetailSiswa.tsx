import { useState } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { EditSiswaForm } from '../../component/Shared/EditSiswa';
import { Edit, User as UserIcon } from 'lucide-react';

interface User {
  role: string;
  name: string;
}

interface Siswa {
  id: string;
  namaSiswa: string;
  nisn: string;
  jenisKelamin: string;
  noTelp: string;
  jurusan: string;
  jurusanId: string;
  tahunAngkatan: string;
  kelas: string;
  kelasId: string;
}

interface DetailSiswaProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  siswaId: string;
}

// Dummy data siswa (nanti diganti dengan fetch dari API)
const dummySiswaData: Siswa = {
  id: '1',
  namaSiswa: 'Muhammad Wito Suherman',
  nisn: '0918415784',
  jenisKelamin: 'Laki-Laki',
  noTelp: '08218374859',
  jurusan: 'Mekatronika',
  jurusanId: 'MTK',
  tahunAngkatan: '2023 - 2026',
  kelas: 'XII Mekatronika 1',
  kelasId: 'XII-MTK-1',
};

// Data untuk dropdown di form
const jurusanListForForm = [
  { id: 'TI', nama: 'Teknik Informatika' },
  { id: 'TM', nama: 'Teknik Mesin' },
  { id: 'AK', nama: 'Akuntansi' },
  { id: 'MTK', nama: 'Mekatronika' },
];

const kelasListForForm = [
  { id: 'X-TI-1', nama: 'X Teknik Informatika 1' },
  { id: 'X-TI-2', nama: 'X Teknik Informatika 2' },
  { id: 'XI-TM-1', nama: 'XI Teknik Mesin 1' },
  { id: 'XII-AK-1', nama: 'XII Akuntansi 1' },
  { id: 'XII-MTK-1', nama: 'XII Mekatronika 1' },
];

export default function DetailSiswa({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  siswaId: _siswaId,
}: DetailSiswaProps) {
  const [siswaData, setSiswaData] = useState<Siswa>(dummySiswaData);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handler untuk submit edit
  const handleEditSubmit = (data: {
    jenisKelamin: string;
    noTelp: string;
    jurusanId: string;
    tahunAngkatan: string;
    kelasId: string;
  }) => {
    const jurusanNama = jurusanListForForm.find(j => j.id === data.jurusanId)?.nama || data.jurusanId;
    const kelasNama = kelasListForForm.find(k => k.id === data.kelasId)?.nama || data.kelasId;
    
    setSiswaData({
      ...siswaData,
      jenisKelamin: data.jenisKelamin,
      noTelp: data.noTelp,
      jurusan: jurusanNama,
      jurusanId: data.jurusanId,
      tahunAngkatan: data.tahunAngkatan,
      kelas: kelasNama,
      kelasId: data.kelasId,
    });
    setIsEditModalOpen(false);
    alert('âœ… Data siswa berhasil diperbarui!');
    // TODO: Nanti ganti dengan API call
  };

  // Field item component untuk reusability
  const FieldItem = ({
    label,
    value,
    onEdit,
  }: {
    label: string;
    value: string;
    onEdit: () => void;
  }) => (
    <div style={{ marginBottom: '16px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px',
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#E5E7EB',
          padding: '12px 16px',
          borderRadius: '8px',
        }}
      >
        <span
          style={{
            flex: 1,
            fontSize: '14px',
            color: '#1F2937',
          }}
        >
          {value}
        </span>
        <button
          onClick={onEdit}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Edit"
        >
          <Edit size={18} strokeWidth={2} color="#1F2937" />
        </button>
      </div>
    </div>
  );

  return (
    <AdminLayout
      pageTitle="Detail Siswa"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: window.innerWidth < 768 ? '16px' : '32px', // Responsive padding
        }}
      >
        {/* Card Container */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}
        >
          {/* Header with Profile */}
          <div
            style={{
              backgroundColor: '#0f172a',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <UserIcon size={28} color="#FFFFFF" />
            </div>
{/* Info */}
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                {siswaData.namaSiswa}
              </h2>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '14px',
                  color: '#cbd5e1',
                }}
              >
                {siswaData.nisn}
              </p>
            </div>
          </div>

          {/* Content - Fields */}
          <div style={{ padding: '24px' }}>
            {/* Row 1: Jenis Kelamin & No. Telp */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <FieldItem
                label="Jenis Kelamin :"
                value={siswaData.jenisKelamin}
                onEdit={() => setIsEditModalOpen(true)}
              />
              <FieldItem
                label="No. Telp :"
                value={siswaData.noTelp}
                onEdit={() => setIsEditModalOpen(true)}
              />
            </div>

            {/* Row 2: Jurusan & Tahun Angkatan */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <FieldItem
                label="Jurusan :"
                value={siswaData.jurusan}
                onEdit={() => setIsEditModalOpen(true)}
              />
              <FieldItem
                label="Tahun Angkatan :"
                value={siswaData.tahunAngkatan}
                onEdit={() => setIsEditModalOpen(true)}
              />
            </div>

            {/* Row 3: Kelas */}
            <FieldItem
              label="Kelas :"
              value={siswaData.kelas}
              onEdit={() => setIsEditModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Modal Edit Siswa */}
      <EditSiswaForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={{
          jenisKelamin: siswaData.jenisKelamin,
          noTelp: siswaData.noTelp,
          jurusanId: siswaData.jurusanId,
          tahunAngkatan: siswaData.tahunAngkatan,
          kelasId: siswaData.kelasId,
        }}
        jurusanList={jurusanListForForm}
        kelasList={kelasListForForm}
      />
    </AdminLayout>
  );
}


