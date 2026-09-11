// Shared vocabulary for claim responses.
// Sourced from @intellectro/social-core RESPONSE_TYPES set and the
// supabase migration claim_responses.response_type check constraint.
// Kept in the web lib so both the composer and the reaction bar can
// import from one place instead of redefining inline.

export const RESPONSE_TYPES = [
  'support',
  'challenge',
  'qualify',
  'add_evidence',
  'ask_question',
];

export const RESPONSE_LABEL_MAP = {
  support: 'Support',
  challenge: 'Challenge',
  qualify: 'Qualify',
  add_evidence: 'Add evidence',
  ask_question: 'Ask a question',
};
