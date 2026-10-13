export default function SuccessModal({ title, message, buttonText = 'Continue', onClose }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal">
        <div className="modal-icon" aria-hidden="true">✓</div>
        <h2 id="modal-title">{title}</h2>
        <p>{message}</p>
        <button className="btn" onClick={onClose}>{buttonText}</button>
      </div>
    </div>
  );
}