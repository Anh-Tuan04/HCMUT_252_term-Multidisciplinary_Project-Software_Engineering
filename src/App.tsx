import { Routes, Route } from 'react-router-dom';

import AdminLayout from './components/admin/AdminLayout.js';
import AdminRoute from './pages/admin.private.route.js';
import PrivateRoute from './pages/private.route.js';
import NotFound from './pages/error.js';
import Login from './pages/login.js';
import Register from './pages/register.js';
import ResetPassword from "./pages/resetPassword.js";
import WelcomePage from './components/WelcomePage.js';
import ParkingLotStatus from './components/share/ParkingLotStatus.js';
import ChangePassword from './pages/changePassword.js';
import UserLayout from './components/user/UserLayout.js';
import MyProfile from './components/user/MyProfile/MyProfile.js';
import MyParkingSession from './components/user/MyParkingSession/MyParkingSession.js';
import Dashboard from './components/admin/DashBoard/DashBoard.js';
import ManageParkingSession from './components/admin/ParkingSession/ManageParkingSession.js';
import ManagerUser from './components/admin/ManageUser/ManagerUser.js';
import ManageCard from './components/admin/ManageCard/ManageCard.js';
import ManageLot from './components/admin/ManageLot/ManageLot.js';

const App = () => {
  return (
      <Routes>
        <Route path="/" element={<WelcomePage />} />

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="parking_sessions" element={<ManageParkingSession />} />
          <Route path="users" element={<ManagerUser />} />
          <Route path="cards" element={<ManageCard />} />
          <Route path="parking_areas" element={<ManageLot />} />
        </Route>

        <Route path="/user" element={<PrivateRoute><UserLayout /></PrivateRoute>}>
          <Route index element={<MyProfile />} />
          <Route path="parking_sessions" element={<MyParkingSession />} />
        </Route>

        <Route path="/parking-status" element={<PrivateRoute><ParkingLotStatus /></PrivateRoute>} />
        <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
};

export default App;
