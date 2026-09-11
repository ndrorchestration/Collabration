import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const migrationPath = 'supabase/migrations/20260911062000_space_invitations.sql';

test('migration adds explicit Space join policy and removes direct self-join authority', () => {
  const sql = read(migrationPath);
  assert.match(sql, /alter table public\.spaces\s+add column join_policy text not null default 'open'/i);
  assert.match(sql, /join_policy in \('open', 'invite_only'\)/i);
  assert.match(sql, /drop policy if exists "memberships self join" on public\.space_memberships/i);
  assert.match(sql, /create or replace function public\.join_open_space\(p_space_id uuid\)/i);
  assert.match(sql, /join_policy <> 'open'/i);
  assert.match(sql, /role\)\s*values\s*\(p_space_id, v_user_id, 'member'\)/is);
});

test('invitation table is RLS protected and member-only by construction', () => {
  const sql = read(migrationPath);
  assert.match(sql, /create table public\.space_invitations/i);
  assert.match(sql, /status text not null default 'pending' check \(status in \('pending', 'accepted', 'declined', 'revoked', 'blocked'\)\)/i);
  assert.match(sql, /granted_role text not null default 'member' check \(granted_role = 'member'\)/i);
  assert.match(sql, /alter table public\.space_invitations enable row level security/i);
  assert.match(sql, /space invitation participants read/i);
  assert.doesNotMatch(sql, /create policy[^;]+space_invitations[^;]+for insert/is);
  assert.doesNotMatch(sql, /create policy[^;]+space_invitations[^;]+for update/is);
});

test('admin invite and revoke RPCs derive actor identity and block forged role escalation', () => {
  const sql = read(migrationPath);
  assert.match(sql, /create or replace function public\.invite_to_space\(p_space_id uuid, p_invitee_id uuid\)/i);
  assert.match(sql, /public\.is_space_admin\(p_space_id\)/i);
  assert.match(sql, /v_inviter_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /insert into public\.space_invitations \(space_id, inviter_id, invitee_id, granted_role\)[\s\S]*'member'/i);
  assert.match(sql, /create or replace function public\.revoke_space_invitation\(p_invitation_id uuid\)/i);
  assert.match(sql, /only Space admin may revoke invitation/i);
});

test('invitee-only decision path rechecks block state and atomically creates member membership', () => {
  const sql = read(migrationPath);
  assert.match(sql, /create or replace function public\.decide_space_invitation\(p_invitation_id uuid, p_decision text\)/i);
  assert.match(sql, /p_decision in \('accepted', 'declined'\)/i);
  assert.match(sql, /v_actor_id <> v_invitee_id/i);
  assert.match(sql, /space invitation is already finalized/i);
  assert.match(sql, /from public\.blocks b[\s\S]*v_inviter_id[\s\S]*v_invitee_id/is);
  assert.match(sql, /insert into public\.space_memberships \(space_id, user_id, role\)[\s\S]*'member'/i);
  assert.match(sql, /where id = p_invitation_id and status = 'pending'/i);
});

test('acceptance rejects a stale invitation when the invitee already became a Space member', () => {
  const sql = read(migrationPath);
  assert.match(sql, /if exists \([\s\S]*from public\.space_memberships sm[\s\S]*sm\.space_id = v_space_id[\s\S]*sm\.user_id = v_invitee_id[\s\S]*\) then[\s\S]*raise exception 'user is already a Space member'/i);
});

test('blocking terminalizes pending invitations without rewriting accepted membership', () => {
  const sql = read(migrationPath);
  assert.match(sql, /create or replace function public\.block_user\(p_blocked_id uuid\)/i);
  assert.match(sql, /update public\.space_invitations[\s\S]*set status = 'blocked'/i);
  assert.match(sql, /where status = 'pending'/i);
  assert.doesNotMatch(sql, /delete from public\.space_memberships/is);
});

test('new invitation RPCs deny anon and grant authenticated only', () => {
  const sql = read(migrationPath);
  for (const signature of [
    'join_open_space(uuid)',
    'invite_to_space(uuid, uuid)',
    'decide_space_invitation(uuid, text)',
    'revoke_space_invitation(uuid)',
    'set_space_join_policy(uuid, text)'
  ]) {
    const escaped = signature.replace(/[()]/g, '\\$&');
    assert.match(sql, new RegExp(`revoke all on function public\\.${escaped} from public, anon`, 'i'));
    assert.match(sql, new RegExp(`grant execute on function public\\.${escaped} to authenticated`, 'i'));
  }
});

test('server actions call controlled invitation and join RPCs without submitting actor or role identity', () => {
  const actions = read('apps/web/app/app/actions.js');
  assert.match(actions, /export async function joinSpace\([\s\S]*rpc\('join_open_space'/);
  assert.match(actions, /export async function inviteToSpace\([\s\S]*rpc\('invite_to_space'/);
  assert.match(actions, /export async function decideSpaceInvitation\([\s\S]*rpc\('decide_space_invitation'/);
  assert.match(actions, /export async function revokeSpaceInvitation\([\s\S]*rpc\('revoke_space_invitation'/);
  assert.match(actions, /export async function setSpaceJoinPolicy\([\s\S]*rpc\('set_space_join_policy'/);
  assert.doesNotMatch(actions, /name="(?:inviter_id|actor_id|role)"/);
});
