import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './JadwalGuruEdit.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';

function JadwalGuruEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    kode_guru: '',
    nama_guru: '',
    mata_pelajaran: '',
    email: '',
    no_hp: '',
    gambar_jadwal: null
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJadwalGuru();
  }, [id]);

  const fetchJadwalGuru = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/jadwal-guru/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          kode_guru: data.kode_guru || '',
          nama_guru: data.nama_guru || '',
          mata_pelajaran: data.mata_pelajaran || '',
          email: data.email || '',
          no_hp: data.no_hp || '',
          gambar_jadwal: null
        });

        if (data.gambar_jadwal) {
          setPreviewImage(`http://localhost:5000${data.gambar_jadwal}`);
        }
      }
    } catch (error) {
      console.error('Error fetching jadwal guru:', error);
      alert('Gagal memuat data jadwal guru');
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
      setErrors(prev => ({ ...prev, gambar_jadwal: 'Format file harus JPG, PNG, atau GIF' }));
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, gambar_jadwal: 'Ukuran file maksimal 5MB' }));
      return;
    }

    setFormData(prev => ({ ...prev, gambar_jadwal: file }));

    const reader = new FileReader();
    reader.onload = e => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      formDataToSend.append('kode_guru', formData.kode_guru);
      formDataToSend.append('nama_guru', formData.nama_guru);
      formDataToSend.append('mata_pelajaran', formData.mata_pelajaran);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('no_hp', formData.no_hp);

      if (formData.gambar_jadwal) {
        formDataToSend.append('gambar_jadwal', formData.gambar_jadwal);
      }

      const response = await fetch(`http://localhost:5000/api/jadwal-guru/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        alert('Jadwal guru berhasil diperbarui');
        navigate('/waka/jadwal-guru');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Gagal memperbarui jadwal guru');
      }
    } catch (error) {
      console.error('Error updating jadwal guru:', error);
      alert('Terjadi kesalahan saat memperbarui jadwal guru');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jadwal-guru-edit-container">
      <NavbarWaka />
      <div className="jadwal-guru-edit-header">
        <div>
          <h1 className="jadwal-guru-edit-title">
            <FaEdit /> Ubah Jadwal Guru
          </h1>
          <p className="jadwal-guru-edit-subtitle">
            Perbarui jadwal guru
          </p>
        </div>

        <Link to="/waka/jadwal-guru" className="jadwal-guru-edit-back">
          <FaArrowLeft /> Kembali
        </Link>
      </div>

      <div className="jadwal-guru-edit-card">
        <form onSubmit={handleSubmit}>
          
          {Object.keys(errors).length > 0 && (
            <div className="jadwal-guru-edit-error">
              <strong>Perhatian!</strong>
              <ul>
                {Object.values(errors).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {[
            ['kode_guru', 'Kode Guru'],
            ['nama_guru', 'Nama Guru'],
            ['mata_pelajaran', 'Mata Pelajaran'],
            ['email', 'Email'],
            ['no_hp', 'No. HP'],
          ].map(([name, label]) => (
            <div className="jadwal-guru-edit-group" key={name}>
              <label>{label}</label>
              <input
                type="text"
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
              />
            </div>
          ))}

          <div className="jadwal-guru-edit-upload">
            <label htmlFor="gambar_jadwal">
              {previewImage ? (
                <img src={previewImage} alt="upload jadwal gambar" />
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

          <div className="jadwal-guru-edit-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>

            <Link to="/waka/jadwal-guru" className="jadwal-guru-edit-cancel">
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JadwalGuruEdit;