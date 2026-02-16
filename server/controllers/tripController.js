const Trip = require('../models/tripModel');
const Destination = require('../models/destinationModel');

function todayYYYYMMDD() {
  return new Date().toISOString().slice(0, 10);
}

// Inclusive days between two YYYY-MM-DD strings
function daysInclusive(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diff = Math.round((end - start) / (24 * 60 * 60 * 1000));
  return diff + 1;
}

function validateAndCompute(req, res, next) {
  const { destinationId, start_date, end_date, notes } = req.body;
  const today = todayYYYYMMDD();

  if (!destinationId) {
    return res.status(400).json({ message: 'Destination is required.' });
  }
  if (!start_date || start_date < today) {
    return res.status(400).json({ message: 'Start date cannot be in the past.' });
  }
  if (!end_date || end_date < start_date) {
    return res.status(400).json({ message: 'End date must be on or after start date.' });
  }

  Destination.getById(destinationId, (err, dest) => {
    if (err) return res.status(500).json({ error: 'Error fetching destination.' });
    if (!dest) return res.status(400).json({ message: 'Destination not found.' });

    const days = daysInclusive(start_date, end_date);
    const daily = dest.daily_budget_bam != null ? Number(dest.daily_budget_bam) : 0;
    const total_budget_bam = daily * days;

    req.tripData = { destinationId, start_date, end_date, notes, total_budget_bam };
    next();
  });
}

const tripController = {
  getAllTrips: (req, res) => {
    const userId = req.user.id;
    Trip.getAllTrips(userId, (err, trips) => {
      if (err) return res.status(500).json({ error: 'Error fetching trips.' });
      res.status(200).json(trips);
    });
  },

  makeTrip: (req, res) => {
    const userId = req.user.id;
    const { destinationId, start_date, end_date, notes, total_budget_bam } = req.tripData;

    Trip.makeTrip(userId, destinationId, start_date, end_date, notes, total_budget_bam, (err) => {
      if (err) return res.status(500).json({ error: 'Error creating trip.' });
      res.status(201).json({ message: 'Trip created successfully.' });
    });
  },

  deleteTrip: (req, res) => {
    const tripId = req.params.id;
    const userId = req.user.id;
    Trip.deleteTrip(tripId, userId, (err, changes) => {
      if (err) return res.status(500).json({ error: 'Error deleting trip.' });
      if (changes === 0) return res.status(404).json({ error: 'Trip not found or unauthorized.' });
      res.status(200).json({ success: true });
    });
  },

  updateTrip: (req, res) => {
    const tripId = req.params.id;
    const userId = req.user.id;
    const { destinationId, start_date, end_date, notes, total_budget_bam } = req.tripData;

    Trip.updateTrip(tripId, userId, destinationId, start_date, end_date, notes, total_budget_bam, (err, changes) => {
      if (err) return res.status(500).json({ error: 'Error updating trip.' });
      if (changes === 0) return res.status(404).json({ error: 'Trip not found or unauthorized.' });
      res.status(200).json({ success: true });
    });
  },
};

module.exports = { tripController, validateAndCompute };
