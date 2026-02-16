import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login/Login';
import Register from '../pages/register/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import Trips from '../pages/trips/Trips';
import Destinations from '../pages/destinations/Destinations';
import Body from '../components/body/Body';
import AddDestination from '../pages/destinations/addDestination';
import AddTrip from '../pages/trips/addTrip';
import EditDestination from '../pages/destinations/editDestination';
import Maps from '../pages/maps/Maps';
import Home from '../pages/Home';



function RoutesList({ auth, setAuth }) {
  return (
    <Routes>
  <Route path="/" element={<Body />}>
    <Route index element={<Home auth={auth} />} />
    <Route path="dashboard" element={auth ? <Dashboard /> : <Login setAuth={setAuth} />} />
    <Route path="login" element={<Login setAuth={setAuth} />} />
    <Route path="logout" element={<Login setAuth={setAuth} />} />
    <Route path="register" element={<Register />} />
    <Route path="destinations" element={<Destinations />} />
    <Route path="add-destination" element={<AddDestination />} />
    <Route path="edit-destination/:id" element={<EditDestination />} />
    <Route path="trips" element={<Trips />} />
    <Route path="add-trip" element={<AddTrip />} />
    <Route path="maps" element={<Maps />} />
  </Route>
</Routes>

  );
}

export default RoutesList;