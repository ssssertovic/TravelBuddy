const https = require('https');
const config = require('../config');

function getCurrentWeather(req, res) {
  const city = req.query.city;
  const country = req.query.country;

  if (!city || !country) {
    return res.status(400).json({
      error: 'Missing required parameters',
      message: 'Query parameters "city" and "country" are required.',
    });
  }

  const apiKey = config.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'OPENWEATHER_API_KEY is not configured.',
    });
  }

  const query = encodeURIComponent(`${city.trim()},${country.trim()}`);
  const path = `/data/2.5/weather?q=${query}&appid=${apiKey}`;

  let responded = false;
  const send = (status, body) => {
    if (responded) return;
    responded = true;
    res.status(status).json(body);
  };

  const request = https.get(
    {
      hostname: 'api.openweathermap.org',
      path,
      method: 'GET',
    },
    (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => (data += chunk));
      apiRes.on('end', () => {
        try {
          const json = JSON.parse(data);

          if (apiRes.statusCode === 404 || (json.cod && json.cod !== 200)) {
            const code = typeof json.cod === 'string' ? parseInt(json.cod, 10) : json.cod;
            if (code === 404 || (json.message && json.message.toLowerCase().includes('not found'))) {
              return send(404, {
                error: 'City not found',
                message: json.message || `No weather data for ${city}, ${country}.`,
              });
            }
            return send(apiRes.statusCode >= 500 ? 502 : 400, {
              error: 'OpenWeather API error',
              message: json.message || 'Request to weather service failed.',
            });
          }

          if (apiRes.statusCode !== 200) {
            return send(502, {
              error: 'OpenWeather API error',
              message: json.message || 'Unexpected response from weather service.',
            });
          }

          const tempK = json.main && json.main.temp;
          const tempC = tempK != null ? Math.round((tempK - 273.15) * 10) / 10 : null;
          const description =
            json.weather && json.weather[0] && json.weather[0].description
              ? json.weather[0].description
              : '';

          return send(200, {
            city: json.name || city,
            tempC,
            description,
          });
        } catch (parseErr) {
          return send(502, {
            error: 'Invalid response from weather service',
            message: 'Could not parse weather data.',
          });
        }
      });
    }
  );

  request.on('error', (err) => {
    send(502, {
      error: 'Weather service unavailable',
      message: err.message || 'Failed to reach weather service.',
    });
  });

  request.setTimeout(10000, () => {
    request.destroy();
    send(504, {
      error: 'Weather service timeout',
      message: 'Request to weather service timed out.',
    });
  });
}

module.exports = {
  getCurrentWeather,
};
