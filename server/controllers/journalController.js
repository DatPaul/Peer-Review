const pool = require('../config/db');
const { createNotification } = require('./notificationController');

exports.createJournal = async (req, res) => {
    const { title, description, domain_id } = req.body;
    const editor_id = req.user.id;

    if (!title || !description || !domain_id) {
        return res.status(400).json({ message: 'Title, description, and domain are required.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO journals (title, description, domain_id, editor_id) VALUES (?, ?, ?, ?)',
            [title, description, domain_id, editor_id]
        );
        res.status(201).json({ message: 'Journal created successfully', journalId: result.insertId });
    } catch (error) {
        console.error("Error creating journal:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getEditorJournals = async (req, res) => {
    const editor_id = req.user.id;
    try {
        const [journals] = await pool.query(
            `SELECT j.* 
             FROM journals j
             LEFT JOIN journal_assignments ja ON j.id = ja.journal_id
             WHERE j.editor_id = ? 
               AND (ja.status IS NULL OR ja.status != 'completed')
             GROUP BY j.id
             ORDER BY j.created_at DESC`,
            [editor_id]
        );
        res.json(journals);
    } catch (error) {
        console.error("Error fetching editor's active journals:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.assignReviewer = async (req, res) => {
    const { journalId } = req.params;
    const editorId = req.user.id;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const [journals] = await connection.query('SELECT * FROM journals WHERE id = ?', [journalId]);
        if (journals.length === 0 || journals[0].editor_id !== editorId) {
            throw new Error('Journal not found or you are not the owner.');
        }
        const journal = journals[0];
        const { domain_id } = journal;

        const [reviewers] = await connection.query(`
            SELECT u.id, u.first_name, u.last_name FROM users u
            JOIN reviewer_expertise re ON u.id = re.user_id
            WHERE u.role = 'reviewer' AND u.is_approved = TRUE AND re.domain_id = ?
            AND u.id NOT IN (SELECT reviewer_id FROM journal_assignments WHERE journal_id = ?)
            LIMIT 1
        `, [domain_id, journalId]);

        if (reviewers.length === 0) {
            throw new Error('No available reviewers found for this domain.');
        }
        
        const reviewer_id = reviewers[0].id;
        
        await connection.query(
            'INSERT INTO journal_assignments (journal_id, reviewer_id, editor_id) VALUES (?, ?, ?)',
            [journalId, reviewer_id, editorId]
        );
        
        await connection.query("UPDATE journals SET status = 'assigned' WHERE id = ?", [journalId]);
        await createNotification(reviewer_id, `You have a new review request for the journal: "${journal.title}".`, '/reviewer/dashboard');
        
        await connection.commit();
        res.status(200).json({ message: `Reviewer ${reviewers[0].first_name} ${reviewers[0].last_name} has been assigned.`, reviewerId: reviewer_id });

    } catch (error) {
        await connection.rollback();
        console.error("Error in assignReviewer:", error);
        res.status(500).json({ message: error.message || 'Server error during assignment.' });
    } finally {
        connection.release();
    }
};