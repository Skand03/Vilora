import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFilter, FiSliders } from 'react-icons/fi';
import { PageWrapper, ProductCard, LoadingSpinner } from '../components';
import { categoriesApi, productsApi } from '../api/apiClient';

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('relevance');

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      setLoading(true);
      try {
        const catRes = await categoriesApi.getById(id);
        const catData = catRes.data?.data;
        setCategory(catData);

        if (catData?.name) {
          const prodRes = await productsApi.search({
            categories: catData.name,
            sort: sort !== 'relevance' ? sort : undefined,
          });
          setProducts(prodRes.data?.data?.content || []);
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCategoryAndProducts();
  }, [id, sort]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center py-24">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-forest/65 font-medium text-sm">Loading organic category products...</p>
        </div>
      </PageWrapper>
    );
  }

  if (!category) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-4 py-24">
          <h1 className="font-display text-3xl font-bold text-forest">Category Not Found</h1>
          <p className="mt-2 text-forest/65 max-w-md text-sm">
            The dry fruit category you are looking for may have been updated or moved.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-6 px-6 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-forest-deep font-semibold text-sm transition-all"
          >
            Explore All Dry Fruits
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-forest/55" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gold">Home</Link>
            <span className="text-gold">›</span>
            <Link to="/shop" className="hover:text-gold">Shop</Link>
            <span className="text-gold">›</span>
            <span className="text-forest font-semibold">{category.name}</span>
          </nav>

          {/* Category Hero / Header */}
          <div className="rounded-2xl border border-gold/20 bg-forest p-8 sm:p-12 text-white relative overflow-hidden mb-10 shadow-md">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider mb-3">
                Vilora Collection
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight">
                {category.name}
              </h1>
              <p className="mt-3 text-cream/80 text-sm sm:text-base leading-relaxed">
                {category.description || 'Finest handpicked dry fruits and nuts harvested at peak freshness.'}
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
              <span className="text-9xl">🌿</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-5 mb-8">
            <p className="text-sm font-semibold text-forest">
              Showing <span className="font-mono text-gold font-bold">{products.length}</span> premium products
            </p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-forest/70 font-medium">
                Sort by:
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-lg border border-gold/30 bg-white px-3 py-1.5 text-forest text-sm outline-none focus:border-gold"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="top-rated">Top Rated</option>
                </select>
              </label>
            </div>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gold/20 p-8 shadow-sm">
              <p className="text-forest/65 text-base mb-4">No products found in this category currently.</p>
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-forest-deep font-semibold text-sm transition-all"
              >
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
