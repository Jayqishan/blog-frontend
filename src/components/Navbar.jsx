import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';

export default function Navbar() {
  const { currentUser, logout, deleteAccount, notificationCount, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deletePromptOpen, setDeletePromptOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get('search') || '');
  }, [location.search]);

  useEffect(() => {
    function handleKeydown(event) {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        const searchField = document.getElementById('global-search');
        if (searchField) searchField.focus();
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate('/');
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccount();
      setDeletePromptOpen(false);
      setMenuOpen(false);
      showToast('Your account has been deleted.', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    navigate({ pathname: '/', search: params.toString() ? `?${params.toString()}` : '' });
  }

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <>
      <header className="header glass-panel">
        <div className="header-inner">
          <Link className="logo" to="/">
            <span className="logo-icon">✦</span>
            <span className="logo-text">BlogSpace</span>
          </Link>

          <form className="nav-search" onSubmit={handleSearchSubmit}>
            <input
              id="global-search"
              type="search"
              className="field react-field"
              placeholder="Search stories, writers, and ideas"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span className="nav-shortcut">Ctrl+K</span>
          </form>

          <nav className="header-right">
            <NavLink className="btn-auth-sm" to="/">Home</NavLink>
            {currentUser ? (
              <>
                <NavLink className="notification-link" to="/notifications" aria-label="Open notifications">
                  <span className="notification-link__icon">🔔</span>
                  {notificationCount ? <span className="notification-link__badge">{notificationCount > 99 ? '99+' : notificationCount}</span> : null}
                </NavLink>

                <div className={`profile-chip ${menuOpen ? 'open' : ''}`}>
                  <button type="button" className="profile-trigger" onClick={() => setMenuOpen((prev) => !prev)}>
                    <span className="profile-avatar">{currentUser.name?.slice(0, 1) || 'U'}</span>
                    <span className="profile-meta">
                      <span className="profile-name">{currentUser.name}</span>
                      <span className={`role-badge ${isAdmin ? 'role-admin' : currentUser.role === 'Author' ? 'role-author' : 'role-visitor'}`}>
                        {isAdmin ? 'Admin' : currentUser.role}
                      </span>
                    </span>
                  </button>

                  <div className="profile-menu glass-panel">
                    <NavLink className="btn-auth-sm" to="/profile" onClick={() => setMenuOpen(false)}>Profile</NavLink>
                    <NavLink className="btn-auth-sm" to="/notifications" onClick={() => setMenuOpen(false)}>Notifications</NavLink>

                    {isAdmin ? (
                      <div className="profile-switch">
                        <div>
                          <div className="profile-switch-label">Admin Mode</div>
                          <div className="profile-switch-copy">Visual layout toggle only.</div>
                        </div>
                        <button
                          type="button"
                          className={`switch ${adminMode ? 'active' : ''}`}
                          onClick={() => setAdminMode((prev) => !prev)}
                          aria-label="Toggle admin mode preview"
                        >
                          <span className="switch-knob"></span>
                        </button>
                      </div>
                    ) : null}

                    {isAdmin ? <NavLink className="btn-auth-sm" to="/admin" onClick={() => setMenuOpen(false)}>Admin Dashboard</NavLink> : null}
                    {!isAdmin ? <button type="button" className="btn-auth-sm btn-danger-sm" onClick={() => setDeletePromptOpen(true)}>Delete Account</button> : null}
                    <button type="button" className="btn-auth-sm btn-danger-sm" onClick={handleLogout}>Logout</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink className="btn-auth-sm" to="/login">Login</NavLink>
                <NavLink className="btn-auth-sm btn-auth-primary" to="/signup">Sign Up</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <ConfirmDialog
        open={deletePromptOpen}
        title="Delete Account"
        message="Your posts, likes, and comments will be removed permanently. Do you want to continue?"
        confirmLabel="Delete My Account"
        onConfirm={handleDeleteAccount}
        onClose={() => setDeletePromptOpen(false)}
      />
    </>
  );
}
