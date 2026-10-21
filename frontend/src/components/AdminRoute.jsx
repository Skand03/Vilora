import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { FiShield, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import Button from './ui/Button';

const AdminRoute = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn());
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const user = useAuthStore((state) => state.user);

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="text-3xl" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-forest mb-2">Access Denied</h1>
          <p className="text-forest/70 text-sm mb-6">
            The account <strong>{user?.email}</strong> does not have administrator privileges. Only users with{' '}
            <code className="bg-sage px-2 py-0.5 rounded text-xs text-forest">ROLE_ADMIN</code> can access the Admin Portal.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                <FiArrowLeft /> Return to Storefront
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button className="w-full">Sign in with Admin Account</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
