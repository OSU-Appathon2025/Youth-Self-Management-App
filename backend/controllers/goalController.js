const supabase = require('../config/supabase');

/**
 * Get all goals for the authenticated user
 */
const getAllGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, category, sort = 'created_at' } = req.query;

    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    // Sort
    query = query.order(sort, { ascending: false });

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ goals: data });
  } catch (error) {
    console.error('Get all goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a single goal by ID
 */
const getGoalById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.status(200).json({ goal: data });
  } catch (error) {
    console.error('Get goal by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new goal
 */
const createGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, category, targetDate, status, milestones } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        title,
        description,
        category,
        target_date: targetDate,
        status: status || 'not_started',
        milestones: milestones || [],
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Goal created successfully',
      goal: data,
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update a goal
 */
const updateGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, category, targetDate, status, milestones, progress } = req.body;

    const { data, error } = await supabase
      .from('goals')
      .update({
        title,
        description,
        category,
        target_date: targetDate,
        status,
        milestones,
        progress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      message: 'Goal updated successfully',
      goal: data,
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a goal
 */
const deleteGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update goal progress
 */
const updateGoalProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { progress } = req.body;

    // Validate progress value
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }

    // Determine status based on progress
    let status = 'in_progress';
    if (progress === 0) {
      status = 'not_started';
    } else if (progress === 100) {
      status = 'completed';
    }

    const { data, error } = await supabase
      .from('goals')
      .update({
        progress,
        status,
        completed_at: progress === 100 ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      message: 'Goal progress updated successfully',
      goal: data,
    });
  } catch (error) {
    console.error('Update goal progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
};
