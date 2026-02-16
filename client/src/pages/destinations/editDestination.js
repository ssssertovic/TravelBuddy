import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function EditDestination() {
  const { id } = useParams();

  const [editedDestination, setEditedDestination] = useState({
    name: '',
    country: '',
    description: '',
    daily_budget_bam: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = Cookies.get('authData');
        const response = await fetch(`http://localhost:3001/api/destinations/${id}`, {
          headers: {
            Authorization: `${authToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch destination data');
        }

        const data = await response.json();
        setEditedDestination(data);
      } catch (error) {
        console.error('Error fetching destination data:', error.message);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const authToken = Cookies.get('authData');
      const response = await fetch(`http://localhost:3001/api/destinations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authToken}`,
        },
        body: JSON.stringify(editedDestination),
      });

      if (!response.ok) {
        throw new Error('Failed to update the destination');
      }

      navigate('/destinations');
    } catch (error) {
      console.error('Error updating destination:', error.message);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Edit Destination {id}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col p-4">
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={editedDestination.name}
          onChange={(e) => setEditedDestination({ ...editedDestination, name: e.target.value })}
          required
          className="border p-2 mb-2"
        />

        <label>Country:</label>
        <input
          type="text"
          name="country"
          value={editedDestination.country}
          onChange={(e) => setEditedDestination({ ...editedDestination, country: e.target.value })}
          required
          className="border p-2 mb-2"
        />

        <label>Description:</label>
        <textarea
          name="description"
          value={editedDestination.description}
          onChange={(e) => setEditedDestination({ ...editedDestination, description: e.target.value })}
          required
          className="border p-2 mb-2"
        />

        <label className="mt-2">Daily budget (BAM/day):</label>
        <input
          type="number"
          min="0"
          step="0.01"
          name="daily_budget_bam"
          value={editedDestination.daily_budget_bam ?? ''}
          onChange={(e) => setEditedDestination({ ...editedDestination, daily_budget_bam: e.target.value })}
          className="border p-2 mb-4"
        />

        <button type="submit" className="bg-blue-500 text-white p-2">
          Save
        </button>
      </form>
    </div>
  );
}

export default EditDestination;
