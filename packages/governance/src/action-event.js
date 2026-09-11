const REQUIRED = [
  'action_id', 'actor_id', 'owner_id', 'action', 'scope',
  'policy_version', 'capabilities_used', 'approval_status', 'timestamp'
];

const APPROVAL = new Set(['not_required', 'pending', 'approved', 'rejected']);
const RATE = new Set(['allowed', 'denied', 'not_applicable']);

export function assertActionEvent(event) {
  if (!event || typeof event !== 'object') throw new TypeError('action event is required');
  for (const field of REQUIRED) {
    if (event[field] === undefined || event[field] === null || event[field] === '') {
      throw new Error(`action event missing ${field}`);
    }
  }
  if (event.event_type !== 'agent_action') throw new Error('event_type must be agent_action');
  if (!Array.isArray(event.capabilities_used) || event.capabilities_used.length === 0) {
    throw new Error('capabilities_used must contain at least one capability');
  }
  if (!APPROVAL.has(event.approval_status)) throw new Error('invalid approval_status');
  if (event.rate_limit_decision && !RATE.has(event.rate_limit_decision)) throw new Error('invalid rate_limit_decision');
  if (Number.isNaN(Date.parse(event.timestamp))) throw new Error('timestamp must be an ISO date-time');
  return true;
}

export function createActionEvent(input) {
  const event = {
    event_type: 'agent_action',
    target_id: null,
    approver_id: null,
    input_refs: [],
    output_refs: [],
    provenance_refs: [],
    rate_limit_decision: 'not_applicable',
    ...input
  };
  assertActionEvent(event);
  event.capabilities_used = Object.freeze([...event.capabilities_used]);
  event.input_refs = Object.freeze([...(event.input_refs ?? [])]);
  event.output_refs = Object.freeze([...(event.output_refs ?? [])]);
  event.provenance_refs = Object.freeze([...(event.provenance_refs ?? [])]);
  return Object.freeze(event);
}
