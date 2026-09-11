'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

const RESPONSE_TYPES = new Set(['support', 'challenge', 'qualify', 'add_evidence', 'ask_question']);
const SUPPORTED_REACTIONS = new Set(['like', 'useful', 'interesting']);
const SUPPORTED_REPORT_REASONS = new Set(['spam', 'harassment', 'misleading', 'other']);
const CONNECTION_DECISIONS = new Set(['accepted', 'declined', 'cancelled']);
const REQUESTABLE_AGENT_CAPABILITIES = new Map([
  ['community_agent', new Set(['draft_public_content', 'publish_public_content'])],
  ['claim_agent', new Set(['draft_annotation', 'publish_annotation'])]
]);

function requiredText(formData, key, maxLength) {
  const value = String(formData.get(key) ?? '').trim();
  if (!value) throw new Error(`${key} is required`);
  if (value.length > maxLength) throw new Error(`${key} is too long`);
  return value;
}

function optionalText(formData, key, maxLength) {
  const value = String(formData.get(key) ?? '').trim();
  if (value.length > maxLength) throw new Error(`${key} is too long`);
  return value;
}

function requiredId(formData, key) {
  return requiredText(formData, key, 80);
}

function optionalJsonArray(formData, key, maxLength = 10000) {
  const raw = optionalText(formData, key, maxLength);
  if (!raw) return [];
  const value = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error(`${key} must be a JSON array`);
  return value;
}

function validateSourceUrl(value) {
  if (!value) return '';
  const parsed = new URL(value);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('source_url must use http or https');
  return parsed.toString();
}

async function authenticatedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || typeof claims?.sub !== 'string' || !claims.sub) redirect('/login?next=/app');
  return { supabase, claims };
}

function refreshApp() {
  revalidatePath('/app');
}

