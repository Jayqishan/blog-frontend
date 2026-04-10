import { useState } from 'react';
import FormInput from './FormInput';

export default function CommentSection({
  comments = [],
  onSubmit,
  submitting = false,
  isAuthenticated = false,
  onRequireAuth,
  sectionId,
}) {
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }
    if (!body.trim()) {
      setError('Please write a comment.');
      return;
    }

    setError('');
    const ok = await onSubmit(body.trim());
    if (ok) setBody('');
  }

  return (
    <section className="detail-comments" id={sectionId}>
      <h2 className="comments-title">Comments</h2>
      <form className="comment-form" onSubmit={handleSubmit}>
        <FormInput
          multiline
          rows={4}
          placeholder={isAuthenticated ? 'Write your comment...' : 'Login to join the conversation...'}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onFocus={() => {
            if (!isAuthenticated) onRequireAuth?.();
          }}
          disabled={submitting}
        />
        {!isAuthenticated ? (
          <button type="button" className="auth-inline-cta" onClick={() => onRequireAuth?.()}>
            Log in or sign up to comment
          </button>
        ) : null}
        {error ? <p className="inline-error">{error}</p> : null}
        <button type="submit" className="btn-publish" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
      <div className="comments-list">
        {comments.length ? comments.map((comment) => (
          <div key={comment._id} className="comment-item glass-panel">
            <p className="comment-user">{comment.user}</p>
            <p className="comment-body">{comment.body}</p>
          </div>
        )) : <p className="no-comments">No comments yet. Be the first!</p>}
      </div>
    </section>
  );
}
