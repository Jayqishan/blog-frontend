import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'admin@blogspace.com';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, showToast } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', adminKey: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isAdminLogin = form.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.email.trim() || !form.password) return setError('Please fill all fields.');
    if (isAdminLogin && !form.adminKey.trim()) return setError('Admin login key is required.');

    setSubmitting(true);
    setError('');
    try {
      const data = await login({
        email: form.email.trim(),
        password: form.password,
        adminKey: form.adminKey.trim(),
      });
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      navigate(data.user.role === 'Admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card auth-card--center glass-panel">
        <span className="hero-tag">Secure Access</span>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-copy">Log in as a visitor to interact and save posts, or as an author to manage your own stories and publishing flow.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <FormInput label="Email" type="email" placeholder="Email address..." value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          <FormInput label="Password" type="password" canTogglePassword placeholder="Password..." value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />
          {isAdminLogin ? (
            <FormInput
              label="Admin Key"
              type="password"
              canTogglePassword
              placeholder="Private admin login key..."
              hint="Admin email detected. Enter your private login key too."
              value={form.adminKey}
              onChange={(e) => setForm((prev) => ({ ...prev, adminKey: e.target.value }))}
            />
          ) : null}
          {error ? <p className="inline-error">{error}</p> : null}
          <button type="submit" className="btn-publish auth-submit" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="modal-switch">No account? <Link to="/signup">Create one</Link></p>
      </div>
    </section>
  );
}