export async function upsertProfile(formData) {
  const { supabase, claims } = await authenticatedClient();
  const handle = requiredText(formData, 'handle', 40).toLowerCase();
  const displayName = requiredText(formData, 'display_name', 80);
  const bio = optionalText(formData, 'bio', 500);
  if (!/^[a-z0-9][a-z0-9_.-]{1,39}$/.test(handle)) throw new Error('handle contains unsupported characters');

  const { error } = await supabase.from('profiles').upsert({
    id: claims.sub,
    handle,
    display_name: displayName,
    bio,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
  refreshApp();
}

export async function createSpace(formData) {
  const { supabase, claims } = await authenticatedClient();
  if (!claims.sub) throw new Error('Authentication required');
  const slug = requiredText(formData, 'slug', 63).toLowerCase();
  const name = requiredText(formData, 'name', 100);
  const description = optionalText(formData, 'description', 1000);
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(slug)) throw new Error('slug must be lowercase letters, numbers, or hyphens');

  const { data, error } = await supabase.rpc('create_space_with_owner', {
    p_slug: slug,
    p_name: name,
    p_description: description
  });
  if (error) throw error;
  refreshApp();
  redirect(`/app?space=${encodeURIComponent(data)}`);
}

export async function joinSpace(formData) {
  const { supabase, claims } = await authenticatedClient();
  const spaceId = requiredId(formData, 'space_id');
  const { error } = await supabase.from('space_memberships').upsert(
    { space_id: spaceId, user_id: claims.sub, role: 'member' },
    { onConflict: 'space_id,user_id', ignoreDuplicates: true }
  );
  if (error) throw error;
  refreshApp();
}

export async function createPost(formData) {
  const { supabase, claims } = await authenticatedClient();
  const spaceId = requiredId(formData, 'space_id');
  const body = requiredText(formData, 'body', 20000);
  const sourceUrl = validateSourceUrl(optionalText(formData, 'source_url', 2000));
  const sourceTitle = optionalText(formData, 'source_title', 500);

  if (sourceUrl) {
    const { error } = await supabase.rpc('create_source_linked_post', {
      p_space_id: spaceId,
      p_body: body,
      p_source_url: sourceUrl,
      p_source_title: sourceTitle || null
    });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('posts').insert({
      space_id: spaceId,
      author_id: claims.sub,
      body,
      kind: 'human',
      ai_assisted: false
    });
    if (error) throw error;
  }

  refreshApp();
}

export async function createComment(formData) {
  const { supabase, claims } = await authenticatedClient();
  const postId = requiredId(formData, 'post_id');
  const body = requiredText(formData, 'body', 10000);
  const { error } = await supabase.from('comments').insert({ post_id: postId, author_id: claims.sub, body });
  if (error) throw error;
  refreshApp();
}

export async function createClaimResponse(formData) {
  const { supabase, claims } = await authenticatedClient();
  const postId = requiredId(formData, 'post_id');
  const responseType = requiredText(formData, 'response_type', 40);
  const body = requiredText(formData, 'body', 10000);
  if (!RESPONSE_TYPES.has(responseType)) throw new Error('Unsupported contextual response type');

  const { error } = await supabase.from('claim_responses').insert({
    post_id: postId,
    author_id: claims.sub,
    response_type: responseType,
    body
  });
  if (error) throw error;
  refreshApp();
}

export async function setReaction(formData) {
  const { supabase, claims } = await authenticatedClient();
  const postId = requiredId(formData, 'post_id');
  const reaction = requiredText(formData, 'reaction', 20);
  if (!SUPPORTED_REACTIONS.has(reaction)) throw new Error('Unsupported reaction');

  const { error } = await supabase.from('reactions').upsert(
    { post_id: postId, user_id: claims.sub, reaction },
    { onConflict: 'post_id,user_id,reaction', ignoreDuplicates: true }
  );
  if (error) throw error;
  refreshApp();
}

export async function removeReaction(formData) {
  const { supabase, claims } = await authenticatedClient();
  const postId = requiredId(formData, 'post_id');
  const reaction = requiredText(formData, 'reaction', 20);
  if (!SUPPORTED_REACTIONS.has(reaction)) throw new Error('Unsupported reaction');

  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', claims.sub)
    .eq('reaction', reaction);
  if (error) throw error;
  refreshApp();
}

export async function reportPost(formData) {
  const { supabase, claims } = await authenticatedClient();
  const postId = requiredId(formData, 'post_id');
  const reason = requiredText(formData, 'reason', 40);
  if (!SUPPORTED_REPORT_REASONS.has(reason)) throw new Error('Unsupported report reason');

  const { error } = await supabase.from('reports').insert({ reporter_id: claims.sub, post_id: postId, reason });
  if (error) throw error;
  refreshApp();
}

function assertDifferentUser(actorId, targetId) {
  if (actorId === targetId) throw new Error('Cannot target your own account');
}

export async function blockMember(formData) {
  const { supabase, claims } = await authenticatedClient();
  const targetId = requiredId(formData, 'target_user_id');
  assertDifferentUser(claims.sub, targetId);
  const { error } = await supabase.from('blocks').upsert(
    { blocker_id: claims.sub, blocked_id: targetId },
    { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true }
  );
  if (error) throw error;
  refreshApp();
}

export async function unblockMember(formData) {
  const { supabase, claims } = await authenticatedClient();
  const targetId = requiredId(formData, 'target_user_id');
  const { error } = await supabase.from('blocks').delete().eq('blocker_id', claims.sub).eq('blocked_id', targetId);
  if (error) throw error;
  refreshApp();
}

export async function muteMember(formData) {
  const { supabase, claims } = await authenticatedClient();
  const targetId = requiredId(formData, 'target_user_id');
  assertDifferentUser(claims.sub, targetId);
  const { error } = await supabase.from('mutes').upsert(
    { muter_id: claims.sub, muted_id: targetId },
    { onConflict: 'muter_id,muted_id', ignoreDuplicates: true }
  );
  if (error) throw error;
  refreshApp();
}

export async function unmuteMember(formData) {
  const { supabase, claims } = await authenticatedClient();
  const targetId = requiredId(formData, 'target_user_id');
  const { error } = await supabase.from('mutes').delete().eq('muter_id', claims.sub).eq('muted_id', targetId);
  if (error) throw error;
  refreshApp();
}

export async function requestConnection(formData) {
  const { supabase, claims } = await authenticatedClient();
  const targetId = requiredId(formData, 'target_user_id');
  assertDifferentUser(claims.sub, targetId);
  const { error } = await supabase.rpc('request_connection', { p_recipient_id: targetId });
  if (error) throw error;
  refreshApp();
}

export async function decideConnectionRequest(formData) {
  const { supabase } = await authenticatedClient();
  const requestId = requiredId(formData, 'request_id');
  const decision = requiredText(formData, 'decision', 20);
  if (!CONNECTION_DECISIONS.has(decision)) throw new Error('Unsupported connection decision');

  const { error } = await supabase.rpc('decide_connection_request', {
    p_request_id: requestId,
    p_decision: decision
  });
  if (error) throw error;
  refreshApp();
}

export async function requestAgentAction(formData) {
  const { supabase } = await authenticatedClient();
  const spaceId = requiredId(formData, 'space_id');
  const agentId = requiredText(formData, 'agent_id', 80);
  const capability = requiredText(formData, 'capability', 120);
  const allowed = REQUESTABLE_AGENT_CAPABILITIES.get(agentId);
  if (!allowed?.has(capability)) throw new Error('Unsupported governed agent request');

  const { error } = await supabase.rpc('request_governed_agent_action', {
    p_space_id: spaceId,
    p_agent_id: agentId,
    p_capability: capability,
    p_input_refs: []
  });
  if (error) throw error;
  refreshApp();
}

export async function decideAgentAction(formData) {
  const { supabase } = await authenticatedClient();
  const actionId = requiredId(formData, 'action_id');
  const decision = requiredText(formData, 'decision', 20);
  const note = optionalText(formData, 'note', 1000);
  if (!['approved', 'rejected'].includes(decision)) throw new Error('Invalid approval decision');

  const { error } = await supabase.rpc('decide_governed_agent_action', {
    p_action_id: actionId,
    p_decision: decision,
    p_note: note
  });
  if (error) throw error;
  refreshApp();
}

export async function recordApprovedActionProvenance(formData) {
  const { supabase } = await authenticatedClient();
  const actionId = requiredId(formData, 'action_id');
  const postId = optionalText(formData, 'post_id', 80) || null;
  const sourceRefs = optionalJsonArray(formData, 'source_refs');
  const transformations = optionalJsonArray(formData, 'transformations');

  const { error } = await supabase.rpc('record_approved_action_provenance', {
    p_action_id: actionId,
    p_post_id: postId,
    p_source_refs: sourceRefs,
    p_transformations: transformations
  });
  if (error) throw error;
  refreshApp();
}

export async function requestCorrectionOrAppeal(formData) {
  const { supabase } = await authenticatedClient();
  const postId = optionalText(formData, 'post_id', 80) || null;
  const actionId = optionalText(formData, 'action_id', 80) || null;
  const requestKind = requiredText(formData, 'request_kind', 20);
  const requestText = requiredText(formData, 'request_text', 10000);
  if (!['correction', 'appeal'].includes(requestKind)) throw new Error('Unsupported correction request kind');
  if ((postId ? 1 : 0) + (actionId ? 1 : 0) !== 1) throw new Error('Exactly one correction target is required');

  const { error } = await supabase.rpc('request_correction_or_appeal', {
    p_post_id: postId,
    p_action_id: actionId,
    p_request_kind: requestKind,
    p_request_text: requestText
  });
  if (error) throw error;
  refreshApp();
}

export async function resolveCorrectionOrAppeal(formData) {
  const { supabase } = await authenticatedClient();
  const requestId = requiredId(formData, 'request_id');
  const status = requiredText(formData, 'status', 20);
  const resolutionNote = optionalText(formData, 'resolution_note', 10000);
  if (!['accepted', 'rejected', 'resolved'].includes(status)) throw new Error('Unsupported correction resolution status');

  const { error } = await supabase.rpc('resolve_correction_or_appeal', {
    p_request_id: requestId,
    p_status: status,
    p_resolution_note: resolutionNote
  });
  if (error) throw error;
  refreshApp();
}
