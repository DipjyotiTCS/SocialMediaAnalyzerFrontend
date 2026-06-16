import { useEffect, useRef, useState } from 'react';
import { analyzeSocialPost } from './api/socialMediaApi.js';
import ResultsDashboard from './components/ResultsDashboard.jsx';
import SocialPostsSidebar from './components/SocialPostsSidebar.jsx';
import CreatePostPage from './components/CreatePostPage.jsx';
import LoginPage from './components/LoginPage.jsx';

const THEMES = [
  { id: 'executive-blue', name: 'Executive Blue', colors: ['#1d4ed8', '#38bdf8', '#dbeafe'] },
  { id: 'calm-slate', name: 'Calm Slate', colors: ['#334155', '#64748b', '#e2e8f0'] },
  { id: 'sage-green', name: 'Sage Green', colors: ['#2f6f5e', '#7fb685', '#e7f4ed'] },
  { id: 'teal-harbor', name: 'Teal Harbor', colors: ['#0f766e', '#14b8a6', '#ccfbf1'] },
  { id: 'indigo-mist', name: 'Indigo Mist', colors: ['#4f46e5', '#818cf8', '#e0e7ff'] },
  { id: 'soft-violet', name: 'Soft Violet', colors: ['#7c3aed', '#a78bfa', '#ede9fe'] },
  { id: 'rosewood', name: 'Rosewood', colors: ['#be4778', '#f0a6ca', '#fce7f3'] },
  { id: 'warm-sand', name: 'Warm Sand', colors: ['#b7791f', '#f6c56f', '#fff7ed'] },
  { id: 'forest-office', name: 'Forest Office', colors: ['#166534', '#22c55e', '#dcfce7'] },
  { id: 'ocean-calm', name: 'Ocean Calm', colors: ['#0369a1', '#38bdf8', '#e0f2fe'] },
  { id: 'charcoal-cyan', name: 'Charcoal Cyan', colors: ['#164e63', '#06b6d4', '#cffafe'] },
  { id: 'plum-graphite', name: 'Plum Graphite', colors: ['#6d3657', '#b47aa2', '#f5e7f0'] },
  { id: 'olive-gold', name: 'Olive Gold', colors: ['#5f6f2d', '#d6ad3d', '#f7f3df'] },
  { id: 'steel-lavender', name: 'Steel Lavender', colors: ['#475569', '#8b5cf6', '#ede9fe'] },
  { id: 'coral-business', name: 'Coral Business', colors: ['#c2410c', '#fb923c', '#ffedd5'] },
];

const AUTH_STORAGE_KEY = 'socialSignalProAuthenticated';
const DEFAULT_LOGIN = { username: 'admin', password: 'admin123' };

function getPageFromLocation() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '');
  if (normalizedPath === '/login') {
    return 'login';
  }
  return normalizedPath === '/create-post' ? 'create-post' : 'analyzer';
}

function AppIcon() {
  return (
    <span className="app-logo" aria-hidden="true">
      <svg viewBox="0 0 48 48" role="img" focusable="false">
        <path className="logo-bubble" d="M8 13.5C8 8.8 11.8 5 16.5 5h15C36.2 5 40 8.8 40 13.5v10.8c0 4.7-3.8 8.5-8.5 8.5h-8.1L14.7 40c-.9.7-2.2.1-2.2-1.1v-7.1C9.8 30.4 8 27.6 8 24.3V13.5Z" />
        <path className="logo-line" d="M17 18.5h14M17 24h8" />
        <circle className="logo-node" cx="31" cy="24" r="2.4" />
        <circle className="logo-node" cx="26" cy="30" r="2.4" />
        <path className="logo-link" d="M30 25.8 27.5 28.4" />
      </svg>
    </span>
  );
}

