import Link from 'next/link';
import { DemoGovernanceRail } from '../components/demo-governance-rail';
import { DemoSocialFeed } from '../components/demo-social-feed';
import { PostCard } from '../components/post-card';
import { demoAuthors, demoFeed, demoSpace } from '../lib/demo-data';
import { resolveRuntimeMode } from '../lib/runtime-mode';

export default function HomePage() {
  const runtime = resolveRuntimeMode(process.env);

  if (!runtime.healthy) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <p className="eyebrow">Runtime configuration · fail closed</p>
          <h1>Intellectro is not configured for this deployment.</h1>
          <p>Production cannot silently fall back to demo state when persistence configuration is absent or partial.</p>
          <p className="context-note">Configuration state: {runtime.reason}</p>
        </section>
      </main>
    );
  }

  const configured = runtime.mode === 'configured';
  const previewLabel = configured ? 'Product preview' : 'Demo mode';

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">Intellectro</div>
        <div className="topbar-context">Accountable collaboration preview</div>
        <Link href={configured ? '/login' : '/'} className="account-button">{configured ? 'Sign in' : 'Demo mode'}</Link>
      </header>
      <aside className="left-rail">
        <p className="rail-heading">Spaces</p>
        <button className="space-link space-link--active" type="button"><span className="space-icon">AG</span><span><strong>{demoSpace.name}</strong><small>{demoSpace.memberCount} members</small></span></button>
        <div className="rail-divider" />
        <p className="context-note">{configured ? 'Preview content only. Sign in for authenticated governed actions.' : 'Illustrative local demo state. Nothing here represents authenticated authority.'}</p>
      </aside>
      <section className="feed-column">
        <section className="space-hero">
          <div>
            <p className="eyebrow">{previewLabel} · governed Space</p>
            <h1>{demoSpace.name}</h1>
            <p>{demoSpace.description}</p>
            <p className="context-note">This landing feed is illustrative. It never represents an authenticated session, live approval, or persisted provenance record.</p>
          </div>
          {configured && <Link href="/login" className="primary-button">Sign in</Link>}
        </section>
        <section className="composer-card"><div className="avatar">Y</div><div className="composer-placeholder">Share an idea, question, experience, or source…</div><button type="button" className="secondary-button" disabled>Add source</button></section>
        <div className="feed-label"><span>Illustrative chronological feed</span><span>No ranking model</span></div>
        {configured
          ? demoFeed.map((post) => <PostCard key={post.id} post={post} author={demoAuthors[post.authorId]} mode="configured" />)
          : <DemoSocialFeed />}
      </section>
      <aside className="right-rail">
        {configured ? (
          <section className="side-card">
            <p className="eyebrow">Trust context</p>
            <h2>Social content first. Accountability when it matters.</h2>
            <p className="context-note">AI participation, source linkage, approval state, and disagreement remain inspectable without turning the feed into a governance dashboard.</p>
          </section>
        ) : <DemoGovernanceRail />}
      </aside>
    </main>
  );
}
