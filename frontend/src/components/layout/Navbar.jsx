import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiMenu, FiUser } from 'react-icons/fi';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { AnimatePresence } from 'framer-motion';
import useCartStore from '../../store/useCartStore';
import useWishlistStore from '../../store/useWishlistStore';
import useAuthStore from '../../store/useAuthStore';
import Button from '../ui/Button';

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const cartCount = useCartStore((state) => state.cartCount());
  const fetchCart = useCartStore((state) => state.fetchCart);
  
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  
  const { user, isLoggedIn, logout } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn()) {
      fetchCart();
      fetchWishlist();
      useAuthStore.getState().fetchProfile();
    }
  }, [isLoggedIn, fetchCart, fetchWishlist]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dry Fruits & Nuts', path: '/shop' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <>
      <div className="bg-forest-deep text-gold text-center py-1.5 px-4 text-xs font-semibold border-b border-gold/20 tracking-wide flex items-center justify-center gap-2">
        <span>🌿 Free Express Shipping across India on orders above ₹499 | 100% Farm-Fresh Certified Organic</span>
      </div>
      <Disclosure as="nav" className="sticky top-0 z-50 bg-forest shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[4.5rem]">
          {/* LEFT: Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest-deep flex items-center justify-center">
              {/* Placeholder leaf icon - replace with actual logo */}
              <svg
                className="w-6 h-6 text-gold"
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
            <span className="font-display text-2xl text-gold font-semibold hidden sm:block">
              VILORA
            </span>
          </Link>

          {/* CENTER: Nav Links (Desktop) */}
              <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-white hover:text-gold transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* RIGHT: Icons & Auth */}
          <div className="flex items-center gap-4">
            {/* Search Icon */}
            <button type="button" aria-label="Search" onClick={() => navigate('/shop')} className="text-white hover:text-gold transition-colors p-1">
              <FiSearch className="text-xl" />
            </button>

            {/* Wishlist Icon */}
            <Link to="/account/wishlist" className="relative text-white hover:text-gold transition-colors">
              <FiHeart className="text-xl" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-forest-deep text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative text-white hover:text-gold transition-colors">
              <FiShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-forest-deep text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Section (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {(user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN') && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/20 text-gold hover:bg-gold hover:text-forest-deep text-xs font-bold transition-all border border-gold/40 shadow-sm"
                >
                  🛡️ Admin
                </Link>
              )}
              {isLoggedIn() ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-white hover:text-gold transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                      <FiUser className="text-forest-deep" />
                    </div>
                    <span className="hidden xl:inline text-sm font-medium capitalize">
                      {user?.fullName || user?.name || (user?.email ? user.email.split('@')[0] : 'User')}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl py-2 border border-gold/20 z-50">
                        {(user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN') && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 font-bold text-forest bg-pale-gold/70 hover:bg-pale-gold transition-colors border-b border-gold/20"
                            onClick={() => setShowUserMenu(false)}
                          >
                            🛡️ Admin Dashboard
                          </Link>
                        )}
                        <Link
                          to="/account"
                          className="block px-4 py-2 text-forest hover:bg-sage transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          to="/account/orders"
                          className="block px-4 py-2 text-forest hover:bg-sage transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Orders
                        </Link>
                        <Link
                          to="/account/wishlist"
                          className="block px-4 py-2 text-forest hover:bg-sage transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Wishlist
                        </Link>
                        <hr className="my-2 border-gold/20" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-sage transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <DisclosureButton className="lg:hidden text-white hover:text-gold transition-colors p-1" aria-label="Open menu">
              <FiMenu className="text-2xl" />
            </DisclosureButton>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <DisclosurePanel transition className="fixed top-16 md:top-[4.5rem] right-0 bottom-0 z-40 w-80 max-w-[85vw] overflow-y-auto lg:hidden bg-forest-deep border-l border-gold/20 transition duration-200 ease-out data-[closed]:translate-x-full">
              <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white hover:text-gold transition-colors py-2 font-medium"
                >
                  {link.name}
                </Link>
              ))}

              <hr className="border-gold/20 my-4" />

              {isLoggedIn() ? (
                <>
                  {user?.role === 'ROLE_ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-gold font-bold hover:text-white transition-colors py-2"
                    >
                      🛡️ Admin Portal
                    </Link>
                  )}
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-white hover:text-gold transition-colors py-2"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/account/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-white hover:text-gold transition-colors py-2"
                  >
                    Orders
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-red-400 hover:text-red-300 transition-colors py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" size="md" className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
      </DisclosurePanel>
    </Disclosure>
    </>
  );
};

export default Navbar;
