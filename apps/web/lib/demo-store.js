// Browser-local demo store for the Intellectro social shell.
// This module is demo-only infrastructure and must never represent authenticated authority.
// State is written to localStorage when available, so it may survive reloads in the same
// browser profile until cleared. It is never server-persisted and must not be interpreted
// as a live approval, provenance record, authenticated identity, or governed action.

const STORE_KEY = 'intellectro-demo-store-v1';

function raw() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem(STORE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

function write(store) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota/private-mode failures. Demo interaction remains non-authoritative.
  }
}

function blankStore() {
  return {
    comments: { ...initial.comments },
    claimResponses: [...initial.claimResponses],
    reactions: {},
    sources: [],
    approvals: []
  };
}

const initial = {
  comments: {
    'post-001': [
      {
        id: 'comment-001a',
        authorId: 'user-maya',
        displayName: 'Maya Chen',
        handle: '@mayac',
        body: 'This is the part I keep returning to. The moment of decision is where trust either becomes legible or becomes folklore.',
        createdAt: '2026-09-11T02:45:00Z'
      },
      {
        id: 'comment-001b',
        authorId: 'user-jon',
        displayName: 'Jon Bell',
        handle: '@jonb',
        body: 'Agreed. If the UI only surfaces agent authority when someone goes looking for it, most people will never see it.',
        createdAt: '2026-09-11T02:52:00Z'
      }
    ],
    'post-002': [
      {
        id: 'comment-002a',
        authorId: 'user-ender',
        displayName: 'Ender',
        handle: '@ender',
        body: 'Exactly. Provenance is a map of where a thing came from and what happened to it. It is not a verdict.',
        createdAt: '2026-09-11T01:55:00Z'
      }
    ],
    'post-004': [
      {
        id: 'comment-004a',
        authorId: 'user-ender',
        displayName: 'Ender',
        handle: '@ender',
        body: 'Good challenge. The unresolved question here is whether the summary should have been versioned against the post edits before review.',
        createdAt: '2026-09-10T23:30:00Z'
      }
    ]
  },
  claimResponses: [
    {
      id: 'cr-seeded-001',
      postId: 'post-001',
      authorId: 'user-maya',
      type: 'challenge',
      text: 'The decision moment is real, but is agent authority the right thing to surface there, or is the right thing the provenance record?',
      sourceIds: [],
      createdAt: '2026-09-11T03:00:00Z'
    },
    {
      id: 'cr-seeded-002',
      postId: 'post-002',
      authorId: 'user-jon',
      type: 'support',
      text: 'Yes. A provenance badge should tell me where a claim came from and what happened to it, not whether the claim is true.',
      sourceIds: [],
      createdAt: '2026-09-11T02:10:00Z'
    },
    {
      id: 'cr-seeded-003',
      postId: 'post-005',
      authorId: 'user-maya',
      type: 'qualify',
      text: 'This source is useful for the capability-matrix claim, but it does not by itself show that deny-by-default is enforced in every context — that needs the action-event records.',
      sourceIds: [],
      createdAt: '2026-09-10T22:05:00Z'
    }
  ],
  reactions: {},
  sources: [],
  approvals: []
};

export const demoStore = Object.freeze({
  get() {
    const store = raw();
    if (!store) return initial;
    return Object.freeze({
      comments: Object.freeze(store.comments ?? initial.comments),
      claimResponses: Object.freeze(store.claimResponses ?? initial.claimResponses),
      reactions: Object.freeze(store.reactions ?? initial.reactions),
      sources: Object.freeze(store.sources ?? initial.sources),
      approvals: Object.freeze(store.approvals ?? initial.approvals)
    });
  },

  addComment(postId, comment) {
    const store = raw() ?? blankStore();
    const list = store.comments[postId] ?? [];
    list.unshift(Object.freeze({ ...comment, createdAt: new Date().toISOString() }));
    store.comments[postId] = list;
    write(store);
  },

  addClaimResponse(response) {
    const store = raw() ?? blankStore();
    store.claimResponses.push(Object.freeze({ ...response, createdAt: new Date().toISOString() }));
    write(store);
  },

  addReaction(postId, userId, reaction) {
    const store = raw() ?? blankStore();
    const key = `${postId}:${userId}:${reaction}`;
    store.reactions[key] = true;
    write(store);
  },

  toggleReaction(postId, userId, reaction) {
    const store = raw() ?? blankStore();
    const key = `${postId}:${userId}:${reaction}`;
    if (store.reactions[key]) delete store.reactions[key];
    else store.reactions[key] = true;
    write(store);
  },

  getReactionsForPost(postId) {
    const store = raw() ?? initial;
    const out = { like: 0, useful: 0, interesting: 0 };
    for (const key of Object.keys(store.reactions)) {
      const [storedPostId, , reaction] = key.split(':');
      if (storedPostId === postId && reaction in out) out[reaction] += 1;
    }
    return Object.freeze(out);
  },

  hasReaction(postId, userId, reaction) {
    const store = raw() ?? initial;
    return Boolean(store.reactions[`${postId}:${userId}:${reaction}`]);
  },

  addSource(source) {
    const store = raw() ?? blankStore();
    const id = `src-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    store.sources.push(Object.freeze({ id, ...source, createdAt: new Date().toISOString() }));
    write(store);
    return id;
  },

  getSources() {
    const store = raw() ?? initial;
    return Object.freeze([...store.sources]);
  },

  recordApproval(actionId, approverId, decision, note = '') {
    const store = raw() ?? blankStore();
    store.approvals.push(Object.freeze({
      actionId,
      approverId,
      decision,
      note,
      createdAt: new Date().toISOString()
    }));
    write(store);
  },

  getApprovalsForAction(actionId) {
    const store = raw() ?? initial;
    return Object.freeze(store.approvals.filter((approval) => approval.actionId === actionId));
  }
});

export function useDemoStore() {
  return { store: demoStore.get() };
}
