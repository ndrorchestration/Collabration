import { readFileSync } from 'node:fs';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { buildPermissionInspection, loadCapabilityMatrix } from '../../../../packages/governance/src/index.js';
import { getSupabasePublicConfig } from '../../lib/supabase/env';
import { createClient } from '../../lib/supabase/server';
import {
  blockMember,
  createClaimResponse,
  createComment,
  createPost,
  createSpace,
  joinSpace,
  muteMember,
  removeReaction,
  reportPost,
  setReaction,
  unblockMember,
  unmuteMember,
  upsertProfile
} from './actions';

export const dynamic = 'force-dynamic';

const capabilityMatrix = loadCapabilityMatrix(
  readFileSync(new URL('../../../../governance/capability-matrix.yaml', import.meta.url).pathname, 'utf8')
);
const permissionInspections = [
  buildPermissionInspection(capabilityMatrix, 'community_agent'),
  buildPermissionInspection(capabilityMatrix, 'claim_agent')
];

function byId(rows = []) {
  return Object.fromEntries(rows.map((row) => [row.id, row]));
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function filterVisibleDiscussion(rows, excludedAuthorIds) {
  return rows
    .filter((post) => !excludedAuthorIds.has(post.author_id))
    .map((post) => ({
      ...post,
      comments: (post.comments ?? []).filter((comment) => !excludedAuthorIds.has(comment.author_id)),
      claim_responses: (post.claim_responses ?? []).filter((response) => !excludedAuthorIds.has(response.author_id))
    }));
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
  const [{ data: profile }, { data: memberships = [] }, { data: spaces = [] }, { data: blocks = [] }, { data: mutes = [] }] = await Promise.all([
    supabase.from('profiles').select('id,handle,display_name,bio').eq('id', userId).maybeSingle(),
    supabase.from('space_memberships').select('space_id,role,created_at').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('spaces').select('id,slug,name,description,created_at').order('created_at', { ascending: true }),
    supabase.from('blocks').select('blocked_id').eq('blocker_id', userId),
    supabase.from('mutes').select('muted_id').eq('muter_id', userId)
  ]);

  const blockedIds = new Set(blocks.map((row) => row.blocked_id));
  const mutedIds = new Set(mutes.map((row) => row.muted_id));
  const excludedAuthorIds = new Set([...blockedIds, ...mutedIds]);
  const spaceMap = byId(spaces);
  const membershipIds = new Set(memberships.map((membership) => membership.space_id));
  const requestedSpace = typeof params?.space === 'string' ? params.space : null;
  const activeSpaceId = requestedSpace && membershipIds.has(requestedSpace) ? requestedSpace : memberships[0]?.space_id ?? null;
  const activeSpace = activeSpaceId ? spaceMap[activeSpaceId] : null;
  const availableSpaces = spaces.filter((space) => !membershipIds.has(space.id));

  let posts = [];
  let authorMap = {};
  let agentActions = [];
  if (activeSpace) {
    const [{ data: persistedPosts = [] }, { data: governedActions = [] }] = await Promise.all([
      supabase
        .from('posts')
        .select('id,author_id,body,kind,ai_assisted,ai_assistance_type,agent_id,human_approved,created_at,post_sources(source_id,sources(id,url,title,publisher)),comments(id,author_id,body,created_at),claim_responses(id,author_id,response_type,body,created_at),reactions(user_id,reaction)')
        .eq('space_id', activeSpace.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('agent_actions')
        .select('id,agent_id,owner_id,action,capability,policy_version,approval_status,created_at,approval_records(id,approver_id,decision,note,created_at)')
        .eq('space_id', activeSpace.id)
        .order('created_at', { ascending: false })
        .limit(20)
    ]);
    posts = filterVisibleDiscussion(persistedPosts, excludedAuthorIds);
    agentActions = governedActions;

    const authorIds = [...new Set(posts.flatMap((post) => [
      post.author_id,
      ...(post.comments ?? []).map((comment) => comment.author_id),
      ...(post.claim_responses ?? []).map((response) => response.author_id)
    ]))];
    if (authorIds.length) {
      const { data: authors = [] } = await supabase.from('profiles').select('id,handle,display_name').in('id', authorIds);
      authorMap = byId(authors);
    }
  }

  let safetyProfileMap = {};
  const safetyIds = [...excludedAuthorIds];
  if (safetyIds.length) {
    const { data: safetyProfiles = [] } = await supabase.from('profiles').select('id,handle,display_name').in('id', safetyIds);
    safetyProfileMap = byId(safetyProfiles);
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
          const reactionCounts = (post.reactions ?? []).reduce((counts, row) => ({ ...counts, [row.reaction]: (counts[row.reaction] ?? 0) + 1 }), {});
          const ownReactions = new Set((post.reactions ?? []).filter((row) => row.user_id === userId).map((row) => row.reaction));
          return (
            <article className="post-card" key={post.id}>
              <div className="post-head"><div><strong>{author?.display_name ?? 'Member'}</strong><small> @{author?.handle ?? post.author_id.slice(0, 8)} · {formatDate(post.created_at)}</small></div></div>
              <p>{post.body}</p>
              <div className="trust-row"><span className="trust-chip">Human-authored</span>{post.kind === 'source_linked' && <span className="trust-chip">Source-linked</span>}{post.ai_assisted && <span className="trust-chip">AI-assisted</span>}</div>
              {(post.post_sources ?? []).map((link) => link.sources && <p className="context-note" key={link.source_id}>Source: <a href={link.sources.url} target="_blank" rel="noreferrer">{link.sources.title || link.sources.url}</a></p>)}

              <div className="trust-row">
                {['like', 'useful', 'interesting'].map((reaction) => <form action={ownReactions.has(reaction) ? removeReaction : setReaction} key={reaction}><input type="hidden" name="post_id" value={post.id} /><input type="hidden" name="reaction" value={reaction} /><button type="submit" className="secondary-button">{ownReactions.has(reaction) ? 'Remove ' : ''}{reaction} · {reactionCounts[reaction] ?? 0}</button></form>)}
              </div>

              {(post.comments ?? []).map((comment) => <p className="context-note" key={comment.id}><strong>{authorMap[comment.author_id]?.display_name ?? 'Member'}:</strong> {comment.body}</p>)}
              {(post.claim_responses ?? []).map((response) => <p className="context-note" key={response.id}><strong>{response.response_type.replace('_', ' ')} · {authorMap[response.author_id]?.display_name ?? 'Member'}:</strong> {response.body}</p>)}

              <details><summary>Comment</summary><form action={createComment} className="login-form"><input type="hidden" name="post_id" value={post.id} /><textarea name="body" required /><button type="submit">Add comment</button></form></details>
              <details><summary>Respond with context</summary><form action={createClaimResponse} className="login-form"><input type="hidden" name="post_id" value={post.id} /><select name="response_type" defaultValue="challenge"><option value="support">Support</option><option value="challenge">Challenge</option><option value="qualify">Qualify</option><option value="add_evidence">Add evidence</option><option value="ask_question">Ask question</option></select><textarea name="body" required /><button type="submit">Add contextual response</button></form></details>
              <details><summary>Report post</summary><form action={reportPost} className="login-form"><input type="hidden" name="post_id" value={post.id} /><select name="reason" defaultValue="misleading"><option value="spam">Spam</option><option value="harassment">Harassment</option><option value="misleading">Misleading</option><option value="other">Other</option></select><button type="submit">Submit report</button></form></details>
              {post.author_id !== userId && <div className="trust-row"><form action={muteMember}><input type="hidden" name="target_user_id" value={post.author_id} /><button type="submit" className="secondary-button">Mute author</button></form><form action={blockMember}><input type="hidden" name="target_user_id" value={post.author_id} /><button type="submit" className="secondary-button">Block author</button></form></div>}
            </article>
          );
        })}
      </section>

      <aside className="right-rail">
        <section className="side-card"><p className="eyebrow">Persistence boundary</p><h2>Identity comes from validated claims.</h2><p>Forms never choose their own author or approver identity. RLS decides whether the authenticated user may write.</p></section>
        <section className="side-card"><p className="eyebrow">Agent authority</p><div className="metric"><strong>0</strong><span>ordinary client insert policies for agent actions</span></div><div className="metric"><strong>0</strong><span>autonomous public posting capabilities</span></div></section>
        <details className="side-card">
          <summary>Permission inspector</summary>
          <p className="context-note">Permission does not mean an action occurred. Unknown capabilities default to deny.</p>
          {permissionInspections.map((inspection) => <div key={inspection.agentType}><p><strong>{inspection.agentType.replace('_', ' ')}</strong> · policy {inspection.version}</p>{inspection.capabilities.map((item) => <p className="context-note" key={item.capability}>{item.capability.replaceAll('_', ' ')} · <strong>{item.decision}</strong></p>)}</div>)}
        </details>
        <details className="side-card">
          <summary>Governed action log · {agentActions.length}</summary>
          <p className="context-note">This view is read-only and constrained by database RLS.</p>
          {agentActions.length === 0 && <p className="context-note">No governed agent actions are visible for this Space.</p>}
          {agentActions.map((action) => <div className="context-note" key={action.id}><strong>{action.agent_id}</strong> · {action.capability} · {action.approval_status}<br />policy {action.policy_version} · {formatDate(action.created_at)}{(action.approval_records ?? []).map((approval) => <span key={approval.id}><br />human decision: {approval.decision}</span>)}</div>)}
        </details>
        <section className="side-card"><p className="eyebrow">Safety controls</p><p>Mute hides a person's activity from your feed. Block also hides it; neither silently bans or deletes that person's content for anyone else.</p>{safetyIds.length === 0 && <p className="context-note">No muted or blocked members.</p>}{safetyIds.map((id) => { const member = safetyProfileMap[id]; return <div key={id} className="context-note"><strong>{member?.display_name ?? member?.handle ?? id.slice(0, 8)}</strong>{mutedIds.has(id) && <form action={unmuteMember}><input type="hidden" name="target_user_id" value={id} /><button type="submit" className="secondary-button">Unmute</button></form>}{blockedIds.has(id) && <form action={unblockMember}><input type="hidden" name="target_user_id" value={id} /><button type="submit" className="secondary-button">Unblock</button></form>}</div>; })}</section>
      </aside>
    </main>
  );
}
