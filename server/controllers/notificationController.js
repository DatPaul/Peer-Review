const pool = require('../config/db');

const createNotification = async (userId, message, link = null) => {
    try {
        await pool.query(
            'INSERT INTO notifications (user_id, message, link) VALUES (?, ?, ?)',
            [userId, message, link]
        );
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};

exports.getUnreadNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const [notifications] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC',
            [userId]
        );
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );
        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createNotification = createNotification;