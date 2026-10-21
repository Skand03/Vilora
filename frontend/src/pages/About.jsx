import React from 'react';
import { PageWrapper, Badge } from '../components';
import { FiCheck, FiAward, FiHeart, FiShield } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <PageWrapper>
      <div className="min-h-screen bg-cream">
        {/* Hero Section */}
        <div className="bg-forest text-white py-16 sm:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <Badge variant="organic" className="mx-auto mb-4">
              🌿 Our Heritage &amp; Promise
            </Badge>
            <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight">
              Rooted in Purity. Nurtured by Nature.
            </h1>
            <p className="mt-4 text-cream/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Vilora Naturals was founded on a simple principle: whole, single-origin dry fruits and nuts harvested with respect for the earth and delivered with zero compromises on quality.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold block mb-2">
                Our Story
              </span>
              <h2 className="font-display text-3xl font-bold text-forest mb-4">
                From Himalayan Valleys &amp; Sunny Groves to Your Table
              </h2>
              <p className="text-forest/75 leading-relaxed text-sm sm:text-base mb-4">
                We travel directly to growers in Kashmir, California, and select global regions to handpick walnuts with butterfly halves, crunchy California almonds, jumbo whole cashews, and Royal Medjool dates.
              </p>
              <p className="text-forest/75 leading-relaxed text-sm sm:text-base">
                Every batch is vacuum sealed to lock in natural essential fatty acids, antioxidants, and pure flavor without artificial preservatives, food colorings, or sulfur dioxide.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=800&q=80"
                alt="Vilora farm fresh organic almonds"
                className="rounded-3xl shadow-xl border border-gold/20 object-cover w-full h-80"
              />
              <div className="absolute -bottom-6 -left-6 bg-pale-gold border border-gold p-4 rounded-2xl shadow-lg hidden sm:block">
                <span className="font-display text-2xl font-bold text-forest block">100%</span>
                <span className="text-xs text-forest/70 font-semibold">Certified Organic</span>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div className="mt-24">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-gold block mb-2">
                What We Stand For
              </span>
              <h2 className="font-display text-3xl font-bold text-forest">
                The Vilora Standard
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl border border-gold/20 p-6 shadow-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-pale-gold/50 text-gold flex items-center justify-center mx-auto mb-4 text-2xl">
                  <FiAward />
                </div>
                <h3 className="font-display text-xl font-bold text-forest mb-2">Single-Origin Quality</h3>
                <p className="text-xs text-forest/70 leading-relaxed">
                  We verify harvest origins and grade standards to ensure uniform size, high crunch, and authentic flavor.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gold/20 p-6 shadow-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-pale-gold/50 text-gold flex items-center justify-center mx-auto mb-4 text-2xl">
                  <FiShield />
                </div>
                <h3 className="font-display text-xl font-bold text-forest mb-2">Zero Chemical Preservatives</h3>
                <p className="text-xs text-forest/70 leading-relaxed">
                  No artificial glazes, sulfur bleach, or synthetic additives. Only raw, solar-dried, or dry-roasted nuts.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gold/20 p-6 shadow-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-pale-gold/50 text-gold flex items-center justify-center mx-auto mb-4 text-2xl">
                  <FiHeart />
                </div>
                <h3 className="font-display text-xl font-bold text-forest mb-2">Airtight Freshness</h3>
                <p className="text-xs text-forest/70 leading-relaxed">
                  Eco-friendly, multi-layer oxygen-barrier packaging guarantees that crunch and nutritional potency remain intact.
                </p>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-20 text-center bg-forest rounded-3xl p-10 text-white shadow-xl">
            <h2 className="font-display text-3xl font-bold mb-3">Taste the Vilora Difference</h2>
            <p className="text-cream/80 text-sm max-w-xl mx-auto mb-6">
              Explore our range of organic almonds, cashews, walnuts, dates, and seed mixes today.
            </p>
            <Link
              to="/shop"
              className="inline-block px-8 py-3 rounded-xl bg-gold hover:bg-gold-light text-forest-deep font-bold text-sm shadow-md transition-all"
            >
              Explore the Collection &rarr;
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
