// server/server.js
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');

const app = express();
const port = 3001;
const destinationRoutes = require('./routes/destinations');
const tripRoutes = require('./routes/trips');
const itineraryRoutes = require('./routes/itinerary');
const weatherRoutes = require('./routes/weather');
const authRoutes = require('./routes/auth');

app.use(express.json());
app.use(cors());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/destinations', destinationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/auth', authRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
