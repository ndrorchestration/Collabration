import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSupabasePublicConfig } from '../../lib/supabase/env';
import { createClient } from '../../lib/supabase/server';
import { createClaimResponse, createComment, createPost, createSpace, joinSpace, upsertProfile } from './actions';

export const dynamic = 'force-dynamic';

function byId(rows = []) {
  return Object.fromEntries(rows.map((row) => [row.id, row]));
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default async function PersistedAppPage({ searchParams }) {
  const config = getSupabasePublicConfig();
  if (!config.configured) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <p className="eyebrow">Persisted alpha · fail closed</p>
          <h1>Supabase is not configured for this runtime.</h1>
          <p>The governed demo remains available, but authenticated persistence is disabled until an isolated Intellectro database is configured.</p>
          <Link href="/">Return to demo</Link>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (claimsError || typeof claims?.sub !== 'string' || !claims.sub) redirect('/login?next=/app');

  const userId = claims.sub;
  const params = await searchParams;
  const [{ data: profile }, { data: memberships = [] }, { data: spaces = [] }] = await Promise.all([
    supabase.from('profiles').select('id,handle,display_name,bio').eq('id', userId).maybeSingle(),
    supabase.from('space_memberships').select('space_id,role,created_at').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('spaces').select('id,slug,name,description,created_at').order('created_at', { ascending: true })
  ]);

  const spaceMap = byId(spaces);
  const membershipIds = new Set(memberships.map((membership) => membership.space_id));
  const requestedSpace = typeof params?.space === 'string' ? params.space : null;
  const activeSpaceId = requestedSpace && membershipIds.has(requestedSpace) ? requestedSpace : memberships[0]?.space_id ?? null;
  const activeSpace = activeSpaceId ? spaceMap[activeSpaceId] : null;
  const availableSpaces = spaces.filter((space) => !membershipIds.has(space.id));

  let posts = [];
  let authorMap = {};
  if (activeSpace) {
    const { data: persistedPosts = [] } = await supabase
      .from('posts')
      .select('id,author_id,body,kind,ai_assisted,ai_assistance_type,agent_id,human_approved,created_at,post_sources(source_id,sources(id,url,title,publisher)),comments(id,author_id,body,created_at),claim_responses(id,author_id,response_type,body,created_at)')
      .eq('space_id', activeSpace.id)
      .order('created_at', { ascending: false })
      .limit(50);
    posts = persistedPosts;

    const authorIds = [...new Set(posts.flatMap((post) => [post.author_id, ...(post.comments ?? []).map((comment) => comment.author_id), ...(post.claim_responses ?? []).map((response) => response.author_id)]))];
    if (authorIds.length) {
      const { data: authors = [] } = await supabase.from('profiles').select('id,handle,display_name').in('id', authorIds);
      authorMap = byId(authors);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand-mark">Intellectro</Link>
        <div className="topbar-search">Persisted alpha · authenticated Supabase boundary</div>
        <form action="/auth/signout" method="post"><button className="account-button" type="submit">Sign out</button></form>
      </header>

      <aside className="left-rail">
        <p className="rail-heading">Your Spaces</p>
        {memberships.map((membership) => {
          const space = spaceMap[membership.space_id];
          if (!space) return null;
          return <Link key={space.id} className={`space-link ${space.id === activeSpaceId ? 'space-link--active' : ''}`} href={`/app?space=${space.id}`}><span><strong>{space.name}</strong><small>{membership.role}</small></span></Link>;
        })}
        {!memberships.length && <p className="context-note">Join or create a Space to start the persisted feed.</p>}
      </aside>

      <section className="feed-column">
        <section className="space-hero">
          <div><p className="eyebrow">Persisted alpha</p><h1>{activeSpace?.name ?? 'Choose a Space'}</h1><p>{activeSpace?.description ?? 'Authenticated writes are constrained by RLS and server-derived identity.'}</p></div>
        </section>

        <details className="composer-card" open={!profile}>
          <summary>{profile ? `Profile · @${profile.handle}` : 'Create your profile'}</summary>
          <form action={upsertProfile} className="login-form">
            <label htmlFor="handle">Handle</label><input id="handle" name="handle" defaultValue={profile?.handle ?? ''} required />
            <label htmlFor="display_name">Display name</label><input id="display_name" name="display_name" defaultValue={profile?.display_name ?? ''} required />
            <label htmlFor="bio">Bio</label><textarea id="bio" name="bio" defaultValue={profile?.bio ?? ''} />
            <button type="submit">Save profile</button>
          </form>
        </details>

        <details className="composer-card">
          <summary>Create a governed Space</summary>
          <form action={createSpace} className="login-form">
            <label htmlFor="space-name">Name</label><input id="space-name" name="name" required />
            <label htmlFor="space-slug">Slug</label><input id="space-slug" name="slug" pattern="[a-z0-9][a-z0-9-]{1,62}" required />
            <label htmlFor="space-description">Description</label><textarea id="space-description" name="description" />
            <button type="submit">Create Space</button>
          </form>
        </details>

        {availableSpaces.length > 0 && <section className="composer-card"><p className="eyebrow">Available Spaces</p>{availableSpaces.map((space) => <form action={joinSpace} key={space.id}><input type="hidden" name="space_id" value={space.id} /><button type="submit" className="secondary-button">Join {space.name}</button></form>)}</section>}

        {activeSpace && <section className="composer-card">
          <form action={createPost} className="login-form">
            <input type="hidden" name="space_id" value={activeSpace.id} />
            <label htmlFor="post-body">Post</label><textarea id="post-body" name="body" placeholder="Share an idea, question, experience, or source…" required />
            <label htmlFor="source-url">Source URL · optional</label><input id="source-url" type="url" name="source_url" />
            <label htmlFor="source-title">Source title · optional</label><input id="source-title" name="source_title" />
            <button type="submit">Publish as human-authored post</button>
          </form>
        </section>}

        {activeSpace && <div className="feed-label"><span>Chronological feed</span><span>No ranking model</span></div>}

        {posts.map((post) => {
          const author = authorMap[post.author_id];
          return (
            <article className="post-card" key={post.id}>
              <div className="post-head"><div><strong>{author?.display_name ?? 'Member'}</strong><small> @{author?.handle ?? post.author_id.slice(0, 8)} · {formatDate(post.created_at)}</small></div></div>
              <p>{post.body}</p>
              <div className="trust-row"><span className="trust-chip">Human-authored</span>{post.kind === 'source_linked' && <span className="trust-chip">Source-linked</span>}{post.ai_assisted && <span className="trust-chip">AI-assisted</span>}</div>
              {(post.post_sources ?? []).map((link) => link.sources && <p className="context-note" key={link.source_id}>Source: <a href={link.sources.url} target="_blank" rel="noreferrer">{link.sources.title || link.sources.url}</a></p>)}

              {(post.comments ?? []).map((comment) => <p className="context-note" key={comment.id}><strong>{authorMap[comment.author_id]?.display_name ?? 'Member'}:</strong> {comment.body}</p>)}
              {(post.claim_responses ?? []).map((response) => <p className="context-note" key={response.id}><strong>{response.response_type.replace('_', ' ')} · {authorMap[response.author_id]?.display_name ?? 'Member'}:</strong> {response.body}</p>)}

              <details><summary>Comment</summary><form action={createComment} className="login-form"><input type="hidden" name="post_id" value={post.id} /><textarea name="body" required /><button type="submit">Add comment</button></form></details>
              <details><summary>Respond with context</summary><form action={createClaimResponse} className="login-form"><input type="hidden" name="post_id" value={post.id} /><select name="response_type" defaultValue="challenge"><option value="support">Support</option><option value="challenge">Challenge</option><option value="qualify">Qualify</option><option value="add_evidence">Add evidence</option><option value="ask_question">Ask question</option></select><textarea name="body" required /><button type="submit">Add contextual response</button></form></details>
            </article>
          );
        })}
      </section>

      <aside className="right-rail">
        <section className="side-card"><p className="eyebrow">Persistence boundary</p><h2>Identity comes from validated claims.</h2><p>Forms never choose their own author or approver identity. RLS decides whether the authenticated user may write.</p></section>
        <section className="side-card"><p className="eyebrow">Agent authority</p><div className="metric"><strong>0</strong><span>ordinary client insert policies for agent actions</span></div><div className="metric"><strong>0</strong><span>autonomous public posting capabilities</span></div></section>
      </aside>
    </main>
  );
}
