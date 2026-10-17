import { fileUrl } from './api';

const FALLBACKS = [
  ['south africa', '/Imgs/sa-open.webp'],
  ['1st african', '/Imgs/highlight-image.webp'],
  ['doubles', '/Imgs/ladies-and-mens-doubles.webp'],
  ['singles', '/Imgs/ladies-singles.webp'],
  ['christmas', '/Imgs/eden-christmas-clash.webp'],
  ['north', '/Imgs/north-vs-south.webp'],
  ['gauteng', '/Imgs/gauteng-open.webp'],
];

export function eventImage(e) {
  if (e.poster_path) return fileUrl(e.poster_path);
  const name = e.name.toLowerCase();
  const hit = FALLBACKS.find(([key]) => name.includes(key));
  return hit ? hit[1] : undefined;
}