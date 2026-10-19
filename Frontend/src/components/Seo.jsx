import { useEffect } from 'react';

const SITE = 'Disc Golf South Africa';
// Your unique Measurement ID from your Google Analytics stream screenshot
const GA_TRACKING_ID = 'G-GE3HV6KEGD'; 

function setTag(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function Seo({ title, description, image = '/Imgs/highlight-image.webp', noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : SITE;
    const url = window.location.origin + window.location.pathname;
    const img = image.startsWith('http') ? image : window.location.origin + image;

    document.title = fullTitle;
    setTag('name', 'description', description);
    setTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setTag('property', 'og:title', fullTitle);
    setTag('property', 'og:description', description);
    setTag('property', 'og:type', 'website');
    setTag('property', 'og:url', url);
    setTag('property', 'og:image', img);
    setTag('name', 'twitter:card', 'summary_large_image');
    setTag('name', 'twitter:title', fullTitle);
    setTag('name', 'twitter:description', description);

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);


    if (!window.gtag) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://googletagmanager.com{GA_TRACKING_ID}`;
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
    }

    window.gtag('config', GA_TRACKING_ID, {
      page_path: window.location.pathname,
    });

  }, [title, description, image, noindex]);

  return null;
}
