import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import './Profilesekolah.css'
import defaultLogo from '../../assets/logo.png';

// ==================== DUMMY DATA SERVICE ====================
const dummyDataService = {
  getSchoolProfile() {
    const savedData = localStorage.getItem('schoolProfile');
    if (savedData) return JSON.parse(savedData);
    return {
      namaSekolah: 'SMKN 2 SINGOSARI',
      npsn: '20517748',
      akreditasi: 'A',
      jenisSekolah: 'SMK',
      kepalaSekolah: 'SUMIJAH, S.Pd., M,Si',
      nipKepalaSekolah: '97002101998022009',
      jalan: 'Jl. Perusahaan No.20, Tanjungtirto',
      kelurahan: 'Tanjungtirto',
      kecamatan: 'Singosari',
      kabupatenKota: 'Kab. Malang',
      provinsi: 'Jawa Timur',
      kodePos: '65153',
      nomorTelepon: '(0341) 458823',
      email: 'smkn2.singosari@yahoo.co.id'
    };
  },
  updateSchoolProfile(data) {
    const updatedData = { ...this.getSchoolProfile(), ...data };
    localStorage.setItem('schoolProfile', JSON.stringify(updatedData));
    return updatedData;
  },
  uploadLogo(base64Image) {
    const currentData = this.getSchoolProfile();
    currentData.logoUrl = base64Image;
    localStorage.setItem('schoolProfile', JSON.stringify(currentData));
    return currentData;
  },
  uploadMascot(base64Image) {
    const currentData = this.getSchoolProfile();
    currentData.mascotUrl = base64Image;
    localStorage.setItem('schoolProfile', JSON.stringify(currentData));
    return currentData;
  },
  resetLogo() {
    const currentData = this.getSchoolProfile();
    currentData.logoUrl = null;
    localStorage.setItem('schoolProfile', JSON.stringify(currentData));
    return currentData;
  },
  deleteMascot() {
    const currentData = this.getSchoolProfile();
    currentData.mascotUrl = null;
    localStorage.setItem('schoolProfile', JSON.stringify(currentData));
    return currentData;
  }
};

function ProfileSekolah() {
  const navigate = useNavigate();
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

  const [originalData, setOriginalData] = useState(null);
  const [logo, setLogo] = useState(defaultLogo);
  const [maskot, setMaskot] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [maskotFile, setMaskotFile] = useState(null);

  useEffect(() => {
    fetchSchoolProfile();
  }, []);

  const fetchSchoolProfile = () => {
    setLoading(true);
    setTimeout(() => {
      const data = dummyDataService.getSchoolProfile();
      setFormData(data);
      setOriginalData(data);
      setLogo(data.logoUrl || defaultLogo);
      setMaskot(data.mascotUrl || null);
      setLoading(false);
    }, 500);
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
    if (!window.confirm('Kembalikan logo ke default?')) return;
    setSaving(true);
    setTimeout(() => {
      dummyDataService.resetLogo();
      setLogo(defaultLogo);
      setLogoFile(null);
      alert('Logo berhasil direset!');
      setSaving(false);
    }, 300);
  };

  const handleRemoveMaskot = () => {
    if (!window.confirm('Hapus maskot?')) return;
    setSaving(true);
    setTimeout(() => {
      dummyDataService.deleteMascot();
      setMaskot(null);
      setMaskotFile(null);
      alert('Maskot berhasil dihapus!');
      setSaving(false);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!window.confirm('Simpan perubahan?')) return;
    setSaving(true);
    setTimeout(() => {
      if (logoFile && logo !== defaultLogo) dummyDataService.uploadLogo(logo);
      if (maskotFile) dummyDataService.uploadMascot(maskot);
      dummyDataService.updateSchoolProfile(formData);
      alert('Data diperbarui!');
      setIsEditing(false);
      fetchSchoolProfile();
      setSaving(false);
    }, 800);
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