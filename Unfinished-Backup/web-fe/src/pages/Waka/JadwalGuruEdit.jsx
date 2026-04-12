import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './JadwalGuruEdit.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';
import api from '../../utils/api';

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
      const data = await api.get(`/teachers/${id}`);
      setFormData({
        kode_guru: data.kode_guru || '',
        nama_guru: data.nama_guru || data.name || '',
        mata_pelajaran: data.subject_name || '',
        email: data.email || '',
        no_hp: data.phone || data.contact || '',
        gambar_jadwal: null
      });
      if (data.schedule_image_url) {
        setPreviewImage(data.schedule_image_url);
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
      await api.put(`/teachers/${id}`, {
        name: formData.nama_guru,
        kode_guru: formData.kode_guru,
        subject: formData.mata_pelajaran,
        email: formData.email,
        phone: formData.no_hp,
      });

      if (formData.gambar_jadwal) {
        const upload = new FormData();
        upload.append('file', formData.gambar_jadwal);
        await api.post(`/teachers/${id}/schedule-image`, upload);
      }

      alert('Jadwal guru berhasil diperbarui');
      navigate('/waka/jadwal-guru');
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
