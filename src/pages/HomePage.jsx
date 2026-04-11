import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthPromptDialog from '../components/AuthPromptDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import LoadingState from '../components/LoadingState';
import PostEditorDialog from '../components/PostEditorDialog';
import PostList from '../components/PostList';
import { useAuth } from '../context/AuthContext';
import {
  createPost,
  deletePost,
  fetchPosts,
  likePost,
  unlikePost,
  updatePost,
} from '../services/postService';
import { uploadImage } from '../services/uploadService';

export default function HomePage() {
  const { currentUser, showToast } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: 6, totalPages: 1, totalPosts: 0, hasNextPage: false, hasPrevPage: false,
  });
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));

  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [feedError, setFeedError] = useState('');
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const [draft, setDraft] = useState({
    title: '', body: '', imageFile: null, summary: '', tags: [],
  });
  const [draftError, setDraftError] = useState('');

  const canPublish = currentUser?.role === 'Author' || currentUser?.role === 'Admin';

  // Sync URL params → state
  useEffect(() => {
    const nextSearch = searchParams.get('search') || '';
    const nextPage = Number(searchParams.get('page') || 1);
    setSearchInput(nextSearch);
    setSearch(nextSearch);
    setPage(nextPage);
  }, [searchParams]);

  useEffect(() => {
    loadPosts();
  }, [page, search]);

  async function loadPosts() {
    setLoading(true);
    try {
      setFeedError('');
      const data = await fetchPosts({ page, limit: 6, search });
      setPosts(data.posts || []);
      setPagination(data.pagination || pagination);
      const next = {};
      if (search) next.search = search;
      if (page > 1) next.page = String(page);
      setSearchParams(next, { replace: true });
    } catch (err) {
      setFeedError(err.message);
      showToast(err.message, 'error');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.body.trim()) {
      return setDraftError('Both title and content are required.');
    }
    setCreateLoading(true);
    setDraftError('');
    try {
      const imageUrl = draft.imageFile ? await uploadImage(draft.imageFile) : '';
      await createPost({
        title: draft.title.trim(),
        body: draft.body.trim(),
        imageUrl,
        summary: draft.summary.trim(),
        tags: draft.tags,
      });
      setDraft({ title: '', body: '', imageFile: null, summary: '', tags: [] });
      showToast('Post published.', 'success');
      setPage(1);
      await loadPosts();
    } catch (err) {
      if (err.message !== 'Session expired, please login again') setDraftError(err.message);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleToggleLike(post) {
    if (!currentUser) { setAuthPromptOpen(true); return; }
    try {
      const liked = Boolean(currentUser && post.likes?.some((l) => String(l.userId) === currentUser.id));
      const data = liked ? await unlikePost(post._id) : await likePost(post._id);
      setPosts((prev) => prev.map((item) => (item._id === data.post._id ? data.post : item)));
      showToast(liked ? 'Like removed.' : 'Post liked!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function handleReadMore(post) {
    if (!currentUser) { setAuthPromptOpen(true); return; }
    navigate(`/posts/${post._id}`);
  }

  async function handleEditSubmit(payload) {
    setEditSubmitting(true);
    try {
      const imageUrl = payload.imageFile ? await uploadImage(payload.imageFile) : payload.imageUrl;
      await updatePost(editingPost._id, {
        title: payload.title,
        body: payload.body,
        imageUrl,
        summary: payload.summary,
        tags: payload.tags,
      });
      showToast('Post updated.', 'success');
      await loadPosts();
      setEditingPost(null);
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deletePost(deleteTarget._id);
      showToast('Post deleted.', 'success');
      setDeleteTarget(null);
      if (posts.length === 1 && page > 1) setPage((prev) => prev - 1);
      else await loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero hero-editorial glass-panel">
        <div className="hero-copy">
          <div className="hero-tag">Editorial Meets SaaS</div>
          <h1 className="hero-title hero-title--compact">
            Editorial presence, structured as a polished publishing system.
          </h1>
          <p className="hero-sub hero-sub--compact">
            A warm glassmorphic workspace for reading, saving, interacting, and publishing stories
            with a premium feel.
          </p>
          {!currentUser ? (
            <div className="hero-cta">
              <Link className="btn-publish" to="/signup">Create Account</Link>
              <Link className="btn-secondary" to="/login">Login to Continue</Link>
            </div>
          ) : null}
        </div>

        {/* ── Create Post panel ── */}
        <aside className="hero-compose glass-panel">
          <div className="hero-compose-label">Create Post</div>
          <p className="hero-compose-copy">
            Authors can publish image-led stories, while visitors stay focused on reading and engaging.
          </p>

          {canPublish ? (
            <form className="hero-compose-form" onSubmit={handleCreate}>
              <FormInput
                placeholder="Your post title..."
                value={draft.title}
                onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
              />

              {/* Cover image */}
              <label className="form-input upload-field">
                <span className="upload-visual">
                  <span className="upload-title">
                    {draft.imageFile ? draft.imageFile.name : 'Choose Cover Image'}
                  </span>
                  <span className="upload-hint">
                    {draft.imageFile
                      ? 'Ready to upload when you publish'
                      : 'PNG, JPG, and WebP supported'}
                  </span>
                </span>
                <input
                  className="field react-field upload-native"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDraft((prev) => ({ ...prev, imageFile: e.target.files?.[0] || null }))}
                />
              </label>

              {draft.imageFile ? (
                <div className="image-meta">
                  <div className="image-meta-text">
                    <p className="results-meta">
                      {draft.imageFile.name} selected. It will upload when you publish.
                    </p>
                  </div>
                </div>
              ) : null}

              <FormInput
                multiline
                rows={5}
                placeholder="Write the opening lines of your story..."
                value={draft.body}
                onChange={(e) => setDraft((prev) => ({ ...prev, body: e.target.value }))}
              />

              <div className="create-footer">
                {draftError
                  ? <span className="inline-error">{draftError}</span>
                  : <span className="results-meta">Images upload securely to Cloudinary.</span>}
                <button type="submit" className="btn-publish" disabled={createLoading}>
                  {createLoading ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          ) : currentUser ? (
            <div className="hero-compose-locked">
              <p className="results-meta">
                Your account is in visitor mode. Visitors can like, comment, share, and save posts.
                Create an author account if you want to publish.
              </p>
            </div>
          ) : (
            <div className="hero-compose-locked">
              <p className="results-meta">Login to open the publishing panel and start writing.</p>
              <div className="hero-cta">
                <Link className="btn-secondary" to="/login">Log In</Link>
              </div>
            </div>
          )}
        </aside>
      </section>

      {/* ── Feed ── */}
      <section className="section">
        <div className="feed-header">
          <div className="section-label">Latest Posts</div>
          <button type="button" className="btn-refresh" onClick={loadPosts}>Refresh</button>
        </div>

        {search
          ? <p className="results-meta results-meta--feed">{pagination.totalPosts || 0} results for "{search}"</p>
          : null}

        {loading ? <LoadingState message="Fetching posts..." /> : null}

        {!loading && feedError ? (
          <div className="state-msg state-msg-error glass-panel">
            <div className="empty-icon">!</div>
            <p>{feedError}</p>
            <button type="button" className="btn-secondary" onClick={loadPosts}>Try Again</button>
          </div>
        ) : null}

        {!loading && !feedError && !posts.length ? (
          <div className="state-msg glass-panel">
            <div className="empty-icon">✦</div>
            <p>{search ? `No posts found for "${search}".` : 'No posts yet. Be the first to write!'}</p>
          </div>
        ) : null}

        {!loading ? (
          <PostList
            posts={posts}
            pagination={pagination}
            currentUser={currentUser}
            onLikeToggle={handleToggleLike}
            onReadMore={handleReadMore}
            onEdit={setEditingPost}
            onDelete={setDeleteTarget}
          />
        ) : null}

        {pagination.totalPosts > 0 ? (
          <div className="pagination-bar">
            <button
              type="button"
              className="btn-secondary"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <span className="pagination-info">Page {pagination.page} of {pagination.totalPages}</span>
            <button
              type="button"
              className="btn-secondary"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        ) : null}
      </section>

      {/* Dialogs */}
      <PostEditorDialog
        open={Boolean(editingPost)}
        title="Edit Post"
        initialData={editingPost}
        onClose={() => setEditingPost(null)}
        onSubmit={handleEditSubmit}
        submitting={editSubmitting}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Confirm Delete"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.` : ''}
        confirmLabel="Yes, Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
      <AuthPromptDialog
        open={authPromptOpen}
        title="Continue Reading"
        message="Please log in or create an account to open the full post and continue reading."
        onClose={() => setAuthPromptOpen(false)}
      />
    </>
  );
}
