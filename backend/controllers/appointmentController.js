const supabase = require('../config/supabase');

/**
 * Get all appointments for the authenticated user
 */
const getAllAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { upcoming, past, sort = 'appointment_date' } = req.query;

    let query = supabase
      .from('APPOINTMENT')
      .select('*')
      .eq('user_id', userId);

    // Filter by upcoming or past
    const now = new Date().toISOString();
    if (upcoming === 'true') {
      query = query.gte('appointment_date', now);
    } else if (past === 'true') {
      query = query.lt('appointment_date', now);
    }

    // Sort
    query = query.order(sort, { ascending: upcoming === 'true' });

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ appointments: data });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a single appointment by ID
 */
const getAppointmentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('APPOINTMENT')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json({ appointment: data });
  } catch (error) {
    console.error('Get appointment by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new appointment
 */
const createAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, provider, appointmentDate, location, purpose, notesBefore, notesAfter } = req.body;

    // Validate required fields
    if (!title || !appointmentDate) {
      return res.status(400).json({ error: 'Title and appointment date are required' });
    }

    const { data, error } = await supabase
      .from('APPOINTMENT')
      .insert({
        user_id: userId,
        title,
        provider,
        appointment_date: appointmentDate,
        location,
        purpose,
        notes_before: notesBefore,
        notes_after: notesAfter,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: data,
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update an appointment
 */
const updateAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, provider, appointmentDate, location, purpose, notesBefore, notesAfter } = req.body;

    const { data, error } = await supabase
      .from('APPOINTMENT')
      .update({
        title,
        provider,
        appointment_date: appointmentDate,
        location,
        purpose,
        notes_before: notesBefore,
        notes_after: notesAfter,
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
      message: 'Appointment updated successfully',
      appointment: data,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete an appointment
 */
const deleteAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('APPOINTMENT')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
