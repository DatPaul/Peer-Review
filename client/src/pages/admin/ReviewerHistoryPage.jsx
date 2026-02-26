import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient.js';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner.jsx';
import { FiStar, FiArrowLeft } from 'react-icons/fi';
import dashboardStyles from '../Dashboard.module.css';

const ReviewerHistoryPage = () => {
    const { reviewerId } = useParams();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewerInfo, setReviewerInfo] = useState(null);

    const fetchHistory = useCallback(async () => {
        try {
            const [historyRes, reviewersRes] = await Promise.all([
                apiClient.get(`/admin/reviewers/${reviewerId}/history`),
                apiClient.get('/admin/reviewers')
            ]);
            
            setHistory(historyRes.data);
            const currentReviewer = reviewersRes.data.find(r => r.id === parseInt(reviewerId));
            setReviewerInfo(currentReviewer);

        } catch (error) {
            toast.error("Could not fetch reviewer's history.");
        } finally {
            setLoading(false);
        }
    }, [reviewerId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);


    if (loading) {
        return (
            <div className="flex justify-center items-center mt-24">
                <Spinner />
            </div>
        );
    }

    return (
        <div className={dashboardStyles.container}>
            <Link to="/admin/view-reviewers" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors">
                <FiArrowLeft />
                Back to All Reviewers
            </Link>
            
            {reviewerInfo && (
                <h1 className={dashboardStyles.headerTitle}>
                    Review History for {reviewerInfo.first_name} {reviewerInfo.last_name}
                </h1>
            )}

            <div className={`${dashboardStyles.list} mt-8`}>
                {history.length > 0 ? (
                    history.map(item => (
                        <div key={item.id} className={dashboardStyles.itemCard}>
                            <div className={dashboardStyles.itemContent}>
                                <h2 className={dashboardStyles.itemTitle}>{item.title}</h2>
                                <div className={`${dashboardStyles.itemMeta} justify-between mt-4`}>
                                    <span>Completed on: {new Date(item.review_completed_date).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-1 font-semibold">
                                        <span className="text-slate-500">Rating given:</span>
                                        <FiStar className="text-amber-400 fill-current" />
                                        <span>{item.rating_given} / 5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={`${dashboardStyles.itemCard} ${dashboardStyles.emptyState}`}>
                        <h3 className={dashboardStyles.emptyStateTitle}>No History Found</h3>
                        <p className={dashboardStyles.emptyStateText}>This reviewer has not completed any reviews yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewerHistoryPage;