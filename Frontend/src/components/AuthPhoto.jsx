export default function AuthPhoto({ src, alt }) {
  return (
    <div className="auth-photo">
      <img src={src} alt={alt} decoding="async" />
    </div>
  );
}
