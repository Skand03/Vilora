import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiMinus, FiPlus, FiTruck, FiX, FiZoomIn } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import toast from 'react-hot-toast';
import { Badge, Button, PageWrapper, ProductCard, StarRating } from '../components';
import useCartStore from '../store/useCartStore';
import useWishlistStore from '../store/useWishlistStore';
import api from '../api';
import 'swiper/css';

const detailProducts = [
  { id: '1', name: 'Himalayan Almonds', category: 'Dry Fruits', price: 649, originalPrice: 799, rating: 4.8, reviewCount: 312, description: 'Handpicked Himalayan almonds with a naturally creamy crunch. Soaked, roasted, or enjoyed straight from the pouch, they bring clean nourishment to every part of your day.', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=1000&q=85', gallery: ['https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1574570162654-1e3b1e8d4c2c?auto=format&fit=crop&w=800&q=85', 'https://images.unsplash.com/photo-1599599810694-b5acdd5d5b8d?auto=format&fit=crop&w=800&q=85', 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=800&q=85'], isOrganic: true, inStock: true, ingredients: '100% premium Himalayan almonds.', nutrition: ['Protein: 21g', 'Healthy fats: 49g', 'Dietary fibre: 12g', 'No added sugar or preservatives'] },
  { id: '2', name: 'Wild Forest Honey', category: 'Superfoods', price: 499, originalPrice: 599, rating: 4.9, reviewCount: 278, description: 'Raw, unfiltered honey gathered from wild forest blossoms. Bottled in small batches to preserve its floral aroma, golden colour, and naturally rich character.', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=85', gallery: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=85', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=85', 'https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?auto=format&fit=crop&w=800&q=85'], isOrganic: true, inStock: true, ingredients: '100% raw multifloral honey.', nutrition: ['Energy: 304 kcal', 'Natural sugars: 82g', 'Raw and unfiltered', 'No artificial additives'] },
  { id: '3', name: 'Cold Pressed Coconut Oil', category: 'Oils & Ghee', price: 389, originalPrice: 449, rating: 4.7, reviewCount: 196, description: 'Virgin coconut oil pressed fresh without heat or solvents. A versatile pantry essential with a soft aroma and a silky finish for cooking and self-care.', image: 'https://images.unsplash.com/photo-1608571423539-e951a2bfc1f9?auto=format&fit=crop&w=1000&q=85', gallery: ['https://images.unsplash.com/photo-1608571423539-e951a2bfc1f9?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=85', 'https://images.unsplash.com/photo-1611073761764-7d9e3f1a5a1f?auto=format&fit=crop&w=800&q=85', 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=800&q=85'], isOrganic: true, inStock: true, ingredients: '100% cold pressed virgin coconut oil.', nutrition: ['Healthy fats: 100g', 'Zero trans fats', 'Unrefined and unbleached', 'Naturally aromatic'] },
];

const relatedProducts = detailProducts.map((product, index) => ({ ...product, id: product.id, discount: Math.round((1 - product.price / product.originalPrice) * 100), reviewCount: product.reviewCount, description: `Carefully sourced ${product.category.toLowerCase()} for your daily ritual.` })).concat([
  { id: '4', name: 'Golden Turmeric Powder', category: 'Herbs & Spices', price: 249, originalPrice: 299, discount: 17, rating: 4.8, reviewCount: 142, description: 'Sun-dried Lakadong turmeric with vibrant warmth.', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80', isOrganic: true, inStock: true },
]);

const reviewsSeed = [
  { name: 'Meera Shah', date: '28 Aug 2026', text: 'The almonds are plump, fresh, and have a lovely clean crunch. The packaging felt thoughtful too.', rating: 5 },
  { name: 'Arjun Rao', date: '19 Aug 2026', text: 'A pantry staple now. I appreciate knowing exactly where my everyday ingredients come from.', rating: 5 },
  { name: 'Kavya Iyer', date: '06 Aug 2026', text: 'Beautiful quality and fast delivery. The flavour is noticeably better than supermarket packs.', rating: 4 },
];

const weightOptions = ['100g', '250g', '500g', '1kg'];
const tabNames = ['Description', 'Nutrition Info', 'Reviews', 'Shipping'];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        const p = data.data;
        setProduct({
          ...p,
          gallery: (p.gallery && p.gallery.length) ? p.gallery : (p.images && p.images.length ? p.images : [p.image || 'https://via.placeholder.com/800']),
          ingredients: p.ingredients || '100% natural single-origin ingredients.',
          nutrition: p.nutrition 
            ? (Array.isArray(p.nutrition) ? p.nutrition : p.nutrition.split(',').map((s) => s.trim()))
            : ['Natural energy: 320 kcal', 'Zero artificial additives', 'High dietary fiber'],
        });
      } catch (error) {
        console.error('Error fetching product', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/products/${id}/reviews`);
        if (data.data && data.data.length > 0) {
          setReviews(data.data);
        }
      } catch (err) {
        console.error('Failed to load reviews', err);
      }
    };

    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState('250g');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState(reviewsSeed);
  const addItem = useCartStore((state) => state.addItem);
  const addToWishlist = useWishlistStore((state) => state.addItem);
  const removeFromWishlist = useWishlistStore((state) => state.removeItem);
  const isWishlisted = useWishlistStore((state) => state.items.some((item) => item.productId === id));
  
  if (loading) {
    return <PageWrapper><div className="min-h-screen flex items-center justify-center">Loading...</div></PageWrapper>;
  }
  if (!product) {
    return <PageWrapper><div className="min-h-screen flex items-center justify-center">Product not found.</div></PageWrapper>;
  }

  const discount = Math.round((1 - product.price / product.originalPrice) * 100) || 0;
  const variantPrice = Math.round(product.price * ({ '100g': 0.48, '250g': 1, '500g': 1.82, '1kg': 3.35 }[selectedWeight] || 1));
  const cartProduct = { ...product, id: product.id, name: `${product.name} (${selectedWeight})`, variant: selectedWeight, price: variantPrice, discount };

  const checkDelivery = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setDeliveryDate(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
    toast.success('Pincode is serviceable! 3-day Blue Dart express delivery available.');
  };

  const addToCart = () => { addItem(cartProduct, quantity); toast.success(`${product.name} added to cart`); };
  const buyNow = () => { addItem(cartProduct, quantity); navigate('/checkout'); };
  const toggleWishlist = () => { if (isWishlisted) { removeFromWishlist(product.id); toast.success('Removed from wishlist'); } else { addToWishlist(product); toast.success('Added to wishlist'); } };
  const submitReview = async (event) => {
    event.preventDefault();
    if (!reviewText.trim()) {
      toast.error('Please add a review before submitting.');
      return;
    }
    try {
      const { data } = await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewText.trim()
      });
      setReviews((current) => [data.data, ...current]);
      setReviewText('');
      toast.success('Thank you for sharing your review.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <PageWrapper>
      <div className="bg-cream"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-forest/55" aria-label="Breadcrumb"><Link to="/" className="hover:text-gold">Home</Link><span className="text-gold">›</span><Link to="/shop" className="hover:text-gold">Shop</Link><span className="text-gold">›</span><Link to={`/shop?category=${encodeURIComponent(product.categoryName || product.category || 'Dry Fruits')}`} className="hover:text-gold">{product.categoryName || product.category || 'Dry Fruits'}</Link><span className="text-gold">›</span><span className="text-forest">{product.name}</span></nav>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <section aria-label="Product images"><div className="group relative h-[400px] overflow-hidden rounded-xl border border-gold/20 bg-white sm:h-[480px]"><img src={product.gallery[activeImage]} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><button type="button" aria-label="Zoom product image" onClick={() => setLightboxOpen(true)} className="absolute right-4 top-4 rounded-full bg-white/90 p-3 text-forest shadow-sm transition-colors hover:bg-gold hover:text-forest-deep"><FiZoomIn /></button><Badge variant="organic" className="absolute left-4 top-4">Organic</Badge></div><div className="mt-4 grid grid-cols-4 gap-3">{product.gallery.map((image, index) => <button type="button" key={image} onClick={() => setActiveImage(index)} className={`h-20 overflow-hidden rounded-lg border-2 bg-white ${activeImage === index ? 'border-gold ring-2 ring-gold/20' : 'border-transparent'}`}><img src={image} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-cover" /></button>)}</div></section>
          <section><Badge variant="organic">Organic Certified</Badge><h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-forest">{product.name}</h1><div className="mt-4 flex flex-wrap items-center gap-3"><StarRating rating={product.rating} showCount={false} /><a href="#reviews" className="text-sm text-forest/60 underline decoration-gold underline-offset-4">({product.reviewCount} reviews)</a></div><div className="mt-6 flex flex-wrap items-center gap-3"><span className="font-mono text-3xl font-semibold text-gold">₹{variantPrice}</span><span className="font-mono text-base text-forest/45 line-through">₹{product.originalPrice}</span><Badge variant="stock">Save {discount}%</Badge></div><p className="mt-6 max-w-xl leading-7 text-forest/70">{product.description}</p><div className="mt-7"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-forest">Weight / Size</p><div className="flex flex-wrap gap-2">{weightOptions.map((weight) => <button type="button" key={weight} onClick={() => setSelectedWeight(weight)} className={`rounded-lg px-5 py-3 text-sm font-semibold transition-colors ${selectedWeight === weight ? 'bg-gold text-forest-deep' : 'border border-gold text-gold hover:bg-pale-gold'}`}>{weight}</button>)}</div></div><div className="mt-7 flex items-center gap-4"><span className="text-sm font-semibold text-forest">Quantity</span><div className="flex items-center rounded-lg border border-gold/40 ring-2 ring-gold/10"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="p-3 text-forest hover:text-gold"><FiMinus /></button><input aria-label="Quantity" type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} className="w-12 border-0 bg-transparent text-center font-mono text-forest outline-none" /><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 1)} className="p-3 text-forest hover:text-gold"><FiPlus /></button></div></div><div className="mt-8 grid gap-3"><Button size="lg" onClick={addToCart}>Add to Cart</Button><div className="grid gap-3 sm:grid-cols-2"><Button variant="secondary" onClick={toggleWishlist}>{isWishlisted ? <FaHeart className="text-red-500 fill-red-500 mr-2 text-lg" /> : <FaRegHeart className="mr-2 text-lg" />} {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</Button><Button className="bg-forest text-white hover:bg-forest-deep" onClick={buyNow}>Buy Now</Button></div></div><div className="mt-8 grid grid-cols-1 gap-3 border-y border-gold/20 py-5 text-sm text-forest/70 sm:grid-cols-3"><span>🛡️ Quality Assured</span><span>🌿 100% Organic</span><span>🚚 Free above ₹499</span></div><form onSubmit={checkDelivery} className="mt-6"><p className="mb-2 text-sm font-semibold text-forest">Delivery Estimator</p><div className="flex gap-2"><label htmlFor="pincode" className="sr-only">Pincode</label><input id="pincode" inputMode="numeric" maxLength="6" value={pincode} onChange={(event) => setPincode(event.target.value.replace(/\D/g, ''))} placeholder="Enter pincode" className="min-w-0 flex-1 rounded-lg border border-gold/30 bg-white px-4 py-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" /><Button type="submit" variant="secondary">Check</Button></div>{deliveryDate && <p className="mt-3 flex items-center gap-2 text-sm text-forest"><FiTruck className="text-gold" />Delivered by {deliveryDate} via Blue Dart</p>}</form></section>
        </div>

        <section className="mt-16 border-t border-gold/20 pt-8"><div className="flex gap-6 overflow-x-auto border-b border-gold/20" role="tablist">{tabNames.map((tab) => <button type="button" role="tab" aria-selected={activeTab === tab} key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-semibold transition-colors ${activeTab === tab ? 'border-gold text-gold' : 'border-transparent text-forest/55 hover:text-forest'}`}>{tab}</button>)}</div><div className="py-8">{activeTab === 'Description' && <div className="grid gap-8 md:grid-cols-2"><div><h2 className="font-display text-3xl font-semibold text-forest">Pure by nature, considered by us</h2><ul className="mt-5 space-y-3 text-forest/70">{['Single-origin ingredients selected for freshness', 'Small-batch packed to protect natural flavour', 'No artificial colours, fillers, or preservatives', 'Sustainably sourced from trusted grower communities'].map((point) => <li key={point} className="flex gap-3"><span className="mt-1 text-gold">✓</span>{point}</li>)}</ul></div><div className="rounded-xl border border-gold/20 bg-white p-6"><h3 className="font-display text-2xl font-semibold text-forest">Ingredients</h3><p className="mt-3 text-forest/70">{product.ingredients}</p></div></div>}{activeTab === 'Nutrition Info' && <div className="max-w-xl rounded-xl border border-gold/20 bg-white p-6"><h2 className="font-display text-3xl font-semibold text-forest">Nutrition at a glance</h2><ul className="mt-5 grid gap-3 sm:grid-cols-2">{product.nutrition.map((item) => <li key={item} className="border-b border-gold/15 pb-3 text-forest/70">{item}</li>)}</ul></div>}{activeTab === 'Shipping' && <div className="max-w-2xl text-forest/70"><h2 className="font-display text-3xl font-semibold text-forest">Simple, careful delivery</h2><p className="mt-4 leading-7">Orders are packed within 1–2 working days and delivered across India in 3–7 working days. Shipping is free on orders above ₹499. Every parcel is sealed to arrive fresh and ready for your ritual.</p></div>}{activeTab === 'Reviews' && <div id="reviews" className="scroll-mt-24"><div className="grid gap-8 lg:grid-cols-[18rem_1fr]"><div><h2 className="font-display text-3xl font-semibold text-forest">Customer reviews</h2><div className="mt-4 flex items-center gap-3"><span className="font-display text-5xl text-forest">{product.rating}</span><div><StarRating rating={product.rating} showCount={false} /><p className="mt-1 text-sm text-forest/60">Based on {product.reviewCount} reviews</p></div></div><div className="mt-6 space-y-2">{[[5, 82], [4, 12], [3, 4], [2, 1], [1, 1]].map(([star, percent]) => <div key={star} className="flex items-center gap-2 text-xs text-forest/60"><span className="w-3">{star}</span><div className="h-2 flex-1 rounded-full bg-sage"><div className="h-2 rounded-full bg-gold" style={{ width: `${percent}%` }} /></div><span className="w-8 text-right">{percent}%</span></div>)}</div></div><div className="space-y-4">{reviews.map((review, index) => <article key={`${review.name}-${index}`} className="rounded-xl border border-gold/20 bg-white p-5"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pale-gold font-semibold text-forest">{review.name.split(' ').map((part) => part[0]).join('')}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-forest">{review.name}</p><time className="text-xs text-forest/50">{review.date}</time></div><StarRating rating={review.rating} showCount={false} size="sm" /><p className="mt-3 text-sm leading-6 text-forest/70">{review.text}</p></div></div></article>)}<details className="rounded-xl border border-gold/20 bg-white p-5"><summary className="cursor-pointer font-semibold text-gold">Write a Review</summary><form onSubmit={submitReview} className="mt-5 space-y-4"><div><p className="mb-2 text-sm font-semibold text-forest">Your rating</p><div className="flex gap-2">{[1, 2, 3, 4, 5].map((rating) => <button type="button" key={rating} aria-label={`${rating} stars`} onClick={() => setReviewRating(rating)} className={rating <= reviewRating ? 'text-gold' : 'text-forest/20'}><FaStar /></button>)}</div></div><textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} rows="4" placeholder="Tell us about your experience" className="w-full rounded-lg border border-gold/30 p-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" /><Button type="submit">Submit Review</Button></form></details></div></div></div>}</div></section>

        <section className="mt-16 border-t border-gold/20 pt-12"><div className="flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Complete your ritual</p><h2 className="mt-2 font-display text-4xl font-semibold text-forest">You May Also Like</h2></div><div className="hidden gap-2 sm:flex"><button type="button" className="related-prev rounded-full border border-gold/30 p-2 text-forest hover:bg-pale-gold" aria-label="Previous related products"><FiChevronLeft /></button><button type="button" className="related-next rounded-full border border-gold/30 p-2 text-forest hover:bg-pale-gold" aria-label="Next related products"><FiChevronRight /></button></div></div><Swiper modules={[Autoplay, Navigation]} autoplay={{ delay: 5000, disableOnInteraction: false }} navigation={{ prevEl: '.related-prev', nextEl: '.related-next' }} spaceBetween={20} slidesPerView={1.5} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }} className="mt-8 !pb-2">{relatedProducts.map((item) => <SwiperSlide key={item.id}><ProductCard product={item} /></SwiperSlide>)}</Swiper></section>
      </div></div>
      <Dialog open={lightboxOpen} onClose={setLightboxOpen} className="relative z-[70]"><div className="fixed inset-0 bg-forest-deep/90" aria-hidden="true" /><div className="fixed inset-0 flex items-center justify-center p-4"><DialogPanel className="relative max-h-full max-w-5xl overflow-hidden rounded-xl bg-white p-2"><DialogTitle className="sr-only">{product.name} enlarged image</DialogTitle><button type="button" onClick={() => setLightboxOpen(false)} className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 text-forest shadow" aria-label="Close image lightbox"><FiX /></button><img src={product.gallery[activeImage]} alt={product.name} className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain" /></DialogPanel></div></Dialog>
    </PageWrapper>
  );
};

export default ProductDetail;
