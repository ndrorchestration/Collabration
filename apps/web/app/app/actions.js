'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

const RESPONSE_TYPES = new Set(['support', 'challenge', 'qualify', 'add_evidence', 'ask_question']);

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

export async function approveAction(formData) {
  const { supabase, claims } = await authenticatedClient();
  const actionId = requiredId(formData, 'action_id');
  const decision = requiredText(formData, 'decision', 20);
  const note = optionalText(formData, 'note', 1000);
  if (!['approved', 'rejected'].includes(decision)) throw new Error('Invalid approval decision');

  const { error } = await supabase.from('approval_records').insert({
    action_id: actionId,
    approver_id: claims.sub,
    decision,
    note
  });
  if (error) throw error;
  refreshApp();
}
