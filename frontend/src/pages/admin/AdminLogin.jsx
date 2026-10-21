import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiMail, FiShield, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@viloranaturals.com');
  const [password, setPassword] = useState('Admin@123456');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { loginUser, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await loginUser(email.trim(), password);

    if (result.success) {
      if (result.data.role === 'ROLE_ADMIN' || isAdmin()) {
        toast.success(`Welcome back, ${result.data.fullName || 'Admin'}!`);
        navigate('/admin');
      } else {
        // Logged in as customer, not admin
        logout();
        setErrorMsg('Access Denied: This account does not possess administrator privileges (ROLE_ADMIN).');
        toast.error('Access Denied: Administrator role required.');
      }
    } else {
      setErrorMsg(result.message || 'Invalid administrator credentials.');
      toast.error(result.message || 'Login failed.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-forest-deep flex items-center justify-center p-4">
      {/* Background organic wave graphic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gold blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-forest blur-3xl" />
      </div>

      <div className="relative max-w-md w-full bg-white rounded-3xl border border-gold/30 shadow-2xl p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-forest text-gold border-2 border-gold flex items-center justify-center mx-auto mb-4 shadow-md">
            <FiShield className="text-3xl" />
          </div>
          <span className="font-display text-2xl font-bold tracking-wider text-forest block">VILORA NATURALS</span>
          <h1 className="text-sm uppercase tracking-widest font-semibold text-gold mt-1">Administrator Portal</h1>
          <p className="text-xs text-slate-500 mt-2">Sign in to manage catalog, orders, and customer operations</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <FiAlertCircle className="text-base shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Administrator Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@viloranaturals.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-sm text-slate-800 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Security Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-sm text-slate-800 transition-all"
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={submitting}
            className="w-full py-3.5 bg-forest hover:bg-forest-deep text-white font-semibold rounded-xl text-sm transition-all shadow-md mt-2"
          >
            Authenticate as Administrator
          </Button>
        </form>

        {/* Credentials hint for test and evaluation */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 mb-1">Bootstrapped Administrator Credentials:</p>
          <code className="text-[11px] bg-slate-100 text-forest px-2.5 py-1 rounded font-mono font-semibold select-all">
            skandchaubey03@gmail.com / Admin@123456
          </code>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-forest transition-colors font-medium"
          >
            <FiArrowLeft /> Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
