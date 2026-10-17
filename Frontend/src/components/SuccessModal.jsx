export default function SuccessModal({ title, message, buttonText = 'Continue', onClose }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal">
        <h2 id="modal-title">{title}</h2>
        {message && <p>{message}</p>}
        <button className="modal-btn" onClick={onClose}>{buttonText}</button>
      </div>
    </div>
  );
}