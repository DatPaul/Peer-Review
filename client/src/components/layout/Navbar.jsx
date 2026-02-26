import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button.jsx';
import Notifications from './Notifications.jsx';
import { FiStar } from 'react-icons/fi';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardText = () => {
    if (!user) return 'Dashboard';
    switch (user.role) {
      case 'editor':
        return 'My Journals';
      case 'reviewer':
        return 'My Assignments';
      case 'admin':
        return 'Admin Panel';
      default:
        return 'Dashboard';
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftGroup}>
        <Link to="/" className={styles.brand}>ReviewIT</Link>
        {user && (
          <>
            <Link to={`/${user.role}/dashboard`} className={styles.link} style={{ marginLeft: '1.5rem' }}>
              {getDashboardText()}
            </Link>
            
            {(user.role === 'editor' || user.role === 'reviewer') && (
                <Link to="/reviews/completed" className={styles.link}>
                    View Reviews
                </Link>
            )}

            {user.role === 'admin' && (
                <Link to="/admin/view-reviewers" className={styles.link}>
                    View All Reviewers
                </Link>
            )}
          </>
        )}
      </div>
      <div className={styles.rightGroup}>
        {user ? (
          <>
            <Notifications />
            <div className="h-6 w-px bg-slate-200" />
            {user.role === 'reviewer' && user.average_rating > 0 && (
                <div className="flex items-center gap-1 text-sm font-semibold text-amber-500" title={`Your average rating: ${Number(user.average_rating).toFixed(1)}`}>
                    <FiStar className="fill-current" />
                    <span>{Number(user.average_rating).toFixed(1)}</span>
                </div>
            )}
            <button onClick={logout} className={styles.buttonAsLink}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.link}>Log In</Link>
            <Button onClick={() => navigate('/register')} variant="primary">Sign Up</Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;