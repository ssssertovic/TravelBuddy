import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// Inclusive days between two YYYY-MM-DD strings
function daysInclusive(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diff = Math.round((end - start) / (24 * 60 * 60 * 1000));
  return Math.max(0, diff + 1);
}

function AddTrip() {
  const [newTrip, setNewTrip] = useState({
    destinationId: '',
    start_date: '',
    end_date: '',
    notes: '',
  });

  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [dateError, setDateError] = useState('');

  const todayISO = new Date().toISOString().slice(0, 10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const authToken = Cookies.get('authData');
        const response = await fetch('http://localhost:3001/api/destinations', {
          headers: { Authorization: `${authToken}` },
        });
        if (!response.ok) throw new Error('Failed to fetch available destinations');
        const destinations = await response.json();
        setAvailableDestinations(destinations);
      } catch (error) {
        console.error('Error fetching available destinations:', error.message);
      }
    };
    fetchDestinations();
  }, []);

  const selectedDest = availableDestinations.find((d) => String(d.id) === String(newTrip.destinationId));
  const dailyBam = selectedDest && selectedDest.daily_budget_bam != null ? Number(selectedDest.daily_budget_bam) : 0;
  const days = daysInclusive(newTrip.start_date, newTrip.end_date);
  const estimatedTotal = days * dailyBam;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newTrip.start_date < todayISO) {
      setDateError('Start date cannot be in the past.');
      return;
    }
    if (newTrip.end_date && newTrip.end_date < newTrip.start_date) {
      setDateError('End date must be on or after start date.');
      return;
    }
    setDateError('');

    try {
      const authToken = Cookies.get('authData');
      const response = await fetch('http://localhost:3001/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authToken}`,
        },
        body: JSON.stringify(newTrip),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 400 && data.message) setDateError(data.message);
        else throw new Error('Failed to create trip');
        return;
      }
      navigate('/trips');
    } catch (error) {
      console.error('Error creating trip:', error.message);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Plan a Trip</h1>

      <form onSubmit={handleSubmit} className="flex flex-col p-4">
        <label>Destination:</label>
        <select
          name="destinationId"
          value={newTrip.destinationId}
          onChange={(e) => setNewTrip({ ...newTrip, destinationId: e.target.value })}
          required
          className="border p-2 mb-2"
        >
          <option value="" disabled>Choose a destination</option>
          {availableDestinations.map((dest) => (
            <option key={dest.id} value={dest.id}>{dest.name} ({dest.country})</option>
          ))}
        </select>

        <label className="mt-2">Start date:</label>
        <input
          type="date"
          name="start_date"
          min={todayISO}
          value={newTrip.start_date}
          onChange={(e) => {
            setNewTrip({ ...newTrip, start_date: e.target.value });
            setDateError('');
          }}
          required
          className="border p-2 mb-2"
        />

        <label className="mt-2">End date:</label>
        <input
          type="date"
          name="end_date"
          min={newTrip.start_date || todayISO}
          value={newTrip.end_date}
          onChange={(e) => {
            setNewTrip({ ...newTrip, end_date: e.target.value });
            if (e.target.value && newTrip.start_date && e.target.value < newTrip.start_date) {
              setDateError('End date must be on or after start date.');
            } else setDateError('');
          }}
          required
          className="border p-2 mb-2"
        />
        {dateError && <p className="text-red-600 text-sm mb-2">{dateError}</p>}

        <label className="mt-2">Notes:</label>
        <textarea
          name="notes"
          value={newTrip.notes}
          onChange={(e) => setNewTrip({ ...newTrip, notes: e.target.value })}
          className="border p-2 mb-2"
          rows={3}
        />

        {days > 0 && (
          <div className="mb-4 p-2 bg-gray-200 rounded">
            <p className="text-sm">Days: {days}</p>
            <p className="text-sm">Estimated total: {estimatedTotal.toFixed(2)} BAM</p>
          </div>
        )}

        <button type="submit" className="bg-green-500 text-white p-2">Add</button>
      </form>
    </div>
  );
}

export default AddTrip;
