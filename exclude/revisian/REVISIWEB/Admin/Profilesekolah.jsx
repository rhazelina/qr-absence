import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import './ProfileSekolah.css';
import defaultLogo from '../../assets/logo.png';

function ProfileSekolah() {
  const navigate = useNavigate();
  const logoInputRef = useRef(null);
  const maskotInputRef = useRef(null);

  const [formData, setFormData] = useState({
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
  });

  const [logo, setLogo] = useState(defaultLogo);
  const [maskot, setMaskot] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load logo dan maskot dari localStorage saat komponen pertama kali dimuat
  useEffect(() => {
    const savedLogo = localStorage.getItem('logoSekolah');
    const savedMaskot = localStorage.getItem('maskotSekolah');
    const savedProfile = localStorage.getItem('profileSekolah');
    
    if (savedLogo) {
      setLogo(savedLogo);
    }
    
    if (savedMaskot) {
      setMaskot(savedMaskot);
    }
    
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        setFormData(profileData);
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    }
  }, []);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setMaskot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    if (window.confirm('Kembalikan logo ke default?')) {
      setLogo(defaultLogo);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const handleRemoveMaskot = () => {
    if (window.confirm('Hapus maskot?')) {
      setMaskot(null);
      // Hapus dari localStorage
      localStorage.removeItem('maskotSekolah');
      if (maskotInputRef.current) {
        maskotInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (window.confirm('Apakah Anda yakin ingin menyimpan perubahan?')) {
      // Simpan data ke localStorage
      localStorage.setItem('profileSekolah', JSON.stringify(formData));
      localStorage.setItem('logoSekolah', logo);
      
      // Simpan maskot hanya jika ada, jika tidak ada maka hapus dari localStorage
      if (maskot) {
        localStorage.setItem('maskotSekolah', maskot);
      } else {
        localStorage.removeItem('maskotSekolah');
      }

      alert('Data berhasil diperbarui!');
      setIsEditing(false);
      
      // Reload halaman agar navbar juga update
      window.location.reload();
    }
  };

  const handleCancel = () => {
    if (window.confirm('Batalkan perubahan?')) {
      // Reset form ke data awal atau dari localStorage
      const savedData = localStorage.getItem('profileSekolah');
      const savedLogo = localStorage.getItem('logoSekolah');
      const savedMaskot = localStorage.getItem('maskotSekolah');
      
      if (savedData) {
        setFormData(JSON.parse(savedData));
      }
      
      if (savedLogo) {
        setLogo(savedLogo);
      } else {
        setLogo(defaultLogo);
      }
      
      if (savedMaskot) {
        setMaskot(savedMaskot);
      } else {
        setMaskot(null);
      }
      
      // Reset file inputs
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
      if (maskotInputRef.current) {
        maskotInputRef.current.value = '';
      }
      
      setIsEditing(false);
    }
  };

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
                <label htmlFor="logo-upload" className="profil-btn-upload">
                  <i className="fas fa-upload"></i>
                  Ubah Logo
                </label>
                <input
                  ref={logoInputRef}
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                  disabled={!isEditing}
                />
                <button 
                  type="button" 
                  onClick={handleResetLogo} 
                  className="profil-btn-reset"
                  disabled={!isEditing}
                >
                  <i className="fas fa-undo"></i>
                  Reset
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
                <label htmlFor="maskot-upload" className="profil-btn-upload">
                  <i className="fas fa-upload"></i>
                  {maskot ? 'Ubah Maskot' : 'Upload Maskot'}
                </label>
                <input
                  ref={maskotInputRef}
                  id="maskot-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleMaskotChange}
                  style={{ display: 'none' }}
                  disabled={!isEditing}
                />
                {maskot && (
                  <button 
                    type="button" 
                    onClick={handleRemoveMaskot} 
                    className="profil-btn-hapus"
                    disabled={!isEditing}
                  >
                    <i className="fas fa-trash"></i>
                    Hapus
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
                  >
                    <i className="fas fa-times"></i>
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="profil-btn-simpan"
                  >
                    <i className="fas fa-save"></i>
                    Perbarui
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