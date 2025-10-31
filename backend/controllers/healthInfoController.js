const supabase = require('../config/supabase');

/**
 * Get health info for the authenticated user
 */
const getHealthInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('HEALTH_INFO')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no health info exists yet, return empty object
      if (error.code === 'PGRST116') {
        return res.status(200).json({ healthInfo: null });
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ healthInfo: data });
  } catch (error) {
    console.error('Get health info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create or update health info for the authenticated user
 */
const upsertHealthInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      insuranceProvider,
      insuranceId,
      primaryPhysician,
      allergies,
      healthConditions,
      healthSummary
    } = req.body;

    // Check if health info already exists
    const { data: existing } = await supabase
      .from('HEALTH_INFO')
      .select('id')
      .eq('user_id', userId)
      .single();

    let result;
    if (existing) {
      // Update existing record
      result = await supabase
        .from('HEALTH_INFO')
        .update({
          insurance_provider: insuranceProvider,
          insurance_id: insuranceId,
          primary_physician: primaryPhysician,
          allergies,
          health_conditions: healthConditions,
          health_summary: healthSummary,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      // Create new record
      result = await supabase
        .from('HEALTH_INFO')
        .insert({
          user_id: userId,
          insurance_provider: insuranceProvider,
          insurance_id: insuranceId,
          primary_physician: primaryPhysician,
          allergies,
          health_conditions: healthConditions,
          health_summary: healthSummary,
        })
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      message: 'Health info saved successfully',
      healthInfo: data,
    });
  } catch (error) {
    console.error('Upsert health info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete health info for the authenticated user
 */
const deleteHealthInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from('HEALTH_INFO')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Health info deleted successfully' });
  } catch (error) {
    console.error('Delete health info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getHealthInfo,
  upsertHealthInfo,
  deleteHealthInfo,
};
