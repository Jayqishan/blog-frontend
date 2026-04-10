export default function ConfirmDialog({
  open,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  onConfirm,
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
            <button type="button" className="btn-publish btn-danger-full" onClick={onConfirm}>{confirmLabel}</button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
