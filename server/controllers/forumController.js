const pool = require('../config/db');

async function checkForumAccess(userId, journalId) {
    const [journal] = await pool.query(
        'SELECT editor_id FROM journals WHERE id = ?', 
        [journalId]
    );
    // Utilizatorul este editorul principal al jurnalului.
    if (journal.length > 0 && journal[0].editor_id === userId) {
        return true;
    }

    // Utilizatorul este recenzorul asignat pentru acest jurnal (indiferent de status).
    const [assignment] = await pool.query(
        'SELECT reviewer_id FROM journal_assignments WHERE journal_id = ? AND reviewer_id = ?',
        [journalId, userId]
    );
    if (assignment.length > 0) {
        return true;
    }

    return false;
}

exports.getMessages = async (req, res) => {
    const { journalId } = req.params;
    const userId = req.user.id;

    try {
        const hasAccess = await checkForumAccess(userId, journalId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this forum.' });
        }

        const [messages] = await pool.query(
            `SELECT fm.*, u.first_name, u.last_name, u.role
             FROM forum_messages fm
             JOIN users u ON fm.sender_id = u.id
             WHERE fm.journal_id = ?
             ORDER BY fm.created_at ASC`,
            [journalId]
        );
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.postMessage = async (req, res) => {
    const { journalId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message && !req.file) {
        return res.status(400).json({ message: 'Message content or a file is required.' });
    }

    try {
        const hasAccess = await checkForumAccess(userId, journalId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Forbidden: You cannot post in this forum.' });
        }

        let filePath = null, fileName = null, fileType = null;
        if (req.file) {
            filePath = req.file.path;
            fileName = req.file.originalname;
            fileType = req.file.mimetype;
        }

        await pool.query(
            'INSERT INTO forum_messages (journal_id, sender_id, message, file_path, file_name, file_type) VALUES (?, ?, ?, ?, ?, ?)',
            [journalId, userId, message || '', filePath, fileName, fileType]
        );
        res.status(201).json({ message: 'Message posted successfully' });
    } catch (error) {
        console.error("Error posting message:", error);
        res.status(500).json({ message: 'Server error' });
    }
};