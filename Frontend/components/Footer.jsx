import { Link } from 'react-router-dom';
import ImagePlaceholder from './ImagePlaceholder';

export default function Footer() {
  return (
    <footer className="footer">
      <ul>
        <li><Link to="/">Home page</Link></li>
        <li><a href="/#faq">FAQ Accordion</a></li>
        <li><a href="/#tournament">Tournament & Event</a></li>
      </ul>
      <ul>
        <li><a href="mailto:info@discgolfsa.org">info@discgolfsa.org</a></li>
        <li><a href="tel:+27794917034">079 491 7034</a></li>
      </ul>
      <div className="footer-logo"><ImagePlaceholder label="Logo" ratio="1 / 1" /></div>
    </footer>
  );
}