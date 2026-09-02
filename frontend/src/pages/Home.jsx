import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { FaFlask, FaLeaf, FaQuoteLeft, FaShippingFast } from 'react-icons/fa';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import toast from 'react-hot-toast';
import { PageWrapper, ProductCard, Button, Badge, StarRating } from '../components';
import 'swiper/css';
import 'swiper/css/pagination';

const categories = [
  { name: 'Dry Fruits', image: 'https://images.unsplash.com/photo-1599599810694-b5acdd5d5b8d?auto=format&fit=crop&w=320&q=80' },
  { name: 'Herbs & Spices', image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=320&q=80' },
  { name: 'Oils & Ghee', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=320&q=80' },
  { name: 'Superfoods', image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=320&q=80' },
  { name: 'Teas', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=320&q=80' },
  { name: 'Gift Sets', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=320&q=80' },
];

const products = [
  { id: 1, name: 'Himalayan Almonds', description: 'Crunchy, naturally sweet and rich in good fats.', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80', price: 649, originalPrice: 799, discount: 19, rating: 4.8, reviewCount: 124, isOrganic: true, inStock: true },
  { id: 2, name: 'Wild Forest Honey', description: 'Raw, unfiltered honey gathered from wild blossoms.', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', price: 499, originalPrice: 599, discount: 17, rating: 4.9, reviewCount: 98, isOrganic: true, inStock: true },
  { id: 3, name: 'Cold Pressed Coconut Oil', description: 'Virgin coconut oil pressed fresh for everyday rituals.', image: 'https://images.unsplash.com/photo-1608571423539-e951a2bfc1f9?auto=format&fit=crop&w=600&q=80', price: 389, originalPrice: 449, discount: 13, rating: 4.7, reviewCount: 76, isOrganic: true, inStock: true },
  { id: 4, name: 'Golden Turmeric Powder', description: 'Sun-dried Lakadong turmeric with vibrant warmth.', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80', price: 249, originalPrice: 299, discount: 17, rating: 4.8, reviewCount: 142, isOrganic: true, inStock: true },
  { id: 5, name: 'Moringa Leaf Powder', description: 'A gentle green boost for smoothies and daily wellness.', image: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?auto=format&fit=crop&w=600&q=80', price: 299, originalPrice: 349, discount: 14, rating: 4.6, reviewCount: 63, isOrganic: true, inStock: true },
  { id: 6, name: 'Rose Green Tea', description: 'Delicate rose petals blended with handpicked green tea.', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', price: 429, originalPrice: 499, discount: 14, rating: 4.7, reviewCount: 51, isOrganic: true, inStock: true },
  { id: 7, name: 'A2 Cow Ghee', description: 'Small-batch cultured ghee with a rich golden finish.', image: 'https://images.unsplash.com/photo-1631294228801-5b7d1c4f2fa8?auto=format&fit=crop&w=600&q=80', price: 899, originalPrice: 999, discount: 10, rating: 4.9, reviewCount: 87, isOrganic: true, inStock: true },
  { id: 8, name: 'Daily Wellness Box', description: 'A considered collection of nourishing everyday essentials.', image: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=600&q=80', price: 1199, originalPrice: 1399, discount: 14, rating: 4.8, reviewCount: 39, isOrganic: true, inStock: true },
];

const testimonials = [
  { text: 'The honey tastes like a walk through a wildflower meadow. Everything arrived beautifully packed and fresh.', name: 'Ananya Mehta', city: 'Bengaluru' },
  { text: 'Vilora has made my morning ritual feel special. The tea is fragrant, clean, and genuinely delicious.', name: 'Rohan Kapoor', city: 'Mumbai' },
  { text: 'Thoughtful products, quick delivery, and a level of quality I can taste. I have already placed my third order.', name: 'Priya Nair', city: 'Kochi' },
];

const trustItems = [
  { icon: FaLeaf, label: '100% Organic' },
  { icon: FaShippingFast, label: 'Free Shipping ₹499+' },
  { icon: FiCheck, label: '50K+ Customers' },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};

const Home = () => {
  const navigate = useNavigate();
  const whyRef = useRef(null);
  const whyInView = useInView(whyRef, { once: true, amount: 0.2 });
  const [email, setEmail] = useState('');

  const handleNewsletter = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Welcome to Vilora. Your 10% offer is on its way.');
    setEmail('');
  };

  return (
    <PageWrapper>
      <div>
        <section className="relative min-h-[90vh] overflow-hidden bg-forest-deep">
          <svg className="absolute inset-0 h-full w-full opacity-[0.08]" aria-hidden="true">
            <defs><pattern id="hero-grid" width="72" height="72" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0H72V72" fill="none" stroke="#C9963C" strokeWidth="1" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
          <div className="relative mx-auto grid min-h-[90vh] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <Badge variant="organic">🌿 100% Certified Organic</Badge>
              <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.95] text-white md:text-7xl">Nature&apos;s Finest,<br />Delivered to Your Door</h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream/80">Premium organic essentials — pure, natural, and crafted with care.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => navigate('/shop')}>Shop Now <FiArrowRight aria-hidden="true" /></Button>
                <Button variant="secondary" size="lg" className="border-white text-white hover:bg-white/10" onClick={() => navigate('/shop?view=categories')}>Explore Categories</Button>
              </div>
              <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 border-t border-white/15 pt-6 sm:grid-cols-3">
                {trustItems.map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-3 text-sm text-cream/80"><Icon className="shrink-0 text-gold" aria-hidden="true" /><span>{label}</span></div>)}
              </div>
            </div>
            <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4 lg:max-w-lg">
              <img src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=700&q=85" alt="Vilora organic skincare products" className="mt-12 h-64 w-full rounded-xl object-cover shadow-2xl sm:h-80" />
              <img src="https://images.unsplash.com/photo-1611073761764-7d9e3f1a5a1f?auto=format&fit=crop&w=700&q=85" alt="Natural ingredients and botanical oils" className="h-64 w-full rounded-xl object-cover shadow-2xl sm:h-80" />
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-gold/50 bg-forest px-5 py-3 text-center text-xs uppercase tracking-[0.2em] text-gold">Purely considered</div>
            </div>
          </div>
        </section>

        <section className="bg-sage py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-display text-4xl font-semibold text-forest">Shop by Category</h2>
            <div className="mt-10 flex snap-x gap-8 overflow-x-auto px-2 pb-4 sm:justify-center sm:gap-10">
              {categories.map((category) => <button type="button" key={category.name} onClick={() => navigate(`/shop?category=${encodeURIComponent(category.name)}`)} className="group flex w-[140px] shrink-0 snap-start flex-col items-center gap-3 text-center"><img src={category.image} alt={category.name} className="h-[140px] w-[140px] rounded-full border-4 border-transparent object-cover transition-all duration-300 group-hover:border-gold group-focus-visible:border-gold" /><span className="font-display text-xl font-semibold text-forest">{category.name}</span></button>)}
            </div>
          </div>
        </section>

        <section className="bg-cream py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Our collection</p><h2 className="mt-2 font-display text-4xl font-semibold text-forest">Our Bestsellers</h2><p className="mt-2 text-forest/65">Nature-led staples, chosen again and again.</p></div><Button variant="secondary" onClick={() => navigate('/shop')}>View All Products <FiArrowRight aria-hidden="true" /></Button></div>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          </div>
        </section>

        <section className="bg-sage py-16 sm:py-24" ref={whyRef}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">The Vilora promise</p><h2 className="mt-2 font-display text-4xl font-semibold text-forest">Why Choose Vilora</h2></div><div className="mt-12 grid gap-10 md:grid-cols-3">{[{ icon: FaLeaf, title: '100% Organic Certified', text: 'Every ingredient is carefully sourced and certified for a cleaner, more conscious ritual.' }, { icon: FaFlask, title: 'Lab Tested Quality', text: 'Thoughtful testing and transparent standards protect the quality in every jar.' }, { icon: FaShippingFast, title: 'Fast Pan-India Delivery', text: 'From our shelves to your doorstep, we pack with care and dispatch with speed.' }].map(({ icon: Icon, title, text }, index) => <motion.div key={title} variants={reveal} initial="hidden" animate={whyInView ? 'visible' : 'hidden'} transition={{ delay: index * 0.12 }} className="text-center"><Icon className="mx-auto text-4xl text-gold" aria-hidden="true" /><h3 className="mt-5 font-display text-2xl font-semibold text-forest">{title}</h3><p className="mx-auto mt-3 max-w-xs leading-relaxed text-forest/70">{text}</p></motion.div>)}</div></div>
        </section>

        <section className="bg-cream py-16 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Loved by our community</p><h2 className="mt-2 font-display text-4xl font-semibold text-forest">What Our Customers Say</h2></div><Swiper modules={[Autoplay, Pagination]} autoplay={{ delay: 4000, disableOnInteraction: false }} pagination={{ clickable: true }} spaceBetween={24} slidesPerView={1} breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }} className="vilora-testimonials mt-10 !pb-12">{testimonials.map((testimonial) => <SwiperSlide key={testimonial.name} className="h-auto"><article className="flex h-full min-h-[250px] flex-col rounded-xl border border-gold/20 bg-white p-7 shadow-sm"><FaQuoteLeft className="text-2xl text-gold" aria-hidden="true" /><p className="mt-5 flex-1 leading-relaxed text-forest/75">&ldquo;{testimonial.text}&rdquo;</p><StarRating rating={5} showCount={false} /><p className="mt-4 font-semibold text-forest">{testimonial.name}<span className="font-normal text-forest/55"> · {testimonial.city}</span></p></article></SwiperSlide>)}</Swiper></div></section>

        <section className="bg-forest py-14"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 md:flex-row md:items-center lg:px-8"><div><h2 className="font-display text-4xl font-semibold text-white">Get 10% Off Your First Order</h2><p className="mt-2 text-cream/75">A little welcome gift for choosing a more natural everyday.</p></div><form onSubmit={handleNewsletter} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"><label htmlFor="newsletter-email" className="sr-only">Email address</label><input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" className="min-h-12 flex-1 rounded-lg border border-gold/30 bg-cream px-4 text-forest outline-none placeholder:text-forest/50 focus:border-gold focus:ring-2 focus:ring-gold/20" /><Button type="submit" className="min-h-12 shrink-0">Subscribe</Button></form></div></section>
      </div>
    </PageWrapper>
  );
};

export default Home;
