const ItineraryItem = require('../models/itineraryModel');

const itineraryController = {
  getByTripId: (req, res) => {
    const tripId = req.params.tripId;
    ItineraryItem.getByTripId(tripId, (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching itinerary items.' });
      }
      res.status(200).json(items);
    });
  },

  create: (req, res) => {
    const { tripId, day_number, activity, note } = req.body;
    const item = { trip_id: tripId, day_number, activity, note };
    ItineraryItem.create(item, (err, created) => {
      if (err) {
        return res.status(500).json({ error: 'Error adding itinerary item.' });
      }
      res.status(201).json(created);
    });
  },

  update: (req, res) => {
    const id = req.params.id;
    const updatedItem = req.body;
    ItineraryItem.update(id, updatedItem, (err, updated) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating itinerary item.' });
      }
      if (!updated) {
        return res.status(404).json({ error: 'Itinerary item not found' });
      }
      res.status(200).json(updated);
    });
  },

  delete: (req, res) => {
    const id = req.params.id;
    ItineraryItem.delete(id, (err, deleted) => {
      if (err) {
        return res.status(500).json({ error: 'Error deleting itinerary item.' });
      }
      if (!deleted) {
        return res.status(404).json({ error: 'Itinerary item not found' });
      }
      res.status(200).json(deleted);
    });
  },
};

module.exports = itineraryController;
