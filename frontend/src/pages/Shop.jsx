import React, { useEffect, useState, useCallback } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiFilter, FiGrid, FiList, FiSliders, FiX } from 'react-icons/fi';
import { PageWrapper, ProductCard, Button } from '../components';
import { useSearchParams } from 'react-router-dom';
import api from '../api';

const FilterSection = ({ title, children, defaultOpen = true }) => (
  <Disclosure as="section" defaultOpen={defaultOpen} className="border-b border-gold/15 py-5 last:border-0">
    <DisclosureButton className="flex w-full items-center justify-between text-left font-semibold text-forest"><span>{title}</span><FiChevronDown className="ui-open:rotate-180 transition-transform" aria-hidden="true" /></DisclosureButton>
    <DisclosurePanel className="pt-4">{children}</DisclosurePanel>
  </Disclosure>
);

const FilterContent = ({ filters, setFilters, categories = [] }) => {
  const toggleCategory = (category) => setFilters((current) => ({ ...current, categories: current.categories.includes(category) ? current.categories.filter((item) => item !== category) : [...current.categories, category] }));
  
  const displayCategories = categories.length > 0 
    ? categories.map((c) => c.name) 
    : ['Premium Dry Fruits & Nuts', 'Exotic Dates & Figs', 'Dried Berries & Raisins', 'Seeds & Healthy Mixes'];

  return (
    <div>
      <FilterSection title="Categories">
        <div className="space-y-3">{displayCategories.map((category) => <label key={category} className="flex cursor-pointer items-center justify-between gap-3 text-sm text-forest/75"><span className="flex items-center gap-3"><input type="checkbox" checked={filters.categories.includes(category)} onChange={() => toggleCategory(category)} className="h-4 w-4 accent-gold" />{category}</span></label>)}</div>
      </FilterSection>
      <FilterSection title="Price Range">
        <div className="space-y-4"><div className="flex items-center justify-between font-mono text-sm text-forest"><span>₹{filters.minPrice}</span><span>₹{filters.maxPrice}</span></div><div className="relative h-5"><input aria-label="Minimum price" type="range" min="0" max="2000" step="50" value={filters.minPrice} onChange={(event) => setFilters((current) => ({ ...current, minPrice: Math.min(Number(event.target.value), current.maxPrice - 50) }))} className="absolute inset-0 z-20 w-full accent-gold" /><input aria-label="Maximum price" type="range" min="0" max="2000" step="50" value={filters.maxPrice} onChange={(event) => setFilters((current) => ({ ...current, maxPrice: Math.max(Number(event.target.value), current.minPrice + 50) }))} className="absolute inset-0 z-10 w-full accent-gold" /></div></div>
      </FilterSection>
      <FilterSection title="Ratings">
        <div className="space-y-3">{[[4, '4★+'], [3, '3★+'], [0, 'All ratings']].map(([value, label]) => <label key={label} className="flex cursor-pointer items-center gap-3 text-sm text-forest/75"><input type="radio" name="rating-filter" checked={filters.rating === value} onChange={() => setFilters((current) => ({ ...current, rating: value }))} className="h-4 w-4 accent-gold" />{label}</label>)}</div>
      </FilterSection>
      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center justify-between text-sm text-forest/75"><span>In Stock Only</span><button type="button" role="switch" aria-checked={filters.inStock} onClick={() => setFilters((current) => ({ ...current, inStock: !current.inStock }))} className={`${filters.inStock ? 'bg-gold' : 'bg-forest/20'} relative h-6 w-11 rounded-full transition-colors`}><span className={`${filters.inStock ? 'translate-x-6' : 'translate-x-1'} absolute top-1 left-0 h-4 w-4 rounded-full bg-white transition-transform`} /></button></label>
      </FilterSection>
    </div>
  );
};

