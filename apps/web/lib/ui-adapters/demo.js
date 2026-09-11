import { demoStore } from '../demo-store.js';

export const DEMO_VIEWER = Object.freeze({
  id: 'user-ender',
  displayName: 'Ender',
  handle: '@ender'
});

export function createDemoUiAdapter(viewer = DEMO_VIEWER) {
  return Object.freeze({
    mode: 'demo',
    viewer,

    reactionStateForPost(postId) {
      return Object.freeze({
        counts: demoStore.getReactionsForPost(postId),
        active: new Set(
          ['like', 'useful', 'interesting'].filter((reaction) =>
            demoStore.hasReaction(postId, viewer.id, reaction)
          )
        )
      });
    },

    commentsForPost(postId) {
      return Object.freeze([...(demoStore.get().comments[postId] ?? [])]);
    },

    claimResponsesForPost(postId) {
      return Object.freeze(
        demoStore.get().claimResponses.filter((response) => response.postId === postId)
      );
    },

    sources() {
      return demoStore.getSources();
    },

    actions: Object.freeze({
      toggleReaction(postId, reaction) {
        demoStore.toggleReaction(postId, viewer.id, reaction);
      },

      addComment(postId, body) {
        demoStore.addComment(postId, {
          id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          authorId: viewer.id,
          displayName: viewer.displayName,
          handle: viewer.handle,
          body
        });
      },

      addClaimResponse(postId, type, body) {
        demoStore.addClaimResponse({
          id: `cr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          postId,
          authorId: viewer.id,
          type,
          text: body,
          sourceIds: []
        });
      },

      addSource(source) {
        return demoStore.addSource(source);
      }
    })
  });
}
