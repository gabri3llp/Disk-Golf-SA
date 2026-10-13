import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');

  if (role === 'admin') return <AdminDashboard />;

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <main className="section">
      <h2>Dashboard</h2>
      <p style={{ textAlign: 'center', marginBottom: 'var(--s5)' }}>Welcome, {name} ({role})</p>
      <button className="btn" style={{ maxWidth: 200, display: 'block', margin: '0 auto' }} onClick={logout}>Log out</button>
    </main>
  );
}