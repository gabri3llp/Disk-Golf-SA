export default function ImagePlaceholder({ label = 'Image', ratio = '16 / 9', src, alt = '', className = '', priority = false }) {
  if (src) {
    return (
      <img
        className={`img-fill ${className}`}
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        style={{ aspectRatio: ratio }}
      />
    );
  }
  return (
    <div className={`img-placeholder ${className}`} style={{ aspectRatio: ratio }} role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  );
}