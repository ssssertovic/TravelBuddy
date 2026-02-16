import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setAuth }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState(''); // ✅ error poruka

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ čim korisnik kuca ponovo, sklanjamo grešku
    if (error) setError('');

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // reset

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // ✅ ako nije ok, prikaži poruku sa backenda
      if (!response.ok) {
        setError(data.message || 'Login nije uspio. Provjerite podatke.');
        return;
      }

      const token = data.user.token;

      // ✅ create cookie (ostavljam kako već radiš)
      document.cookie = `authData=${JSON.stringify(token)}; path=/;`;

      setAuth(data.user);
      navigate('/');
    } catch (err) {
      setError('Došlo je do greške. Pokušajte ponovo.');
      console.error('Login failed:', err.message);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 min-w-[600px]">
      <h1 className="text-2xl">LOGIN</h1>

      <form onSubmit={handleSubmit} id="login_form" className="w-full">
        {/* ✅ ERROR MESSAGE */}
        {error && (
          <div className="p-2">
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="p-2 flex flex-col">
          <label className="text-gray-500">Username</label>
          <input
            className={`border-2 bg-gray-100 p-2 ${error ? 'border-red-400' : 'border-gray-200'}`}
            name="username"
            placeholder="Username"
            type="text"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div className="p-2 flex flex-col">
          <label className="text-gray-500">Password</label>
          <input
            className={`border-2 bg-gray-100 p-2 ${error ? 'border-red-400' : 'border-gray-200'}`}
            name="password"
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="p-2 flex flex-col">
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white text-xl p-2 rounded">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
