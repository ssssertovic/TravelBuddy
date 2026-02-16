const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const destinationController = require('../controllers/destinationController');

const router = express.Router();

router.use(authenticateToken); // Apply middleware to all routes below this line

/**
 * @swagger
 * /api/destinations:
 *   get:
 *     summary: Get all destinations
 *     description: Retrieve a list of all destinations.
 *     responses:
 *       '200':
 *         description: A successful response with the list of destinations.
 */
router.get('/', destinationController.getAllDestinations);

router.get('/:id', destinationController.getDestinationById);
router.post('/', destinationController.createDestination);
router.put('/:id', destinationController.updateDestination);
router.delete('/:id', destinationController.deleteDestination);

module.exports = router;
