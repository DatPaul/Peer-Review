const pool = require('../config/db');

exports.getAllDomains = async (req, res) => {
    try {
        const [domains] = await pool.query('SELECT id, name FROM domains ORDER BY name ASC');
        res.json(domains);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};