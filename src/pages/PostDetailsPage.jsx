import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import AuthPromptDialog from '../components/AuthPromptDialog';
import CommentSection from '../components/CommentSection';
import LikeButton from '../components/LikeButton';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import { createComment, fetchPostById, likePost, sharePost, unlikePost } from '../services/postService';

export default function PostDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { currentUser, showToast } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [savedPosts, setSavedPosts] = useState(() => JSON.parse(localStorage.getItem('savedPosts') || '[]'));

  useEffect(() => {
    loadPost();
  }, [id]);

  useEffect(() => {
    if (!post || location.hash !== '#comments') return;
    window.setTimeout(() => {
      const section = document.getElementById('comments');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, [post, location.hash]);

  async function loadPost() {
    setLoading(true);
    try {
      const data = await fetchPostById(id);
      setPost(data.post);
      document.title = `${data.post.title} | BlogSpace`;
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleLikeToggle() {
    if (!post) return;
    if (!currentUser) {
      setAuthPromptOpen(true);
      return;
    }
    try {
      const liked = Boolean(currentUser && post.likes?.some((like) => String(like.userId) === currentUser.id));
      const data = liked ? await unlikePost(post._id) : await likePost(post._id);
      setPost(data.post);
      showToast(liked ? 'Like removed.' : 'Post liked!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function handleSaveToggle() {
    if (!post) return;
    if (!currentUser) {
      setAuthPromptOpen(true);
      return;
    }

    const exists = savedPosts.includes(post._id);
    const next = exists ? savedPosts.filter((item) => item !== post._id) : [...savedPosts, post._id];
    setSavedPosts(next);
    localStorage.setItem('savedPosts', JSON.stringify(next));
    showToast(exists ? 'Removed from saved posts.' : 'Saved for later.', 'success');
  }

  async function handleShare() {
    if (!post) return;
    if (!currentUser) {
      setAuthPromptOpen(true);
      return;
    }

    try {
      await sharePost(post._id);
      showToast('Share recorded. The author has been notified.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleCommentSubmit(body) {
    if (!post) return false;
    if (!currentUser) {
      setAuthPromptOpen(true);
      return false;
    }
    setCommenting(true);
    try {
      const data = await createComment({ post: post._id, body });
      setPost(data.post);
      showToast('Comment added!', 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setCommenting(false);
    }
  }

  if (loading) return <LoadingState message="Loading post..." />;

  if (!post) {
    return <div className="state-msg glass-panel"><div className="empty-icon">✦</div><p>Post could not be loaded.</p></div>;
  }

  const liked = Boolean(currentUser && post.likes?.some((like) => String(like.userId) === currentUser.id));
  const saved = savedPosts.includes(post._id);
  const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  return (
    <section className="section detail-layout">
      <aside className="detail-rail glass-panel">
        <LikeButton liked={liked} count={post.likes?.length || 0} onClick={handleLikeToggle} />
        <button type="button" className={`action-btn ${saved ? 'liked' : ''}`} onClick={handleSaveToggle}>
          {saved ? 'Saved' : 'Save'}
        </button>
        <button type="button" className="action-btn action-share" onClick={handleShare}>
          Share
        </button>
      </aside>

      <article className="detail-card glass-panel">
        <div className="detail-meta">
          <span className="post-num">Post Detail</span>
          <span className="post-date">{dateStr}</span>
        </div>
        <h1 className="detail-title">{post.title}</h1>
        <p className="detail-author">By {post.author || 'Anonymous'}</p>
        {post.imageUrl ? <img className="detail-image detail-image--hero" src={post.imageUrl} alt={post.title} /> : null}
        <div className="detail-reading-col">
          <div className="detail-body">{String(post.body || '').split(/\n+/).map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)}</div>
          <div className="detail-stats">
            <span>{post.comments?.length || 0} comments</span>
            <span>{post.likes?.length || 0} likes</span>
          </div>
          {!currentUser ? <p className="auth-note detail-note">Log in as a visitor or author to like, comment, share, and save posts.</p> : null}
          <CommentSection
            comments={post.comments || []}
            onSubmit={handleCommentSubmit}
            submitting={commenting}
            isAuthenticated={Boolean(currentUser)}
            onRequireAuth={() => setAuthPromptOpen(true)}
            sectionId="comments"
          />
        </div>
      </article>

      <AuthPromptDialog
        open={authPromptOpen}
        title="Continue the Story"
        message="Create a visitor or author account to read fully, save posts, like stories, and join the discussion."
        onClose={() => setAuthPromptOpen(false)}
      />
    </section>
  );
}
