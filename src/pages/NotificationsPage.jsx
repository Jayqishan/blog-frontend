import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import { fetchNotifications, markAllNotificationsRead } from '../services/notificationService';

function formatWhen(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.max(Math.round(diffMs / 60000), 0);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function NotificationList({ items, emptyMessage }) {
  if (!items.length) {
    return (
      <div className="state-msg glass-panel">
        <div className="empty-icon">✦</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="notification-list">
      {items.map((item) => (
        <article key={item._id} className={`notification-card glass-panel ${item.read ? '' : 'notification-card--unread'}`}>
          <div className="notification-card-top">
            <div>
              <p className="notification-message">{item.message}</p>
              <p className="notification-meta">
                {item.actorName ? `${item.actorName}${item.actorRole ? ` · ${item.actorRole}` : ''}` : 'System'}
              </p>
            </div>
            <span className="notification-time">{formatWhen(item.createdAt)}</span>
          </div>
          {item.postId ? (
            <div className="notification-card-bottom">
              <span className="notification-post">{item.postTitle || 'Related post'}</span>
              <Link className="btn-secondary" to={`/posts/${item.postId}`}>Open Post</Link>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const { currentUser, refreshNotifications, showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [data, setData] = useState({ notifications: [], sections: {}, unreadCount: 0 });
  const isAdmin = currentUser?.role === 'Admin';
  const [tab, setTab] = useState(isAdmin ? 'authors' : 'activity');

  useEffect(() => {
    setTab(isAdmin ? 'authors' : 'activity');
  }, [isAdmin]);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const response = await fetchNotifications();
      setData(response);
      await refreshNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAllRead() {
    setMarking(true);
    try {
      await markAllNotificationsRead();
      await loadNotifications();
      showToast('Notifications marked as read.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setMarking(false);
    }
  }

  const sections = useMemo(() => {
    if (isAdmin) {
      return [
        { id: 'authors', label: 'Authors', items: data.sections?.authors || [], empty: 'No new author signups yet.' },
        { id: 'visitors', label: 'Visitors', items: data.sections?.visitors || [], empty: 'No new visitor signups yet.' },
      ];
    }

    return [
      { id: 'activity', label: 'Activity', items: data.sections?.activity || [], empty: 'No likes, comments, or shares yet.' },
      { id: 'admin', label: 'Admin Updates', items: data.sections?.admin || [], empty: 'No admin changes on your posts.' },
    ];
  }, [data.sections, isAdmin]);

  const activeSection = sections.find((section) => section.id === tab) || sections[0];

  if (loading) return <LoadingState message="Loading notifications..." />;

  return (
    <section className="section notifications-page">
      <div className="notifications-hero glass-panel">
        <div>
          <span className="hero-tag">Notifications</span>
          <h1 className="auth-title">Stay on top of activity</h1>
          <p className="auth-copy">
            {isAdmin
              ? 'Track new authors and visitors in separate notification streams.'
              : 'See who liked, commented, or shared your posts, plus any admin changes.'}
          </p>
        </div>
        <button type="button" className="btn-publish" onClick={handleMarkAllRead} disabled={marking || !data.unreadCount}>
          {marking ? 'Updating...' : data.unreadCount ? `Mark ${data.unreadCount} as Read` : 'All Read'}
        </button>
      </div>

      <div className="notifications-shell glass-panel">
        <div className="notification-tabs">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`admin-tab ${tab === section.id ? 'active' : ''}`}
              onClick={() => setTab(section.id)}
            >
              {section.label}
              {section.items.length ? <span className="notification-tab-count">{section.items.length}</span> : null}
            </button>
          ))}
        </div>

        <div className="notifications-body">
          <NotificationList items={activeSection?.items || []} emptyMessage={activeSection?.empty || 'No notifications yet.'} />
        </div>
      </div>
    </section>
  );
}
