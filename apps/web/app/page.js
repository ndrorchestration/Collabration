'use client';

import Link from 'next/link';
import { PostCard } from '../components/post-card';
import { CommunityStatePanel } from '../components/community-state-panel';
import { SourceLinker } from '../components/source-linker';
import { ModeratorQueue } from '../components/moderator-queue';
import { ActionLogViewer } from '../components/action-log-viewer';
import { demoAuthors, demoFeed, demoSpace } from '../lib/demo-data';
import { hasSupabaseEnv } from '../lib/supabase/env';
import { useState } from 'react';

export default function HomePage() {
  const authConfigured = hasSupabaseEnv();
  const [actionLogOpen, setActionLogOpen] = useState(false);
  const demoModeNote = authConfigured
    ? 'Interactions are authenticated with Supabase. They are stored on the server, not just this browser.'
    : 'In demo mode, interactions are stored in this browser only and disappear on reload.';
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
        <section className="space-hero"><div><p className="eyebrow">Governed Space · Alpha</p><h1>{demoSpace.name}</h1><p>{demoSpace.description}</p><p className="context-note">Provenance records where a thing came from and what happened to it. It is not a verdict. Agent output in this Space requires human approval before publication. The capability posture is deny-by-default. This alpha never fabricates a logged-in session.</p></div><button type="button" className="primary-button">Join Space</button></section>
        <section className="composer-card"><div className="avatar">Y</div><div className="composer-placeholder">Share an idea, question, experience, or source…</div><button type="button" className="secondary-button">Add source</button><SourceLinker /></section>
        <div className="feed-label"><span>Chronological feed</span><span>No ranking model</span></div>
        <p className="context-note">{demoModeNote}</p>
        {demoFeed.map((post) => (
          <PostCard key={post.id} post={post} author={demoAuthors[post.authorId]} onOpenActionLog={() => setActionLogOpen(true)} />
        ))}
      </section>
      <aside className="right-rail">
        <CommunityStatePanel />
        <ModeratorQueue currentUserId="user-ender" />
        <ActionLogViewer open={actionLogOpen} onClose={() => setActionLogOpen(false)} />
        <section className="side-card"><p className="eyebrow">How to read Intellectro</p><ol className="read-list"><li>Read normally; trust chips surface lightweight context on each post.</li><li>Open the context panel when trust or provenance matters.</li><li>Comment, or respond with support, challenge, qualify, add evidence, or ask a question.</li><li>Trace a post to its sources and provenance records.</li><li>Watch the governance pulse panel for denied capabilities and approval requirements.</li></ol></section>
      </aside>
    </main>
  );
}
