// routes/trips.js
const express = require('express');
const { tripController, validateAndCompute } = require('../controllers/tripController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', tripController.getAllTrips);
router.post('/', validateAndCompute, tripController.makeTrip);
router.delete('/:id', tripController.deleteTrip);
router.put('/:id', validateAndCompute, tripController.updateTrip);

module.exports = router;
