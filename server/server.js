require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import rute
const authRoutes = require('./routes/authRoutes');
const journalRoutes = require('./routes/journalRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const forumRoutes = require('./routes/forumRoutes');         
const adminRoutes = require('./routes/adminRoutes');         
const expertiseRoutes = require('./routes/expertiseRoutes');       
const notificationRoutes = require('./routes/notificationRoutes');
const app = express();

// Middleware-uri globale
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutele API
app.use('/api/auth', authRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/forum', forumRoutes);        
app.use('/api/admin', adminRoutes);         
app.use('/api/domains', expertiseRoutes);       
app.use('/api/notifications', notificationRoutes);
app.get('/', (req, res) => {
    res.send('Peer Review API is running...');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});