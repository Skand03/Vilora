import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiImage, FiUploadCloud, 
  FiCheck, FiX, FiRefreshCw, FiExternalLink, FiAlertCircle 
} from 'react-icons/fi';
import { productsApi, categoriesApi } from '../../api/apiClient';
import toast from 'react-hot-toast';

const money = (val) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    originalPrice: '',
    stockQuantity: 10,
    inStock: true,
    organic: false,
    image: '',
    images: [],
    description: '',
    ingredients: '',
    nutrition: '',
  });

  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setProducts(prodRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch (err) {
      toast.error('Failed to load products or categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
      price: '',
      originalPrice: '',
      stockQuantity: 20,
      inStock: true,
      organic: true,
      image: '',
      images: [],
      description: '',
      ingredients: '',
      nutrition: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      categoryId: product.categoryId || categories[0]?.id || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      stockQuantity: product.stockQuantity ?? product.stock ?? 0,
      inStock: product.inStock ?? true,
      organic: product.organic ?? product.isOrganic ?? false,
      image: product.image || '',
      images: product.images || product.gallery || [],
      description: product.description || '',
      ingredients: product.ingredients || '',
      nutrition: product.nutrition || '',
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const res = await productsApi.uploadImage(file);
      const uploadedUrl = res.data?.data?.url || res.data?.data;
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, image: uploadedUrl }));
        toast.success('Main image uploaded to Supabase Storage!');
      } else {
        toast.error('Upload succeeded but no URL was returned');
      }
    } catch (err) {
      toast.error(err.message || 'Image upload failed.');
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newGalleryUrl.trim()],
    }));
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Product name is required');
    if (!formData.categoryId) return toast.error('Category is required');
    if (!formData.price || Number(formData.price) <= 0) return toast.error('Valid price is required');

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stockQuantity: Number(formData.stockQuantity) || 0,
        inStock: formData.inStock,
        organic: formData.organic,
        image: formData.image.trim(),
        images: formData.images,
        description: formData.description.trim(),
        ingredients: formData.ingredients.trim(),
        nutrition: formData.nutrition.trim(),
      };

      if (editingProduct) {
        await productsApi.update(editingProduct.id, payload);
        toast.success('Product updated successfully!');
      } else {
        await productsApi.create(payload);
        toast.success('Product created successfully!');
      }

      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await productsApi.delete(productId);
      toast.success('Product deleted successfully');
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
                          p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Product Management</h1>
          <p className="text-sm text-forest/65">
            Manage your organic inventory, pricing, images, and descriptions.
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
            <FiPlus /> Add New Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-gold/20 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/40" />
          <input
            type="text"
            placeholder="Search products by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gold/25 text-sm text-forest outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-56 px-3 py-2.5 rounded-lg border border-gold/25 text-sm text-forest bg-white outline-none focus:border-gold"
          >
            <option value="">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gold/20 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-forest/60">
            <span className="h-10 w-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-4" />
            <p>Loading catalog items from backend...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-forest/60 text-base mb-2">No products found matching your filter.</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory(''); }}
              className="text-sm font-semibold text-gold hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-forest">
              <thead className="bg-pale-gold/30 border-b border-gold/20 font-semibold text-forest text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Organic</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/15">
                {filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=120'}
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover bg-sage/20 border border-gold/20 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-forest truncate max-w-xs">{p.name}</p>
                            <p className="text-xs text-forest/50 truncate max-w-xs">{p.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-forest/5 text-forest">
                          {cat?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-forest">{money(p.price)}</div>
                        {p.originalPrice && (
                          <div className="text-xs text-forest/45 line-through font-mono">
                            {money(p.originalPrice)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              p.inStock && (p.stockQuantity ?? 0) > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                          <span className="font-mono text-xs">
                            {p.stockQuantity ?? p.stock ?? 0} in stock
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {p.organic || p.isOrganic ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Organic
                          </span>
                        ) : (
                          <span className="text-xs text-forest/40">Standard</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Product"
                            className="p-2 rounded-lg hover:bg-gold/15 text-forest/80 hover:text-forest transition-colors"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            title="Delete Product"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gold/20 animate-[modal-pop_0.2s_ease-out]">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <FiAlertCircle className="text-2xl" />
              <h3 className="text-lg font-bold">Delete Product</h3>
            </div>
            <p className="text-sm text-forest/70 mb-6">
              Are you sure you want to permanently remove this product from the Vilora catalog? This action cannot be undone.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-gold/20 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gold/20">
              <h2 className="font-display text-xl font-bold text-forest">
                {editingProduct ? 'Edit Product' : 'Add New Organic Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-forest/50 hover:text-forest hover:bg-cream"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto pr-2 mt-4 space-y-4 flex-1">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium California Almonds"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                />
              </div>

              {/* Category & Organic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest bg-white outline-none focus:border-gold"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-forest">
                    <input
                      type="checkbox"
                      checked={formData.organic}
                      onChange={(e) => setFormData({ ...formData, organic: e.target.checked })}
                      className="w-4 h-4 accent-gold rounded"
                    />
                    <span>100% Organic Certified</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-forest">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-4 h-4 accent-gold rounded"
                    />
                    <span>In Stock</span>
                  </label>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="499"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest font-mono outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="699"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest font-mono outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest font-mono outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Main Image & File Upload */}
              <div className="p-4 rounded-xl border border-gold/20 bg-pale-gold/15">
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-2">
                  Featured Product Image (Supabase Storage)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Image URL or upload a file below..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-gold/30 text-xs text-forest outline-none focus:border-gold"
                  />
                  <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-forest text-white text-xs font-semibold whitespace-nowrap hover:bg-forest-deep transition-colors w-full sm:w-auto">
                    <FiUploadCloud className={uploadingImage ? 'animate-bounce' : ''} />
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-16 h-16 rounded-lg object-cover border border-gold/30 bg-white"
                    />
                    <span className="text-xs text-forest/60 truncate max-w-sm">
                      {formData.image}
                    </span>
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                  Additional Gallery Images
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="https://... additional image URL"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-gold/30 text-xs text-forest outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-3 py-2 bg-gold/20 text-forest text-xs font-semibold rounded-lg hover:bg-gold/30"
                  >
                    Add
                  </button>
                </div>
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={url}
                          alt="Gallery item"
                          className="w-14 h-14 rounded-lg object-cover border border-gold/25"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Detailed description of the product benefits, harvesting, and origin..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                />
              </div>

              {/* Ingredients & Nutrition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                    Ingredients
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Raw Organic California Almonds"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-gold/30 text-xs text-forest outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                    Nutrition Info
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Protein: 21g, Fiber: 12g, Healthy Fats: 49g"
                    value={formData.nutrition}
                    onChange={(e) => setFormData({ ...formData, nutrition: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-gold/30 text-xs text-forest outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gold/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-gold/30 text-forest text-sm font-semibold hover:bg-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-forest-deep text-sm font-bold shadow transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-forest-deep/30 border-t-forest-deep rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheck /> {editingProduct ? 'Save Changes' : 'Create Product'}
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
