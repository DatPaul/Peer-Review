const pool = require('../config/db');
const { createNotification } = require('./notificationController');

exports.getMyAssignments = async (req, res) => {
    const reviewer_id = req.user.id;
    try {
        const [assignments] = await pool.query(
            `SELECT ja.*, j.title, j.description, j.submission_date, d.name as domain_name
             FROM journal_assignments ja
             JOIN journals j ON ja.journal_id = j.id
             JOIN domains d ON j.domain_id = d.id
             WHERE ja.reviewer_id = ? 
               AND ja.status != 'completed' 
               AND ja.reviewer_finished = FALSE
             ORDER BY ja.status = 'pending' DESC, ja.assigned_date DESC`,
            [reviewer_id]
        );
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCompletedAssignments = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const field = userRole === 'editor' ? 'ja.editor_id' : 'ja.reviewer_id';
    try {
        const [assignments] = await pool.query(
            `SELECT ja.*, j.title, j.description, d.name as domain_name
             FROM journal_assignments ja
             JOIN journals j ON ja.journal_id = j.id
             JOIN domains d ON j.domain_id = d.id
             WHERE ${field} = ? AND ja.status = 'completed'
             ORDER BY ja.review_completed_date DESC`,
            [userId]
        );
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching completed assignments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAssignmentByJournalId = async (req, res) => {
    const { journalId } = req.params;
    const userId = req.user.id;
    try {
        const [assignments] = await pool.query(
            `SELECT * FROM journal_assignments 
             WHERE journal_id = ? AND (editor_id = ? OR reviewer_id = ?)`,
            [journalId, userId, userId] 
        );

        if (assignments.length === 0) {
            return res.status(404).json({ message: 'Assignment not found or you do not have permission to view it.' });
        }
        res.json(assignments[0]);

    } catch (error) {
        console.error('Error in getAssignmentByJournalId:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.respondToAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const { status, decline_reason } = req.body;
    const reviewer_id = req.user.id;
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        const [assignments] = await connection.query(
            `SELECT ja.*, j.title as journal_title, j.editor_id, u.first_name, u.last_name
             FROM journal_assignments ja
             JOIN journals j ON ja.journal_id = j.id
             JOIN users u ON ja.reviewer_id = u.id
             WHERE ja.id = ? AND ja.reviewer_id = ?`,
            [assignmentId, reviewer_id]
        );
        if (assignments.length === 0) {
            throw new Error('Assignment not found or not authorized.');
        }
        const assignment = assignments[0];
        if (assignment.status !== 'pending') {
            throw new Error('Assignment has already been responded to.');
        }
        await connection.query(
            `UPDATE journal_assignments SET status = ?, response_date = CURRENT_TIMESTAMP, decline_reason = ? WHERE id = ?`,
            [status, status === 'declined' ? decline_reason : null, assignmentId]
        );
        const journalStatus = status === 'accepted' ? 'in_review' : 'pending';
        await connection.query("UPDATE journals SET status = ? WHERE id = ?", [journalStatus, assignment.journal_id]);
        const message = `Reviewer ${assignment.first_name} ${assignment.last_name} has ${status} the review request for "${assignment.journal_title}".`;
        await createNotification(assignment.editor_id, message, `/journal/${assignment.journal_id}`);
        await connection.commit();
        res.json({ message: `Assignment ${status} successfully.` });
    } catch (error) {
        await connection.rollback();
        console.error('Error responding to assignment:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    } finally {
        connection.release();
    }
};

exports.finalizeByReviewer = async (req, res) => {
    const { assignmentId } = req.params;
    const reviewerId = req.user.id;
    try {
        const [result] = await pool.query(
            'UPDATE journal_assignments SET reviewer_finished = TRUE WHERE id = ? AND reviewer_id = ?',
            [assignmentId, reviewerId]
        );
        if (result.affectedRows === 0) throw new Error('Assignment not found or not authorized.');

        const [assignments] = await pool.query(
            `SELECT j.id as journal_id, j.title, ja.editor_id FROM journal_assignments ja 
             JOIN journals j ON ja.journal_id = j.id WHERE ja.id = ?`,
            [assignmentId]
        );
        
        const { title, editor_id, journal_id } = assignments[0];
        await createNotification(editor_id, `The review for "${title}" has been submitted and is ready for evaluation.`, `/journal/${journal_id}`);

        res.status(200).json({ message: 'Review submitted successfully.' });
    } catch (error) {
        console.error('Error finalizing review:', error);
        res.status(500).json({ message: error.message || 'Server error.' });
    }
};

exports.submitRating = async (req, res) => {
    const { assignmentId } = req.params;
    const { rating } = req.body;
    const editorId = req.user.id;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Invalid rating.' });
    
    try {
        const [assignments] = await pool.query(
            `SELECT ja.*, j.title as journal_title
             FROM journal_assignments ja JOIN journals j ON ja.journal_id = j.id
             WHERE ja.id = ? AND ja.editor_id = ? AND ja.reviewer_finished = TRUE`,
            [assignmentId, editorId]
        );
        if (assignments.length === 0) throw new Error('Cannot submit rating until the reviewer has finalized.');

        const assignment = assignments[0];

        await pool.query(
            "UPDATE journal_assignments SET rating_given = ?, review_completed_date = CURRENT_TIMESTAMP, status = 'completed' WHERE id = ?",
            [rating, assignmentId]
        );
        
        await pool.query(`
            UPDATE users u SET average_rating = (
                SELECT AVG(ja.rating_given) 
                FROM journal_assignments ja 
                WHERE ja.reviewer_id = ? AND ja.rating_given IS NOT NULL
            ) WHERE u.id = ?`,
            [assignment.reviewer_id, assignment.reviewer_id]
        );
        
        await createNotification(assignment.reviewer_id, `Your review for "${assignment.journal_title}" has been completed and rated.`);
        
        res.status(200).json({ message: 'Rating submitted and review completed.' });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.reopenReview = async (req, res) => {
    const { assignmentId } = req.params;
    const editorId = req.user.id;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Pasul 1: Actualizeaza assignment-ul
        const [assignmentResult] = await connection.query(
            `UPDATE journal_assignments 
             SET status = 'in_review', reviewer_finished = FALSE, editor_confirmed = FALSE, rating_given = NULL, review_completed_date = NULL
             WHERE id = ? AND editor_id = ? AND status = 'completed'`,
            [assignmentId, editorId]
        );

        if (assignmentResult.affectedRows === 0) {
            throw new Error('Completed review not found or you are not authorized to reopen it.');
        }

        // Gasim journal_id pentru a actualiza si jurnalul
        const [assignments] = await connection.query(`SELECT journal_id FROM journal_assignments WHERE id = ?`, [assignmentId]);
        const { journal_id } = assignments[0];
        
        // Pasul 2: Actualizeaza si jurnalul principal
        await connection.query(
            `UPDATE journals SET status = 'in_review' WHERE id = ?`,
            [journal_id]
        );

        // Pasul 3: Notifica recenzorul
        const [notificationData] = await connection.query(
            `SELECT j.title, ja.reviewer_id 
             FROM journal_assignments ja JOIN journals j ON ja.journal_id = j.id 
             WHERE ja.id = ?`,
            [assignmentId]
        );
        const { title, reviewer_id } = notificationData[0];
        await createNotification(reviewer_id, `The review process for "${title}" has been reopened by the editor.`, `/journal/${journal_id}`);
        
        await connection.commit();
        res.status(200).json({ message: 'Review process has been reopened.' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error reopening review:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    } finally {
        if (connection) connection.release();
    }
};