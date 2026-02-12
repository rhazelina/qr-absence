// ProfilSekolah.tsx - Halaman profil sekolah untuk admin
import { useState, useRef, useEffect } from "react";
import AdminLayout from "../../component/Admin/AdminLayout";
import AWANKIRI from "../../assets/Icon/AWANKIRI.png";
import AwanBawahkanan from "../../assets/Icon/AwanBawahkanan.png";
import settingService from '../../services/setting';

// ==================== INTERFACE DEFINITIONS ====================
interface User {
  role: string;
  name: string;
}

interface ProfilSekolahProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

interface SchoolData {
  nama_sekolah: string;
  npsn: string;
  jenis_sekolah: string;
  akreditasi: string;
  jalan: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
  kode_pos: string;
  email: string;
  kepala_sekolah: string;
  nip_kepala_sekolah: string;
  nomor_telepon: string;
  logo_sekolah: string;
  maskot_sekolah: string;
}

// ==================== CONSTANTS & FALLBACKS ====================
const DEFAULT_SCHOOL_DATA: SchoolData = {
  nama_sekolah: 'SMK Negeri 1 Karawang',
  npsn: '20217436',
  jenis_sekolah: 'SMK',
  akreditasi: 'A',
  jalan: 'Jl. Pangkal Perjuangan',
  kelurahan: 'Tanjungpura',
  kecamatan: 'Karawang Barat',
  kabupaten_kota: 'Karawang',
  provinsi: 'Jawa Barat',
  kode_pos: '41316',
  email: 'smkn1karawang@gmail.com',
  nomor_telepon: '(0267) 401651',
  kepala_sekolah: 'Drs. H. Makmur, M.T.',
  nip_kepala_sekolah: '19640915 198903 1 012',
  logo_sekolah: '',
  maskot_sekolah: '',
};

