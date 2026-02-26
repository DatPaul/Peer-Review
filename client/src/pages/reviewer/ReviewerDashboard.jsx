// src/pages/reviewer/ReviewerDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import dashboardStyles from '../Dashboard.module.css';

const ReviewerDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Funcție pentru a prelua cererile de review
  const fetchAssignments = useCallback(async () => {
    try {
      const response = await apiClient.get('/assignments');
      setAssignments(response.data);
    } catch (error) {
      toast.error('Could not fetch review assignments.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Preluare date la prima încărcare a componentei
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Funcție pentru a răspunde la o cerere (Accept/Decline)
  const handleResponse = async (assignmentId, status) => {
    let decline_reason = null;
    if (status === 'declined') {
        decline_reason = prompt('Please provide a brief reason for declining this review:');
        if (!decline_reason) { // Utilizatorul a apăsat Cancel sau a lăsat câmpul gol
            toast.error("A reason is required to decline.");
            return;
        }
    }

    try {
        await apiClient.post(`/assignments/${assignmentId}/respond`, { status, decline_reason });
        toast.success(`Review request has been ${status}.`);
        // Reîmprospătăm lista pentru a reflecta schimbarea
        fetchAssignments();
    } catch (error) {
        toast.error('Failed to respond to the request.');
    }
  };

  // Afișăm un spinner în timpul încărcării inițiale
  if (loading) {
    return (
      <div className="flex justify-center items-center mt-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className={dashboardStyles.container}>
      <h1 className={dashboardStyles.headerTitle}>My Review Assignments</h1>
      
      <div className={dashboardStyles.list}>
        {assignments.length > 0 ? (
          assignments.map(a => (
            <div key={a.id} className={dashboardStyles.itemCard}>
              {/* Partea de sus a cardului cu conținutul principal */}
              <div className={dashboardStyles.itemContent}>
                <div className={dashboardStyles.itemHeader}>
                  <h2 className={dashboardStyles.itemTitle}>{a.title}</h2>
                  <span className={dashboardStyles.itemTag}>{a.status}</span>
                </div>
                <div className={dashboardStyles.itemMeta}>
                  <span className="font-semibold text-slate-700">Domain:</span>
                  <span className="text-slate-600">{a.domain_name}</span>
                </div>
                <p className={dashboardStyles.itemDescription}>{a.description}</p>
              </div>
              
              {}
              {}
              {a.status === 'pending' && (
                <div className={dashboardStyles.itemActions}>
                  <Button variant="success" onClick={() => handleResponse(a.id, 'accepted')}>
                    <FiCheck /> Accept Assignment
                  </Button>
                  <Button variant="danger" onClick={() => handleResponse(a.id, 'declined')}>
                    <FiX /> Decline
                  </Button>
                </div>
              )}
              {a.status === 'accepted' && (
                <div className={dashboardStyles.itemActions}>
                  <Link to={`/journal/${a.journal_id}`}>
                    <Button variant="secondary">
                      <FiMessageSquare /> View Discussion
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ))
        ) : (
          // Mesaj afișat dacă nu există nicio cerere de review
          <div className={`${dashboardStyles.itemCard} ${dashboardStyles.emptyState}`}>
            <h3 className={dashboardStyles.emptyStateTitle}>No Assignments Found</h3>
            <p className={dashboardStyles.emptyStateText}>You currently have no pending or active review assignments. You will be notified when a new one is available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewerDashboard;