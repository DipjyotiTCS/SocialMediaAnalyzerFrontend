import { useMemo, useState } from 'react';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4.8 6.6h14.4c.9 0 1.6.7 1.6 1.6v7.6c0 .9-.7 1.6-1.6 1.6H4.8c-.9 0-1.6-.7-1.6-1.6V8.2c0-.9.7-1.6 1.6-1.6Z" />
      <path d="m4.2 8 7.8 5 7.8-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.8 10.4h10.4c.8 0 1.4.6 1.4 1.4v6c0 .8-.6 1.4-1.4 1.4H6.8c-.8 0-1.4-.6-1.4-1.4v-6c0-.8.6-1.4 1.4-1.4Z" />
      <path d="M8.6 10.4V8.2a3.4 3.4 0 0 1 6.8 0v2.2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2.8 12s3.3-5.4 9.2-5.4 9.2 5.4 9.2 5.4-3.3 5.4-9.2 5.4S2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

export default function LoginPage({ AppIcon, ThemeSwitcher, selectedTheme, onThemeChange, onLogin }) {
  const [username, setUsername] = useState(DEFAULT_USERNAME);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => username.trim() && password.trim(), [username, password]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const success = onLogin({ username: username.trim(), password });
    if (!success) {
      setError('Invalid username or password. Use admin / admin123.');
    }
  };

  return (
    <main className="login-page-shell">
      <section className="login-hero-panel" aria-label="Application overview">
        <div className="login-hero-content">
          <div className="login-brand-row">
            <AppIcon />
            <span>SocialSignal Pro</span>
          </div>

          <div className="login-copy-block">
            <h1>Streamline your social response workflow</h1>
            <p>
              Capture customer posts, analyze intent and sentiment, route agent actions,
              and publish approved responses from one focused workspace.
            </p>
          </div>

          <ul className="login-feature-list" aria-label="Application highlights">
            <li>Real-time social post intake and analysis</li>
            <li>Agentic routing for service, sales, leads, and feedback</li>
            <li>Editable response management before public posting</li>
          </ul>
        </div>
      </section>

      <section className="login-form-panel" aria-label="Login form">
        <div className="login-theme-area">
          <ThemeSwitcher selectedTheme={selectedTheme} onThemeChange={onThemeChange} />
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-card-heading">
            <h2>Welcome back</h2>
            <p>Sign in to continue to SocialSignal Pro</p>
          </div>

          <label className="login-field">
            <span>Username</span>
            <div className="login-input-wrap">
              <MailIcon />
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>
          </label>

          <label className="login-field">
            <span>Password</span>
            <div className="login-input-wrap">
              <LockIcon />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((isVisible) => !isVisible)}
              >
                <EyeIcon />
              </button>
            </div>
          </label>

          {error && <div className="login-error" role="alert">{error}</div>}

          <button type="submit" className="login-submit-button" disabled={!canSubmit}>
            Sign In
          </button>
        </form>
      </section>
    </main>
  );
}
