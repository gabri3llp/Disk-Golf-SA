import AdminDashboard from './AdminDashboard';
import PlayerDashboard from './PlayerDashboard';

export default function Dashboard() {
  return localStorage.getItem('role') === 'admin' ? <AdminDashboard /> : <PlayerDashboard />;
}