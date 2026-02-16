import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Destination from './Destination';
import Cookies from 'js-cookie';

function Destinations() {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = Cookies.get('authData');
        const response = await fetch('http://localhost:3001/api/destinations', {
          headers: {
            Authorization: `${authToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        setDestinations(data);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const authToken = Cookies.get('authData');
      const response = await fetch(`http://localhost:3001/api/destinations/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the destination');
      }

      setDestinations((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Error deleting destination:', error.message);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <div className="flex w-full justify-between">
        <h1 className="text-3xl font-bold mb-4">Destinations</h1>
        <Link to="/add-destination" className="bg-blue-500 text-white p-2 mb-4">
          Add Destination
        </Link>
      </div>

      {destinations.map((destination) => (
        <Destination key={destination.id} {...destination} onDelete={handleDelete} />
      ))}
    </div>
  );
}

export default Destinations;
