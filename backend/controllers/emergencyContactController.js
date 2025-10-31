const supabase = require('../config/supabase');

/**
 * Get all emergency contacts for the authenticated user
 */
const getAllEmergencyContacts = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('EMERGENCY_CONTACT')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ emergencyContacts: data });
  } catch (error) {
    console.error('Get all emergency contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a single emergency contact by ID
 */
const getEmergencyContactById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('EMERGENCY_CONTACT')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Emergency contact not found' });
    }

    res.status(200).json({ emergencyContact: data });
  } catch (error) {
    console.error('Get emergency contact by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new emergency contact
 */
const createEmergencyContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, relationship, phone, email, address } = req.body;

    // Validate required fields
    if (!name || !relationship || !phone) {
      return res.status(400).json({ error: 'Name, relationship, and phone are required' });
    }

    const { data, error } = await supabase
      .from('EMERGENCY_CONTACT')
      .insert({
        user_id: userId,
        name,
        relationship,
        phone,
        email,
        address,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Emergency contact created successfully',
      emergencyContact: data,
    });
  } catch (error) {
    console.error('Create emergency contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update an emergency contact
 */
const updateEmergencyContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, relationship, phone, email, address } = req.body;

    const { data, error } = await supabase
      .from('EMERGENCY_CONTACT')
      .update({
        name,
        relationship,
        phone,
        email,
        address,
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
      message: 'Emergency contact updated successfully',
      emergencyContact: data,
    });
  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete an emergency contact
 */
const deleteEmergencyContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('EMERGENCY_CONTACT')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Emergency contact deleted successfully' });
  } catch (error) {
    console.error('Delete emergency contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllEmergencyContacts,
  getEmergencyContactById,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
};
