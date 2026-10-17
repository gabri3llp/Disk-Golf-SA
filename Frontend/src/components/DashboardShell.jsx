import { Link, useNavigate } from 'react-router-dom';
import ImagePlaceholder from './ImagePlaceholder';

export default function DashboardShell({ children, actions }) {
  const navigate = useNavigate();
  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={`dash-bg ${role === 'admin' ? 'is-admin' : 'is-player'}`}>
      <div className="dash">
        <aside className="dash-side" aria-label="Dashboard menu">
          <Link to="/dashboard" title="Dashboard" aria-label="Dashboard">▦</Link>
          <Link to="/" title="Public site" aria-label="Public site">⌂</Link>
          <button className="side-btn" onClick={logout} title="Log out" aria-label="Log out">⎋</button>
        </aside>

        <section className="dash-main">
          <header className="dash-head">
            <div className="dash-user">
              <div className="avatar">
                <ImagePlaceholder
                  label=""
                  ratio="1 / 1"
                  alt=""
                  src={role === 'admin' ? '/Imgs/admindashboard.webp' : '/Imgs/userdashboard.webp'}
                />
              </div>
              <div>
                <small>{name}</small>
                <h1>Dashboard</h1>
              </div>
            </div>
            {actions && <div className="dash-actions">{actions}</div>}
          </header>
          {children}
        </section>
      </div>
    </div>
  );
}