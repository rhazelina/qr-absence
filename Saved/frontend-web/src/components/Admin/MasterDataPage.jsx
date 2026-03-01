import React, { useState, useEffect } from 'react';
import Pagination from '../Common/Pagination';
import NavbarAdmin from './NavbarAdmin';
import './MasterDataPage.css';

/**
 * Generic admin table for simple CRUD master data.
 * props:
 *  - title: page title
 *  - fetchFunction(params): returns promise resolving to {data, meta}
 *  - createFunction(data)
 *  - updateFunction(id, data)
 *  - deleteFunction(id)
 *  - columns: [{ key, label }]
 *  - formFields: [{ name, label, type? }]
 */
function MasterDataPage({
  title,
  fetchFunction,
  createFunction,
  updateFunction,
  deleteFunction,
  columns,
  formFields,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, [pagination.currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.currentPage, per_page: 15 };
      const res = await fetchFunction(params);
      const data = res.data || res;
      setItems(data);
      if (res.meta) {
        setPagination({
          currentPage: res.meta.current_page,
          lastPage: res.meta.last_page,
          total: res.meta.total,
        });
      }
    } catch (e) {
      console.error('Error loading', title, e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    setEditItem(item);
    setFormData(item || formFields.reduce((a, f) => ({ ...a, [f.name]: '' }), {}));
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateFunction(editItem.id, formData);
      } else {
        await createFunction(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Save error', err);
      setErrors(err.data || {});
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus?')) return;
    try {
      await deleteFunction(id);
      loadData();
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  return (
    <div className="master-data-page">
      <NavbarAdmin />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          <button onClick={() => openModal()} className="btn btn-primary">Tambah</button>
        </div>
        {!loading && (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="py-2 px-4 border-b">{col.label}</th>
                ))}
                <th className="py-2 px-4 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  {columns.map(col => (
                    <td key={col.key} className="py-2 px-4 border-b">{item[col.key]}</td>
                  ))}
                  <td className="py-2 px-4 border-b">
                    <button className="btn btn-sm mr-2" onClick={() => openModal(item)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination pagination={pagination} onPageChange={(p) => setPagination(prev=>({ ...prev,currentPage:p }))} />
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="text-xl mb-4">{editItem ? 'Edit' : 'Tambah'} {title}</h3>
            <form onSubmit={handleSubmit}>
              {formFields.map(field => (
                <div key={field.name} className="mb-3">
                  <label className="block mb-1">{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full border px-2 py-1"
                  />
                  {errors[field.name] && <p className="text-red-500 text-sm">{errors[field.name]}</p>}
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MasterDataPage;
