export function SpaceHeader({ space, membershipRole = null }) {
  return (
    <header className="space-header">
      <div>
        <p className="eyebrow">{membershipRole ? `Space · ${membershipRole}` : 'Space'}</p>
        <h1>{space?.name ?? 'Choose a Space'}</h1>
        <p>{space?.description ?? 'Authenticated writes remain constrained by RLS and server-derived identity.'}</p>
      </div>
    </header>
  );
}
