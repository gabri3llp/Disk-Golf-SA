import { useState } from 'react';

const tel = (n) => `tel:+27${n.replace(/^0/, '')}`;

const COURSES = [
  { place: 'Inanda Disc Golf Course, Gauteng, Kyalami', who: 'Bart', phone: '0794917034' },
  { place: 'The Big Red Barn, Gauteng, Irene', who: 'Jandre', phone: '0823472182' },
  { place: 'Zwartkop Country Club, Gauteng, Centurion', who: 'Jandre', phone: '0823472182' },
  { place: 'Derdepoort Recreational Resort, Gauteng, Pretoria', who: 'Ettienne', phone: '0832359090' },
  { place: 'Marais Steyn Park, Gauteng, Edenvale', who: 'Charles', phone: '0613351883' },
  { place: 'Rooirivierrif, Western Cape, George', who: 'Leon', phone: '0823303966' },
  { place: 'Stellenbosch, Western Cape', who: 'Chris', phone: '0825751061' },
];

const QUESTIONS = [
  {
    q: 'Where can I play?',
    a: (
      <>
        <p>There are multiple locations you can play disc golf including:</p>
        <ul>
          {COURSES.map((c) => (
            <li key={c.place}>
              {c.place}. {c.who}: <a href={tel(c.phone)}>{c.phone}</a>
            </li>
          ))}
        </ul>
        <p>Note that each course may have its own entrance fee and some courses are by reservation only.</p>
      </>
    ),
  },
  {
    q: 'What is Disc Golf?',
    a: (
      <p>
        Disc golf is a flying disc sport where players throw a specialised disc from a tee area into an
        elevated metal basket with the goal of completing a course in the fewest throws possible.
      </p>
    ),
  },
  {
    q: 'Why should I become a DGSA member?',
    a: (
      <p>
        Joining DGSA helps us grow the sport in the country by allowing us to host events, run leagues,
        do clinics, do activations. Joining DGSA will also give you cheaper event entrance, priority
        registration and access to DGSA merchandise.
      </p>
    ),
  },
  {
    q: "Can I play if I've played before?",
    a: (
      <p>
        Absolutely, disc golf is a low barrier to entry sport that is easy for new players to pick up
        and enjoy.
      </p>
    ),
  },
];

export default function Faq() {
  const [open, setOpen] = useState(null);

  return (
    <div className="faq">
      {QUESTIONS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className={`faq-item ${isOpen ? 'is-open' : ''}`} key={item.q}>
            <h3 className="faq-heading">
              <button
                className="faq-q"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                {item.q}
              </button>
            </h3>
            {isOpen && (
              <div className="faq-a" id={`faq-panel-${i}`}>
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}