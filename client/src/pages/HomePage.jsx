import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const { user } = useAuth();
  return (
    <div className={styles.hero}>
      <h1 className={styles.title}>
         <span className={styles.highlight}>ReviewIT</span>
      </h1>
      <p className={styles.subtitle}>
        This platform connects scientific journals with qualified reviewers, allowing them to easily communicate.
      </p>
      {!user && (
        <div className={styles.actions}>
          <Link to="/register"><Button variant="primary" className="px-6 py-3">Get Started</Button></Link>
          <Link to="/login"><Button variant="secondary" className="px-6 py-3">Log In</Button></Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;