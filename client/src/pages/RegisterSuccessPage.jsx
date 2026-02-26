// src/pages/RegisterSuccessPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import dashboardStyles from './Dashboard.module.css';

const RegisterSuccessPage = () => {
  return (
    <div className={dashboardStyles.container}>
      <div className={`${dashboardStyles.itemCard} ${dashboardStyles.emptyState}`}>
        <FiCheckCircle className="mx-auto text-green-500 h-16 w-16 mb-4" />
        <h1 className={dashboardStyles.emptyStateTitle}>Registration Successful!</h1>
        <p className={`${dashboardStyles.emptyStateText} max-w-lg mx-auto`}>
          Your account has been created. If you registered as a reviewer, an administrator will need to approve it. You will be notified via email upon approval.
        </p>
        <div className="mt-8">
            <Link 
                to="/login" 
                className="inline-block bg-blue-900 text-white font-semibold px-8 py-3 rounded-md hover:bg-blue-800 transition-colors"
            >
                Proceed to Login
            </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccessPage;