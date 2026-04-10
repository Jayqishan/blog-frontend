export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="state-msg loading-state glass-panel">
      <div className="skeleton-stack">
        <div className="skeleton-line skeleton-line--lg"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line skeleton-line--sm"></div>
      </div>
      <div className="loader"></div>
      <p>{message}</p>
    </div>
  );
}
