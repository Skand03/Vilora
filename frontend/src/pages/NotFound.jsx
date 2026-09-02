import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-display text-forest mb-4">404</h1>
      <p className="text-xl text-forest-deep mb-8">Page not found</p>
      <Link
        to="/"
        className="px-6 py-3 bg-gold text-white rounded-pill hover:bg-gold-light transition"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
