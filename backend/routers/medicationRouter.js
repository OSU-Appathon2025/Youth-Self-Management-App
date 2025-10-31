const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const { authenticateUser } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateUser);

/**
 * @route   GET /api/medications
 * @desc    Get all medications for authenticated user
 * @access  Private
 * @query   active
 */
router.get('/', medicationController.getAllMedications);

/**
 * @route   GET /api/medications/:id
 * @desc    Get medication by ID
 * @access  Private
 */
router.get('/:id', medicationController.getMedicationById);

/**
 * @route   POST /api/medications
 * @desc    Create a new medication
 * @access  Private
 */
router.post('/', medicationController.createMedication);

/**
 * @route   PUT /api/medications/:id
 * @desc    Update a medication
 * @access  Private
 */
router.put('/:id', medicationController.updateMedication);

/**
 * @route   DELETE /api/medications/:id
 * @desc    Delete a medication
 * @access  Private
 */
router.delete('/:id', medicationController.deleteMedication);

/**
 * @route   PATCH /api/medications/:id/toggle-reminder
 * @desc    Toggle medication reminder on/off
 * @access  Private
 */
router.patch('/:id/toggle-reminder', medicationController.toggleMedicationReminder);

module.exports = router;
