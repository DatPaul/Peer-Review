const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Înregistrare utilizator nou
exports.register = async (req, res) => {
    const { email, password, firstName, lastName, role, expertise } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const [existingUser] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const is_approved = role === 'editor';

        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, role, is_approved) VALUES (?, ?, ?, ?, ?, ?)',
            [email, password_hash, firstName, lastName, role, is_approved]
        );
        const userId = result.insertId;

        if (role === 'reviewer' && expertise && expertise.length > 0) {
            const expertiseValues = expertise.map(domainId => [userId, domainId]);
            await pool.query('INSERT INTO reviewer_expertise (user_id, domain_id) VALUES ?', [expertiseValues]);
        }

        res.status(201).json({ message: 'User registered successfully. Reviewers require admin approval.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// Autentificare utilizator
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({ message: 'Account is deactivated.' });
        }
        
        // Verificarea parolei
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const payload = {
            id: user.id,
            role: user.role,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                is_approved: !!user.is_approved,
                average_rating: user.average_rating
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};