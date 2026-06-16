import { useMemo, useState } from 'react';
import { createSocialPost } from '../api/socialMediaApi.js';

const STORY_IMAGES = [
  '/assets/story-office.svg',
  '/assets/story-legal.svg',
  '/assets/story-support.svg',
  '/assets/story-analytics.svg',
];

const CONTACTS = [
  { name: 'Support Team', avatar: '/assets/avatar-support.svg' },
  { name: 'Legal Ops', avatar: '/assets/avatar-legal.svg' },
  { name: 'Sales Desk', avatar: '/assets/avatar-sales.svg' },
  { name: 'Customer Care', avatar: '/assets/avatar-care.svg' },
];

function buildPostId() {
  const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `P-${Date.now()}-${randomSuffix}`;
}

function buildCreatePostPayload(postText) {
  return {
    post_id: buildPostId(),
    source_type: 'api',
    batch_id: 'BATCH-DEMO-001',
    platform: 'Facebook',
    user_type: 'Customer',
    post: postText.trim(),
    comment: 'Please create a support ticket.',
    mention: '@SupportTeam',
    likes: 0,
    shares: 0,
    hashtags: '#Support #Billing',
    lead_score: 42,
    expected_category: 'service_issue_reporting',
    expected_sentiment: 'negative',
  };
}

function FacebookGlyph() {
  return <span className="facebook-glyph" aria-hidden="true">f</span>;
}

function CircleIcon({ children, label }) {
  return (
    <button type="button" className="fb-round-control" aria-label={label} disabled>
      {children}
    </button>
  );
}

