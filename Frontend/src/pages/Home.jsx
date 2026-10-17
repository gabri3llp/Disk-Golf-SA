import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { eventImage } from '../eventImage';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ImagePlaceholder from '../components/ImagePlaceholder';
import EventsCarousel from '../components/EventsCarousel';
import Faq from '../components/Faq';
import Seo from '../components/Seo';

export default function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/events').then(({ data }) => setEvents(data)).catch(() => setEvents([]));
  }, []);

  const featured = events.find((e) => e.featured) || events[0];
  const others = events.filter((e) => e !== featured);

  return (
    <>
      <Navbar />
      <main>
        <Seo title="Events, Tournaments & Membership" description="Discover disc golf in South Africa. Find upcoming tournaments, join DGSA and register for events." />
        <section className="hero" aria-label="Welcome">
          <ImagePlaceholder
            label="Hero photo"
            ratio="16 / 6"
            src="/Imgs/hero.webp"
            alt="Player throwing a disc at a disc golf basket"
            priority
          />
          <div className="hero-content">
            <div>
              <span className="eyebrow">Welcome to</span>
              <h1>Disc Golf South Africa</h1>
            </div>
            <p>Discover your new<br />favourite hobby</p>
          </div>
        </section>

        {featured && (
          <section className="section" id="tournament">
            <h2>Tournament</h2>
            <article className="tournament-card">
              <ImagePlaceholder label="Tournament poster" ratio="3 / 4" src={eventImage(featured)} alt={featured.name} />
              <div className="tournament-info">
                <h3>{featured.name}</h3>
                <p>{featured.description}</p>
                <ul className="tournament-meta">
                  <li>{new Date(featured.start_datetime).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</li>
                  <li>{featured.location}</li>
                  <li>PDGA {featured.pdga_tier}</li>
                </ul>
                <Link to={`/events/${featured.event_id}/register`} className="btn" style={{ textAlign: 'center', color: 'var(--navy-800)', marginTop: 'auto' }}>
                  Join the tournament
                </Link>
              </div>
            </article>
          </section>
        )}

        <section className="section" aria-labelledby="events-h">
          <h2 id="events-h">Upcoming Events</h2>
          {others.length
            ? <EventsCarousel events={others} />
            : <p style={{ textAlign: 'center' }}>No upcoming events yet.</p>}
        </section>

        <section className="section" id="faq">
          <h2>FAQ</h2>
          <Faq />
        </section>
      </main>
      <Footer />
    </>
  );
}