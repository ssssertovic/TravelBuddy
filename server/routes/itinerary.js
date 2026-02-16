// routes/itinerary.js
const express = require('express');
const itineraryController = require('../controllers/itineraryController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/:tripId', itineraryController.getByTripId);
router.post('/', itineraryController.create);
router.put('/:id', itineraryController.update);
router.delete('/:id', itineraryController.delete);

module.exports = router;
