const supabase = require('../config/supabase');

/**
 * Get all goals for the authenticated user
 */
const getAllGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, category, sort = 'created_at' } = req.query;

    let query = supabase
      .from('GOAL')
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
      .from('GOAL')
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
    const { title, description, category, targetDate, status } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { data, error } = await supabase
      .from('GOAL')
      .insert({
        user_id: userId,
        title,
        description,
        category,
        target_date: targetDate,
        status: status || 'not started',
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
    const { title, description, category, targetDate, status } = req.body;

    const { data, error } = await supabase
      .from('GOAL')
      .update({
        title,
        description,
        category,
        target_date: targetDate,
        status,
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
      .from('GOAL')
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
 * Update goal status
 */
const updateGoalStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    const validStatuses = ['not started', 'in progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status must be: not started, in progress, or completed' });
    }

    const { data, error } = await supabase
      .from('GOAL')
      .update({
        status,
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
      message: 'Goal status updated successfully',
      goal: data,
    });
  } catch (error) {
    console.error('Update goal status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalStatus,
};
