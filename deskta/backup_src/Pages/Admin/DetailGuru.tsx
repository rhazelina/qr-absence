import { useState } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { Button } from '../../component/Shared/Button';
import { EditGuruForm } from '../../component/Shared/EditGuru';
import { Edit, User as UserIcon } from 'lucide-react';

interface User {
  role: string;
  name: string;
}

interface Guru {
  id: string;
  nama: string;
  nip: string;
  role: string;
  password: string;
  noTelp: string;
  waliKelasDari: string;
  mataPelajaran: string;
}

interface DetailGuruProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  guruId: string;
  onNavigateToRiwayat?: (guruId: string) => void;
}

// Dummy data guru (nanti diganti dengan fetch dari API)
const dummyGuruData: Guru = {
  id: '1',
  nama: 'Ewit Erniyah S.pd',
  nip: '0918415784',
  role: 'Wali Kelas',
  password: 'ABC123',
  noTelp: '08218374859',
  waliKelasDari: 'XII RPL 2',
  mataPelajaran: 'MTK,B.Ing',
};

export default function DetailGuru({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  guruId: _guruId,
  onNavigateToRiwayat,
}: DetailGuruProps) {
  const [guruData, setGuruData] = useState<Guru>(dummyGuruData);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handler untuk submit edit
  const handleEditSubmit = (data: {
    role: string;
    password: string;
    noTelp: string;
    waliKelasDari: string;
    mataPelajaran: string;
  }) => {
    setGuruData({
      ...guruData,
      role: data.role,
      password: data.password,
      noTelp: data.noTelp,
      waliKelasDari: data.waliKelasDari,
      mataPelajaran: data.mataPelajaran,
    });
    setIsEditModalOpen(false);
    alert('âœ… Data guru berhasil diperbarui!');
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
      pageTitle="Detail Guru"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '32px',
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
                {guruData.nama}
              </h2>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '14px',
                  color: '#cbd5e1',
                }}
              >
                {guruData.nip}
              </p>
            </div>
          </div>

          {/* Content - Fields */}
          <div style={{ padding: '24px' }}>
            {/* Button Riwayat Kehadiran */}
            {onNavigateToRiwayat && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '24px',
                }}
              >
                <Button
                  label="Riwayat Kehadiran"
                  onClick={() => onNavigateToRiwayat(guruData.id)}
                />
              </div>
            )}

            {/* Row 1: Role & Password */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <FieldItem
                label="Role :"
                value={guruData.role}
                onEdit={() => setIsEditModalOpen(true)}
              />
              <FieldItem
                label="Password :"
                value={guruData.password}
                onEdit={() => setIsEditModalOpen(true)}
              />
            </div>

            {/* Row 2: No. Telp & Wali Kelas dari */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <FieldItem
                label="No. Telp :"
                value={guruData.noTelp}
                onEdit={() => setIsEditModalOpen(true)}
              />
              <FieldItem
                label="Wali Kelas dari :"
                value={guruData.waliKelasDari}
                onEdit={() => setIsEditModalOpen(true)}
              />
            </div>

            {/* Row 3: Mata Pelajaran */}
            <FieldItem
              label="Mata Pelajaran :"
              value={guruData.mataPelajaran}
              onEdit={() => setIsEditModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Modal Edit Guru */}
      <EditGuruForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={{
          role: guruData.role,
          password: guruData.password,
          noTelp: guruData.noTelp,
          waliKelasDari: guruData.waliKelasDari,
          mataPelajaran: guruData.mataPelajaran,
        }}
      />
    </AdminLayout>
  );
}


