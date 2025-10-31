const supabase = require('../config/supabase');

/**
 * Get all medications for the authenticated user
 */
const getAllMedications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { active } = req.query;

    let query = supabase
      .from('MEDICATION')
      .select('*')
      .eq('user_id', userId);

    // Filter by active medications (where next_refill_date is in the future)
    if (active === 'true') {
      const now = new Date().toISOString().split('T')[0];
      query = query.gte('next_refill_date', now);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ medications: data });
  } catch (error) {
    console.error('Get all medications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a single medication by ID
 */
const getMedicationById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('MEDICATION')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    res.status(200).json({ medication: data });
  } catch (error) {
    console.error('Get medication by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new medication
 */
const createMedication = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      dosage,
      frequency,
      startDate,
      nextRefillDate,
      reminderEnabled
    } = req.body;

    // Validate required fields
    if (!name || !dosage || !frequency) {
      return res.status(400).json({ error: 'Name, dosage, and frequency are required' });
    }

    const { data, error } = await supabase
      .from('MEDICATION')
      .insert({
        user_id: userId,
        name,
        dosage,
        frequency,
        start_date: startDate,
        next_refill_date: nextRefillDate,
        reminder_enabled: reminderEnabled !== undefined ? reminderEnabled : true,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Medication created successfully',
      medication: data,
    });
  } catch (error) {
    console.error('Create medication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update a medication
 */
const updateMedication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      name,
      dosage,
      frequency,
      startDate,
      nextRefillDate,
      reminderEnabled
    } = req.body;

    const { data, error } = await supabase
      .from('MEDICATION')
      .update({
        name,
        dosage,
        frequency,
        start_date: startDate,
        next_refill_date: nextRefillDate,
        reminder_enabled: reminderEnabled,
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
      message: 'Medication updated successfully',
      medication: data,
    });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a medication
 */
const deleteMedication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('MEDICATION')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Toggle medication reminder
 */
const toggleMedicationReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get current medication
    const { data: medication, error: fetchError } = await supabase
      .from('MEDICATION')
      .select('reminder_enabled')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    // Toggle reminder
    const newReminderState = !medication.reminder_enabled;

    const { data, error } = await supabase
      .from('MEDICATION')
      .update({
        reminder_enabled: newReminderState,
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
      message: 'Medication reminder toggled successfully',
      medication: data,
    });
  } catch (error) {
    console.error('Toggle medication reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  toggleMedicationReminder,
};
