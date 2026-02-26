const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.post('/', authenticate, authorize('editor'), journalController.createJournal);

router.post('/:journalId/assign', authenticate, authorize('editor'), journalController.assignReviewer);

router.get('/my-journals', authenticate, authorize('editor'), journalController.getEditorJournals);

module.exports = router;