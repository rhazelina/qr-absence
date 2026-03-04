import React, { useState, useRef, useEffect } from 'react';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import './ProfileSekolah.css';
import defaultLogo from '../../assets/logo.png';
import api from '../../utils/api';
import { API_ENDPOINTS } from '../../utils/apiConfig';

function ProfileSekolah() {
  const logoInputRef = useRef(null);
  const maskotInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    namaSekolah: '',
    npsn: '',
    akreditasi: '',
    jenisSekolah: '',
    kepalaSekolah: '',
    nipKepalaSekolah: '',
    jalan: '',
    kelurahan: '',
    kecamatan: '',
    kabupatenKota: '',
    provinsi: '',
    kodePos: '',
    nomorTelepon: '',
    email: ''
  });

  const [originalData, setOriginalData] = useState(null);
  const [logo, setLogo] = useState(defaultLogo);
  const [maskot, setMaskot] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [maskotFile, setMaskotFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const normalizeFromSettings = (settings = {}) => ({
    namaSekolah: settings.school_name || '',
    npsn: settings.school_npsn || '',
    akreditasi: settings.school_accreditation || 'A',
    jenisSekolah: settings.school_type || '',
    kepalaSekolah: settings.school_headmaster || '',
    nipKepalaSekolah: settings.school_headmaster_nip || '',
    jalan: settings.school_address || '',
    kelurahan: settings.school_subdistrict || '',
    kecamatan: settings.school_district || '',
    kabupatenKota: settings.school_city || '',
    provinsi: settings.school_province || '',
    kodePos: settings.school_postal_code || '',
    nomorTelepon: settings.school_phone || '',
    email: settings.school_email || ''
  });

  const toSettingsPayload = (data = {}) => ({
    school_name: data.namaSekolah || '',
    school_npsn: data.npsn || '',
    school_accreditation: data.akreditasi || '',
    school_type: data.jenisSekolah || '',
    school_headmaster: data.kepalaSekolah || '',
    school_headmaster_nip: data.nipKepalaSekolah || '',
    school_address: data.jalan || '',
    school_subdistrict: data.kelurahan || '',
    school_district: data.kecamatan || '',
    school_city: data.kabupatenKota || '',
    school_province: data.provinsi || '',
    school_postal_code: data.kodePos || '',
    school_phone: data.nomorTelepon || '',
    school_email: data.email || ''
  });

  useEffect(() => {
    fetchSchoolProfile();
  }, []);

  const fetchSchoolProfile = async () => {
    try {
      setLoading(true);
      const result = await api.get(API_ENDPOINTS.settings);
      const settings = result?.data || {};
      const profileData = normalizeFromSettings(settings);
      setFormData(profileData);
      setOriginalData(profileData);
      setLogo(settings.school_logo_url || defaultLogo);
      setMaskot(settings.school_mascot_url || null);
    } catch (err) {
      console.error('Error fetching school profile:', err);
      setFormData(normalizeFromSettings({}));
      setOriginalData(normalizeFromSettings({}));
      setLogo(defaultLogo);
      setMaskot(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar!');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB!');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMaskotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar!');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB!');
        return;
      }

      setMaskotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMaskot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    if (!window.confirm('Kembalikan logo ke default?')) return;
    
    try {
      setSaving(true);
      api.post(API_ENDPOINTS.settings, { delete_school_logo: true }).then(() => {
        setLogo(defaultLogo);
        setLogoFile(null);
        if (logoInputRef.current) {
          logoInputRef.current.value = '';
        }
        alert('Logo berhasil direset ke default!');
        setSaving(false);
      }).catch((error) => {
        console.error('Error resetting logo:', error);
        alert('Gagal mereset logo. Silakan coba lagi.');
        setSaving(false);
      });
    } catch (error) {
      console.error('Error resetting logo:', error);
      alert('Gagal mereset logo. Silakan coba lagi.');
      setSaving(false);
    }
  };

  const handleRemoveMaskot = () => {
    if (!window.confirm('Hapus maskot?')) return;
    
    try {
      setSaving(true);
      api.post(API_ENDPOINTS.settings, { delete_school_mascot: true }).then(() => {
        setMaskot(null);
        setMaskotFile(null);
        if (maskotInputRef.current) {
          maskotInputRef.current.value = '';
        }
        alert('Maskot berhasil dihapus!');
        setSaving(false);
      }).catch((error) => {
        console.error('Error deleting mascot:', error);
        alert('Gagal menghapus maskot. Silakan coba lagi.');
        setSaving(false);
      });
    } catch (error) {
      console.error('Error deleting mascot:', error);
      alert('Gagal menghapus maskot. Silakan coba lagi.');
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!window.confirm('Apakah Anda yakin ingin menyimpan perubahan?')) return;
    
    try {
      setSaving(true);
      const payload = new FormData();
      Object.entries(toSettingsPayload(formData)).forEach(([k, v]) => payload.append(k, v));
      if (logoFile) payload.append('school_logo', logoFile);
      if (maskotFile) payload.append('school_mascot', maskotFile);

      await api.post(API_ENDPOINTS.settings, payload);
      alert('Data berhasil diperbarui!');
      setIsEditing(false);
      setLogoFile(null);
      setMaskotFile(null);
      await fetchSchoolProfile();
      setSaving(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Gagal memperbarui data. Silakan coba lagi.');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!window.confirm('Batalkan perubahan?')) return;
    
    // Reset to original data
    if (originalData) {
      setFormData(originalData);
    }
    
    // Reset images
    fetchSchoolProfile();
    
    // Reset file inputs
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
    if (maskotInputRef.current) {
      maskotInputRef.current.value = '';
    }
    
    setLogoFile(null);
    setMaskotFile(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="profil-sekolah-wrapper">
        <NavbarAdmin />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '18px',
          color: '#6b7280'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="profil-sekolah-wrapper">
      <NavbarAdmin />

      <div className="profil-sekolah-konten">
        <h1 className="profil-judul-halaman">Profil Sekolah</h1>

        <div className="profil-kontainer">
          {/* Logo & Maskot Section */}
          <div className="profil-media-section">
            <div className="profil-media-kartu">
              <h3 className="profil-media-judul">Logo Sekolah</h3>
              <div className="profil-media-preview">
                <img src={logo} alt="Logo Sekolah" className="profil-preview-gambar profil-logo-preview" />
              </div>

              {logo === defaultLogo && (
                <div className="profil-logo-info">
                  <i className="fas fa-info-circle"></i>
                  <span>Logo Default</span>
                </div>
              )}
              <div className="profil-media-tombol">
                <label htmlFor="logo-upload" className={`profil-btn-upload ${!isEditing || saving ? 'disabled' : ''}`}>
                  <i className="fas fa-upload"></i>
                  Ubah Logo
                </label>
                <input
                  ref={logoInputRef}
                  id="logo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                  disabled={!isEditing || saving}
                />
                <button 
                  type="button" 
                  onClick={handleResetLogo} 
                  className="profil-btn-reset"
                  disabled={!isEditing || saving}
                >
                  <i className="fas fa-undo"></i>
                  {saving ? 'Processing...' : 'Reset'}
                </button>
              </div>
            </div>

            <div className="profil-media-kartu">
              <h3 className="profil-media-judul">Maskot Sekolah</h3>
              <div className="profil-media-preview">
                {maskot ? (
                  <img src={maskot} alt="Maskot Sekolah" className="profil-preview-gambar profil-maskot-preview" />
                ) : (
                  <div className="profil-no-gambar">
                    <i className="fas fa-image"></i>
                    <p>Belum ada maskot</p>
                  </div>
                )}
              </div>
              <div className="profil-media-tombol">
                <label htmlFor="maskot-upload" className={`profil-btn-upload ${!isEditing || saving ? 'disabled' : ''}`}>
                  <i className="fas fa-upload"></i>
                  {maskot ? 'Ubah Maskot' : 'Unggah Maskot'}
                </label>
                <input
                  ref={maskotInputRef}
                  id="maskot-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleMaskotChange}
                  style={{ display: 'none' }}
                  disabled={!isEditing || saving}
                />
                {maskot && (
                  <button 
                    type="button" 
                    onClick={handleRemoveMaskot} 
                    className="profil-btn-hapus"
                    disabled={!isEditing || saving}
                  >
                    <i className="fas fa-trash"></i>
                    {saving ? 'Processing...' : 'Hapus'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Data Sekolah */}
          <form onSubmit={handleSubmit} className="profil-form-data">
            <div className="profil-form-bagian">
              <h3 className="profil-bagian-judul">Informasi Umum</h3>

              <div className="profil-form-baris">
                <div className="profil-form-grup">
                  <label className="profil-form-label">Nama Sekolah</label>
                  <input
                    type="text"
                    name="namaSekolah"
                    value={formData.namaSekolah}
                    onChange={handleInputChange}
                    className="profil-form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="profil-form-grup">
                  <label className="profil-form-label">NPSN</label>
                  <input
                    type="text"
                    name="npsn"
                    value={formData.npsn}
                    onChange={handleInputChange}
                    className="profil-form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="profil-form-baris">
                <div className="profil-form-grup">
                  <label className="profil-form-label">Akreditasi</label>
                  <select
                    name="akreditasi"
                    value={formData.akreditasi}
                    onChange={handleInputChange}
                    className="profil-form-input"
                    disabled={!isEditing}
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                  </select>
                </div>

                <div className="profil-form-grup">
                  <label className="profil-form-label">Jenis Sekolah</label>
                  <input
                    type="text"
                    name="jenisSekolah"
                    value={formData.jenisSekolah}
                    onChange={handleInputChange}
                    className="profil-form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="profil-form-bagian">
              <h3 className="profil-bagian-judul">Kepala Sekolah</h3>
              
              <div className="profil-form-baris">
                <div className="profil-form-grup">
                  <label className="profil-form-label">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    name="kepalaSekolah"
                    value={formData.kepalaSekolah}
                    onChange={handleInputChange}
                    className="profil-form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="profil-form-grup">
                  <label className="profil-form-label">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    name="nipKepalaSekolah"
                    value={formData.nipKepalaSekolah}
                    onChange={handleInputChange}
                    className="profil-form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="profil-form-bagian">
              <h3 className="profil-bagian-judul">Alamat & Kontak</h3>
              
              <div className="profil-form-grup lebar-penuh">
                <label className="profil-form-label">Alamat Jalan</label>
                <input
                  type="text"
                  name="jalan"
                  value={formData.jalan}
                  onChange={handleInputChange}
                  className="profil-form-input"
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="profil-form-baris">
                <div className="profil-form-grup">
                  <label className="profil-form-label">Kelurahan</label>
                  <input
                    type="text"
                    name="kelurahan"
                    value={formData.kelurahan}
                    onChange={handleInputChange}
                    className="profil-form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="profil-form-grup">
                  <label className="profil-form-label">Kecamatan</label>
                  <input
                    type="text"
                    name="kecamatan"
                    value={formData.kecamatan}
                    onChange={handleInputChange}
                    className="profil-form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="profil-form-baris">
                <div className="profil-form-grup">
                  <label className="profil-form-label">Kabupaten/Kota</label>
                  <input
                    type="text"
                    name="kabupatenKota"
                    value={formData.kabupatenKota}
                    onChange={handleInputChange}
                    className="profil-form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="profil-form-grup">
                  <label className="profil-form-label">Provinsi</label>
                  <input
                    type="text"
                    name="provinsi"
                    value={formData.provinsi}
                    onChange={handleInputChange}
                    className="profil-form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="profil-form-baris">
                <div className="profil-form-grup">
                  <label className="profil-form-label">Kode Pos</label>
                  <input
                    type="text"
                    name="kodePos"
                    value={formData.kodePos}
                    onChange={handleInputChange}
                    className="profil-form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="profil-form-grup">
                  <label className="profil-form-label">Nomor Telepon</label>
                  <input
                    type="text"
                    name="nomorTelepon"
                    value={formData.nomorTelepon}
                    onChange={handleInputChange}
                    className="profil-form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="profil-form-grup lebar-penuh">
                <label className="profil-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="profil-form-input"
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="profil-form-aksi">
              {!isEditing ? (
                <button 
                  type="button" 
                  onClick={() => setIsEditing(true)} 
                  className="profil-btn-edit"
                  disabled={saving}
                >
                  <i className="fas fa-edit"></i>
                  Edit Profil
                </button>
              ) : (
                <>
                  <button 
                    type="button" 
                    onClick={handleCancel} 
                    className="profil-btn-batal"
                    disabled={saving}
                  >
                    <i className="fas fa-times"></i>
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="profil-btn-simpan"
                    disabled={saving}
                  >
                    <i className="fas fa-save"></i>
                    {saving ? 'Menyimpan...' : 'Perbarui'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileSekolah;
