const supabase = require('../config/supabase');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, password, fullName, dateOfBirth } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create corresponding record in USER table
    if (data.user) {
      console.log('Creating USER record for:', data.user.id, data.user.email);

      const { data: userData, error: userError } = await supabase
        .from('USER')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName || null,
          date_of_birth: dateOfBirth || null,
        })
        .select();

      if (userError) {
        console.error('❌ Error creating USER record:', userError);
        console.error('Full error details:', JSON.stringify(userError, null, 2));
        // Return error to user so they know something went wrong
        return res.status(500).json({
          error: 'User registered but profile creation failed',
          details: userError.message
        });
      }

      console.log('✅ USER record created successfully:', userData);
    } else {
      console.log('⚠️ No user object returned from signUp');
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.status(200).json({
      message: 'Login successful',
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Refresh session
 */
const refreshSession = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.status(200).json({
      message: 'Session refreshed successfully',
      session: data.session,
    });
  } catch (error) {
    console.error('Refresh session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Request password reset
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update password
 */
const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshSession,
  forgotPassword,
  updatePassword,
};
