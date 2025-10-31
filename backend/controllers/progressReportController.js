const supabase = require('../config/supabase');

/**
 * Get all progress reports for the authenticated user
 */
const getAllProgressReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('PROGRESS_REPORT')
      .select('*')
      .eq('user_id', userId)
      .order('period_end', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ progressReports: data });
  } catch (error) {
    console.error('Get all progress reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a single progress report by ID
 */
const getProgressReportById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('PROGRESS_REPORT')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Progress report not found' });
    }

    res.status(200).json({ progressReport: data });
  } catch (error) {
    console.error('Get progress report by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get latest progress report
 */
const getLatestProgressReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('PROGRESS_REPORT')
      .select('*')
      .eq('user_id', userId)
      .order('period_end', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no progress report exists, return null
      if (error.code === 'PGRST116') {
        return res.status(200).json({ progressReport: null });
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ progressReport: data });
  } catch (error) {
    console.error('Get latest progress report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new progress report
 */
const createProgressReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      periodStart,
      periodEnd,
      avgSelfAssessment,
      goalsCompleted,
      appointmentsAttended
    } = req.body;

    // Validate required fields
    if (!periodStart || !periodEnd) {
      return res.status(400).json({ error: 'Period start and end dates are required' });
    }

    const { data, error } = await supabase
      .from('PROGRESS_REPORT')
      .insert({
        user_id: userId,
        period_start: periodStart,
        period_end: periodEnd,
        avg_self_assessment: avgSelfAssessment,
        goals_completed: goalsCompleted || 0,
        appointments_attended: appointmentsAttended || 0,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Progress report created successfully',
      progressReport: data,
    });
  } catch (error) {
    console.error('Create progress report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Generate progress report for a period
 * This calculates the metrics automatically from the database
 */
const generateProgressReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { periodStart, periodEnd } = req.body;

    // Validate required fields
    if (!periodStart || !periodEnd) {
      return res.status(400).json({ error: 'Period start and end dates are required' });
    }

    // Calculate average self assessment score for the period
    const { data: assessments } = await supabase
      .from('SELF_ASSESSMENT')
      .select('response')
      .eq('user_id', userId)
      .gte('assessment_date', periodStart)
      .lte('assessment_date', periodEnd);

    const avgSelfAssessment = assessments && assessments.length > 0
      ? (assessments.reduce((sum, a) => sum + a.response, 0) / assessments.length).toFixed(2)
      : 0;

    // Count completed goals in the period
    const { data: goals } = await supabase
      .from('GOAL')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('updated_at', periodStart)
      .lte('updated_at', periodEnd);

    const goalsCompleted = goals ? goals.length : 0;

    // Count appointments attended in the period
    const { data: appointments } = await supabase
      .from('APPOINTMENT')
      .select('id')
      .eq('user_id', userId)
      .gte('appointment_date', periodStart)
      .lte('appointment_date', periodEnd);

    const appointmentsAttended = appointments ? appointments.length : 0;

    // Create the progress report
    const { data, error } = await supabase
      .from('PROGRESS_REPORT')
      .insert({
        user_id: userId,
        period_start: periodStart,
        period_end: periodEnd,
        avg_self_assessment: parseFloat(avgSelfAssessment),
        goals_completed: goalsCompleted,
        appointments_attended: appointmentsAttended,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Progress report generated successfully',
      progressReport: data,
    });
  } catch (error) {
    console.error('Generate progress report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a progress report
 */
const deleteProgressReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('PROGRESS_REPORT')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Progress report deleted successfully' });
  } catch (error) {
    console.error('Delete progress report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllProgressReports,
  getProgressReportById,
  getLatestProgressReport,
  createProgressReport,
  generateProgressReport,
  deleteProgressReport,
};
