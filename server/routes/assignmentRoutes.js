const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/completed', assignmentController.getCompletedAssignments);
router.get('/journal/:journalId', assignmentController.getAssignmentByJournalId);
router.get('/', authorize('reviewer'), assignmentController.getMyAssignments);
router.post('/:assignmentId/respond', authorize('reviewer'), assignmentController.respondToAssignment);
router.post('/:assignmentId/finalize', authorize('reviewer'), assignmentController.finalizeByReviewer);
router.post('/:assignmentId/rate', authorize('editor'), assignmentController.submitRating);
router.post('/:assignmentId/reopen', authorize('editor'), assignmentController.reopenReview);

module.exports = router;