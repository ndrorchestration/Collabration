export const ALPHA_CAPABILITY_MATRIX = Object.freeze({
  version: '0.1.0-alpha',
  default: 'deny',
  principles: Object.freeze({
    accountable_owner_required: true,
    typed_capability_required: true,
    public_action_attribution_required: true,
    high_impact_action_requires_reversibility_or_approval: true,
    automated_actions_rate_limited: true,
    preserve_ai_transformation_provenance: true,
    policy_version_required_for_moderation: true,
    self_escalation: 'deny'
  }),
  agents: Object.freeze({
    community_agent: Object.freeze({
      owner_required: true,
      capabilities: Object.freeze({
        read_space_posts: 'allow',
        summarize_space: 'allow',
        detect_duplicate_question: 'allow',
        draft_faq: 'allow',
        recommend_moderator_attention: 'allow',
        flag_for_human_review: 'allow',
        request_capability_escalation: 'allow',
        draft_public_content: 'approval_required',
        publish_public_content: 'approval_required',
        delete_content: 'deny',
        ban_user: 'deny',
        change_policy: 'deny',
        create_or_invite_agent: 'deny',
        grant_capability: 'deny'
      }),
      rate_limits: Object.freeze({
        summaries: Object.freeze({ window: '1h', max_actions: 10 }),
        public_drafts: Object.freeze({ window: '1h', max_actions: 10 })
      })
    }),
    claim_agent: Object.freeze({
      owner_required: true,
      capabilities: Object.freeze({
        read_attached_sources: 'allow',
        extract_claims: 'allow',
        separate_source_from_interpretation: 'allow',
        identify_unsupported_assertions: 'allow',
        surface_counterevidence: 'allow',
        mark_uncertainty: 'allow',
        track_corrections: 'allow',
        generate_claim_map: 'allow',
        draft_annotation: 'approval_required',
        publish_annotation: 'approval_required',
        moderate_user: 'deny',
        delete_content: 'deny',
        change_policy: 'deny',
        grant_capability: 'deny'
      }),
      rate_limits: Object.freeze({
        analyses: Object.freeze({ window: '1h', max_actions: 30 })
      })
    })
  }),
  alpha_constraints: Object.freeze({
    autonomous_public_posting: 'deny',
    autonomous_banning: 'deny',
    autonomous_deletion: 'deny',
    autonomous_policy_change: 'deny'
  })
});
