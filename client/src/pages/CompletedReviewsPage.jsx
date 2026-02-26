import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner.jsx';
import { Link, useLocation } from 'react-router-dom';
import { FiMessageSquare } from 'react-icons/fi';
import dashboardStyles from './Dashboard.module.css';

const CompletedReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const fetchCompleted = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/assignments/completed');
            setReviews(res.data);
        } catch (error) {
            toast.error("Could not fetch completed reviews.");
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompleted();
    }, [fetchCompleted, location.key]);

    if (loading) {
        return (
            <div className="flex justify-center items-center mt-24">
                <Spinner />
            </div>
        );
    }

    return (
        <div className={dashboardStyles.container}>
            <h1 className={dashboardStyles.headerTitle}>Completed Reviews</h1>
            <div className={`${dashboardStyles.list} mt-8`}>
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className={dashboardStyles.itemCard}>
                            <div className={dashboardStyles.itemContent}>
                                <h2 className={dashboardStyles.itemTitle}>{review.title}</h2>
                                <p className={dashboardStyles.itemMeta}>
                                    Completed on: {review.review_completed_date ? new Date(review.review_completed_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div className={dashboardStyles.itemActions}>
                                <Link to={`/journal/${review.journal_id}`}>
                                    <button className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors bg-transparent border-none cursor-pointer">
                                        <FiMessageSquare /> View Archived Discussion
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={`${dashboardStyles.itemCard} ${dashboardStyles.emptyState}`}>
                        <h3 className={dashboardStyles.emptyStateTitle}>No Completed Reviews</h3>
                        <p className={dashboardStyles.emptyStateText}>You have not completed any review processes yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompletedReviewsPage;