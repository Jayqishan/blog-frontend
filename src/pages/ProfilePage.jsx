import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import LoadingState from '../components/LoadingState';
import PostEditorDialog from '../components/PostEditorDialog';
import PostList from '../components/PostList';
import { useAuth } from '../context/AuthContext';
import { deletePost, fetchMyPosts, likePost, unlikePost, updatePost } from '../services/postService';
import { uploadImage } from '../services/uploadService';

export default function ProfilePage() {
  const { currentUser, showToast, updateProfile, refreshCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', headline: '', bio: '', avatarUrl: '', avatarFile: null });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const freshUser = await refreshCurrentUser();
      const postsData = await fetchMyPosts();
      setForm({
        name: freshUser.name || '',
        headline: freshUser.headline || '',
        bio: freshUser.bio || '',
        avatarUrl: freshUser.avatarUrl || '',
        avatarFile: null,
      });
      setPosts(postsData.posts || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      showToast('Name is required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const avatarUrl = form.avatarFile ? await uploadImage(form.avatarFile) : form.avatarUrl;
      const updatedUser = await updateProfile({
        name: form.name.trim(),
        headline: form.headline.trim(),
        bio: form.bio.trim(),
        avatarUrl,
      });
      setForm((prev) => ({ ...prev, avatarUrl: updatedUser.avatarUrl || '', avatarFile: null }));
      await loadProfile();
      showToast('Profile updated.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit(payload) {
    setEditSubmitting(true);
    try {
      const imageUrl = payload.imageFile ? await uploadImage(payload.imageFile) : payload.imageUrl;
      await updatePost(editingPost._id, {
        title: payload.title,
        body: payload.body,
        imageUrl,
      });
      showToast('Post updated.', 'success');
      setEditingPost(null);
      await loadProfile();
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDeletePost() {
    if (!deleteTarget) return;
    try {
      await deletePost(deleteTarget._id);
      showToast('Post deleted.', 'success');
      setDeleteTarget(null);
      await loadProfile();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleToggleLike(post) {
    try {
      const liked = Boolean(currentUser && post.likes?.some((like) => String(like.userId) === currentUser.id));
      const data = liked ? await unlikePost(post._id) : await likePost(post._id);
      setPosts((prev) => prev.map((item) => (item._id === data.post._id ? data.post : item)));
      showToast(liked ? 'Like removed.' : 'Post liked!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  const stats = useMemo(() => ([
    { label: 'Posts', value: posts.length },
    { label: 'Likes', value: posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0) },
    { label: 'Comments', value: posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0) },
  ]), [posts]);

  if (loading) return <LoadingState message="Loading your profile..." />;

  const isAuthor = currentUser?.role === 'Author' || currentUser?.role === 'Admin';
  const avatarSource = form.avatarFile ? URL.createObjectURL(form.avatarFile) : (form.avatarUrl || '');

  return (
    <section className="section profile-page">
      <div className="profile-shell">
        <aside className="profile-overview glass-panel">
          <div className="profile-banner">
            <div className="profile-avatar-lg">
              {avatarSource ? <img src={avatarSource} alt={form.name} className="profile-avatar-image" /> : <span>{form.name?.slice(0, 1) || 'U'}</span>}
            </div>
          </div>
          <div className="profile-copy">
            <h1 className="profile-title">{form.name || currentUser?.name}</h1>
            <p className="profile-handle">{currentUser?.email}</p>
            <p className="profile-headline">{form.headline || (isAuthor ? 'Author at BlogSpace' : 'Thoughtful reader and community member')}</p>
            <p className="profile-bio">{form.bio || 'Add a short bio to make your profile feel more personal and polished.'}</p>
          </div>
          <div className="profile-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="profile-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="profile-main">
          <div className="profile-edit glass-panel">
            <div className="section-label">Edit Profile</div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <FormInput label="Name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Display name" />
              <FormInput label="Headline" value={form.headline} onChange={(event) => setForm((prev) => ({ ...prev, headline: event.target.value }))} placeholder="Short headline" />
              <FormInput multiline rows={4} label="Bio" value={form.bio} onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))} placeholder="Write something about yourself..." />
              <label className="form-input upload-field">
                <span className="form-input__label">Profile Photo</span>
                <span className="upload-visual">
                  <span className="upload-title">{form.avatarFile ? form.avatarFile.name : 'Choose a profile image'}</span>
                  <span className="upload-hint">Upload a profile photo to personalize your page</span>
                </span>
                <input className="field react-field upload-native" type="file" accept="image/*" onChange={(event) => setForm((prev) => ({ ...prev, avatarFile: event.target.files?.[0] || null }))} />
              </label>
              <button type="submit" className="btn-publish" disabled={submitting}>{submitting ? 'Saving...' : 'Save Profile'}</button>
            </form>
          </div>

          <div className="profile-posts glass-panel">
            <div className="profile-posts-head">
              <div className="section-label">{isAuthor ? 'Your Posts' : 'Your Activity'}</div>
              {!posts.length && isAuthor ? <Link className="btn-secondary" to="/">Create Your First Post</Link> : null}
            </div>
            {posts.length ? (
              <PostList
                posts={posts}
                pagination={{ page: 1, limit: posts.length || 1, totalPosts: posts.length }}
                currentUser={currentUser}
                onLikeToggle={handleToggleLike}
                onReadMore={(post) => navigate(`/posts/${post._id}`)}
                onEdit={setEditingPost}
                onDelete={setDeleteTarget}
              />
            ) : (
              <div className="state-msg">
                <div className="empty-icon">✦</div>
                <p>{isAuthor ? 'No posts yet. Your published stories will appear here.' : 'Your profile is ready. Start engaging with posts to build your presence.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <PostEditorDialog open={Boolean(editingPost)} title="Edit Post" initialData={editingPost} onClose={() => setEditingPost(null)} onSubmit={handleEditSubmit} submitting={editSubmitting} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Delete Post" message={deleteTarget ? `Delete "${deleteTarget.title}" from your profile?` : ''} confirmLabel="Delete Post" onConfirm={handleDeletePost} onClose={() => setDeleteTarget(null)} />
    </section>
  );
}
