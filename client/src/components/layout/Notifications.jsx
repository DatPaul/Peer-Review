import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { FiBell } from 'react-icons/fi';
import styles from './Notifications.module.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await apiClient.get('/notifications');
                setNotifications(res.data);
            } catch (error) { console.error(error); }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Verifică la fiecare minut
        return () => clearInterval(interval);
    }, []);

    const handleNotificationClick = async (notif) => {
        try {
            await apiClient.post(`/notifications/${notif.id}/read`);
            setNotifications(prev => prev.filter(n => n.id !== notif.id));
            setIsOpen(false);
            if (notif.link) {
                navigate(notif.link);
            }
        } catch (error) { console.error(error); }
    };

    return (
        <div className={styles.dropdown}>
            <button className={styles.iconButton} onClick={() => setIsOpen(!isOpen)}>
                <FiBell size={24} />
                {notifications.length > 0 && (
                    <span className={styles.badge}>{notifications.length}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.panel}>
                    {notifications.length > 0 ? (
                        notifications.map(notif => (
                            <div key={notif.id} className={styles.notificationItem} onClick={() => handleNotificationClick(notif)}>
                                {notif.message}
                            </div>
                        ))
                    ) : (
                        <div className={styles.notificationItem} style={{cursor: 'default'}}>No new notifications</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;