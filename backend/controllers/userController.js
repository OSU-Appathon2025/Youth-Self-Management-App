const supabase = require('../config/supabase');

/**
 * Get current user profile
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.status(200).json({ profile: data });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, dateOfBirth } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        date_of_birth: dateOfBirth,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: data,
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete user account
 */
const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user data
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // Note: Deleting the auth user requires admin privileges
    // This should be handled through Supabase admin API or trigger

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get counts for tasks and goals
    const [tasksResult, goalsResult] = await Promise.all([
      supabase.from('tasks').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('goals').select('id', { count: 'exact' }).eq('user_id', userId),
    ]);

    res.status(200).json({
      stats: {
        totalTasks: tasksResult.count || 0,
        totalGoals: goalsResult.count || 0,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all users
 */
const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      users: data,
      count: data.length
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getUserStats,
  getAllUsers,
};