// ==================== MAIN COMPONENT ====================
export default function ProfilSekolah({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: ProfilSekolahProps) {
  // ==================== STATE MANAGEMENT ====================
  const [schoolData, setSchoolData] = useState<SchoolData>(DEFAULT_SCHOOL_DATA);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<SchoolData>(DEFAULT_SCHOOL_DATA);
  const [logoPreview, setLogoPreview] = useState('');
  const [maskotPreview, setMaskotPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ==================== REFS ====================
  const logoInputRef = useRef<HTMLInputElement>(null);
  const maskotInputRef = useRef<HTMLInputElement>(null);

  // ==================== LOAD DATA FROM BACKEND ====================
  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const settings = await settingService.getAllSettings();
        
        const mappedData: SchoolData = {
          nama_sekolah: settings.school_name || DEFAULT_SCHOOL_DATA.nama_sekolah,
          npsn: settings.school_npsn || DEFAULT_SCHOOL_DATA.npsn,
          jenis_sekolah: settings.school_type || DEFAULT_SCHOOL_DATA.jenis_sekolah,
          akreditasi: settings.school_accreditation || DEFAULT_SCHOOL_DATA.akreditasi,
          jalan: settings.school_address || DEFAULT_SCHOOL_DATA.jalan,
          kelurahan: settings.school_subdistrict || DEFAULT_SCHOOL_DATA.kelurahan,
          kecamatan: settings.school_district || DEFAULT_SCHOOL_DATA.kecamatan,
          kabupaten_kota: settings.school_city || DEFAULT_SCHOOL_DATA.kabupaten_kota,
          provinsi: settings.school_province || DEFAULT_SCHOOL_DATA.provinsi,
          kode_pos: settings.school_postal_code || DEFAULT_SCHOOL_DATA.kode_pos,
          email: settings.school_email || DEFAULT_SCHOOL_DATA.email,
          kepala_sekolah: settings.school_headmaster || DEFAULT_SCHOOL_DATA.kepala_sekolah,
          nip_kepala_sekolah: settings.school_headmaster_nip || DEFAULT_SCHOOL_DATA.nip_kepala_sekolah,
          nomor_telepon: settings.school_phone || DEFAULT_SCHOOL_DATA.nomor_telepon,
          logo_sekolah: settings.school_logo_url || '',
          maskot_sekolah: settings.school_mascot_url || '',
        };

        setSchoolData(mappedData);
        setEditFormData(mappedData);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setErrorMessage('Gagal memuat data dari server. Menampilkan data lokal.');
        
        // Fallback to localStorage
        const savedData = localStorage.getItem('schoolData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setSchoolData(parsedData);
          setEditFormData(parsedData);
        }
      }
    };

    fetchSchoolData();
  }, []);

  // ==================== EVENT HANDLERS ====================
  const handleEditClick = () => {
    setIsEditMode(true);
    setEditFormData(schoolData);
    setLogoPreview('');
    setMaskotPreview('');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setErrorMessage('');
    setLogoPreview('');
    setMaskotPreview('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // ==================== IMAGE VALIDATION ====================
  const validateFile = (file: File) => {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, message: 'Format file harus PNG atau JPG' };
    }
    if (file.size > MAX_SIZE) {
      return { valid: false, message: 'Ukuran file maksimal 2MB' };
    }
    return { valid: true, message: '' };
  };

  // ==================== HANDLE LOGO UPLOAD ====================
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);

      if (!validation.valid) {
        setErrorMessage(validation.message);
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setLogoPreview(base64String);
        setEditFormData({
          ...editFormData,
          logo_sekolah: base64String,
        });
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  // ==================== HANDLE MASKOT UPLOAD ====================
  const handleMaskotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);

      if (!validation.valid) {
        setErrorMessage(validation.message);
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setMaskotPreview(base64String);
        setEditFormData({
          ...editFormData,
          maskot_sekolah: base64String,
        });
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  // ==================== HANDLE DELETE LOGO ====================
  const handleDeleteLogo = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const updatedData = { ...schoolData, logo_sekolah: '' };
    setSchoolData(updatedData);
    setEditFormData({ ...editFormData, logo_sekolah: '' });
    setLogoPreview('');

    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }

    try {
      await settingService.bulkUpdateSettings({ school_logo: null });
      localStorage.setItem('schoolData', JSON.stringify(updatedData));
      window.dispatchEvent(new Event('schoolDataUpdated'));
      setSuccessMessage('Logo berhasil dihapus!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Error deleting logo:', error);
      setErrorMessage('Gagal menghapus logo dari server.');
    }
  };

  // ==================== HANDLE DELETE MASKOT ====================
  const handleDeleteMaskot = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const updatedData = { ...schoolData, maskot_sekolah: '' };
    setSchoolData(updatedData);
    setEditFormData({ ...editFormData, maskot_sekolah: '' });
    setMaskotPreview('');

    if (maskotInputRef.current) {
      maskotInputRef.current.value = '';
    }

    try {
      await settingService.bulkUpdateSettings({ school_mascot: null });
      localStorage.setItem('schoolData', JSON.stringify(updatedData));
      window.dispatchEvent(new Event('schoolDataUpdated'));
      setSuccessMessage('Maskot berhasil dihapus!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Error deleting maskot:', error);
      setErrorMessage('Gagal menghapus maskot dari server.');
    }
  };

  // ==================== HANDLE SAVE CHANGES ====================
  const handleSaveChanges = async () => {
    if (!editFormData.nama_sekolah.trim()) {
      setErrorMessage('Nama sekolah tidak boleh kosong');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    
    try {
      const formData = new FormData();
      formData.append('school_name', editFormData.nama_sekolah);
      formData.append('school_npsn', editFormData.npsn);
      formData.append('school_type', editFormData.jenis_sekolah);
      formData.append('school_accreditation', editFormData.akreditasi);
      formData.append('school_headmaster', editFormData.kepala_sekolah);
      formData.append('school_headmaster_nip', editFormData.nip_kepala_sekolah);
      formData.append('school_email', editFormData.email);
      formData.append('school_phone', editFormData.nomor_telepon);
      formData.append('school_address', editFormData.jalan);
      formData.append('school_subdistrict', editFormData.kelurahan);
      formData.append('school_district', editFormData.kecamatan);
      formData.append('school_city', editFormData.kabupaten_kota);
      formData.append('school_province', editFormData.provinsi);
      formData.append('school_postal_code', editFormData.kode_pos);

      if (logoInputRef.current?.files?.[0]) {
        formData.append('school_logo', logoInputRef.current.files[0]);
      }
      
      if (maskotInputRef.current?.files?.[0]) {
        formData.append('school_mascot', maskotInputRef.current.files[0]);
      }

      await settingService.updateSettings(formData);
      
      const settings = await settingService.getAllSettings();
      const updatedData: SchoolData = {
        nama_sekolah: settings.school_name || editFormData.nama_sekolah,
        npsn: settings.school_npsn || editFormData.npsn,
        jenis_sekolah: settings.school_type || editFormData.jenis_sekolah,
        akreditasi: settings.school_accreditation || editFormData.akreditasi,
        jalan: settings.school_address || editFormData.jalan,
        kelurahan: settings.school_subdistrict || editFormData.kelurahan,
        kecamatan: settings.school_district || editFormData.kecamatan,
        kabupaten_kota: settings.school_city || editFormData.kabupaten_kota,
        provinsi: settings.school_province || editFormData.provinsi,
        kode_pos: settings.school_postal_code || editFormData.kode_pos,
        email: settings.school_email || editFormData.email,
        kepala_sekolah: settings.school_headmaster || editFormData.kepala_sekolah,
        nip_kepala_sekolah: settings.school_headmaster_nip || editFormData.nip_kepala_sekolah,
        nomor_telepon: settings.school_phone || editFormData.nomor_telepon,
        logo_sekolah: settings.school_logo_url || '',
        maskot_sekolah: settings.school_mascot_url || '',
      };

      setSchoolData(updatedData);
      setEditFormData(updatedData);
      localStorage.setItem('schoolData', JSON.stringify(updatedData));
      
      setIsEditMode(false);
      setSuccessMessage('Data sekolah berhasil diperbarui!');
      setLogoPreview('');
      setMaskotPreview('');
      setTimeout(() => setSuccessMessage(''), 3000);
      window.dispatchEvent(new Event('schoolDataUpdated'));
    } catch (error) {
      console.error('Error saving school data:', error);
      setErrorMessage('Gagal menyimpan data ke server. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== DISPLAY LOGO & MASKOT ====================
  const displayLogo = logoPreview || editFormData.logo_sekolah;
  const displayMaskot = maskotPreview || editFormData.maskot_sekolah;

  // ==================== RENDERING ====================
  if (!isEditMode) {
    return (
      <AdminLayout
        pageTitle="Profil Sekolah"
        currentPage={currentPage}
        onMenuClick={onMenuClick}
        user={user}
        onLogout={onLogout}
        hideBackground
      >
        <img src={AWANKIRI} style={bgLeft} alt="Background awan kiri" />
        <img src={AwanBawahkanan} style={bgRight} alt="Background awan kanan bawah" />

        <div style={mainContainerStyle}>
          <div style={headerStyle}>
            <div>
              <h1 style={titleStyle}>{schoolData.nama_sekolah}</h1>
              <p style={npsnStyle}>NPSN: {schoolData.npsn}</p>
            </div>
            <button onClick={handleEditClick} style={editButtonStyle}>
              ✏️ Ubah Data
            </button>
          </div>

          <div style={contentGridStyle}>
            <div style={leftColumnStyle}>
              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>Logo Sekolah</h3>
                <div style={uploadContainerStyle}>
                  {schoolData.logo_sekolah ? (
                    <img src={schoolData.logo_sekolah} alt="Logo Sekolah" style={imageStyle} />
                  ) : (
                    <div style={placeholderStyle}>Belum ada logo</div>
                  )}
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>Maskot Sekolah</h3>
                <div style={uploadContainerStyle}>
                  {schoolData.maskot_sekolah ? (
                    <img src={schoolData.maskot_sekolah} alt="Maskot Sekolah" style={imageStyle} />
                  ) : (
                    <div style={placeholderStyle}>Belum ada maskot</div>
                  )}
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>Informasi Sekolah</h3>
              <div style={tableContainerStyle}>
                <table style={tableStyle}>
                  <tbody>
                    <TableRow label="Nama Sekolah" value={schoolData.nama_sekolah} />
                    <TableRow label="NPSN" value={schoolData.npsn} />
                    <TableRow label="Jenis Sekolah" value={schoolData.jenis_sekolah} />
                    <TableRow label="Akreditasi" value={schoolData.akreditasi} />
                    <TableRow label="Kepala Sekolah" value={schoolData.kepala_sekolah} />
                    <TableRow label="NIP Kepala Sekolah" value={schoolData.nip_kepala_sekolah} />
                    <TableRow label="Email" value={schoolData.email} />
                    <TableRow label="Telepon" value={schoolData.nomor_telepon} />
                    <TableRow label="Alamat" value={schoolData.jalan} />
                    <TableRow label="Kelurahan" value={schoolData.kelurahan} />
                    <TableRow label="Kecamatan" value={schoolData.kecamatan} />
                    <TableRow label="Kabupaten/Kota" value={schoolData.kabupaten_kota} />
                    <TableRow label="Provinsi" value={schoolData.provinsi} />
                    <TableRow label="Kode Pos" value={schoolData.kode_pos} />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Ubah Profil Sekolah"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
      hideBackground
    >
      <img src={AWANKIRI} style={bgLeft} alt="Background awan kiri" />
      <img src={AwanBawahkanan} style={bgRight} alt="Background awan kanan bawah" />

      <div style={mainContainerStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Ubah Profil Sekolah</h1>
            <p style={npsnStyle}>Ubah informasi sekolah, logo, dan maskot</p>
          </div>
        </div>

        {successMessage && <div style={successMessageStyle}>✓ {successMessage}</div>}
        {errorMessage && <div style={errorMessageStyle}>✗ {errorMessage}</div>}

        <div style={contentGridStyle}>
          <div style={leftColumnStyle}>
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>Logo Sekolah</h3>
              <div style={uploadContainerStyle} onClick={() => logoInputRef.current?.click()}>
                {displayLogo ? (
                  <img src={displayLogo} alt="Logo Preview" style={imageStyle} />
                ) : (
                  <div style={placeholderStyle}>
                    <div style={placeholderIconStyle}>📷</div>
                    <div style={placeholderTextStyle}>Klik untuk upload logo</div>
                  </div>
                )}
              </div>
              <input ref={logoInputRef} type="file" onChange={handleLogoUpload} style={{ display: 'none' }} />
              {(logoPreview || editFormData.logo_sekolah) && (
                <button onClick={handleDeleteLogo} style={deleteButtonStyle}>🗑️ Hapus Logo</button>
              )}
            </div>

            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>Maskot Sekolah</h3>
              <div style={uploadContainerStyle} onClick={() => maskotInputRef.current?.click()}>
                {displayMaskot ? (
                  <img src={displayMaskot} alt="Maskot Preview" style={imageStyle} />
                ) : (
                  <div style={placeholderStyle}>
                    <div style={placeholderIconStyle}>🎭</div>
                    <div style={placeholderTextStyle}>Klik untuk upload maskot</div>
                  </div>
                )}
              </div>
              <input ref={maskotInputRef} type="file" onChange={handleMaskotUpload} style={{ display: 'none' }} />
              {(maskotPreview || editFormData.maskot_sekolah) && (
                <button onClick={handleDeleteMaskot} style={deleteButtonStyle}>🗑️ Hapus Maskot</button>
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={formGridStyle}>
              <FormInput label="Nama Sekolah *" name="nama_sekolah" value={editFormData.nama_sekolah} onChange={handleInputChange} />
              <FormInput label="NPSN" name="npsn" value={editFormData.npsn} onChange={handleInputChange} />
              <FormSelect label="Jenis Sekolah" name="jenis_sekolah" value={editFormData.jenis_sekolah} onChange={handleInputChange} options={['SMK', 'SMA', 'SMP', 'SD']} />
              <FormSelect label="Akreditasi" name="akreditasi" value={editFormData.akreditasi} onChange={handleInputChange} options={['A', 'B', 'C']} />
              <FormInput label="Kepala Sekolah" name="kepala_sekolah" value={editFormData.kepala_sekolah} onChange={handleInputChange} />
              <FormInput label="NIP Kepala Sekolah" name="nip_kepala_sekolah" value={editFormData.nip_kepala_sekolah} onChange={handleInputChange} />
              <FormInput label="Email" name="email" value={editFormData.email} onChange={handleInputChange} />
              <FormInput label="Nomor Telepon" name="nomor_telepon" value={editFormData.nomor_telepon} onChange={handleInputChange} />
              <FormInput label="Jalan" name="jalan" value={editFormData.jalan} onChange={handleInputChange} />
              <FormInput label="Kelurahan" name="kelurahan" value={editFormData.kelurahan} onChange={handleInputChange} />
              <FormInput label="Kecamatan" name="kecamatan" value={editFormData.kecamatan} onChange={handleInputChange} />
              <FormInput label="Kabupaten/Kota" name="kabupaten_kota" value={editFormData.kabupaten_kota} onChange={handleInputChange} />
              <FormInput label="Provinsi" name="provinsi" value={editFormData.provinsi} onChange={handleInputChange} />
              <FormInput label="Kode Pos" name="kode_pos" value={editFormData.kode_pos} onChange={handleInputChange} />
            </div>
          </div>
        </div>

        <div style={actionButtonsStyle}>
          <button onClick={handleCancelEdit} style={cancelButtonStyle}>Batal</button>
          <button onClick={handleSaveChanges} style={saveButtonStyle}>{isSaving ? '⏳ Menyimpan...' : '✓ Simpan Perubahan'}</button>
        </div>
      </div>
    </AdminLayout>
  );
}

// ==================== HELPER COMPONENTS ====================
const TableRow = ({ label, value }: { label: string; value: string }) => (
  <tr style={tableRowStyle}>
    <td style={tableLabelStyle}>{label}</td>
    <td style={tableValueStyle}>{value}</td>
  </tr>
);

const FormInput = ({ label, name, value, onChange }: any) => (
  <div style={{ marginBottom: '15px' }}>
    <label style={formLabelStyle}>{label}</label>
    <input name={name} value={value} onChange={onChange} style={formInputStyle} />
  </div>
);

const FormSelect = ({ label, name, value, onChange, options }: any) => (
  <div style={{ marginBottom: '15px' }}>
    <label style={formLabelStyle}>{label}</label>
    <select name={name} value={value} onChange={onChange} style={formInputStyle}>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

// ==================== STYLES ====================
const bgLeft: React.CSSProperties = { position: "fixed", top: 0, left: 0, width: "300px", zIndex: 0, pointerEvents: "none", opacity: 0.6 };
const bgRight: React.CSSProperties = { position: "fixed", bottom: 0, right: 0, width: "350px", zIndex: 0, pointerEvents: "none", opacity: 0.6 };
const mainContainerStyle: React.CSSProperties = { position: "relative", zIndex: 1, padding: "20px" };
const headerStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", background: "rgba(255,255,255,0.8)", padding: "20px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" };
const titleStyle: React.CSSProperties = { fontSize: "28px", fontWeight: 800, color: "#001F3E", margin: 0 };
const npsnStyle: React.CSSProperties = { fontSize: "14px", color: "#64748B", margin: "5px 0 0" };
const editButtonStyle: React.CSSProperties = { padding: "10px 20px", backgroundColor: "#001F3E", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease" };
const contentGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "300px 1fr", gap: "25px" };
const leftColumnStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "25px" };
const cardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.9)", padding: "20px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid rgba(255,255,255,0.5)" };
const cardTitleStyle: React.CSSProperties = { fontSize: "16px", fontWeight: 700, color: "#001F3E", marginBottom: "15px", borderBottom: "2px solid #F1F5F9", paddingBottom: "10px" };
const uploadContainerStyle: React.CSSProperties = { width: "100%", aspectRatio: "1/1", background: "#F8FAFC", border: "2px dashed #E2E8F0", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "pointer" };
const imageStyle: React.CSSProperties = { width: "100%", height: "100%", objectFit: "contain" };
const placeholderStyle: React.CSSProperties = { textAlign: "center", color: "#94A3B8", fontSize: "14px" };
const placeholderIconStyle: React.CSSProperties = { fontSize: "32px", marginBottom: "10px" };
const placeholderTextStyle: React.CSSProperties = { fontWeight: 500 };
const deleteButtonStyle: React.CSSProperties = { width: "100%", marginTop: "10px", padding: "8px", backgroundColor: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" };
const tableContainerStyle: React.CSSProperties = { overflowX: "auto" };
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const tableRowStyle: React.CSSProperties = { borderBottom: "1px solid #F1F5F9" };
const tableLabelStyle: React.CSSProperties = { padding: "12px 0", color: "#64748B", fontSize: "14px", width: "200px" };
const tableValueStyle: React.CSSProperties = { padding: "12px 0", color: "#001F3E", fontSize: "14px", fontWeight: 600 };
const formGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };
const formLabelStyle: React.CSSProperties = { fontSize: "14px", fontWeight: 600, color: "#001F3E", marginBottom: "5px", display: "block" };
const formInputStyle: React.CSSProperties = { width: "100%", padding: "10px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px" };
const successMessageStyle: React.CSSProperties = { padding: "15px", backgroundColor: "#DCFCE7", color: "#166534", borderRadius: "10px", marginBottom: "20px", fontWeight: 600 };
const errorMessageStyle: React.CSSProperties = { padding: "15px", backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: "10px", marginBottom: "20px", fontWeight: 600 };
const actionButtonsStyle: React.CSSProperties = { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" };
const cancelButtonStyle: React.CSSProperties = { padding: "12px 25px", backgroundColor: "#F1F5F9", color: "#475569", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" };
const saveButtonStyle: React.CSSProperties = { padding: "12px 25px", backgroundColor: "#001F3E", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" };
