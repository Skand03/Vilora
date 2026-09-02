import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import router from './router';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <>
      <RouterProvider router={router}>
        <ScrollToTop />
      </RouterProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A3C34',
            color: '#FDF8F0',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#C9963C',
              secondary: '#FDF8F0',
            },
          },
        }}
      />
    </>
  );
}

export default App;
