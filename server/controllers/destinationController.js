// server/controllers/destinationController.js
const Destination = require('../models/destinationModel');

const destinationController = {
  getAllDestinations: (req, res) => {
    Destination.getAll((err, destinations) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching destinations.' });
      }
      res.json(destinations);
    });
  },

  getDestinationById: (req, res) => {
    const destinationId = req.params.id;
    Destination.getById(destinationId, (err, destination) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching destination from the database.' });
      }
      if (!destination) {
        return res.status(404).json({ error: 'Destination not found' });
      }
      res.json(destination);
    });
  },

  createDestination: (req, res) => {
    const newDestination = req.body;
    Destination.create(newDestination, (err, createdDestination) => {
      if (err) {
        return res.status(500).json({ error: 'Error adding destination to the database.' });
      }
      res.status(201).json(createdDestination);
    });
  },

  updateDestination: (req, res) => {
    const destinationId = req.params.id;
    const updatedDestination = req.body;
    Destination.update(destinationId, updatedDestination, (err, updated) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating destination in the database.' });
      }
      if (!updated) {
        return res.status(404).json({ error: 'Destination not found' });
      }
      res.json(updated);
    });
  },

  deleteDestination: (req, res) => {
    const destinationId = req.params.id;
    Destination.delete(destinationId, (err, deletedDestination) => {
      if (err) {
        return res.status(500).json({ error: 'Error deleting destination from the database.' });
      }
      if (!deletedDestination) {
        return res.status(404).json({ error: 'Destination not found' });
      }
      res.json(deletedDestination);
    });
  },
};

module.exports = destinationController;
