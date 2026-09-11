import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ALPHA_CAPABILITY_MATRIX, buildPermissionInspection } from '../../../../packages/governance/src/index.js';
import { AccountPanel } from '../../components/account-panel';
import { AppShell } from '../../components/app-shell';
import { MobileNav } from '../../components/mobile-nav';
import { PeoplePanel } from '../../components/people-panel';
import { PersistedPostCard } from '../../components/persisted-post-card';
import { PrimaryNav } from '../../components/primary-nav';
import { ReviewPanel } from '../../components/review-panel';
import { SpaceHeader } from '../../components/space-header';
import { SpacesPanel } from '../../components/spaces-panel';
import { getSupabasePublicConfig } from '../../lib/supabase/env';
import { createClient } from '../../lib/supabase/server';
import {
  blockMember,
  createClaimResponse,
  createComment,
  createPost,
  createSpace,
  decideAgentAction,
  decideConnectionRequest,
  decideSpaceInvitation,
  disconnectConnection,
  inviteToSpace,
  joinSpace,
  muteMember,
  removeReaction,
  reportPost,
  requestAgentAction,
  requestConnection,
  requestCorrectionOrAppeal,
  resolveCorrectionOrAppeal,
  revokeSpaceInvitation,
  setReaction,
  setSpaceJoinPolicy,
  unblockMember,
  unmuteMember,
  upsertProfile
} from './actions';

export const dynamic = 'force-dynamic';

const APP_VIEWS = new Set(['home', 'spaces', 'people', 'review', 'account']);

const permissionInspections = [
  buildPermissionInspection(ALPHA_CAPABILITY_MATRIX, 'community_agent'),
  buildPermissionInspection(ALPHA_CAPABILITY_MATRIX, 'claim_agent')
];