function ThemeSwitcher({ selectedTheme, onThemeChange }) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const closePicker = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', closePicker);
    return () => document.removeEventListener('mousedown', closePicker);
  }, []);

  const currentTheme = THEMES.find((theme) => theme.id === selectedTheme) || THEMES[0];

  return (
    <div className="theme-picker" ref={pickerRef}>
      <button
        type="button"
        className="theme-button"
        aria-label="Open color theme selector"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <span className="gear-icon" aria-hidden="true">⚙</span>
      </button>

      {open && (
        <div className="theme-menu" role="listbox" aria-label="Color themes">
          <div className="theme-menu-heading">
            <span>Color Theme</span>
            <small>{currentTheme.name}</small>
          </div>
          {THEMES.map((theme) => (
            <button
              type="button"
              key={theme.id}
              className={`theme-option ${selectedTheme === theme.id ? 'selected' : ''}`}
              role="option"
              aria-selected={selectedTheme === theme.id}
              onClick={() => {
                onThemeChange(theme.id);
                setOpen(false);
              }}
            >
              <span className="marble-row" aria-hidden="true">
                {theme.colors.map((color) => (
                  <span className="color-marble" style={{ background: color }} key={`${theme.id}-${color}`} />
                ))}
              </span>
              <span>{theme.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState('executive-blue');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [activeResultKey, setActiveResultKey] = useState(null);
  const [analysisCache, setAnalysisCache] = useState({});
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activePage, setActivePage] = useState(getPageFromLocation);
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem(AUTH_STORAGE_KEY) === 'true');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const handleRouteChange = () => {
      setActivePage(getPageFromLocation());
      setSidebarExpanded(false);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const navigateTo = (path, options = {}) => {
    if (options.replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    setActivePage(getPageFromLocation());
    setSidebarExpanded(false);
  };

  useEffect(() => {
    if (!authenticated && activePage !== 'login') {
      navigateTo('/login', { replace: true });
    }
  }, [authenticated, activePage]);

  const handleLogin = ({ username, password }) => {
    if (username === DEFAULT_LOGIN.username && password === DEFAULT_LOGIN.password) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setAuthenticated(true);
      navigateTo('/analyzer', { replace: true });
      return true;
    }
    return false;
  };

  const analyzePayload = async (payload, options = {}) => {
    const resultKey = options.sidebarKey || payload?.post_id || `post-${Date.now()}`;
    const cachedAnalysis = analysisCache[resultKey];

    setSelectedPostId(payload?.post_id || null);
    setActiveResultKey(resultKey);
    setError('');

    if (cachedAnalysis) {
      setLoading(false);
      setResult(cachedAnalysis.result || null);
      if (cachedAnalysis.error) {
        setError(cachedAnalysis.error);
      }
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await analyzeSocialPost(payload);
      setResult(response);
      setAnalysisCache((previousCache) => ({
        ...previousCache,
        [resultKey]: { result: response, error: '' },
      }));
    } catch (err) {
      const errorMessage = err.message || 'Failed to analyze post.';
      setError(errorMessage);
      setAnalysisCache((previousCache) => ({
        ...previousCache,
        [resultKey]: { result: null, error: errorMessage },
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated || activePage === 'login') {
    return (
      <LoginPage
        AppIcon={AppIcon}
        ThemeSwitcher={ThemeSwitcher}
        selectedTheme={theme}
        onThemeChange={setTheme}
        onLogin={handleLogin}
      />
    );
  }

  if (activePage === 'create-post') {
    return <CreatePostPage onGoToAnalyzer={() => navigateTo('/analyzer')} />;
  }

  return (
    <>
      <SocialPostsSidebar
        onAnalyzePost={analyzePayload}
        activePostId={selectedPostId || result?.post_id}
        activeSidebarKey={activeResultKey}
        disabled={loading}
        onExpandedChange={setSidebarExpanded}
      />

      <main className={`app-shell ${sidebarExpanded ? 'sidebar-open' : ''}`.trim()}>
        <header className="app-header">
          <div className="app-brand">
            <AppIcon />
            <h1>SocialSignal Pro</h1>
          </div>
          <div className="header-actions">
            <ThemeSwitcher selectedTheme={theme} onThemeChange={setTheme} />
          </div>
        </header>

        <section className="middle-section" aria-label="Social media post analyzer workspace">
          <div className="analysis-section">
            {error && (
              <section className="error-panel">
                <h3>Request Failed</h3>
                <p>{error}</p>
              </section>
            )}
            {loading && (
              <section className="loading-panel">
                <div className="spinner" />
                <div>
                  <h3>Analyzing post...</h3>
                  <p>The backend is running the agent workflow. This may take a few seconds.</p>
                </div>
              </section>
            )}
            {!loading && <ResultsDashboard result={result} resultKey={activeResultKey} />}
          </div>
        </section>
      </main>
    </>
  );
}
