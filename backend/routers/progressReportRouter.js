const express = require('express');
const router = express.Router();
const progressReportController = require('../controllers/progressReportController');
const { authenticateUser } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateUser);

/**
 * @route   GET /api/progress-reports
 * @desc    Get all progress reports for authenticated user
 * @access  Private
 */
router.get('/', progressReportController.getAllProgressReports);

/**
 * @route   GET /api/progress-reports/latest
 * @desc    Get latest progress report
 * @access  Private
 */
router.get('/latest', progressReportController.getLatestProgressReport);

/**
 * @route   GET /api/progress-reports/:id
 * @desc    Get progress report by ID
 * @access  Private
 */
router.get('/:id', progressReportController.getProgressReportById);

/**
 * @route   POST /api/progress-reports
 * @desc    Create a new progress report
 * @access  Private
 */
router.post('/', progressReportController.createProgressReport);

/**
 * @route   POST /api/progress-reports/generate
 * @desc    Generate a progress report for a period (auto-calculated)
 * @access  Private
 */
router.post('/generate', progressReportController.generateProgressReport);

/**
 * @route   DELETE /api/progress-reports/:id
 * @desc    Delete a progress report
 * @access  Private
 */
router.delete('/:id', progressReportController.deleteProgressReport);

module.exports = router;
