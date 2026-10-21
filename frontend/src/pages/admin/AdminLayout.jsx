import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiBox,
  FiFolder,
  FiShoppingBag,
  FiExternalLink,
  FiLogOut,
  FiMenu,
  FiX,
  FiShield,
  FiUser
} from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Signed out of Administrator Portal');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: FiGrid, exact: true },
    { name: 'Products', path: '/admin/products', icon: FiBox },
    { name: 'Categories', path: '/admin/categories', icon: FiFolder },
    { name: 'Orders', path: '/admin/orders', icon: FiShoppingBag },
  ];

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/admin') return 'Dashboard Overview';
    if (p.startsWith('/admin/products')) return 'Product Management';
    if (p.startsWith('/admin/categories')) return 'Category Management';
    if (p.startsWith('/admin/orders')) return 'Customer Orders';
    return 'Admin Portal';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-forest text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg bg-forest-deep text-gold hover:bg-forest-deep/80"
            aria-label="Toggle Navigation"
          >
            {mobileSidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
          <span className="font-display font-bold text-xl text-gold">VILORA ADMIN</span>
        </div>
        <Link to="/" className="text-xs flex items-center gap-1 text-cream/80 hover:text-gold">
          Storefront <FiExternalLink />
        </Link>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-forest text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest-deep border border-gold/40 flex items-center justify-center text-gold">
              <FiShield className="text-xl" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-wide text-gold">VILORA</span>
              <span className="block text-[10px] tracking-widest uppercase text-cream/60">Admin Portal</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-cream/70 hover:text-white"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold text-forest-deep font-semibold shadow-sm'
                    : 'text-cream/80 hover:bg-forest-deep hover:text-white'
                }`}
              >
                <Icon className={`text-lg ${isActive ? 'text-forest-deep' : 'text-gold'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div className="p-4 border-t border-white/10 bg-forest-deep/60">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center text-gold border border-gold/30">
              <FiUser />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Administrator'}</p>
              <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-gold/20 text-gold rounded-full">
                ROLE_ADMIN
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-forest/80 text-cream/90 hover:bg-forest hover:text-gold transition-colors"
            >
              <FiExternalLink /> Store
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-red-950/40 text-red-300 hover:bg-red-900/60 hover:text-red-100 transition-colors"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex bg-white h-20 border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-30 shadow-sm">
          <div>
            <h1 className="text-2xl font-display font-bold text-forest">{getPageTitle()}</h1>
            <p className="text-xs text-slate-500">Vilora Organic Essentials — Administrative Control Center</p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-forest transition-colors"
            >
              <FiExternalLink className="text-gold" /> View Storefront
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-right">
              <span className="block text-xs font-semibold text-slate-700">{user?.fullName || 'Admin User'}</span>
              <span className="block text-[11px] text-slate-400 font-mono">{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Outlet Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Backdrop for mobile */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}
    </div>
  );
};

export default AdminLayout;
