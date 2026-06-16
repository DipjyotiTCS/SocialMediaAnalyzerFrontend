import { useEffect, useMemo, useState } from 'react';
import { fetchRecentSocialPosts } from '../api/socialMediaApi.js';

function truncateText(value, maxLength = 86) {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  if (!text) return 'No post text available';
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function normalizePlatform(platform) {
  return String(platform || '').trim().toLowerCase();
}

function getSidebarPostKey(record, index) {
  return String(record?.id || record?.post_id || record?.payload?.post_id || `${record?.platform || 'post'}-${index}`);
}

function PlatformIcon({ platform }) {
  const normalizedPlatform = normalizePlatform(platform);

  if (normalizedPlatform === 'facebook') {
    return (
      <span className="platform-icon platform-facebook" title="Facebook" aria-label="Facebook">
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M14.4 8.3h2.1V5.1c-.4-.1-1.7-.2-3.2-.2-3.2 0-5.3 1.9-5.3 5.5v3.1H4.7v3.6H8v8.8h4v-8.8h3.3l.5-3.6H12v-2.7c0-1 .3-1.7 1.8-1.7h.6Z" />
        </svg>
      </span>
    );
  }

  if (normalizedPlatform === 'x' || normalizedPlatform === 'twitter') {
    return (
      <span className="platform-icon platform-x" title="X" aria-label="X">
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M14.1 10.6 21.2 2h-2.7l-5.6 6.8L8.4 2H2.8l7.4 11.1L2.5 22h2.7l6.2-7.2 4.8 7.2h5.6l-7.7-11.4Zm-2 2.3-1.2-1.8L6.3 4h1.2l4.3 6.5 1.2 1.8 5 7.6h-1.2l-4.7-7Z" />
        </svg>
      </span>
    );
  }

  if (normalizedPlatform === 'instagram') {
    return (
      <span className="platform-icon platform-instagram" title="Instagram" aria-label="Instagram">
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="5" />
          <circle cx="12" cy="12" r="3.3" />
          <circle cx="16.6" cy="7.4" r="1" />
        </svg>
      </span>
    );
  }

  return (
    <span className="platform-icon platform-generic" title={platform || 'Social post'} aria-label={platform || 'Social post'}>
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M7.5 9.8a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Zm9 0a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6ZM3.8 20c0-3.1 2-5.3 4.7-5.3 1.1 0 2.1.4 2.9 1.1A5.4 5.4 0 0 0 9.8 20h-6Zm10.4 0c0-2.5 1.6-4.3 3.8-4.3s3.8 1.8 3.8 4.3h-7.6Z" />
      </svg>
    </span>
  );
}

function extractPosts(responseBody) {
  if (Array.isArray(responseBody)) return responseBody;
  if (Array.isArray(responseBody?.records)) return responseBody.records;
  if (Array.isArray(responseBody?.items)) return responseBody.items;
  return [];
}

function getPostPayload(record) {
  const source = record?.input_json && typeof record.input_json === 'object' ? record.input_json : record;

  return {
    post_id: source?.post_id || record?.post_id || null,
    platform: source?.platform || record?.platform || null,
    user_type: source?.user_type || record?.user_type || null,
    post: source?.post || record?.post || '',
    comment: source?.comment || record?.comment || null,
    mention: source?.mention || record?.mention || null,
    likes: Number(source?.likes ?? record?.likes ?? 0),
    shares: Number(source?.shares ?? record?.shares ?? 0),
    hashtags: source?.hashtags || record?.hashtags || null,
    lead_score: Number(source?.lead_score ?? record?.lead_score ?? 0),
  };
}

export default function SocialPostsSidebar({ onAnalyzePost, activePostId, activeSidebarKey, disabled = false, onExpandedChange }) {
  const [expanded, setExpanded] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [clickedPostKeys, setClickedPostKeys] = useState(() => new Set());

  const posts = useMemo(() => records.map((record, index) => ({
    ...record,
    sidebarKey: getSidebarPostKey(record, index),
    payload: getPostPayload(record),
  })), [records]);

  const loadRecentPosts = async ({ force = false } = {}) => {
    if (!force && loadedOnce) return;

    setLoading(true);
    setError('');

    try {
      const responseBody = await fetchRecentSocialPosts(15);
      setRecords(extractPosts(responseBody));
      setLoadedOnce(true);
    } catch (err) {
      setError(err.message || 'Failed to load saved posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onExpandedChange?.(expanded);

    if (expanded) {
      loadRecentPosts();
    }
  }, [expanded, onExpandedChange]);

  const handleToggle = () => {
    setExpanded((isExpanded) => !isExpanded);
  };

  const handleAnalyze = (post) => {
    const hasAlreadyBeenClicked = clickedPostKeys.has(post.sidebarKey);

    if (!hasAlreadyBeenClicked) {
      setClickedPostKeys((previousKeys) => {
        const nextKeys = new Set(previousKeys);
        nextKeys.add(post.sidebarKey);
        return nextKeys;
      });
    }

    onAnalyzePost(post.payload, {
      source: 'sidebar',
      sidebarKey: post.sidebarKey,
      alreadyClicked: hasAlreadyBeenClicked,
    });
  };

  return (
    <aside className={`social-sidebar ${expanded ? 'expanded' : 'collapsed'}`} aria-label="Recent social media posts">
      <button
        type="button"
        className="sidebar-toggle"
        aria-label={expanded ? 'Collapse recent posts sidebar' : 'Expand recent posts sidebar'}
        aria-expanded={expanded}
        onClick={handleToggle}
      >
        <span className={`sidebar-toggle-icon ${expanded ? 'expanded' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 20 20" focusable="false">
            <path d="M7.75 5.5 12.25 10l-4.5 4.5" />
          </svg>
        </span>
      </button>

      {expanded && (
        <div className="sidebar-content">
          <div className="sidebar-heading">
            <div>
              <p className="eyebrow">Recent Posts</p>
            </div>
            <button
              type="button"
              className="sidebar-refresh-button"
              onClick={() => loadRecentPosts({ force: true })}
              disabled={loading}
            >
              {loading ? 'Loading' : 'Refresh'}
            </button>
          </div>

          {error && <div className="sidebar-message sidebar-error">{error}</div>}
          {loading && !posts.length && <div className="sidebar-message">Loading latest posts...</div>}
          {!loading && !error && posts.length === 0 && <div className="sidebar-message">No posts found.</div>}

          <div className="sidebar-post-list">
            {posts.map((post) => {
              const isActive = activeSidebarKey ? post.sidebarKey === activeSidebarKey : activePostId && post.payload.post_id === activePostId;
              const needsAction = !clickedPostKeys.has(post.sidebarKey);
              return (
                <button
                  type="button"
                  className={`sidebar-post-item ${isActive ? 'active' : ''} ${needsAction ? 'needs-action' : ''}`}
                  key={post.sidebarKey}
                  onClick={() => handleAnalyze(post)}
                  disabled={disabled}
                  title={post.payload.post || 'Analyze this post'}
                >
                  {needsAction && <span className="sidebar-notification-dot" aria-label="Action needed" title="Action needed" />}
                  <PlatformIcon platform={post.payload.platform} />
                  <span className="sidebar-post-copy">
                    <strong>{post.payload.platform || 'Social'}</strong>
                    <span>{truncateText(post.payload.post)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