const parseInitialFilters = (params) => ({
  categories: params.get('category') ? params.get('category').split(',') : [],
  minPrice: Number(params.get('minPrice')) || 0,
  maxPrice: Number(params.get('maxPrice')) || 2000,
  rating: Number(params.get('rating')) || 0,
  inStock: params.get('inStock') === 'true',
  sort: params.get('sort') || 'relevance',
});

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => parseInitialFilters(searchParams));
  const [availableCategories, setAvailableCategories] = useState([]);
  const [view, setView] = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const search = searchParams.get('search') || '';

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setAvailableCategories(data.data || []))
      .catch(console.error);
  }, []);

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach((cat) => params.append('categories', cat));
      }
      params.append('minPrice', filters.minPrice);
      params.append('maxPrice', filters.maxPrice);
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.sort !== 'relevance') params.append('sort', filters.sort);
      params.append('page', page - 1); // backend is 0-indexed
      params.append('size', 12);

      const { data } = await api.get(`/products/search?${params.toString()}`);
      const raw = data?.data;
      if (Array.isArray(raw)) {
        setProducts(raw);
        setTotalProducts(raw.length);
      } else if (raw?.content) {
        setProducts(raw.content);
        setTotalProducts(raw.totalElements ?? raw.content.length);
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  }, [filters, search, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (filters.categories.length) nextParams.set('category', filters.categories.join(','));
    if (search) nextParams.set('search', search);
    if (filters.minPrice > 0) nextParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice < 2000) nextParams.set('maxPrice', filters.maxPrice);
    if (filters.rating) nextParams.set('rating', filters.rating);
    if (filters.inStock) nextParams.set('inStock', 'true');
    if (filters.sort !== 'relevance') nextParams.set('sort', filters.sort);
    setSearchParams(nextParams, { replace: true });
    setPage(1);
  }, [filters, search, setSearchParams]);

  const pageCount = Math.max(1, Math.ceil(totalProducts / 12));
  const visibleProducts = products;

  const clearFilters = () => setFilters({ categories: [], minPrice: 0, maxPrice: 2000, rating: 0, inStock: false, sort: 'relevance' });
  const removeCategory = (category) => setFilters((current) => ({ ...current, categories: current.categories.filter((item) => item !== category) }));
  const activeChips = [...filters.categories.map((category) => ({ label: category, remove: () => removeCategory(category) })), ...(filters.minPrice > 0 || filters.maxPrice < 2000 ? [{ label: `₹${filters.minPrice} - ₹${filters.maxPrice}`, remove: () => setFilters((current) => ({ ...current, minPrice: 0, maxPrice: 2000 })) }] : []), ...(filters.rating ? [{ label: `${filters.rating}★+`, remove: () => setFilters((current) => ({ ...current, rating: 0 })) }] : []), ...(filters.inStock ? [{ label: 'In stock', remove: () => setFilters((current) => ({ ...current, inStock: false })) }] : []), ...(search ? [{ label: `Search: ${search}`, remove: () => { const next = new URLSearchParams(searchParams); next.delete('search'); setSearchParams(next); } }] : [])];

  return (
    <PageWrapper>
      <div className="min-h-screen bg-cream"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">The Vilora collection</p><h1 className="mt-2 font-display text-5xl font-semibold text-forest">Shop Organic Essentials</h1><p className="mt-2 max-w-xl text-forest/65">Thoughtfully sourced staples for a more grounded everyday.</p></div>
        <div className="flex items-center justify-between border-b border-gold/20 pb-4 lg:hidden"><span className="font-semibold text-forest">{totalProducts} products</span><Button variant="secondary" size="sm" onClick={() => setMobileFiltersOpen(true)}><FiFilter /> Filter &amp; Sort</Button></div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="hidden lg:block"><div className="sticky top-24 rounded-xl border border-gold/20 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-display text-2xl font-semibold text-forest">Filter Products</h2><FiSliders className="text-gold" aria-hidden="true" /></div><FilterContent filters={filters} setFilters={setFilters} categories={availableCategories} /><button type="button" onClick={clearFilters} className="mt-4 text-sm font-semibold text-gold underline-offset-4 hover:underline">Clear All Filters</button></div></aside>
          <section aria-label="Product results"><div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div className="min-w-0"><p className="text-sm text-forest/65">Showing {visibleProducts.length ? (page - 1) * 12 + 1 : 0}-{Math.min(page * 12, totalProducts)} of {totalProducts} products</p><div className="mt-3 flex flex-wrap gap-2">{activeChips.map((chip) => <span key={chip.label} className="inline-flex items-center gap-2 rounded-pill border border-gold/50 px-3 py-1 text-xs text-forest">{chip.label}<button type="button" aria-label={`Remove ${chip.label} filter`} onClick={chip.remove}><FiX /></button></span>)}</div></div><div className="flex flex-wrap items-center gap-2"><div className="flex rounded-lg border border-gold/30 bg-white p-1"><button type="button" aria-label="Grid view" onClick={() => setView('grid')} className={`rounded-md p-2 ${view === 'grid' ? 'bg-pale-gold text-forest' : 'text-forest/50'}`}><FiGrid /></button><button type="button" aria-label="List view" onClick={() => setView('list')} className={`rounded-md p-2 ${view === 'list' ? 'bg-pale-gold text-forest' : 'text-forest/50'}`}><FiList /></button></div><label className="flex items-center gap-2 text-sm text-forest/65"><span className="sr-only">Sort products</span><select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))} className="rounded-lg border border-gold/30 bg-white px-3 py-2 text-forest outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"><option value="relevance">Relevance</option><option value="price-asc">Price ↑</option><option value="price-desc">Price ↓</option><option value="newest">Newest</option><option value="top-rated">Top Rated</option></select></label></div></div>
            {visibleProducts.length ? <div className={view === 'grid' ? 'mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'mt-8 grid gap-6'}>{visibleProducts.map((product) => <ProductCard key={product.id} product={product} layout={view} />)}</div> : <div className="mt-10 flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-gold/30 bg-white/50 px-6 text-center"><svg className="h-20 w-20 text-gold" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M58 14C37 17 23 29 24 45c1 13 12 20 23 16-3-9-1-19 8-28-3 8-3 16 0 24 10-7 15-21 3-43Z" stroke="currentColor" strokeWidth="2" /><path d="M24 63c8-13 15-20 31-30" stroke="currentColor" strokeWidth="2" /></svg><h2 className="mt-5 font-display text-3xl font-semibold text-forest">No products found</h2><p className="mt-2 text-forest/65">Try adjusting your filters</p><Button className="mt-6" onClick={clearFilters}>Clear Filters</Button></div>}
            {pageCount > 1 && <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-gold/30 bg-white p-2 text-forest disabled:opacity-40" aria-label="Previous page"><FiChevronLeft /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button type="button" key={pageNumber} onClick={() => setPage(pageNumber)} className={`h-10 w-10 rounded-lg font-semibold ${page === pageNumber ? 'bg-gold text-forest-deep' : 'border border-gold/30 bg-white text-forest hover:bg-pale-gold'}`}>{pageNumber}</button>)}<button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-gold/30 bg-white p-2 text-forest disabled:opacity-40" aria-label="Next page"><FiChevronRight /></button></nav>}
          </section>
        </div>
      </div></div>
      {mobileFiltersOpen && <div className="fixed inset-0 z-[60] bg-forest-deep/50 lg:hidden" role="presentation" onClick={() => setMobileFiltersOpen(false)}><div className="fixed inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-label="Filter and sort products" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="font-display text-2xl font-semibold text-forest">Filter Products</h2><button type="button" onClick={() => setMobileFiltersOpen(false)} className="rounded-full p-2 text-forest hover:bg-sage" aria-label="Close filters"><FiX className="text-xl" /></button></div><FilterContent filters={filters} setFilters={setFilters} categories={availableCategories} /><div className="mt-4 grid grid-cols-2 gap-3"><Button variant="secondary" onClick={clearFilters}>Clear All</Button><Button onClick={() => setMobileFiltersOpen(false)}>Apply</Button></div></div></div>}
    </PageWrapper>
  );
};

export default Shop;
