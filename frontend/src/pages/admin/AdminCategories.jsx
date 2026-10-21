import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiFolder, FiCheck, 
  FiX, FiRefreshCw, FiAlertCircle, FiLayers 
} from 'react-icons/fi';
import { categoriesApi, productsApi } from '../../api/apiClient';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        categoriesApi.getAll(),
        productsApi.getAll(),
      ]);
      setCategories(catRes.data?.data || []);
      setProducts(prodRes.data?.data || []);
    } catch (err) {
      toast.error('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Category name is required');

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, payload);
        toast.success('Category updated successfully!');
      } else {
        await categoriesApi.create(payload);
        toast.success('Category created successfully!');
      }

      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await categoriesApi.delete(categoryId);
      toast.success('Category deleted successfully');
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
      console.error(err);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Category Management</h1>
          <p className="text-sm text-forest/65">
            Organize Vilora's catalog by managing product categories and sections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInitialData}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gold/30 bg-white text-forest text-sm font-semibold hover:bg-pale-gold/30 transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-forest-deep text-sm font-semibold shadow-sm transition-all"
          >
            <FiPlus /> Add New Category
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gold/20 p-4 mb-6 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/40" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gold/25 text-sm text-forest outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </div>
      </div>

      {/* Categories Cards / Table */}
      <div className="bg-white rounded-xl border border-gold/20 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-forest/60">
            <span className="h-10 w-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-4" />
            <p>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FiLayers className="mx-auto text-4xl text-gold/50 mb-3" />
            <p className="text-forest/60 text-base mb-2">No categories found matching your query.</p>
            <button
              onClick={() => setSearch('')}
              className="text-sm font-semibold text-gold hover:underline"
            >
              Reset search
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-forest">
              <thead className="bg-pale-gold/30 border-b border-gold/20 font-semibold text-forest text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Category Name</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6 text-center">Linked Products</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/15">
                {filteredCategories.map((c) => {
                  const linkedCount = products.filter((p) => p.categoryId === c.id).length;
                  return (
                    <tr key={c.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-pale-gold/50 text-gold flex items-center justify-center font-bold">
                            <FiFolder />
                          </div>
                          <div>
                            <span className="font-semibold text-forest">{c.name}</span>
                            <span className="block text-[11px] font-mono text-forest/40 truncate max-w-[200px]">
                              {c.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-md">
                        <p className="text-forest/70 line-clamp-2">
                          {c.description || 'No description provided'}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-forest/5 text-forest">
                          {linkedCount} items
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            title="Edit Category"
                            className="p-2 rounded-lg hover:bg-gold/15 text-forest/80 hover:text-forest transition-colors"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(c.id)}
                            title="Delete Category"
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gold/20">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <FiAlertCircle className="text-2xl" />
              <h3 className="text-lg font-bold">Delete Category</h3>
            </div>
            <p className="text-sm text-forest/70 mb-6">
              Are you sure you want to delete this category? Products currently assigned to this category might become uncategorized.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-gold/30 text-forest text-sm font-semibold hover:bg-cream"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gold/20">
            <div className="flex items-center justify-between pb-4 border-b border-gold/20">
              <h2 className="font-display text-xl font-bold text-forest">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-forest/50 hover:text-forest hover:bg-cream"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dry Fruits, Nuts & Seeds"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Summary of products in this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gold/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-lg border border-gold/30 text-forest text-sm font-semibold hover:bg-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gold hover:bg-gold-light text-forest-deep text-sm font-bold shadow transition-all disabled:opacity-50"
                >
                  {saving ? (
                    'Saving...'
                  ) : (
                    <>
                      <FiCheck /> {editingCategory ? 'Save Changes' : 'Create Category'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
