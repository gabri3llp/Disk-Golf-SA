import { useState } from 'react';

const QUESTIONS = [
  { q: 'Where can I play?', a: 'Add your answer here.' },
  { q: 'What is Disc Golf?', a: 'Add your answer here.' },
  { q: 'Why should I become a DGSA member?', a: 'Add your answer here.' },
  { q: "Can I play if I've played before?", a: 'Add your answer here.' },
];

export default function Faq() {
  const [open, setOpen] = useState(null);
  return (
    <div className="faq">
      {QUESTIONS.map((item, i) => (
        <div className="faq-item" key={item.q}>
          <button className="faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            {item.q}
          </button>
          {open === i && <p className="faq-a">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}