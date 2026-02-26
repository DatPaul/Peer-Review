const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate, authorize('admin'));

router.get('/reviewers/pending', adminController.getPendingReviewers);
router.post('/reviewers/:reviewerId/approve', adminController.approveReviewer);

router.get('/reviewers', adminController.getAllReviewers);
router.get('/reviewers/:reviewerId/history', adminController.getReviewerHistory);

module.exports = router;