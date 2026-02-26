const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', notificationController.getUnreadNotifications);
router.post('/:notificationId/read', notificationController.markAsRead);

module.exports = router;