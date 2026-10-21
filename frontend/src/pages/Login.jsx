import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const Logo = () => (
  <div className="flex flex-col items-center">
    <div className="flex h-[90px] w-[90px] items-center justify-center rounded-full border-2 border-gold bg-forest ring-4 ring-gold/15">
      <svg className="h-11 w-11 text-gold" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M16.8 3.2C10.3 3.4 5.6 6.1 4.1 10.1c-1.1 3 .5 5.6 3.2 6.1-.1-2.6.7-5.1 2.7-7.1-1.1 1.7-1.5 3.6-1.3 5.7 3.9-.9 6.6-4.8 8.1-11.6Z" />
      </svg>
    </div>
    <span className="mt-4 font-display text-4xl font-semibold tracking-[0.18em] text-gold">VILORA</span>
  </div>
);

const Field = ({ label, type = 'text', value, onChange, error, icon: Icon, children, ...props }) => (
  <div>
    <label htmlFor={props.id} className="mb-2 block text-sm font-semibold text-forest">{label}</label>
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold" aria-hidden="true" />
      <input {...props} id={props.id} type={type} value={value} onChange={onChange} aria-invalid={Boolean(error)} aria-describedby={error ? `${props.id}-error` : undefined} className={`min-h-[52px] w-full rounded-lg border bg-white pl-11 pr-12 text-forest outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 ${error ? 'border-red-400' : 'border-gold/30'}`} />
      {children}
    </div>
    {error && <p id={`${props.id}-error`} className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const loginUser = useAuthStore((state) => state.loginUser);
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.password) nextErrors.password = 'Password is required.';
    else if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setLoading(true);
    const result = await loginUser(form.email, form.password);
    if (result && result.success) {
      toast.success('Welcome back to Vilora.');
      navigate('/account');
    } else {
      toast.error(result?.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-15 lg:hidden" aria-hidden="true" />
      <div className="absolute inset-0 bg-cream/85 lg:hidden" aria-hidden="true" />
      <div className="relative grid min-h-screen lg:grid-cols-2">
        <aside className="relative hidden min-h-screen overflow-hidden bg-forest-deep lg:flex lg:items-center lg:justify-center">
          <div className="absolute inset-0 opacity-10" aria-hidden="true"><svg className="h-full w-full"><defs><pattern id="login-lines" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0H64V64" fill="none" stroke="#C9963C" /></pattern></defs><rect width="100%" height="100%" fill="url(#login-lines)" /></svg></div>
          <Logo />
          <p className="absolute bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill border border-gold/30 bg-forest px-5 py-3 text-sm text-cream/85">🌿 Trusted by 50,000+ customers</p>
          <p className="absolute bottom-36 left-1/2 -translate-x-1/2 font-display text-xl italic text-gold">Pure. Natural. Premium.</p>
        </aside>
        <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden"><Logo /><p className="mt-4 text-center font-display text-xl italic text-gold">Pure. Natural. Premium.</p></div>
            <div className="text-center"><h1 className="font-display text-4xl font-semibold text-forest">Welcome Back</h1><p className="mt-2 text-sm text-forest/60">Sign in to your Vilora account</p><div className="mx-auto mt-4 mb-7 h-1 w-10 rounded-full bg-gold" /></div>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Field id="email" name="email" label="Email address" type="email" value={form.email} onChange={updateField} placeholder="you@example.com" autoComplete="email" icon={FiMail} error={errors.email} />
              <Field id="password" name="password" label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={updateField} placeholder="Enter your password" autoComplete="current-password" icon={FiLock} error={errors.password}>
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 text-forest/50 hover:text-gold">{showPassword ? <FiEyeOff /> : <FiEye />}</button>
              </Field>
              <div className="flex items-center justify-between gap-4 text-sm"><label className="flex cursor-pointer items-center gap-2 text-forest/75"><input type="checkbox" name="remember" checked={form.remember} onChange={updateField} className="h-4 w-4 accent-gold" />Remember me</label><a href="#forgot-password" className="font-semibold text-gold hover:underline">Forgot Password?</a></div>
              <button type="submit" disabled={loading} className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3 font-semibold text-forest-deep shadow-sm transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-70">{loading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-forest-deep/30 border-t-forest-deep" />Signing in...</> : <>Sign In <FiArrowRight /></>}</button>
            </form>
            <div className="my-7 flex items-center gap-4 text-xs text-forest/45"><span className="h-px flex-1 bg-gold/25" />or continue with<span className="h-px flex-1 bg-gold/25" /></div>
            <button type="button" onClick={() => toast('Google Sign-in is coming in V2. Please use email and password.', { icon: 'ℹ️' })} className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-lg border border-forest bg-white px-6 py-3 font-semibold text-forest transition hover:bg-sage"><FcGoogle className="text-xl" />Continue with Google</button>
            <div className="mt-8 text-center text-sm text-forest/65"><span>Don&apos;t have an account? </span><Link to="/register" className="font-semibold text-gold hover:underline">Create one →</Link><p className="mt-5 text-xs text-forest/50">🔒 Your data is protected with 256-bit SSL</p></div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
