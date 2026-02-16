import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Cookies from 'js-cookie';

// Fix default marker icon in React (webpack path issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';
const DEFAULT_CENTER = [45.5, 15.5];
const DEFAULT_ZOOM = 4;

// Small component to fly map to a position when it changes
function MapCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] != null && center[1] != null) {
      map.flyTo(center, zoom ?? 12);
    }
  }, [center, zoom, map]);
  return null;
}

function Maps() {
  const [destinations, setDestinations] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [coordsCache, setCoordsCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  const fetchDestinations = useCallback(async () => {
    try {
      const authToken = Cookies.get('authData');
      const response = await fetch('http://localhost:3001/api/destinations', {
        headers: { Authorization: `${authToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch destinations');
      const data = await response.json();
      setDestinations(data);
      setSelectedId((prev) => (prev ? prev : data.length ? String(data[0].id) : ''));
    } catch (err) {
      setError(err.message || 'Failed to load destinations');
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const geocode = useCallback(async (name, country) => {
    const query = [name, country].filter(Boolean).join(', ');
    const url = `${NOMINATIM_BASE}?format=json&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'TravelBuddy/1.0 (Travel Planner)',
      },
    });
    if (!res.ok) throw new Error('Geocoding request failed');
    const data = await res.json();
    if (!data || data.length === 0) throw new Error('No results found');
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const dest = destinations.find((d) => String(d.id) === selectedId);
    if (!dest) return;

    const cached = coordsCache[dest.id];
    if (cached) {
      setMapCenter([cached.lat, cached.lon]);
      setMapZoom(12);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    geocode(dest.name, dest.country)
      .then(({ lat, lon }) => {
        setCoordsCache((prev) => ({ ...prev, [dest.id]: { lat, lon } }));
        setMapCenter([lat, lon]);
        setMapZoom(12);
      })
      .catch((err) => {
        setError(err.message || 'Could not find location');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedId, destinations, coordsCache, geocode]);

  const selectedDest = destinations.find((d) => String(d.id) === selectedId);
  const cachedCoords = selectedId && coordsCache[selectedId];

  return (
    <div className="container max-w-6xl mx-auto mt-8 p-4">
      <h1 className="text-3xl font-bold mb-4">Maps</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-64 shrink-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
          >
            <option value="">Select a destination</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.country ? `(${d.country})` : ''}
              </option>
            ))}
          </select>
          {loading && <p className="mt-2 text-sm text-gray-500">Loading location…</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex-1 min-h-0 rounded-lg shadow-md overflow-hidden" style={{ height: '70vh' }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenter center={mapCenter} zoom={mapZoom} />
            {cachedCoords && selectedDest && (
              <Marker position={[cachedCoords.lat, cachedCoords.lon]}>
                <Popup>
                  <strong>{selectedDest.name}</strong>
                  {selectedDest.country && ` (${selectedDest.country})`}
                  {selectedDest.daily_budget_bam != null && (
                    <p className="mt-1 text-gray-600">
                      Daily budget: {Number(selectedDest.daily_budget_bam).toFixed(2)} BAM/day
                    </p>
                  )}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default Maps;
