const express = require('express');
const router = express.Router();
const emergencyContactController = require('../controllers/emergencyContactController');
const { authenticateUser } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateUser);

/**
 * @route   GET /api/emergency-contacts
 * @desc    Get all emergency contacts for authenticated user
 * @access  Private
 */
router.get('/', emergencyContactController.getAllEmergencyContacts);

/**
 * @route   GET /api/emergency-contacts/:id
 * @desc    Get emergency contact by ID
 * @access  Private
 */
router.get('/:id', emergencyContactController.getEmergencyContactById);

/**
 * @route   POST /api/emergency-contacts
 * @desc    Create a new emergency contact
 * @access  Private
 */
router.post('/', emergencyContactController.createEmergencyContact);

/**
 * @route   PUT /api/emergency-contacts/:id
 * @desc    Update an emergency contact
 * @access  Private
 */
router.put('/:id', emergencyContactController.updateEmergencyContact);

/**
 * @route   DELETE /api/emergency-contacts/:id
 * @desc    Delete an emergency contact
 * @access  Private
 */
router.delete('/:id', emergencyContactController.deleteEmergencyContact);

module.exports = router;
