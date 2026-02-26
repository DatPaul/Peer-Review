const pool = require('../config/db');

exports.getPendingReviewers = async (req, res) => {
    try {
        const [reviewers] = await pool.query(
            `SELECT id, email, first_name, last_name, created_at FROM users 
             WHERE role = 'reviewer' AND is_approved = FALSE`
        );
        res.json(reviewers);
    } catch (error) {
        console.error("Error fetching pending reviewers:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.approveReviewer = async (req, res) => {
    const { reviewerId } = req.params;
    try {
        const [result] = await pool.query(
            "UPDATE users SET is_approved = TRUE WHERE id = ? AND role = 'reviewer'",
            [reviewerId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reviewer not found or already approved.' });
        }
        res.json({ message: 'Reviewer approved successfully.' });
    } catch (error) {
        console.error("Error approving reviewer:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllReviewers = async (req, res) => {
    try {
        const [reviewers] = await pool.query(`
            SELECT u.id, u.first_name, u.last_name, u.email, u.average_rating, 
                   GROUP_CONCAT(d.name SEPARATOR ', ') as expertise
            FROM users u
            LEFT JOIN reviewer_expertise re ON u.id = re.user_id
            LEFT JOIN domains d ON re.domain_id = d.id
            WHERE u.role = 'reviewer' AND u.is_approved = TRUE
            GROUP BY u.id
            ORDER BY u.last_name ASC
        `);
        res.json(reviewers);
    } catch (error) {
        console.error("Error fetching all reviewers:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getReviewerHistory = async (req, res) => {
    const { reviewerId } = req.params;
    try {
        const [assignments] = await pool.query(
            `SELECT ja.*, j.title
             FROM journal_assignments ja
             JOIN journals j ON ja.journal_id = j.id
             WHERE ja.reviewer_id = ? AND ja.status = 'completed'
             ORDER BY ja.review_completed_date DESC`,
            [reviewerId]
        );
        res.json(assignments);
    } catch (error) {
        console.error("Error fetching reviewer history:", error);
        res.status(500).json({ message: 'Server error' });
    }
};