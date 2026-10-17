import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { eventImage } from '../eventImage';
import DashboardShell from '../components/DashboardShell';
import ImagePlaceholder from '../components/ImagePlaceholder';
import EventsCarousel from '../components/EventsCarousel';
import Seo from '../components/Seo';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

export default function PlayerDashboard() {
  const [events, setEvents] = useState([]);
  const [mine, setMine] = useState([]);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/events'), api.get('/registrations/mine'), api.get('/members/me')])
      .then(([e, r, m]) => { setEvents(e.data); setMine(r.data); setMe(m.data); })
      .catch((err) => setError(err.response?.data?.error || 'Could not load your dashboard'));
  }, []);

  const next = events.find((e) => e.featured) || events[0];
  const others = events.filter((e) => e !== next);

  return (
    <DashboardShell>
      <Seo title="Dashboard" description="Your Disc Golf South Africa dashboard." noindex />
      {error && <p className="error-msg dash-error">{error}</p>}

      {me && me.tier === 'Free' && me.membership_status !== 'pending' && (
        <p className="notice">Become a DGSA member for discounted entry fees. <Link to="/member-tier">See membership</Link></p>
      )}
      {me && me.membership_status === 'pending' && (
        <p className="notice">Your membership is waiting for payment approval.</p>
      )}

      <div className="player-grid">
        <section className="card soon" aria-labelledby="soon-h">
          <h2 id="soon-h">What's Happening Soon</h2>
          {next ? (
            <>
              <ImagePlaceholder label="Event poster" ratio="3 / 4" src={eventImage(next)} alt={next.name} />
              <strong>{next.name}</strong>
              <small className="muted">{fmtDate(next.start_datetime)} · {next.location}</small>
              <Link to={`/events/${next.event_id}/register`} className="btn btn-dark">Register</Link>
            </>
          ) : <p className="muted">No upcoming events yet.</p>}
        </section>

        <section className="card" aria-labelledby="mine-h">
          <h2 id="mine-h">My Event Registrations</h2>
          <div className="scroll">
            {mine.length === 0 && <p className="muted">You haven't registered for any events yet.</p>}
            {mine.length > 0 && (
              <table className="table">
                <thead><tr><th>Name</th><th>Location</th><th>Date</th><th>Info</th></tr></thead>
                <tbody>
                  {mine.map((r) => (
                    <tr key={r.event_id}>
                      <td>{r.name}</td>
                      <td>{r.location}</td>
                      <td>{fmtDate(r.start_datetime)}</td>
                      <td><Link to="/#tournament">More Info</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="card" aria-labelledby="all-h">
          <h2 id="all-h">View All Upcoming Events</h2>
          {others.length
            ? <EventsCarousel events={others} register />
            : <p className="muted">No upcoming events yet.</p>}
        </section>
      </div>
    </DashboardShell>
  );
}