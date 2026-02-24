import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './JadwalSiswaEdit.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';

function JadwalSiswaEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    kompetensi_keahlian: '',
    wali_kelas: '',
    kelas: '',
    gambar_jadwal: null
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJadwalSiswa();
  }, [id]);

  const fetchJadwalSiswa = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/jadwal-siswa/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          kompetensi_keahlian: data.kompetensi_keahlian || '',
          wali_kelas: data.wali_kelas || '',
          kelas: data.kelas || '',
          gambar_jadwal: null
        });

        if (data.gambar_jadwal) {
          setPreviewImage(`http://localhost:5000${data.gambar_jadwal}`);
        }
      } else {
        console.error('Gagal memuat data jadwal siswa');
        alert('Gagal memuat data jadwal siswa');
      }
    } catch (error) {
      console.error('Error fetching jadwal siswa:', error);
      alert('Terjadi kesalahan saat memuat data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setErrors({ gambar_jadwal: 'Format file harus JPG, PNG, atau GIF' });
      return;
    }

    if (file.size > maxSize) {
      setErrors({ gambar_jadwal: 'Ukuran file maksimal 5MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = e => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);

    setFormData(prev => ({ ...prev, gambar_jadwal: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      formDataToSend.append('kompetensi_keahlian', formData.kompetensi_keahlian);
      formDataToSend.append('wali_kelas', formData.wali_kelas);
      formDataToSend.append('kelas', formData.kelas);

      if (formData.gambar_jadwal) {
        formDataToSend.append('gambar_jadwal', formData.gambar_jadwal);
      }

      const response = await fetch(`http://localhost:5000/api/jadwal-siswa/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        alert('Jadwal siswa berhasil diperbarui');
        navigate('/waka/jadwal-siswa', {
          state: {
            message: 'Jadwal siswa berhasil diperbarui',
            type: 'success'
          }
        });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Gagal memperbarui jadwal siswa');
      }
    } catch (error) {
      console.error('Error updating jadwal siswa:', error);
      alert('Terjadi kesalahan saat memperbarui jadwal siswa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jadwal-siswa-edit-container">
      <NavbarWaka />

      <div className="page-offset">

        <div className="jadwal-siswa-edit-header">
          <div>
            <h1 className="jadwal-siswa-edit-title">
              <FaEdit /> Ubah Jadwal Siswa
            </h1>
            <p className="jadwal-siswa-edit-subtitle">
              Perbarui jadwal kelas siswa
            </p>
          </div>

          <Link to="/waka/jadwal-siswa" className="jadwal-siswa-edit-back">
            <FaArrowLeft /> Kembali
          </Link>
        </div>

        <div className="jadwal-siswa-edit-card">
          <form onSubmit={handleSubmit}>

            {Object.keys(errors).length > 0 && (
              <div className="jadwal-siswa-edit-error">
                <strong>Perhatian!</strong>
                <ul>
                  {Object.values(errors).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {['kompetensi_keahlian', 'wali_kelas', 'kelas'].map((name) => (
              <div className="jadwal-siswa-edit-group" key={name}>
                <label>
                  {name
                    .replace('_', ' ')
                    .replace(/\b\w/g, char => char.toUpperCase())}
                </label>

                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleInputChange}
                />
              </div>
            ))}

            <div className="jadwal-siswa-edit-upload">
              <label htmlFor="gambar_jadwal" className="upload-label">
                {previewImage ? (
                  <div className="image-wrapper">
                    <img src={previewImage} alt="Preview Jadwal" />
                  </div>
                ) : (
                  <span>Klik untuk tambah jadwal</span>
                )}
              </label>

              <input
                type="file"
                id="gambar_jadwal"
                hidden
                onChange={handleFileChange}
              />
            </div>

            <div className="jadwal-siswa-edit-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
              </button>

              <Link to="/waka/jadwal-siswa" className="jadwal-siswa-edit-cancel">
                Batal
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default JadwalSiswaEdit;