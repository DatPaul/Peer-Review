const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticate, authorize(['editor', 'reviewer']));

router.get('/:journalId', forumController.getMessages);

router.post('/:journalId', upload.single('attachment'), forumController.postMessage);

module.exports = router;