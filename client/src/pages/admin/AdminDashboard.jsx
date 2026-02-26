import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/apiClient'; 
import toast from 'react-hot-toast';
import Button from '../../components/common/Button.jsx'; 
import Spinner from '../../components/common/Spinner.jsx'; 
import { FiUserCheck } from 'react-icons/fi';
import dashboardStyles from '../Dashboard.module.css';

const AdminDashboard = () => {
  const [pendingReviewers, setPendingReviewers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingReviewers = useCallback(async () => {
    try {
      const response = await apiClient.get('/admin/reviewers/pending');
      setPendingReviewers(response.data);
    } catch (error) {
      toast.error('Could not fetch pending reviewers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingReviewers();
  }, [fetchPendingReviewers]);

  const handleApprove = async (reviewerId) => {
    try {
      await apiClient.post(`/admin/reviewers/${reviewerId}/approve`);
      toast.success('Reviewer approved successfully!');
      fetchPendingReviewers();
    } catch (error) {
      toast.error('Failed to approve reviewer.');
    }
  };

  if (loading) return <div className="mt-24 flex justify-center"><Spinner /></div>;

  return (
    <div className={dashboardStyles.container}>
      <h1 className={dashboardStyles.headerTitle}>Administration</h1>

      <h2 className="text-xl font-semibold text-slate-700 mb-4 mt-8">Pending Reviewer Approvals</h2>
      <div className={dashboardStyles.list}>
        {pendingReviewers.length > 0 ? (
          pendingReviewers.map((reviewer) => (
            <div key={reviewer.id} className={dashboardStyles.itemCard}>
                <div className={`${dashboardStyles.itemContent} flex justify-between items-center`}>
                    <div>
                        <p className={dashboardStyles.itemTitle}>
                            {reviewer.first_name} {reviewer.last_name}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">{reviewer.email}</p>
                    </div>
                    <Button onClick={() => handleApprove(reviewer.id)} variant="success">
                        <FiUserCheck /> Approve
                    </Button>
                </div>
            </div>
          ))
        ) : (
          <div className={`${dashboardStyles.itemCard} ${dashboardStyles.emptyState}`}>
            <h3 className={dashboardStyles.emptyStateTitle}>All Clear!</h3>
            <p className={dashboardStyles.emptyStateText}>There are no new reviewers waiting for approval.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;