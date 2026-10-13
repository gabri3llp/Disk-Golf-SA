export default function ImagePlaceholder({ label = 'Image', ratio = '16 / 9', src, alt = '', className = '' }) {
  if (src) {
    return <img className={`img-fill ${className}`} src={src} alt={alt} loading="lazy" style={{ aspectRatio: ratio }} />;
  }
  return (
    <div className={`img-placeholder ${className}`} style={{ aspectRatio: ratio }} role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  );
}

//VERYYYY COOL. remeber to add images tho. It shoould just let the image replace it. Will test.