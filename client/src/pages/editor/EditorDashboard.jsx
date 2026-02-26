import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Modal from '../../components/common/Modal.jsx';
import { FiPlus, FiSend, FiMessageSquare } from 'react-icons/fi';
import dashboardStyles from '../Dashboard.module.css';

const CreateJournalForm = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domainId, setDomainId] = useState('');
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    apiClient.get('/domains').then(res => {
        setDomains(res.data);
        if (res.data.length > 0) setDomainId(res.data[0].id);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !domainId) {
        toast.error("All fields are required.");
        return;
    }
    try {
      await apiClient.post('/journals', { title, description, domain_id: domainId });
      toast.success('Journal created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create journal.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Journal Title" required className="w-full px-3 py-2 border rounded-md"/>
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" required className="w-full px-3 py-2 border rounded-md"/>
      <select value={domainId} onChange={e => setDomainId(e.target.value)} className="w-full px-3 py-2 border rounded-md">
        {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      <Button type="submit" variant="primary" className="w-full">Create Journal</Button>
    </form>
  );
};

const EditorDashboard = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const fetchJournals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/journals/my-journals');
      setJournals(response.data);
    } catch (error) {
      toast.error('Could not fetch journals.');
      setJournals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals, location.key]);

  const handleAssignReviewer = async (journalId) => {
    try {
        const response = await apiClient.post(`/journals/${journalId}/assign`);
        toast.success(response.data.message || "Searching for a suitable reviewer...");
        fetchJournals();
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to assign reviewer.");
    }
  };

  if (loading) return <div className="mt-24 flex justify-center"><Spinner /></div>;

  return (
    <div className={dashboardStyles.container}>
      <div className={dashboardStyles.header}>
        <h1 className={dashboardStyles.title}>My Journals</h1>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <FiPlus /> New Journal
        </Button>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create a New Journal">
        <CreateJournalForm onClose={() => setIsModalOpen(false)} onSuccess={fetchJournals} />
      </Modal>

      <div className={`${dashboardStyles.list} mt-8`}>
        {journals.length > 0 ? (
          journals.map(journal => (
            <div key={journal.id} className={dashboardStyles.itemCard}>
              <div className={dashboardStyles.itemContent}>
                  <div className={dashboardStyles.itemHeader}>
                    <h2 className={dashboardStyles.itemTitle}>{journal.title}</h2>
                    <span className={dashboardStyles.itemTag}>{journal.status.replace('_', ' ')}</span>
                  </div>
                  <p className={dashboardStyles.itemDescription}>{journal.description}</p>
              </div>
              <div className={dashboardStyles.itemActions}>
                {journal.status === 'pending' && 
                  <Button onClick={() => handleAssignReviewer(journal.id)} variant="primary">
                    <FiSend /> Find & Assign Reviewer
                  </Button>
                }
                {journal.status === 'in_review' && 
                  <Link to={`/journal/${journal.id}`}>
                    <Button variant="secondary">
                      <FiMessageSquare /> View Forum
                    </Button>
                  </Link>
                }
                 {journal.status === 'assigned' && 
                  <Button variant="secondary" disabled>
                    Awaiting Reviewer Response
                  </Button>
                }
              </div>
            </div>
          ))
        ) : (
          <div className={`${dashboardStyles.itemCard} ${dashboardStyles.emptyState}`}>
            <h3 className={dashboardStyles.emptyStateTitle}>No Active Journals</h3>
            <p className={dashboardStyles.emptyStateText}>Click the "+ New Journal" button to add your first publication. Completed reviews can be found in the "View Reviews" section.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorDashboard;