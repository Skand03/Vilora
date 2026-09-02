import React, { useEffect, useMemo, useState } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiFilter, FiGrid, FiList, FiSliders, FiX } from 'react-icons/fi';
import { PageWrapper, ProductCard, Button } from '../components';
import { useSearchParams } from 'react-router-dom';

const categoryNames = ['Dry Fruits', 'Herbs & Spices', 'Oils & Ghee', 'Superfoods', 'Teas', 'Gift Sets'];
const categoryCounts = { 'Dry Fruits': 4, 'Herbs & Spices': 3, 'Oils & Ghee': 3, Superfoods: 3, Teas: 3, 'Gift Sets': 2 };
const imageUrls = [
  'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
];

const productSeed = [
  ['Himalayan Almonds', 'Dry Fruits', 649, 799, 4.8], ['Kashmiri Walnuts', 'Dry Fruits', 749, 899, 4.7], ['Royal Pistachios', 'Dry Fruits', 699, 849, 4.9], ['Organic Cashews', 'Dry Fruits', 599, 699, 4.6],
  ['Golden Turmeric Powder', 'Herbs & Spices', 249, 299, 4.8], ['Ceylon Cinnamon', 'Herbs & Spices', 329, 399, 4.7], ['Black Pepper Whole', 'Herbs & Spices', 279, 349, 4.6],
  ['Cold Pressed Coconut Oil', 'Oils & Ghee', 389, 449, 4.7], ['A2 Cow Ghee', 'Oils & Ghee', 899, 999, 4.9], ['Virgin Sesame Oil', 'Oils & Ghee', 449, 529, 4.5],
  ['Moringa Leaf Powder', 'Superfoods', 299, 349, 4.6], ['Raw Cacao Nibs', 'Superfoods', 549, 649, 4.8], ['Chia Seed Pantry Pack', 'Superfoods', 329, 399, 4.7],
  ['Rose Green Tea', 'Teas', 429, 499, 4.7], ['Masala Chai Leaves', 'Teas', 349, 399, 4.6], ['Calm Chamomile Tea', 'Teas', 399, 479, 4.8],
  ['Daily Wellness Box', 'Gift Sets', 1199, 1399, 4.8], ['Nourish & Glow Set', 'Gift Sets', 1499, 1699, 4.9],
];
const products = productSeed.map(([name, category, price, originalPrice, rating], index) => ({ id: index + 1, name, category, price, originalPrice, discount: Math.round((1 - price / originalPrice) * 100), rating, reviewCount: 24 + index * 9, description: `Carefully sourced ${category.toLowerCase()} for your daily ritual.`, image: imageUrls[index % imageUrls.length], isOrganic: true, inStock: index !== 10 }));

const parseInitialFilters = (params) => ({
  categories: params.get('category') ? params.get('category').split(',').filter((category) => categoryNames.includes(category)) : [],
  minPrice: Number(params.get('minPrice')) || 0,
  maxPrice: Number(params.get('maxPrice')) || 2000,
  rating: Number(params.get('rating')) || 0,
  inStock: params.get('inStock') === 'true',
  sort: params.get('sort') || 'relevance',
});

const FilterSection = ({ title, children, defaultOpen = true }) => (
  <Disclosure as="section" defaultOpen={defaultOpen} className="border-b border-gold/15 py-5 last:border-0">
    <DisclosureButton className="flex w-full items-center justify-between text-left font-semibold text-forest"><span>{title}</span><FiChevronDown className="ui-open:rotate-180 transition-transform" aria-hidden="true" /></DisclosureButton>
    <DisclosurePanel className="pt-4">{children}</DisclosurePanel>
  </Disclosure>
);

