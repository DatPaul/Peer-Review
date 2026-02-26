import React from 'react';
import Navbar from './Navbar.jsx';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      {}
    </div>
  );
};

export default Layout;