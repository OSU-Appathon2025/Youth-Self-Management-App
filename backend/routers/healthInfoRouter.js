const express = require('express');
const router = express.Router();
const healthInfoController = require('../controllers/healthInfoController');
const { authenticateUser } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateUser);

/**
 * @route   GET /api/health-info
 * @desc    Get health info for authenticated user
 * @access  Private
 */
router.get('/', healthInfoController.getHealthInfo);

/**
 * @route   PUT /api/health-info
 * @desc    Create or update health info
 * @access  Private
 */
router.put('/', healthInfoController.upsertHealthInfo);

/**
 * @route   DELETE /api/health-info
 * @desc    Delete health info
 * @access  Private
 */
router.delete('/', healthInfoController.deleteHealthInfo);

module.exports = router;
