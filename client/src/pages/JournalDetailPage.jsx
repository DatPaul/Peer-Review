// client/src/pages/JournalDetailPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner.jsx';
import Button from '../components/common/Button.jsx';
import { FiSend, FiStar, FiCheckCircle, FiLock, FiCheck, FiPaperclip, FiRefreshCw } from 'react-icons/fi';
import Modal from '../components/common/Modal.jsx';
import styles from './JournalDetailPage.module.css';

// Componenta internă pentru Rating
const Rating = ({ onRate }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                        key={star}
                        size={32}
                        className="cursor-pointer text-gray-300 transition-colors duration-150"
                        style={{ color: (hoverRating || rating) >= star ? '#f59e0b' : 'currentColor' }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                    />
                ))}
            </div>
            <Button variant="primary" onClick={() => onRate(rating)} disabled={rating === 0}>
                Submit Final Rating
            </Button>
        </div>
    );
};

// Componenta principală a paginii
const JournalDetailPage = () => {
    const { journalId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState(null);
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', buttonText: '', navigateTo: '/' });
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchDetails = useCallback(async () => {
        try {
            const [msgRes, assignRes] = await Promise.all([
                apiClient.get(`/forum/${journalId}`),
                apiClient.get(`/assignments/journal/${journalId}`)
            ]);
            setMessages(msgRes.data);
            setAssignment(assignRes.data);
        } catch (error) {
            toast.error("Could not load discussion details.");
        } finally {
            setLoading(false);
        }
    }, [journalId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            toast.success(`Selected file: ${selectedFile.name}`);
        }
    };

    const handleSubmitMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !file) return;
        const formData = new FormData();
        formData.append('message', newMessage);
        if (file) formData.append('attachment', file);
        try {
            await apiClient.post(`/forum/${journalId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setNewMessage('');
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            fetchDetails();
        } catch (error) {
            toast.error('Failed to send message.');
        }
    };

    const handleFinalizeReview = async () => {
        if (!assignment) return;
        if (!window.confirm("Are you sure you want to submit your final review? You will no longer be able to send messages in this forum.")) return;
        try {
            await apiClient.post(`/assignments/${assignment.id}/finalize`);
            setModalConfig({
                title: 'Review Submitted!',
                message: 'Your review has been successfully submitted. This task has been moved to your completed reviews.',
                buttonText: 'Back to My Assignments',
                navigateTo: '/reviewer/dashboard'
            });
            setIsConfirmModalOpen(true);
        } catch (error) { toast.error("Failed to submit the review."); }
    };

    const handleRate = async (rating) => {
        if (!assignment || rating === 0) {
            toast.error("Please select a rating before submitting.");
            return;
        }
        const promise = apiClient.post(`/assignments/${assignment.id}/rate`, { rating });
        toast.promise(promise, {
            loading: 'Submitting rating...',
            success: () => {
                setModalConfig({
                    title: 'Review Completed!',
                    message: 'The rating was submitted and the process is now finalized.',
                    buttonText: 'Take me to My Journals',
                    navigateTo: '/editor/dashboard'
                });
                setIsConfirmModalOpen(true);
                return 'Rating submitted successfully!';
            },
            error: (err) => err.response?.data?.message || "An error occurred."
        });
    };
    
    const handleReopenReview = async () => {
        if (!assignment) return;
        if (!window.confirm("Are you sure you want to reopen this review? This will move the review back to an active state for both you and the reviewer.")) {
            return;
        }
        try {
            await apiClient.post(`/assignments/${assignment.id}/reopen`);
            toast.success("Review has been reopened!");
            fetchDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reopen the review.");
        }
    };

    const handleCloseConfirmation = () => {
        setIsConfirmModalOpen(false);
        navigate(modalConfig.navigateTo, { replace: true });
    };
    
    if (loading) return <div className="mt-24 flex justify-center"><Spinner /></div>;
    if (!assignment) return <div className="text-center mt-24 text-red-500 font-semibold">Could not find assignment details.</div>;

    const isReviewerFinished = !!assignment.reviewer_finished;
    const isProcessCompleted = assignment.status === 'completed';
    const isForumLockedForCurrentUser = (user.role === 'reviewer' && isReviewerFinished) || isProcessCompleted;
    const canSubmitRating = user.role === 'editor' && isReviewerFinished && !isProcessCompleted;

    return (
        <div className="max-w-4xl mx-auto my-8">
            <h1 className="text-3xl font-bold mb-4 font-['Lora',_serif]">Discussion & Review</h1>
            
            <div className={styles.chatContainer}>
                <div className={styles.messagesArea}>
                    {messages.length > 0 ? messages.map(msg => (
                        <div key={msg.id} className={`${styles.messageBubble} ${msg.sender_id === user.id ? styles.myMessage : styles.theirMessage}`}>
                            <p className={styles.senderInfo}>{msg.first_name} ({msg.role})</p>
                            <p>{msg.message}</p>
                            {msg.file_path && (
                                <a href={`http://localhost:5000/${msg.file_path.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>
                                    View Attachment: {msg.file_name}
                                </a>
                            )}
                        </div>
                    )) : (
                        <p className="text-center text-slate-400">No messages yet. Start the conversation!</p>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {!isForumLockedForCurrentUser ? (
                    <div className={styles.inputArea}>
                        <form onSubmit={handleSubmitMessage} className={styles.inputForm}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className={styles.textInput}
                            />
                            <input 
                                type="file" 
                                id="file-input" 
                                ref={fileInputRef}
                                onChange={handleFileChange} 
                                className={styles.fileInput}
                            />
                            <label htmlFor="file-input" className={styles.attachButton} title="Attach a file">
                                <FiPaperclip size={20} />
                            </label>
                            <Button type="submit" variant="primary">
                                <FiSend />
                            </Button>
                        </form>
                        {file && (
                            <p className="text-xs text-slate-500 mt-2">
                                Attached: <strong>{file.name}</strong>
                            </p>
                        )}
                    </div>
                ) : (
                    <div className={`${styles.inputArea} bg-slate-100`}>
                        <p className="text-slate-500 font-semibold text-center flex items-center justify-center gap-2">
                            <FiLock />
                            This discussion is now read-only for you.
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-6 bg-white border border-slate-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold font-['Lora',_serif] mb-4">Review Actions</h2>
                {isProcessCompleted ? (
                    <div className="text-center">
                        <div className="p-4 bg-green-50 text-green-700 rounded-md flex items-center justify-center gap-2 mb-4">
                            <FiCheckCircle />
                            <span>This review process was completed on {new Date(assignment.review_completed_date).toLocaleDateString()}.</span>
                        </div>
                        {user.role === 'editor' && (
                            <Button variant="primary" onClick={handleReopenReview}>
                                <FiRefreshCw /> Reopen Review
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {user.role === 'reviewer' && !isReviewerFinished && (
                            <div className="text-center">
                                <p className="mb-4 text-slate-600">Once you have posted your final comments and attachments, finalize the review process.</p>
                                <Button variant="success" onClick={handleFinalizeReview}>
                                    <FiCheck /> Finalize & Submit Review
                                </Button>
                            </div>
                        )}
                        {user.role === 'reviewer' && isReviewerFinished && (
                            <div className="text-center p-4 bg-blue-50 text-blue-700 rounded-md flex items-center justify-center gap-2">
                                <FiCheckCircle />
                                <span>Your review has been submitted. Awaiting editor's final rating.</span>
                            </div>
                        )}
                        {user.role === 'editor' && !isReviewerFinished && (
                             <div className="text-center p-4 bg-slate-100 text-slate-600 rounded-md">
                                Awaiting reviewer's final submission.
                            </div>
                        )}
                        {canSubmitRating && (
                            <div className="mt-4 text-center">
                                <p className="font-semibold mb-2 text-slate-700">The reviewer has submitted their final comments. Please rate their contribution to complete the process:</p>
                                <Rating onRate={handleRate} />
                            </div>
                        )}
                    </>
                )}
            </div>
            
            <Modal isOpen={isConfirmModalOpen} onClose={handleCloseConfirmation} title={modalConfig.title}>
                <div className="text-center">
                    <FiCheckCircle className="mx-auto text-green-500 h-16 w-16 mb-4" />
                    <p className="text-lg text-slate-700">{modalConfig.message}</p>
                    <div className="mt-6">
                        <Button variant="primary" onClick={handleCloseConfirmation}>
                            {modalConfig.buttonText}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default JournalDetailPage;