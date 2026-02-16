import {Link, useNavigate} from 'react-router-dom';
import Cookies from 'js-cookie';

function Header({auth, setAuth}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth(false);
    Cookies.remove('authData');
    navigate('/login');
  };

  return (
    <header className="bg-emerald-700 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 text-white text-2xl font-bold whitespace-nowrap">
  
          <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-7 h-7"
          >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V8.25a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 8.25v8.25M3 16.5l9-6 9 6M3 16.5l9 4.5 9-4.5" />
      </svg>

        TravelBuddy
      </Link>

  
        {/* Middle: Nav */}
        {auth && (
          <nav className="flex items-center gap-6 whitespace-nowrap">
            <Link to="/destinations" className="text-white hover:underline">Destinations</Link>
            <Link to="/trips" className="text-white hover:underline">My Trips</Link>
            <Link to="/maps" className="text-white hover:underline">Maps</Link>
          </nav>
        )}
  
        {/* Right: Auth */}
        <div className="flex items-center gap-4 font-bold text-white whitespace-nowrap">
          {!auth ? (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Register</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="hover:underline">
              Logout
            </button>
          )}
        </div>
  
      </div>
    </header>
  );
  
}

export default Header;