const FilterContent = ({ filters, setFilters }) => {
  const toggleCategory = (category) => setFilters((current) => ({ ...current, categories: current.categories.includes(category) ? current.categories.filter((item) => item !== category) : [...current.categories, category] }));
  return (
    <div>
      <FilterSection title="Categories">
        <div className="space-y-3">{categoryNames.map((category) => <label key={category} className="flex cursor-pointer items-center justify-between gap-3 text-sm text-forest/75"><span className="flex items-center gap-3"><input type="checkbox" checked={filters.categories.includes(category)} onChange={() => toggleCategory(category)} className="h-4 w-4 accent-gold" />{category}</span><span className="text-xs text-forest/50">{categoryCounts[category]}</span></label>)}</div>
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

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => parseInitialFilters(searchParams));
  const [view, setView] = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const search = searchParams.get('search') || '';

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

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    const result = products.filter((product) => (!filters.categories.length || filters.categories.includes(product.category)) && product.price >= filters.minPrice && product.price <= filters.maxPrice && (!filters.rating || product.rating >= filters.rating) && (!filters.inStock || product.inStock) && (!normalizedSearch || `${product.name} ${product.category}`.toLowerCase().includes(normalizedSearch)));
    return [...result].sort((a, b) => filters.sort === 'price-asc' ? a.price - b.price : filters.sort === 'price-desc' ? b.price - a.price : filters.sort === 'newest' ? b.id - a.id : filters.sort === 'top-rated' ? b.rating - a.rating : a.id - b.id);
  }, [filters, search]);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / 12));
  const visibleProducts = filteredProducts.slice((page - 1) * 12, page * 12);

  const clearFilters = () => setFilters({ categories: [], minPrice: 0, maxPrice: 2000, rating: 0, inStock: false, sort: 'relevance' });
  const removeCategory = (category) => setFilters((current) => ({ ...current, categories: current.categories.filter((item) => item !== category) }));
  const activeChips = [...filters.categories.map((category) => ({ label: category, remove: () => removeCategory(category) })), ...(filters.minPrice > 0 || filters.maxPrice < 2000 ? [{ label: `₹${filters.minPrice} - ₹${filters.maxPrice}`, remove: () => setFilters((current) => ({ ...current, minPrice: 0, maxPrice: 2000 })) }] : []), ...(filters.rating ? [{ label: `${filters.rating}★+`, remove: () => setFilters((current) => ({ ...current, rating: 0 })) }] : []), ...(filters.inStock ? [{ label: 'In stock', remove: () => setFilters((current) => ({ ...current, inStock: false })) }] : []), ...(search ? [{ label: `Search: ${search}`, remove: () => { const next = new URLSearchParams(searchParams); next.delete('search'); setSearchParams(next); } }] : [])];

  return (
    <PageWrapper>
      <div className="min-h-screen bg-cream"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">The Vilora collection</p><h1 className="mt-2 font-display text-5xl font-semibold text-forest">Shop Organic Essentials</h1><p className="mt-2 max-w-xl text-forest/65">Thoughtfully sourced staples for a more grounded everyday.</p></div>
        <div className="flex items-center justify-between border-b border-gold/20 pb-4 lg:hidden"><span className="font-semibold text-forest">{filteredProducts.length} products</span><Button variant="secondary" size="sm" onClick={() => setMobileFiltersOpen(true)}><FiFilter /> Filter &amp; Sort</Button></div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="hidden lg:block"><div className="sticky top-24 rounded-xl border border-gold/20 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-display text-2xl font-semibold text-forest">Filter Products</h2><FiSliders className="text-gold" aria-hidden="true" /></div><FilterContent filters={filters} setFilters={setFilters} /><button type="button" onClick={clearFilters} className="mt-4 text-sm font-semibold text-gold underline-offset-4 hover:underline">Clear All Filters</button></div></aside>
          <section aria-label="Product results"><div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div className="min-w-0"><p className="text-sm text-forest/65">Showing {visibleProducts.length ? (page - 1) * 12 + 1 : 0}-{Math.min(page * 12, filteredProducts.length)} of {filteredProducts.length} products</p><div className="mt-3 flex flex-wrap gap-2">{activeChips.map((chip) => <span key={chip.label} className="inline-flex items-center gap-2 rounded-pill border border-gold/50 px-3 py-1 text-xs text-forest">{chip.label}<button type="button" aria-label={`Remove ${chip.label} filter`} onClick={chip.remove}><FiX /></button></span>)}</div></div><div className="flex flex-wrap items-center gap-2"><div className="flex rounded-lg border border-gold/30 bg-white p-1"><button type="button" aria-label="Grid view" onClick={() => setView('grid')} className={`rounded-md p-2 ${view === 'grid' ? 'bg-pale-gold text-forest' : 'text-forest/50'}`}><FiGrid /></button><button type="button" aria-label="List view" onClick={() => setView('list')} className={`rounded-md p-2 ${view === 'list' ? 'bg-pale-gold text-forest' : 'text-forest/50'}`}><FiList /></button></div><label className="flex items-center gap-2 text-sm text-forest/65"><span className="sr-only">Sort products</span><select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))} className="rounded-lg border border-gold/30 bg-white px-3 py-2 text-forest outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"><option value="relevance">Relevance</option><option value="price-asc">Price ↑</option><option value="price-desc">Price ↓</option><option value="newest">Newest</option><option value="top-rated">Top Rated</option></select></label></div></div>
            {visibleProducts.length ? <div className={view === 'grid' ? 'mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'mt-8 grid gap-6'}>{visibleProducts.map((product) => <ProductCard key={product.id} product={product} layout={view} />)}</div> : <div className="mt-10 flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-gold/30 bg-white/50 px-6 text-center"><svg className="h-20 w-20 text-gold" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M58 14C37 17 23 29 24 45c1 13 12 20 23 16-3-9-1-19 8-28-3 8-3 16 0 24 10-7 15-21 3-43Z" stroke="currentColor" strokeWidth="2" /><path d="M24 63c8-13 15-20 31-30" stroke="currentColor" strokeWidth="2" /></svg><h2 className="mt-5 font-display text-3xl font-semibold text-forest">No products found</h2><p className="mt-2 text-forest/65">Try adjusting your filters</p><Button className="mt-6" onClick={clearFilters}>Clear Filters</Button></div>}
            {pageCount > 1 && <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-gold/30 bg-white p-2 text-forest disabled:opacity-40" aria-label="Previous page"><FiChevronLeft /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button type="button" key={pageNumber} onClick={() => setPage(pageNumber)} className={`h-10 w-10 rounded-lg font-semibold ${page === pageNumber ? 'bg-gold text-forest-deep' : 'border border-gold/30 bg-white text-forest hover:bg-pale-gold'}`}>{pageNumber}</button>)}<button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-gold/30 bg-white p-2 text-forest disabled:opacity-40" aria-label="Next page"><FiChevronRight /></button></nav>}
          </section>
        </div>
      </div></div>
      {mobileFiltersOpen && <div className="fixed inset-0 z-[60] bg-forest-deep/50 lg:hidden" role="presentation" onClick={() => setMobileFiltersOpen(false)}><div className="fixed inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-label="Filter and sort products" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="font-display text-2xl font-semibold text-forest">Filter Products</h2><button type="button" onClick={() => setMobileFiltersOpen(false)} className="rounded-full p-2 text-forest hover:bg-sage" aria-label="Close filters"><FiX className="text-xl" /></button></div><FilterContent filters={filters} setFilters={setFilters} /><div className="mt-4 grid grid-cols-2 gap-3"><Button variant="secondary" onClick={clearFilters}>Clear All</Button><Button onClick={() => setMobileFiltersOpen(false)}>Apply</Button></div></div></div>}
    </PageWrapper>
  );
};

export default Shop;
