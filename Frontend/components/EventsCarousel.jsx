import { useRef } from 'react';
import ImagePlaceholder from './ImagePlaceholder';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-ZA', { hour: 'numeric', minute: '2-digit', hour12: false });

export default function EventsCarousel({ events }) {
  const track = useRef(null);
  const scroll = (dir) => track.current.scrollBy({ left: dir * 320, behavior: 'smooth' });

  return (
    <div className="carousel">
      <button className="carousel-btn" onClick={() => scroll(-1)} aria-label="Previous events">‹</button>
      <div className="carousel-track" ref={track}>
        {events.map((e) => (
          <article className="event-card" key={e.event_id}>
            <ImagePlaceholder label="Event photo" ratio="4 / 3" src={e.poster_path ? `/${e.poster_path}` : undefined} alt={e.name} />
            <div className="event-card-body">
              <div>
                <h3>{e.name}</h3>
                <small>{e.location}</small>
              </div>
              <div className="event-card-date">
                {fmtDate(e.start_datetime)}
                <small>{fmtTime(e.start_datetime)}</small>
              </div>
            </div>
          </article>
        ))}
      </div>
      <button className="carousel-btn" onClick={() => scroll(1)} aria-label="Next events">›</button>
    </div>
  );
}