function ComposerAction({ icon, label }) {
  return (
    <button type="button" className="fb-composer-action" disabled>
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function StockAvatar({ className = '', src = '/assets/avatar-dipjyoti.svg', alt = '' }) {
  return <img className={`fb-stock-avatar ${className}`.trim()} src={src} alt={alt} />;
}

function SubmittedFeedPost({ post, submittedAt }) {
  if (!post) return null;

  const timeLabel = submittedAt
    ? submittedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <article className="fb-submitted-post-card" aria-label="Submitted Facebook-style post">
      <div className="fb-post-card-header">
        <StockAvatar className="fb-large-avatar" />
        <div className="fb-post-author-block">
          <strong>Dipjyoti Som</strong>
          <span>{timeLabel} · 🌐</span>
        </div>
        <button type="button" className="fb-post-menu" aria-label="More options" disabled>⋯</button>
      </div>

      <p className="fb-post-content">{post.post}</p>

      <div className="fb-post-engagement-summary" aria-hidden="true">
        <span className="fb-reaction-stack"><span>👍</span><span>❤️</span></span>
        <span>{post.likes || 0}</span>
        <span>{post.comment ? '1 comment' : 'No comments yet'}</span>
        <span>{post.shares || 0} shares</span>
      </div>

      <div className="fb-post-actions-row" aria-label="Decorative post interaction buttons">
        <button type="button" className="fb-post-action-button" disabled>
          <span aria-hidden="true">👍</span>
          <strong>Like</strong>
        </button>
        <button type="button" className="fb-post-action-button" disabled>
          <span aria-hidden="true">💬</span>
          <strong>Comment</strong>
        </button>
        <button type="button" className="fb-post-action-button" disabled>
          <span aria-hidden="true">↗</span>
          <strong>Share</strong>
        </button>
      </div>

      <div className="fb-comment-box-preview" aria-hidden="true">
        <StockAvatar className="fb-small-avatar" />
        <span>Write a comment...</span>
      </div>
    </article>
  );
}

export default function CreatePostPage({ onGoToAnalyzer }) {
  const [postText, setPostText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedPost, setSavedPost] = useState(null);
  const [submittedAt, setSubmittedAt] = useState(null);

  const previewText = useMemo(() => postText.trim(), [postText]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanPostText = postText.trim();
    if (!cleanPostText || saving) return;

    setSaving(true);
    setError('');
    setSavedPost(null);
    setSubmittedAt(null);

    const payload = buildCreatePostPayload(cleanPostText);

    try {
      await createSocialPost(payload);
      setSavedPost(payload);
      setSubmittedAt(new Date());
      setPostText('');
    } catch (err) {
      setError(err.message || 'Failed to save the post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="facebook-page-shell facebook-route-page" aria-label="Facebook-style create post page">
      <header className="fb-topbar">
        <div className="fb-topbar-left">
          <FacebookGlyph />
          <div className="fb-search" aria-hidden="true">
            <span>⌕</span>
            <span>Search Facebook</span>
          </div>
        </div>

        <nav className="fb-top-nav" aria-label="Decorative page navigation">
          <button type="button" className="active" disabled aria-label="Home">⌂</button>
          <button type="button" disabled aria-label="Video">▻</button>
          <button type="button" disabled aria-label="Marketplace">▦</button>
          <button type="button" disabled aria-label="Groups">◉</button>
          <button type="button" disabled aria-label="Gaming">♢</button>
        </nav>

        <div className="fb-topbar-right">
          <CircleIcon label="Menu">☰</CircleIcon>
          <CircleIcon label="Messenger">✦</CircleIcon>
          <CircleIcon label="Notifications">●</CircleIcon>
          <StockAvatar className="fb-small-avatar" />
        </div>
      </header>

      <div className="fb-layout">
        <aside className="fb-left-rail" aria-label="Decorative Facebook menu">
          <button type="button" className="fb-rail-item fb-home-link" onClick={onGoToAnalyzer}>
            <StockAvatar className="fb-avatar-mini" />
            <strong>Dipjyoti Som</strong>
          </button>
          <div className="fb-rail-item"><span>👥</span><strong>Friends</strong></div>
          <div className="fb-rail-item"><span>🕘</span><strong>Memories</strong></div>
          <div className="fb-rail-item"><span>🔖</span><strong>Saved</strong></div>
          <div className="fb-rail-item"><span>👪</span><strong>Groups</strong></div>
          <div className="fb-rail-item"><span>▶</span><strong>Video</strong></div>
          <div className="fb-rail-item"><span>🏪</span><strong>Marketplace</strong></div>
        </aside>

        <section className="fb-feed-column" aria-label="Facebook-style feed composer">
          <div className="fb-stories-row" aria-hidden="true">
            {['Create story', 'Legal Ops', 'Support Team', 'Customer Voice'].map((story, index) => (
              <div className="fb-story-card" key={story}>
                <img src={STORY_IMAGES[index]} alt="" />
                <span>{index === 0 ? '+' : '•'}</span>
                <strong>{story}</strong>
              </div>
            ))}
          </div>

          <form className="fb-composer-card" onSubmit={handleSubmit}>
            <div className="fb-composer-head">
              <StockAvatar className="fb-large-avatar" />
              <div className="fb-composer-identity">
                <strong>Dipjyoti Som</strong>
                <span>Post to Facebook</span>
              </div>
            </div>

            <textarea
              className="fb-post-textarea"
              value={postText}
              onChange={(event) => setPostText(event.target.value)}
              placeholder="What's on your mind, Dipjyoti?"
              rows={6}
              aria-label="Post text"
            />

            {previewText && (
              <div className="fb-live-preview">
                <div className="fb-preview-header">
                  <StockAvatar className="fb-small-avatar" />
                  <div>
                    <strong>Dipjyoti Som</strong>
                    <span>Just now · 🌐</span>
                  </div>
                </div>
                <p>{previewText}</p>
              </div>
            )}

            <div className="fb-add-to-post">
              <strong>Add to your post</strong>
              <div className="fb-add-icons" aria-hidden="true">
                <button type="button" disabled>🖼️</button>
                <button type="button" disabled>👤</button>
                <button type="button" disabled>😊</button>
                <button type="button" disabled>📍</button>
                <button type="button" disabled>⋯</button>
              </div>
            </div>

            <div className="fb-composer-actions" aria-hidden="true">
              <ComposerAction icon="🎥" label="Live video" />
              <ComposerAction icon="🖼️" label="Photo/video" />
              <ComposerAction icon="😊" label="Feeling/activity" />
            </div>

            {error && <div className="fb-save-message fb-save-error">{error}</div>}
            {savedPost && (
              <div className="fb-save-message fb-save-success">
                Post saved successfully.
              </div>
            )}

            <button type="submit" className="fb-post-button" disabled={!previewText || saving}>
              {saving ? 'Posting...' : 'Post'}
            </button>
          </form>

          {savedPost && <SubmittedFeedPost post={savedPost} submittedAt={submittedAt} />}
        </section>

        <aside className="fb-right-rail" aria-label="Decorative contacts area">
          <div className="fb-card-small">
            <div className="fb-section-title">
              <strong>Sponsored</strong>
              <span>⋯</span>
            </div>
            <div className="fb-sponsored-item">
              <img className="fb-sponsored-thumb" src="/assets/sponsored-dashboard.svg" alt="" />
              <p>Business-ready social engagement insights</p>
            </div>
          </div>

          <div className="fb-card-small">
            <div className="fb-section-title">
              <strong>Contacts</strong>
              <span>⌕ ⋯</span>
            </div>
            {CONTACTS.map((contact) => (
              <div className="fb-contact-row" key={contact.name}>
                <span className="fb-online-avatar">
                  <img src={contact.avatar} alt="" />
                </span>
                <strong>{contact.name}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
