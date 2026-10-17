import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function AnimatedBackground({ discs = true }) {
  const { pathname } = useLocation();
  const canvas = useRef(null);
  const light = pathname.startsWith('/dashboard') && localStorage.getItem('role') !== 'admin';

  useEffect(() => {
    const el = canvas.current;
    if (!discs || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = el.getContext('2d');
    const COUNT = window.innerWidth < 700 ? 6 : 12;
    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      w = el.width = window.innerWidth;
      h = el.height = window.innerHeight;
    };

    const make = (initial) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 40,
      r: 10 + Math.random() * 18,
      vx: 0.15 + Math.random() * 0.35,
      vy: -(0.2 + Math.random() * 0.45),
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.01,
      tilt: 0.25 + Math.random() * 0.2,
      a: 0.12 + Math.random() * 0.18,
    });

    resize();
    const list = Array.from({ length: COUNT }, () => make(true));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      list.forEach((d, i) => {
        d.x += d.vx;
        d.y += d.vy;
        d.rot += d.vr;
        if (d.y < -40 || d.x > w + 40) {
          Object.assign(d, make(false));
          d.x = Math.random() * w;
        }
        const color = light
          ? `rgba(11, 31, 69, ${d.a})`
          : i % 2 ? `rgba(255, 197, 101, ${d.a})` : `rgba(183, 200, 232, ${d.a})`;
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);
        ctx.scale(1, d.tilt);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, d.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, d.r * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [discs, light]);

  return (
    <div className={`bg-layer ${light ? 'is-light' : ''}`} aria-hidden="true">
      <span className="bg-blob" />
      <span className="bg-blob" />
      <span className="bg-blob" />
      <span className="bg-blob" />
      {discs && <canvas ref={canvas} className="bg-canvas" />}
    </div>
  );
}