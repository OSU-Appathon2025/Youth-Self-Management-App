const supabase = require('../config/supabase');

/**
 * Get all tasks for the authenticated user
 */
const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, priority, sort = 'created_at' } = req.query;

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by priority
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Sort
    query = query.order(sort, { ascending: false });

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ tasks: data });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a single task by ID
 */
const getTaskById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ task: data });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new task
 */
const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, dueDate, priority, status, tags } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title,
        description,
        due_date: dueDate,
        priority: priority || 'medium',
        status: status || 'todo',
        tags: tags || [],
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Task created successfully',
      task: data,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update a task
 */
const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, dueDate, priority, status, tags } = req.body;

    const { data, error } = await supabase
      .from('tasks')
      .update({
        title,
        description,
        due_date: dueDate,
        priority,
        status,
        tags,
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
      message: 'Task updated successfully',
      task: data,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a task
 */
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Toggle task completion status
 */
const toggleTaskCompletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get current task
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Toggle status
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';

    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
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
      message: 'Task status toggled successfully',
      task: data,
    });
  } catch (error) {
    console.error('Toggle task completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
};
