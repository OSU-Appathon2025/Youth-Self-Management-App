const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateUser } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateUser);

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments for authenticated user
 * @access  Private
 * @query   upcoming, past, sort
 */
router.get('/', appointmentController.getAllAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment by ID
 * @access  Private
 */
router.get('/:id', appointmentController.getAppointmentById);

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private
 */
router.post('/', appointmentController.createAppointment);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update an appointment
 * @access  Private
 */
router.put('/:id', appointmentController.updateAppointment);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Delete an appointment
 * @access  Private
 */
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
