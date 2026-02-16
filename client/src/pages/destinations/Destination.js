import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Destination({ id, name, country, description, onDelete }) {
  const [weather, setWeather] = useState({ status: 'loading', data: null, error: null });

  useEffect(() => {
    if (!name || !country) return;

    const fetchWeather = async () => {
      try {
        const params = new URLSearchParams({ city: name, country });
        const response = await fetch(`http://localhost:3001/api/weather?${params}`);
        if (!response.ok) throw new Error('Weather unavailable');
        const data = await response.json();
        setWeather({ status: 'ok', data, error: null });
      } catch (err) {
        setWeather({ status: 'error', data: null, error: err.message });
      }
    };

    fetchWeather();
  }, [name, country]);

  return (
    <div className="flex flex-inline bg-gray-200 shadow-md p-4 mb-4 rounded-md">
      <div>
        <h2 className="text-xl font-bold mb-2">{name}</h2>
        <p className="text-gray-600">{country}</p>
        <p className="mt-2">{description}</p>
        <div className="mt-3 p-3 bg-gray-300 rounded-md border border-gray-400">
          <p className="text-sm font-bold text-gray-700 mb-1">Weather</p>
          {weather.status === 'loading' && <p className="text-gray-600 text-sm">Loading weather...</p>}
          {weather.status === 'error' && <p className="text-gray-600 text-sm">Weather unavailable</p>}
          {weather.status === 'ok' && weather.data && (
            <p className="text-gray-600 text-sm">
              {weather.data.city} — {weather.data.tempC != null ? `${weather.data.tempC}°C` : '—'} {weather.data.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex w-full justify-end items-center">
        <button className="bg-red-800 rounded-md mr-2 p-4" onClick={() => onDelete(id)}>Delete</button>
        <Link to={`/edit-destination/${id}`} className="bg-blue-800 rounded-md mr-2 p-4">
          Edit
        </Link>
      </div>
    </div>
  );
}

export default Destination;
