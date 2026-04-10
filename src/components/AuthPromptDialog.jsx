import { Link } from 'react-router-dom';

export default function AuthPromptDialog({
  open,
  title = 'Continue to Interact',
  message = 'Please log in or create an account to continue.',
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-sm glass-panel" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p className="modal-desc modal-desc-strong">{message}</p>
          <div className="confirm-actions">
            <Link className="btn-publish" to="/login" onClick={onClose}>Log In</Link>
            <Link className="btn-secondary" to="/signup" onClick={onClose}>Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
