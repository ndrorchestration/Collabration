/**
 * Shared presentation contract for Intellectro social UI.
 *
 * The contract intentionally separates display state from authority. A UI adapter may
 * expose demo callbacks or configured server-backed actions, but reusable components
 * must not derive authenticated actor/owner/approver identity themselves.
 *
 * @typedef {'demo'|'configured'} UiMode
 *
 * @typedef {Object} UiViewer
 * @property {string} id
 * @property {string} displayName
 * @property {string} handle
 *
 * @typedef {Object} ReactionState
 * @property {Record<'like'|'useful'|'interesting', number>} counts
 * @property {Set<string>} active
 *
 * @typedef {Object} SocialUiActions
 * @property {(postId: string, reaction: string) => void|Promise<void>} toggleReaction
 * @property {(postId: string, body: string) => void|Promise<void>} addComment
 * @property {(postId: string, type: string, body: string) => void|Promise<void>} addClaimResponse
 * @property {(source: object) => string|Promise<string>} addSource
 *
 * @typedef {Object} SocialUiAdapter
 * @property {UiMode} mode
 * @property {UiViewer|null} viewer
 * @property {(postId: string) => ReactionState} reactionStateForPost
 * @property {(postId: string) => Array<object>} commentsForPost
 * @property {(postId: string) => Array<object>} claimResponsesForPost
 * @property {() => Array<object>} sources
 * @property {SocialUiActions} actions
 */

export const UI_ADAPTER_CONTRACT_VERSION = '1.0-alpha';
