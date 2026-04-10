import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, showToast } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Visitor' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) return setError('Please fill all fields.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');

    setSubmitting(true);
    setError('');
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      showToast('Account created! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card auth-card--center glass-panel">
        <span className="hero-tag">New Account</span>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-copy">Choose how you want to use BlogSpace. Visitors can interact and save stories, while authors can publish and manage posts too.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <FormInput label="Full Name" placeholder="Full name..." value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          <FormInput label="Email" type="email" placeholder="Email address..." value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          <div className="role-picker">
            <span className="form-input__label">Account Type</span>
            <div className="role-picker-options">
              <button type="button" className={`role-choice ${form.role === 'Visitor' ? 'active' : ''}`} onClick={() => setForm((prev) => ({ ...prev, role: 'Visitor' }))}>
                <strong>Visitor</strong>
                <span>Read and interact</span>
              </button>
              <button type="button" className={`role-choice ${form.role === 'Author' ? 'active' : ''}`} onClick={() => setForm((prev) => ({ ...prev, role: 'Author' }))}>
                <strong>Author</strong>
                <span>Publish and manage posts</span>
              </button>
            </div>
          </div>
          <FormInput
            label="Password"
            type="password"
            canTogglePassword
            placeholder="Password (min 6 chars)..."
            hint="Create a clean user account to write posts and join conversations."
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          {error ? <p className="inline-error">{error}</p> : null}
          <button type="submit" className="btn-publish auth-submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="modal-switch">Have an account? <Link to="/login">Log in</Link></p>
      </div>
    </section>
  );
}
