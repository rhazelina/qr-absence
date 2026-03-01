import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import './Profilesekolah.css'
import defaultLogo from '../../assets/logo.png';

import apiService from '../../utils/api';
import { useSchool } from '../../context/SchoolContext';

function ProfileSekolah() {
  const navigate = useNavigate();
  const { refreshSettings } = useSchool();
  const logoInputRef = useRef(null);
  const maskotInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    namaSekolah: '', npsn: '', akreditasi: '', jenisSekolah: '',
    kepalaSekolah: '', nipKepalaSekolah: '', jalan: '', kelurahan: '',
    kecamatan: '', kabupatenKota: '', provinsi: '', kodePos: '',
    nomorTelepon: '', email: ''
  });

  const [logo, setLogo] = useState(defaultLogo);
  const [maskot, setMaskot] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [maskotFile, setMaskotFile] = useState(null);

  useEffect(() => {
    fetchSchoolProfile();
  }, []);

  const fetchSchoolProfile = async () => {
    setLoading(true);
    try {
      const response = await apiService.getSettings();
      if (response.data) {
        const d = response.data;
        setFormData({
          namaSekolah: d.school_name || '',
          npsn: d.school_npsn || '',
          akreditasi: d.school_accreditation || '',
          jenisSekolah: d.school_type || '',
          kepalaSekolah: d.school_principal_name || '',
          nipKepalaSekolah: d.school_principal_nip || '',
          jalan: d.school_address || '',
          kelurahan: d.village || '',
          kecamatan: d.district || '',
          kabupatenKota: d.city || '',
          provinsi: d.province || '',
          kodePos: d.postal_code || '',
          nomorTelepon: d.school_phone || '',
          email: d.school_email || ''
        });
        setLogo(d.school_logo_url || defaultLogo);
        setMaskot(d.school_mascot_url || null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) return alert('File harus berupa gambar!');
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMaskotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) return alert('File harus berupa gambar!');
      setMaskotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setMaskot(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    if (!window.confirm('Logo default akan digunakan jika tidak mengunggah logo baru saat simpan. Lanjutkan?')) return;
    setLogo(defaultLogo);
    setLogoFile(null);
  };

  const handleRemoveMaskot = () => {
    if (!window.confirm('Hapus maskot?')) return;
    setMaskot(null);
    setMaskotFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Simpan perubahan?')) return;
    setSaving(true);
    
    try {
      const uploadData = new FormData();
      uploadData.append('school_name', formData.namaSekolah);
      uploadData.append('school_npsn', formData.npsn);
      uploadData.append('school_accreditation', formData.akreditasi);
      uploadData.append('school_type', formData.jenisSekolah);
      uploadData.append('school_principal_name', formData.kepalaSekolah);
      uploadData.append('school_principal_nip', formData.nipKepalaSekolah);
      uploadData.append('school_address', formData.jalan);
      uploadData.append('village', formData.kelurahan);
      uploadData.append('district', formData.kecamatan);
      uploadData.append('city', formData.kabupatenKota);
      uploadData.append('province', formData.provinsi);
      uploadData.append('postal_code', formData.kodePos);
      uploadData.append('school_phone', formData.nomorTelepon);
      uploadData.append('school_email', formData.email);

      if (logoFile) {
        uploadData.append('school_logo', logoFile);
      }
      
      if (maskotFile) {
        uploadData.append('school_mascot', maskotFile);
      } else if (maskot === null) {
        // Explicitly remove mascot if it was removed in UI
        uploadData.append('school_mascot', '');
      }

      await apiService.updateSettings(uploadData);
      alert('Profil sekolah berhasil diperbarui!');
      setIsEditing(false);
      refreshSettings(); // Sync global state
      await fetchSchoolProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Gagal memperbarui profil: ' + (error.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profil-sekolah-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <NavbarAdmin />
        <div style={{ color: 'white', fontSize: '20px' }}>Memuat Profil...</div>
      </div>
    );
  }

  return (
    <div className="profil-sekolah-wrapper">
      <NavbarAdmin />
      <div className="profil-sekolah-konten">
        <h1 className="profil-judul-halaman">Profil Sekolah</h1>

        <div className="profil-kontainer">
          <div className="profil-media-section">
            <div className="profil-media-kartu">
              <h3 className="profil-media-judul">Logo Sekolah</h3>
              <div className="profil-media-preview">
                <img src={logo} alt="Logo" className="profil-preview-gambar profil-logo-preview" />
              </div>
              <div className="profil-media-tombol">
                <label htmlFor="logo-upload" className={`profil-btn-upload ${!isEditing ? 'disabled' : ''}`} style={{ opacity: !isEditing ? 0.5 : 1 }}>
                  Ubah Logo
                </label>
                <input id="logo-upload" type="file" onChange={handleLogoChange} style={{ display: 'none' }} disabled={!isEditing} />
                <button onClick={handleResetLogo} className="profil-btn-reset" disabled={!isEditing}>Reset</button>
              </div>
            </div>

            <div className="profil-media-kartu">
              <h3 className="profil-media-judul">Maskot Sekolah</h3>
              <div className="profil-media-preview">
                {maskot ? <img src={maskot} alt="Maskot" className="profil-preview-gambar" /> : <div style={{ color: '#94a3b8' }}>Belum ada maskot</div>}
              </div>
              <div className="profil-media-tombol">
                <label htmlFor="maskot-upload" className={`profil-btn-upload ${!isEditing ? 'disabled' : ''}`} style={{ opacity: !isEditing ? 0.5 : 1 }}>
                  Unggah Maskot
                </label>
                <input id="maskot-upload" type="file" onChange={handleMaskotChange} style={{ display: 'none' }} disabled={!isEditing} />
                {maskot && <button onClick={handleRemoveMaskot} className="profil-btn-hapus" disabled={!isEditing}>Hapus</button>}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profil-form-data">
            <div className="profil-form-bagian">
              <h3 className="profil-bagian-judul">Informasi Umum</h3>
              <div className="profil-form-baris">
                <div className="profil-form-grup">
                  <label className="profil-form-label">Nama Sekolah</label>
                  <input type="text" name="namaSekolah" value={formData.namaSekolah} onChange={handleInputChange} className="profil-form-input" disabled={!isEditing} required />
                </div>
                <div className="profil-form-grup">
                  <label className="profil-form-label">NPSN</label>
                  <input type="text" name="npsn" value={formData.npsn} onChange={handleInputChange} className="profil-form-input" disabled={!isEditing} required />
                </div>
              </div>
            </div>

            <div className="profil-form-bagian">
              <h3 className="profil-bagian-judul">Alamat & Kontak</h3>
              <div className="profil-form-grup lebar-penuh">
                <label className="profil-form-label">Alamat Jalan</label>
                <input type="text" name="jalan" value={formData.jalan} onChange={handleInputChange} className="profil-form-input" disabled={!isEditing} required />
              </div>
              <div className="profil-form-baris">
                <div className="profil-form-grup">
                  <label className="profil-form-label">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="profil-form-input" disabled={!isEditing} required />
                </div>
                <div className="profil-form-grup">
                  <label className="profil-form-label">Nomor Telepon</label>
                  <input type="text" name="nomorTelepon" value={formData.nomorTelepon} onChange={handleInputChange} className="profil-form-input" disabled={!isEditing} required />
                </div>
              </div>
            </div>

            <div className="profil-form-aksi">
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)} className="profil-btn-edit">Edit Profil</button>
              ) : (
                <>
                  <button type="button" onClick={() => setIsEditing(false)} className="profil-btn-batal">Batal</button>
                  <button type="submit" className="profil-btn-simpan" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
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