function byId(rows = []) {
  return Object.fromEntries(rows.map((row) => [row.id, row]));
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

function correctionTargetSpaceId(request) {
  return request.posts?.space_id ?? request.agent_actions?.space_id ?? null;
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
  const requestedView = typeof params?.view === 'string' ? params.view : 'home';
  const normalizedView = APP_VIEWS.has(requestedView) ? requestedView : 'home';

  const [
    { data: profile },
    { data: memberships = [] },
    { data: spaces = [] },
    { data: blocks = [] },
    { data: mutes = [] },
    { data: discoverableProfiles = [] },
    { data: connectionRows = [] },
    { data: invitationRows = [] }
  ] = await Promise.all([
    supabase.from('profiles').select('id,handle,display_name,bio').eq('id', userId).maybeSingle(),
    supabase.from('space_memberships').select('space_id,role,created_at').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('spaces').select('id,slug,name,description,join_policy,created_at').order('created_at', { ascending: true }),
    supabase.from('blocks').select('blocked_id').eq('blocker_id', userId),
    supabase.from('mutes').select('muted_id').eq('muter_id', userId),
    supabase.from('profiles').select('id,handle,display_name').order('display_name', { ascending: true }).limit(50),
    supabase
      .from('connection_requests')
      .select('id,requester_id,recipient_id,status,created_at,decided_at,ended_at')
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false }),
    supabase
      .from('space_invitations')
      .select('id,space_id,inviter_id,invitee_id,granted_role,status,created_at,decided_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
  ]);

  const blockedIds = new Set(blocks.map((row) => row.blocked_id));
  const mutedIds = new Set(mutes.map((row) => row.muted_id));
  const excludedAuthorIds = new Set([...blockedIds, ...mutedIds]);
  const spaceMap = byId(spaces);
  const membershipIds = new Set(memberships.map((membership) => membership.space_id));
  const requestedSpace = typeof params?.space === 'string' ? params.space : null;
  const activeSpaceId = requestedSpace && membershipIds.has(requestedSpace) ? requestedSpace : memberships[0]?.space_id ?? null;
  const activeSpace = activeSpaceId ? spaceMap[activeSpaceId] : null;
  const activeMembership = memberships.find((membership) => membership.space_id === activeSpaceId);
  const canModerate = ['moderator', 'admin'].includes(activeMembership?.role);
  const availableSpaces = spaces.filter((space) => !membershipIds.has(space.id));

  const incomingConnectionRequests = connectionRows.filter((row) => row.status === 'pending' && row.recipient_id === userId);
  const outgoingConnectionRequests = connectionRows.filter((row) => row.status === 'pending' && row.requester_id === userId);
  const acceptedConnections = connectionRows.filter((row) => row.status === 'accepted');
  const activeConnectionUserIds = new Set(
    connectionRows
      .flatMap((row) => [row.requester_id, row.recipient_id])
      .filter((id) => id !== userId)
  );
  const discoverablePeople = discoverableProfiles.filter((person) => person.id !== userId && !activeConnectionUserIds.has(person.id));
  const invitablePeople = discoverableProfiles.filter((person) => person.id !== userId);
  const peopleMap = byId(discoverableProfiles);
  const incomingSpaceInvitations = invitationRows.filter((row) => row.invitee_id === userId);
  const outgoingSpaceInvitations = invitationRows.filter((row) => row.inviter_id === userId);

  let posts = [];
  let authorMap = {};
  let agentActions = [];
  let pendingActions = [];
  let correctionRequests = [];
  if (activeSpace) {
    const [
      { data: persistedPosts = [] },
      { data: governedActions = [] },
      { data: pendingGovernedActions = [] },
      { data: visibleCorrections = [] }
    ] = await Promise.all([
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
        .limit(20),
      supabase
        .from('agent_actions')
        .select('id,agent_id,owner_id,action,capability,policy_version,approval_status,created_at')
        .eq('space_id', activeSpace.id)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: true }),
      supabase
        .from('correction_requests')
        .select('id,requester_id,post_id,action_id,request_kind,request_text,status,resolution_note,resolved_by,created_at,resolved_at,posts(space_id),agent_actions(space_id)')
        .order('created_at', { ascending: false })
        .limit(50)
    ]);
    posts = filterVisibleDiscussion(persistedPosts, excludedAuthorIds);
    agentActions = governedActions;
    pendingActions = pendingGovernedActions;
    correctionRequests = visibleCorrections.filter((request) => correctionTargetSpaceId(request) === activeSpace.id);

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

  const openCorrections = correctionRequests.filter((request) => request.status === 'open');
  const canReview = canModerate && (pendingActions.length > 0 || openCorrections.length > 0 || agentActions.length > 0 || correctionRequests.length > 0);
  const activeView = normalizedView === 'review' && !canReview ? 'home' : normalizedView;

  let safetyProfileMap = {};
  const safetyIds = [...excludedAuthorIds];
  if (safetyIds.length) {
    const { data: safetyProfiles = [] } = await supabase.from('profiles').select('id,handle,display_name').in('id', safetyIds);
    safetyProfileMap = byId(safetyProfiles);
  }

  const navigationSpaces = memberships.map((membership) => spaceMap[membership.space_id]).filter(Boolean);

  const safetyContext = (
    <section className="side-card">
      <p className="eyebrow">Safety controls</p>
      <p>Mute hides a person's activity from your feed. Block creates a bilateral privacy boundary, hides blocked profiles at the database boundary, and ends any pending or accepted connection without banning or deleting content for anyone else.</p>
      {safetyIds.length === 0 && <p className="context-note">No muted or blocked members.</p>}
      {safetyIds.map((id) => {
        const member = safetyProfileMap[id];
        return (
          <div key={id} className="context-note safety-member">
            <strong>{member?.display_name ?? member?.handle ?? id.slice(0, 8)}</strong>
            {mutedIds.has(id) && <form action={unmuteMember}><input type="hidden" name="target_user_id" value={id} /><button type="submit" className="secondary-button">Unmute</button></form>}
            {blockedIds.has(id) && <form action={unblockMember}><input type="hidden" name="target_user_id" value={id} /><button type="submit" className="secondary-button">Unblock</button></form>}
          </div>
        );
      })}
    </section>
  );

  const topbar = (
    <>
      <Link href="/app?view=home" className="brand-mark">Intellectro</Link>
      <div className="topbar-context">{activeSpace?.name ?? 'Accountable collaboration'}</div>
      <form action="/auth/signout" method="post"><button className="account-button" type="submit">Sign out</button></form>
    </>
  );

  const primaryNav = <PrimaryNav activeView={activeView} spaces={navigationSpaces} activeSpaceId={activeSpaceId} canReview={canReview} />;
  const mobileNav = <MobileNav activeView={activeView} canReview={canReview} />;

  let content;
  if (activeView === 'spaces') {
    content = (
      <SpacesPanel
        memberships={memberships}
        spaceMap={spaceMap}
        availableSpaces={availableSpaces}
        incomingSpaceInvitations={incomingSpaceInvitations}
        outgoingSpaceInvitations={outgoingSpaceInvitations}
        invitablePeople={invitablePeople}
        peopleMap={peopleMap}
        createSpace={createSpace}
        joinSpace={joinSpace}
        inviteToSpace={inviteToSpace}
        decideSpaceInvitation={decideSpaceInvitation}
        revokeSpaceInvitation={revokeSpaceInvitation}
        setSpaceJoinPolicy={setSpaceJoinPolicy}
      />
    );
  } else if (activeView === 'people') {
    content = (
      <PeoplePanel
        acceptedConnections={acceptedConnections}
        incomingConnectionRequests={incomingConnectionRequests}
        outgoingConnectionRequests={outgoingConnectionRequests}
        discoverablePeople={discoverablePeople}
        peopleMap={peopleMap}
        userId={userId}
        requestConnection={requestConnection}
        decideConnectionRequest={decideConnectionRequest}
        disconnectConnection={disconnectConnection}
        muteMember={muteMember}
        blockMember={blockMember}
      />
    );
  } else if (activeView === 'review' && canReview) {
    content = (
      <ReviewPanel
        pendingActions={pendingActions}
        openCorrections={openCorrections}
        correctionRequests={correctionRequests}
        agentActions={agentActions}
        permissionInspections={permissionInspections}
        decideAgentAction={decideAgentAction}
        requestCorrectionOrAppeal={requestCorrectionOrAppeal}
        resolveCorrectionOrAppeal={resolveCorrectionOrAppeal}
      />
    );
  } else if (activeView === 'account') {
    content = <AccountPanel profile={profile} upsertProfile={upsertProfile} />;
  } else {
    content = (
      <section className="home-view">
        <SpaceHeader space={activeSpace} membershipRole={activeMembership?.role ?? null} />

        {!profile && <section className="inline-notice"><p>Create your profile before participating publicly.</p><Link href="/app?view=account" className="secondary-button">Create profile</Link></section>}

        {activeSpace && (
          <section className="composer-card">
            <form action={createPost} className="login-form">
              <input type="hidden" name="space_id" value={activeSpace.id} />
              <label htmlFor="post-body">Post</label><textarea id="post-body" name="body" placeholder="Share an idea, question, experience, or source…" required />
              <label htmlFor="source-url">Source URL · optional</label><input id="source-url" type="url" name="source_url" />
              <label htmlFor="source-title">Source title · optional</label><input id="source-title" name="source_title" />
              <button type="submit">Publish post</button>
            </form>
          </section>
        )}

        {activeSpace && (
          <details className="composer-card">
            <summary>Request governed agent draft</summary>
            <p className="context-note">This creates a pending governance record only. No model executes from this request and no public content is published.</p>
            <form action={requestAgentAction} className="login-form"><input type="hidden" name="space_id" value={activeSpace.id} /><input type="hidden" name="agent_id" value="community_agent" /><input type="hidden" name="capability" value="draft_public_content" /><button type="submit">Request Community Agent public draft review</button></form>
            <form action={requestAgentAction} className="login-form"><input type="hidden" name="space_id" value={activeSpace.id} /><input type="hidden" name="agent_id" value="claim_agent" /><input type="hidden" name="capability" value="draft_annotation" /><button type="submit">Request Claim Agent annotation review</button></form>
          </details>
        )}

        {activeSpace && <div className="feed-label"><span>Chronological feed</span><span>No ranking model</span></div>}
        {!activeSpace && <p className="empty-state">Join or create a Space to start the persisted feed.</p>}

        {posts.map((post) => (
          <PersistedPostCard
            key={post.id}
            post={post}
            authorMap={authorMap}
            userId={userId}
            createComment={createComment}
            createClaimResponse={createClaimResponse}
            reportPost={reportPost}
            requestCorrectionOrAppeal={requestCorrectionOrAppeal}
            setReaction={setReaction}
            removeReaction={removeReaction}
            muteMember={muteMember}
            blockMember={blockMember}
          />
        ))}
      </section>
    );
  }

  const context = activeView === 'people'
    ? safetyContext
    : activeView === 'home'
      ? (
        <>
          <section className="side-card"><p className="eyebrow">Persistence boundary</p><h2>Identity comes from validated claims.</h2><p className="context-note">Forms never choose their own author or approver identity. RLS decides whether the authenticated user may write.</p></section>
          <section className="side-card"><p className="eyebrow">Agent authority</p><p className="context-note">Ordinary clients cannot directly insert governed agent actions, and autonomous public posting remains unavailable.</p></section>
          {safetyContext}
        </>
      )
      : null;

  return (
    <AppShell topbar={topbar} primaryNav={primaryNav} mobileNav={mobileNav} context={context}>
      {content}
    </AppShell>
  );
}
