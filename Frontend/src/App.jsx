import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { trackPage } from './analytics';
import AnimatedBackground from './components/AnimatedBackground';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import MemberTier from './pages/MemberTier';
import BecomeMember from './pages/BecomeMember';
import NewEvent from './pages/NewEvent';
import EventRegister from './pages/EventRegister';

const Protected = ({ children, admin }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" replace />;
  if (admin && role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function RouteTracker() {
  const { pathname } = useLocation();
  useEffect(() => { trackPage(pathname); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedBackground />
      <RouteTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/member-tier" element={<Protected><MemberTier /></Protected>} />
        <Route path="/become-member" element={<Protected><BecomeMember /></Protected>} />
        <Route path="/events/new" element={<Protected admin><NewEvent /></Protected>} />
        <Route path="/events/:id/edit" element={<Protected admin><NewEvent /></Protected>} />
        <Route path="/events/:id/register" element={<Protected><EventRegister /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}