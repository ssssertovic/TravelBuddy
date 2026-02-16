import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function AddDestination() {
  const [newDestination, setNewDestination] = useState({
    name: '',
    country: '',
    description: '',
    daily_budget_bam: '',
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const authToken = Cookies.get('authData');
      const response = await fetch('http://localhost:3001/api/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authToken}`,
        },
        body: JSON.stringify(newDestination),
      });

      if (!response.ok) {
        throw new Error('Failed to add the new destination');
      }

      navigate('/destinations');
    } catch (error) {
      console.error('Error adding destination:', error.message);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Add Destination</h1>

      <form onSubmit={handleSubmit} className="flex flex-col p-4">
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={newDestination.name}
          onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
          required
          className="border p-2 mb-2"
        />

        <label>Country:</label>
        <input
          type="text"
          name="country"
          value={newDestination.country}
          onChange={(e) => setNewDestination({ ...newDestination, country: e.target.value })}
          required
          className="border p-2 mb-2"
        />

        <label>Description:</label>
        <textarea
          name="description"
          value={newDestination.description}
          onChange={(e) => setNewDestination({ ...newDestination, description: e.target.value })}
          required
          className="border p-2 mb-2"
        />

        <label className="mt-2">Daily budget (BAM/day):</label>
        <input
          type="number"
          min="0"
          step="0.01"
          name="daily_budget_bam"
          value={newDestination.daily_budget_bam}
          onChange={(e) => setNewDestination({ ...newDestination, daily_budget_bam: e.target.value })}
          className="border p-2 mb-4"
        />

        <button type="submit" className="bg-green-500 text-white p-2">
          Add
        </button>
      </form>
    </div>
  );
}

export default AddDestination;
