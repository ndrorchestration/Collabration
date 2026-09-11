import Link from 'next/link';
import { PostCard } from '../components/post-card';
import { demoAuthors, demoFeed, demoSpace } from '../lib/demo-data';
import { hasSupabaseEnv } from '../lib/supabase/env';

export default function HomePage() {
  const authConfigured = hasSupabaseEnv();
  return (
    <main className="app-shell">
      <header className="topbar"><div className="brand-mark">Intellectro</div><div className="topbar-search">Search people, Spaces, sources, and projects</div><Link href="/login" className="account-button">{authConfigured ? 'Sign in' : 'Demo mode'}</Link></header>
      <aside className="left-rail">
        <p className="rail-heading">Spaces</p>
        <button className="space-link space-link--active"><span className="space-icon">AG</span><span><strong>{demoSpace.name}</strong><small>{demoSpace.memberCount} members</small></span></button>
        <div className="rail-divider" /><p className="rail-heading">Alpha boundaries</p>
        <ul className="boundary-list"><li>Chronological feed</li><li>Human approval for agent output</li><li>Deny-by-default capabilities</li><li>No autonomous public posting</li></ul>
      </aside>
      <section className="feed-column">
        <section className="space-hero"><div><p className="eyebrow">Governed Space · Alpha</p><h1>{demoSpace.name}</h1><p>{demoSpace.description}</p></div><button type="button" className="primary-button">Join Space</button></section>
        <section className="composer-card"><div className="avatar">Y</div><div className="composer-placeholder">Share an idea, question, experience, or source…</div><button type="button" className="secondary-button">Add source</button></section>
        <div className="feed-label"><span>Chronological feed</span><span>No ranking model</span></div>
        {demoFeed.map((post) => <PostCard key={post.id} post={post} author={demoAuthors[post.authorId]} />)}
      </section>
      <aside className="right-rail">
        <section className="side-card"><p className="eyebrow">Governance pulse</p><h2>Context, not hidden authority</h2><div className="metric"><strong>3</strong><span>trust states visible in this demo</span></div><div className="metric"><strong>0</strong><span>autonomous public actions permitted</span></div><div className="metric"><strong>1</strong><span>agent output awaiting human approval</span></div></section>
        <section className="side-card"><p className="eyebrow">How to read Intellectro</p><ol className="read-list"><li>Read normally.</li><li>Notice lightweight context chips.</li><li>Open context when trust matters.</li><li>Challenge, qualify, or add evidence.</li></ol></section>
      </aside>
    </main>
  );
}
