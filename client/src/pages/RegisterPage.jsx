import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';
import styles from './LoginPage.module.css'; // Refolosim stilul de la Login
import registerStyles from './RegisterPage.module.css'; // Stiluri adiționale

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'editor',
    expertise: [],
  });
  const [domains, setDomains] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoadingDomains(true);
        const response = await apiClient.get('/domains');
        setDomains(response.data);
      } catch (error) {
        toast.error('Could not fetch expertise domains.');
      } finally {
        setLoadingDomains(false);
      }
    };
    fetchDomains();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleExpertiseChange = (e) => {
    const domainId = parseInt(e.target.value);
    const isChecked = e.target.checked;
    
    setFormData(prev => ({
        ...prev,
        expertise: isChecked 
            ? [...prev.expertise, domainId] 
            : prev.expertise.filter(id => id !== domainId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.role === 'reviewer' && formData.expertise.length === 0) {
        toast.error('As a reviewer, please select at least one area of expertise.');
        return;
    }
    setLoadingSubmit(true);
    try {
      await register(formData);
      toast.success('Registration successful! Please log in to continue.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>Create Your Account</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={styles.inputGroup}>
              <label htmlFor="firstName" className={styles.label}>First Name</label>
              <input id="firstName" name="firstName" type="text" required className={styles.input} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="lastName" className={styles.label}>Last Name</label>
              <input id="lastName" name="lastName" type="text" required className={styles.input} onChange={handleChange} />
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input id="email" name="email" type="email" required className={styles.input} onChange={handleChange} />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input id="password" name="password" type="password" required minLength="6" className={styles.input} onChange={handleChange} />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="role" className={styles.label}>I am registering as an:</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} className={styles.select}>
              <option value="editor">Editor</option>
              <option value="reviewer">Reviewer</option>
            </select>
          </div>

          {formData.role === 'reviewer' && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Areas of Expertise (select all that apply)</label>
              {loadingDomains ? <Spinner /> : (
                <div className={registerStyles.checkboxGrid}>
                  {domains.map(domain => (
                    <label key={domain.id} className={registerStyles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        value={domain.id} 
                        onChange={handleExpertiseChange} 
                        className={registerStyles.checkbox}
                        checked={formData.expertise.includes(domain.id)}
                      />
                      <span className={registerStyles.checkboxText}>{domain.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <Button 
            type="submit" 
            variant="primary" 
            className={`w-full ${styles.submitButton}`}
            disabled={loadingSubmit}
          >
            {loadingSubmit ? 'Creating Account...' : 'Create Account'}
          </Button>

        </form>
        <p className={styles.footerText}>
          Already have an account? <Link to="/login" className={styles.footerLink}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;