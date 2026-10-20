import { Link } from 'react-router-dom';
import ImagePlaceholder from './ImagePlaceholder';

export default function Navbar() {
  const loggedIn = !!localStorage.getItem('token');
  return (
    <header className="navbar">
      <Link to="/" aria-label="Disc Golf South Africa home">
        <div className="navbar-logo">
          <ImagePlaceholder label="Logo" ratio="1 / 1" src="/Imgs/small-logo.webp" alt="Disc Golf South Africa logo" priority />
        </div>
      </Link>
      <nav aria-label="Main">
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li>
            <a href="/#tournament">
              <span className="nav-long">Tournament/Event</span>
              <span className="nav-short">Events</span>
            </a>
          </li>
        </ul>
      </nav>
      <ul className="navbar-links">
        {loggedIn ? (
          <li><Link to="/dashboard">Dashboard</Link></li>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </>
        )}
      </ul>
    </header>
  );
}