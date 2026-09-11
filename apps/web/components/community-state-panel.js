export function CommunityStatePanel({ metrics = {} }) {
  const entries = [
    ['challenges', 'challenges across the feed'],
    ['qualifications', 'qualifications across the feed'],
    ['unresolvedQuestions', 'unresolved questions across the feed'],
    ['awaitingApproval', 'agent outputs awaiting human approval'],
    ['sourceLinkedPosts', 'source-linked posts'],
    ['humanPosts', 'human-authored posts'],
    ['claimResponses', 'community claim responses']
  ];

  return (
    <section className="side-card community-state-panel">
      <p className="eyebrow">Governance pulse</p>
      <h2>Context, not hidden authority</h2>
      {entries.map(([key, label]) => {
        const value = metrics[key] ?? 0;
        if (key === 'claimResponses' && value === 0) return null;
        return <div className="metric" key={key}><strong>{value}</strong><span>{label}</span></div>;
      })}
    </section>
  );
}
