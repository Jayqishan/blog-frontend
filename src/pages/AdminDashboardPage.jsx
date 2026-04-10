import { useEffect, useMemo, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import { fetchUsers, removeUser } from '../services/authService';
import { deletePost, fetchPosts } from '../services/postService';

export default function AdminDashboardPage() {
  const { currentUser, showToast } = useAuth();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    else loadPostsData();
  }, [tab]);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data.users || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadPostsData() {
    setLoading(true);
    try {
      const data = await fetchPosts({ page: 1, limit: 100 });
      setPosts(data.posts || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!confirmState) return;
    try {
      if (confirmState.type === 'user') {
        await removeUser(confirmState.id);
        showToast('User deleted.', 'success');
        loadUsers();
      } else {
        await deletePost(confirmState.id);
        showToast('Post deleted.', 'success');
        loadPostsData();
      }
      setConfirmState(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  const stats = useMemo(() => ([
    { label: 'Total Users', value: users.length, points: [30, 60, 55, 70, 64, 78] },
    { label: 'Total Posts', value: posts.length, points: [18, 35, 48, 42, 68, 74] },
    { label: 'Reports', value: 0, points: [8, 10, 12, 10, 8, 9] },
  ]), [users.length, posts.length]);

  function renderSparkline(points) {
    return points.map((point, index) => (
      <span key={`${point}-${index}`} style={{ height: `${point}%` }} className="spark-bar"></span>
    ));
  }

  return (
    <section className="section admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">BlogSpace</div>
        <button type="button" className={`admin-side-link ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users</button>
        <button type="button" className={`admin-side-link ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>Posts</button>
      </aside>

      <div className="admin-main">
        <div className="admin-hero glass-panel">
          <span className="hero-tag">Admin Dashboard</span>
          <h1 className="auth-title">Control the publication flow</h1>
          <p className="auth-copy">Review members, moderate stories, and keep the editorial space healthy.</p>
        </div>

        <div className="admin-stats">
          {stats.map((stat) => (
            <article key={stat.label} className="admin-stat glass-panel">
              <div className="admin-stat-copy">
                <span className="results-meta">{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
              <div className="sparkline">{renderSparkline(stat.points)}</div>
            </article>
          ))}
        </div>

        <div className="admin-shell glass-panel">
          <div className="admin-tabs">
            <button type="button" className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>User Management</button>
            <button type="button" className={`admin-tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>Post Management</button>
          </div>

          {loading ? <LoadingState message={`Loading ${tab}...`} /> : null}

          {!loading && tab === 'users' ? (
            <div className="admin-panel-body">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className={`role-badge ${user.role === 'Admin' ? 'role-admin' : user.role === 'Author' ? 'role-author' : 'role-visitor'}`}>{user.role}</span></td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        {user._id !== currentUser?.id ? (
                          <button type="button" className="action-btn action-delete action-delete-reveal" onClick={() => setConfirmState({ type: 'user', id: user._id, message: `Delete user "${user.name}"? This cannot be undone.` })}>Delete</button>
                        ) : <span className="admin-you">You</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {!loading && tab === 'posts' ? (
            <div className="admin-panel-body">
              <table className="admin-table">
                <thead><tr><th>Title</th><th>Author</th><th>Likes</th><th>Comments</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post._id}>
                      <td>{post.title}</td>
                      <td>{post.author || 'Anonymous'}</td>
                      <td>{post.likes?.length || 0}</td>
                      <td>{post.comments?.length || 0}</td>
                      <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td><button type="button" className="action-btn action-delete action-delete-reveal" onClick={() => setConfirmState({ type: 'post', id: post._id, message: `Delete post "${post.title}"?` })}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog open={Boolean(confirmState)} title="Confirm Delete" message={confirmState?.message || ''} confirmLabel="Yes, Delete" onConfirm={handleConfirm} onClose={() => setConfirmState(null)} />
    </section>
  );
}
