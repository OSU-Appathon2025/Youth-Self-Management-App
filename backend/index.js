// Load environment variables
require('dotenv').config();

// Initialize the server
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');

// Import routers
const authRouter = require('./routers/authRouter');
const userRouter = require('./routers/userRouter');
const goalRouter = require('./routers/goalRouter');
const appointmentRouter = require('./routers/appointmentRouter');
const healthInfoRouter = require('./routers/healthInfoRouter');
const emergencyContactRouter = require('./routers/emergencyContactRouter');
const medicationRouter = require('./routers/medicationRouter');
const selfAssessmentRouter = require('./routers/selfAssessmentRouter');
const progressReportRouter = require('./routers/progressReportRouter');

// Middleware
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Youth Self-Management API is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/goals', goalRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/health-info', healthInfoRouter);
app.use('/api/emergency-contacts', emergencyContactRouter);
app.use('/api/medications', medicationRouter);
app.use('/api/self-assessments', selfAssessmentRouter);
app.use('/api/progress-reports', progressReportRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 