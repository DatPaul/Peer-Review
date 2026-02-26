import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner.jsx';
import Button from '../../components/common/Button.jsx';
import { FiStar, FiEye } from 'react-icons/fi';
import dashboardStyles from '../Dashboard.module.css';

const ViewReviewersPage = () => {
    const [reviewers, setReviewers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviewers = useCallback(async () => {
        try {
            const res = await apiClient.get('/admin/reviewers');
            setReviewers(res.data);
        } catch (error) {
            toast.error("Could not fetch the list of reviewers.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviewers();
    }, [fetchReviewers]);

    if (loading) {
        return (
            <div className="flex justify-center items-center mt-24">
                <Spinner />
            </div>
        );
    }

    return (
        <div className={dashboardStyles.container}>
            <h1 className={dashboardStyles.headerTitle}>All Approved Reviewers</h1>
            
            <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 mt-8">
                <table className="min-w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 text-xs text-slate-700 uppercase tracking-wider">
                        <tr>
                            <th scope="col" className="px-6 py-4">Name</th>
                            <th scope="col" className="px-6 py-4">Expertise</th>
                            <th scope="col" className="px-6 py-4">Avg. Rating</th>
                            <th scope="col" className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviewers.length > 0 ? (
                            reviewers.map(reviewer => (
                                <tr key={reviewer.id} className="bg-white border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{reviewer.first_name} {reviewer.last_name}</td>
                                    <td className="px-6 py-4 max-w-sm truncate">{reviewer.expertise || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <FiStar className="text-amber-400 fill-current" />
                                            <span className="font-semibold">{Number(reviewer.average_rating).toFixed(1)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/admin/reviewer/${reviewer.id}/history`}>
                                            <Button variant="secondary">
                                                <FiEye /> View History
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-slate-500">No approved reviewers found in the system.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewReviewersPage;