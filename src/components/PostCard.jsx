import { Link } from 'react-router-dom';
import LikeButton from './LikeButton';

export default function PostCard({
  post,
  index,
  pagination,
  currentUser,
  onLikeToggle,
  onReadMore,
  onEdit,
  onDelete,
}) {
  const likes = post.likes?.length || 0;
  const comments = post.comments?.length || 0;
  const dateStr = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const isOwner = currentUser && post.authorId && String(post.authorId) === currentUser.id;
  const isAdmin = currentUser?.role === 'Admin';
  const canEdit = isOwner || isAdmin;
  const isLiked = Boolean(currentUser && post.likes?.some((like) => String(like.userId) === currentUser.id));

  return (
    <article className="post-card glass-panel" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="post-meta-top">
        <div className="post-meta-stack">
          <span className="post-num">
            Story
            {' '}
            {(pagination.totalPosts || 0) - ((pagination.page - 1) * pagination.limit) - index}
          </span>
          <span className="post-author">By {post.author || 'Anonymous'}</span>
        </div>
        <span className="post-date">{dateStr}</span>
      </div>

      {post.imageUrl ? <img className="post-image" src={post.imageUrl} alt={post.title} /> : null}

      <div className="post-card-copy">
        <h2 className="post-title">
          <Link className="post-link" to={`/posts/${post._id}`}>
            {post.title}
          </Link>
        </h2>

        <p className="post-body">{post.body}</p>
      </div>

      <div className="post-card-footer">
        <div className="post-actions post-actions--compact">
          <LikeButton liked={isLiked} count={likes} onClick={() => onLikeToggle(post)} />
          <Link className="comment-badge" to={`/posts/${post._id}#comments`}>
            Comments
            <span className="count">{comments}</span>
          </Link>
          <button type="button" className="action-btn action-readmore" onClick={() => onReadMore(post)}>
            Read More
          </button>
        </div>
        {canEdit ? (
          <div className="post-actions-right">
            <button type="button" className="action-btn action-edit" onClick={() => onEdit(post)}>Edit</button>
            <button type="button" className="action-btn action-delete" onClick={() => onDelete(post)}>Delete</button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
