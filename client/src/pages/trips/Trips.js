import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';

function formatDate(val) {
  if (!val) return '—';
  return String(val).slice(0, 10);
}

// Inclusive days between two YYYY-MM-DD strings
function daysInclusive(startStr, endStr) {
  if (!startStr || !endStr) return null;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diff = Math.round((end - start) / (24 * 60 * 60 * 1000));
  return diff + 1;
}

function getSortDate(trip) {
  return formatDate(trip.start_date) || formatDate(trip.trip_date) || '';
}

function getStartStr(trip) {
  const raw = trip.start_date || trip.trip_date;
  return raw ? String(raw).slice(0, 10) : null;
}
function getEndStr(trip) {
  const raw = trip.end_date;
  return raw ? String(raw).slice(0, 10) : null;
}

function Trips() {
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    destinationId: '',
    start_date: '',
    end_date: '',
    notes: '',
  });
  const [dateError, setDateError] = useState('');

  const todayISO = new Date().toISOString().slice(0, 10);

  const fetchTrips = async () => {
    try {
      const authToken = Cookies.get('authData');
      const response = await fetch('http://localhost:3001/api/trips', { headers: { Authorization: `${authToken}` } });
      if (!response.ok) throw new Error('Failed to fetch trips');
      setTrips(await response.json());
    } catch (error) {
      console.error('Error fetching trips:', error.message);
    }
  };

  const fetchDestinations = async () => {
    try {
      const authToken = Cookies.get('authData');
      const response = await fetch('http://localhost:3001/api/destinations', { headers: { Authorization: `${authToken}` } });
      if (!response.ok) throw new Error('Failed to fetch destinations');
      setDestinations(await response.json());
    } catch (error) {
      console.error('Error fetching destinations:', error.message);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchDestinations();
  }, []);

  const sortedTrips = [...trips].sort((a, b) => {
    const dA = getSortDate(a);
    const dB = getSortDate(b);
    if (dA !== dB) return sortAsc ? dA.localeCompare(dB) : dB.localeCompare(dA);
    return (a.id || 0) - (b.id || 0);
  });

  const handleDelete = async (id) => {
    try {
      const authToken = Cookies.get('authData');
      const response = await fetch(`http://localhost:3001/api/trips/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `${authToken}` },
      });
      if (!response.ok) throw new Error('Failed to delete trip');
      fetchTrips();
    } catch (error) {
      console.error('Error deleting trip:', error.message);
    }
  };

  const startEdit = (trip) => {
    setEditingId(trip.id);
    setEditForm({
      destinationId: String(trip.destination_id),
      start_date: formatDate(trip.start_date) || formatDate(trip.trip_date) || todayISO,
      end_date: formatDate(trip.end_date) || formatDate(trip.start_date) || formatDate(trip.trip_date) || todayISO,
      notes: trip.notes || '',
    });
    setDateError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDateError('');
  };

  const validateEdit = () => {
    if (editForm.start_date < todayISO) {
      setDateError('Start date cannot be in the past.');
      return false;
    }
    if (editForm.end_date < editForm.start_date) {
      setDateError('End date must be on or after start date.');
      return false;
    }
    setDateError('');
    return true;
  };

  const handleSaveEdit = async () => {
    if (!validateEdit()) return;
    try {
      const authToken = Cookies.get('authData');
      const response = await fetch(`http://localhost:3001/api/trips/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `${authToken}` },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 400 && data.message) setDateError(data.message);
        return;
      }
      cancelEdit();
      fetchTrips();
    } catch (error) {
      console.error('Error updating trip:', error.message);
    }
  };

  const notesPreview = (notes) => {
    if (!notes) return '—';
    const s = String(notes).trim();
    if (s.length <= 40) return s;
    return s.slice(0, 40) + '…';
  };

  return (
    <div className="container mx-auto mt-8">
      <div className="flex w-full justify-between">
        <h1 className="text-3xl font-bold mb-4">My Trips</h1>
        <Link to="/add-trip" className="bg-blue-500 text-white p-2 mb-4">Plan a Trip</Link>
      </div>

      <table className="w-full border border-gray-400 bg-gray-200 shadow-md rounded-md overflow-hidden">
        <thead>
          <tr className="bg-gray-300">
            <th className="border border-gray-400 p-2 text-left">Destination</th>
            <th className="border border-gray-400 p-2 text-left">
              Start
              <button
                type="button"
                onClick={() => setSortAsc((a) => !a)}
                className="ml-2 text-sm bg-gray-400 rounded px-2 py-0.5"
              >
                {sortAsc ? '↑ Asc' : '↓ Desc'}
              </button>
            </th>
            <th className="border border-gray-400 p-2 text-left">End</th>
            <th className="border border-gray-400 p-2 text-left">Days</th>
            <th className="border border-gray-400 p-2 text-left">Total (BAM)</th>
            <th className="border border-gray-400 p-2 text-left">Notes</th>
            <th className="border border-gray-400 p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTrips.map((trip) => (
            <tr key={trip.id} className="bg-gray-100">
              {editingId === trip.id ? (
                <>
                  <td className="border border-gray-400 p-2">
                    <select
                      value={editForm.destinationId}
                      onChange={(e) => setEditForm((f) => ({ ...f, destinationId: e.target.value }))}
                      className="border p-1 w-full"
                    >
                      {destinations.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.country})</option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <input
                      type="date"
                      min={todayISO}
                      value={editForm.start_date}
                      onChange={(e) => setEditForm((f) => ({ ...f, start_date: e.target.value }))}
                      className="border p-1"
                    />
                  </td>
                  <td className="border border-gray-400 p-2">
                    <input
                      type="date"
                      min={editForm.start_date || todayISO}
                      value={editForm.end_date}
                      onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))}
                      className="border p-1"
                    />
                  </td>
                  <td className="border border-gray-400 p-2 text-sm text-gray-600">(recalculated on save)</td>
                  <td className="border border-gray-400 p-2 text-sm text-gray-600">—</td>
                  <td className="border border-gray-400 p-2">
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                      className="border p-1 w-full"
                      rows={2}
                    />
                  </td>
                  <td className="border border-gray-400 p-2">
                    {dateError && <p className="text-red-600 text-sm mb-1">{dateError}</p>}
                    <button type="button" onClick={handleSaveEdit} className="bg-green-500 text-white rounded-md mr-2 p-2">Save</button>
                    <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white rounded-md p-2">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border border-gray-400 p-2">{trip.destination_name != null ? trip.destination_name : trip.name}</td>
                  <td className="border border-gray-400 p-2">{formatDate(trip.start_date) || formatDate(trip.trip_date)}</td>
                  <td className="border border-gray-400 p-2">{formatDate(trip.end_date)}</td>
                  <td className="border border-gray-400 p-2">
                    {daysInclusive(getStartStr(trip), getEndStr(trip)) ?? '—'}
                  </td>
                  <td className="border border-gray-400 p-2">
                    {trip.total_budget_bam != null ? Number(trip.total_budget_bam).toFixed(2) : '—'}
                  </td>
                  <td className="border border-gray-400 p-2">
                    {notesPreview(trip.notes)}
                    {trip.notes && String(trip.notes).length > 40 && (
                      <button
                        type="button"
                        onClick={() => window.alert(trip.notes)}
                        className="ml-1 text-blue-600 text-sm underline"
                      >
                        View
                      </button>
                    )}
                  </td>
                  <td className="border border-gray-400 p-2">
                    <button type="button" onClick={() => startEdit(trip)} className="bg-blue-800 text-white rounded-md mr-2 p-2">Edit</button>
                    <button type="button" onClick={() => handleDelete(trip.id)} className="bg-red-800 text-white rounded-md p-2">Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Trips;
