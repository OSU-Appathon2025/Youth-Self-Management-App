const supabase = require('../config/supabase');

/**
 * Get all self assessments for the authenticated user
 */
const getAllSelfAssessments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.query;

    let query = supabase
      .from('SELF_ASSESSMENT')
      .select('*')
      .eq('user_id', userId);

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category);
    }

    query = query.order('assessment_date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ selfAssessments: data });
  } catch (error) {
    console.error('Get all self assessments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a single self assessment by ID
 */
const getSelfAssessmentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('SELF_ASSESSMENT')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Self assessment not found' });
    }

    res.status(200).json({ selfAssessment: data });
  } catch (error) {
    console.error('Get self assessment by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new self assessment
 */
const createSelfAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, question, response, assessmentDate } = req.body;

    // Validate required fields
    if (!category || !question || response === undefined) {
      return res.status(400).json({ error: 'Category, question, and response are required' });
    }

    // Validate response is between 1 and 5
    if (response < 1 || response > 5) {
      return res.status(400).json({ error: 'Response must be between 1 and 5' });
    }

    const { data, error } = await supabase
      .from('SELF_ASSESSMENT')
      .insert({
        user_id: userId,
        category,
        question,
        response,
        assessment_date: assessmentDate || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Self assessment created successfully',
      selfAssessment: data,
    });
  } catch (error) {
    console.error('Create self assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create multiple self assessments (batch)
 */
const createBatchSelfAssessments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assessments } = req.body;

    // Validate input
    if (!Array.isArray(assessments) || assessments.length === 0) {
      return res.status(400).json({ error: 'Assessments array is required' });
    }

    // Validate each assessment
    for (const assessment of assessments) {
      if (!assessment.category || !assessment.question || assessment.response === undefined) {
        return res.status(400).json({ error: 'Each assessment must have category, question, and response' });
      }
      if (assessment.response < 1 || assessment.response > 5) {
        return res.status(400).json({ error: 'All responses must be between 1 and 5' });
      }
    }

    // Add user_id and assessment_date to each assessment
    const assessmentsToInsert = assessments.map(a => ({
      user_id: userId,
      category: a.category,
      question: a.question,
      response: a.response,
      assessment_date: a.assessmentDate || new Date().toISOString().split('T')[0],
    }));

    const { data, error } = await supabase
      .from('SELF_ASSESSMENT')
      .insert(assessmentsToInsert)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: `${data.length} self assessments created successfully`,
      selfAssessments: data,
    });
  } catch (error) {
    console.error('Create batch self assessments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get assessment summary by category
 */
const getAssessmentSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('SELF_ASSESSMENT')
      .select('category, response, assessment_date')
      .eq('user_id', userId)
      .order('assessment_date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Group by category and calculate average
    const summary = data.reduce((acc, assessment) => {
      if (!acc[assessment.category]) {
        acc[assessment.category] = {
          category: assessment.category,
          totalResponses: 0,
          sumResponses: 0,
          count: 0,
          latestDate: assessment.assessment_date,
        };
      }
      acc[assessment.category].sumResponses += assessment.response;
      acc[assessment.category].count += 1;
      acc[assessment.category].totalResponses = assessment.response;

      // Update latest date if this assessment is newer
      if (assessment.assessment_date > acc[assessment.category].latestDate) {
        acc[assessment.category].latestDate = assessment.assessment_date;
      }

      return acc;
    }, {});

    // Calculate averages
    const summaryArray = Object.values(summary).map(item => ({
      category: item.category,
      averageScore: (item.sumResponses / item.count).toFixed(2),
      assessmentCount: item.count,
      latestAssessmentDate: item.latestDate,
    }));

    res.status(200).json({ summary: summaryArray });
  } catch (error) {
    console.error('Get assessment summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a self assessment
 */
const deleteSelfAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('SELF_ASSESSMENT')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Self assessment deleted successfully' });
  } catch (error) {
    console.error('Delete self assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllSelfAssessments,
  getSelfAssessmentById,
  createSelfAssessment,
  createBatchSelfAssessments,
  getAssessmentSummary,
  deleteSelfAssessment,
};
