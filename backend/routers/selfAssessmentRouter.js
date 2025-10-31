const express = require('express');
const router = express.Router();
const selfAssessmentController = require('../controllers/selfAssessmentController');
const { authenticateUser } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateUser);

/**
 * @route   GET /api/self-assessments
 * @desc    Get all self assessments for authenticated user
 * @access  Private
 * @query   category
 */
router.get('/', selfAssessmentController.getAllSelfAssessments);

/**
 * @route   GET /api/self-assessments/summary
 * @desc    Get assessment summary by category
 * @access  Private
 */
router.get('/summary', selfAssessmentController.getAssessmentSummary);

/**
 * @route   GET /api/self-assessments/:id
 * @desc    Get self assessment by ID
 * @access  Private
 */
router.get('/:id', selfAssessmentController.getSelfAssessmentById);

/**
 * @route   POST /api/self-assessments
 * @desc    Create a new self assessment
 * @access  Private
 */
router.post('/', selfAssessmentController.createSelfAssessment);

/**
 * @route   POST /api/self-assessments/batch
 * @desc    Create multiple self assessments
 * @access  Private
 */
router.post('/batch', selfAssessmentController.createBatchSelfAssessments);

/**
 * @route   DELETE /api/self-assessments/:id
 * @desc    Delete a self assessment
 * @access  Private
 */
router.delete('/:id', selfAssessmentController.deleteSelfAssessment);

module.exports = router;
