import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const PageWrapper = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-cream">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageWrapper;
