const supabase = require('../config/supabase');

/**
 * Get current user profile
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 Looking for USER profile with ID:', userId);

    const { data, error } = await supabase
      .from('USER')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Profile lookup failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return res.status(404).json({
        error: 'User profile not found',
        userId: userId,
        details: error.message
      });
    }

    console.log('✅ Profile found:', data);
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
      .from('USER')
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
      .from('USER')
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

    // Get counts for goals and appointments
    const [goalsResult, appointmentsResult] = await Promise.all([
      supabase.from('GOAL').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('APPOINTMENT').select('id', { count: 'exact' }).eq('user_id', userId),
    ]);

    res.status(200).json({
      stats: {
        totalGoals: goalsResult.count || 0,
        totalAppointments: appointmentsResult.count || 0,
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
      .from('USER')
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
