// src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="text-center">
    <h1 className="text-6xl font-bold text-indigo-600">404</h1>
    <p className="text-xl mt-4">Page Not Found</p>
    <Link to="/" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md">
      Go Home
    </Link>
  </div>
);

export default NotFoundPage;