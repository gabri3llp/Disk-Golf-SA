import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import MemberTier from './pages/MemberTier';
import BecomeMember from './pages/BecomeMember';

const Protected = ({ children, admin }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" replace />;
  if (admin && role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/member-tier" element={<Protected><MemberTier /></Protected>} />
        <Route path="/become-member" element={<Protected><BecomeMember /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}