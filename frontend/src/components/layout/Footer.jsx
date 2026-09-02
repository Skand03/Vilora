import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Shipping Policy', path: '/shipping' },
    { name: 'Return Policy', path: '/returns' },
  ];

  const categories = [
    { name: 'Skincare', path: '/shop?category=skincare' },
    { name: 'Haircare', path: '/shop?category=haircare' },
    { name: 'Body Care', path: '/shop?category=bodycare' },
    { name: 'Essential Oils', path: '/shop?category=essential-oils' },
    { name: 'Gift Sets', path: '/shop?category=gifts' },
    { name: 'Best Sellers', path: '/shop?filter=bestsellers' },
  ];

  return (
    <footer className="bg-forest-deep text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-forest-deep"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-display text-2xl text-gold font-semibold">
                VILORA
              </span>
            </div>
            <p className="text-sm text-cream/80 leading-relaxed">
              Premium organic essentials crafted from nature's finest ingredients. Pure, sustainable, and ethically sourced.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gold/20 hover:bg-gold flex items-center justify-center transition-all hover:scale-110"
              >
                <FaInstagram className="text-gold hover:text-forest-deep transition-colors" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gold/20 hover:bg-gold flex items-center justify-center transition-all hover:scale-110"
              >
                <FaFacebookF className="text-gold hover:text-forest-deep transition-colors" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gold/20 hover:bg-gold flex items-center justify-center transition-all hover:scale-110"
              >
                <FaYoutube className="text-gold hover:text-forest-deep transition-colors" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-gold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-cream/80 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="font-display text-lg font-semibold text-gold mb-4">
              Categories
            </h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.path}>
                  <Link
                    to={category.path}
                    className="text-sm text-cream/80 hover:text-gold transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-display text-lg font-semibold text-gold mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-cream/80">
                <FaMapMarkerAlt className="text-gold mt-1 flex-shrink-0" />
                <span>123 Organic Street, Green Valley, Mumbai 400001</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-cream/80">
                <FaPhone className="text-gold flex-shrink-0" />
                <a href="tel:+911234567890" className="hover:text-gold transition-colors">
                  +91 123 456 7890
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-cream/80">
                <FaEnvelope className="text-gold flex-shrink-0" />
                <a href="mailto:hello@vilora.com" className="hover:text-gold transition-colors">
                  hello@vilora.com
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm text-cream/80 mb-2">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded-lg bg-forest border border-gold/30 text-white placeholder-cream/50 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-sm"
                />
                <button className="px-4 py-2 bg-gold text-forest-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-sm">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-cream/70 text-center sm:text-left">
              © 2025 Vilora Organic Essentials Pvt Ltd. All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-cream/70">We Accept:</span>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-white rounded text-xs font-semibold text-forest-deep">
                  VISA
                </div>
                <div className="px-2 py-1 bg-white rounded text-xs font-semibold text-forest-deep">
                  MC
                </div>
                <div className="px-2 py-1 bg-white rounded text-xs font-semibold text-forest-deep">
                  UPI
                </div>
                <div className="px-2 py-1 bg-white rounded text-xs font-semibold text-forest-deep">
                  PayPal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
