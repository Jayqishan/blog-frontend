export default function LikeButton({ liked, count, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className={`action-btn like-btn ${liked ? 'liked' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="like-icon">{liked ? '♥' : '♡'}</span>
      <span>{liked ? 'Liked' : 'Like'}</span>
      <span className="count">{count}</span>
    </button>
  );
}
