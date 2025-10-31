const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { authenticateUser } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateUser);

/**
 * @route   GET /api/goals
 * @desc    Get all goals for authenticated user
 * @access  Private
 * @query   status, category, sort
 */
router.get('/', goalController.getAllGoals);

/**
 * @route   GET /api/goals/:id
 * @desc    Get goal by ID
 * @access  Private
 */
router.get('/:id', goalController.getGoalById);

/**
 * @route   POST /api/goals
 * @desc    Create a new goal
 * @access  Private
 */
router.post('/', goalController.createGoal);

/**
 * @route   PUT /api/goals/:id
 * @desc    Update a goal
 * @access  Private
 */
router.put('/:id', goalController.updateGoal);

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete a goal
 * @access  Private
 */
router.delete('/:id', goalController.deleteGoal);

/**
 * @route   PATCH /api/goals/:id/progress
 * @desc    Update goal progress
 * @access  Private
 */
router.patch('/:id/progress', goalController.updateGoalProgress);

module.exports = router;
