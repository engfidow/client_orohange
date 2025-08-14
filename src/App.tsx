import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import AppLayout from './layout/AppLayout';
import Children from './pages/common/Children';
import Donations from './pages/common/Donations';
import Users from './pages/admin/Users';
import Profile from './pages/common/Profile';
import Reports from './pages/admin/Reports';
import StaffPage from './pages/admin/Staff';
import ForgotPasswordForm from './pages/AuthPages/ForgotPasswordForm';

function RedirectByRole() {
  const user = localStorage.getItem('user');
  const role = user ? JSON.parse(user).role : null;

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (role === 'staff') {
    return <Navigate to="/staff-dashboard" replace />;
  }

  return <Navigate to="/signin" replace />;
}

function App() {
  return (
    <Routes>
      {/* Redirect root */}
      <Route path="/" element={<RedirectByRole />} />

      {/* Public routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />

      {/* Protected layout wrapper */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="/children" element={<Children />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<Users />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;
