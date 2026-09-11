export function SpacesPanel({ memberships = [], spaces = [], spaceMap = {}, availableSpaces = [], createSpace, joinSpace }) {
  return (
    <section className="product-view spaces-panel" aria-labelledby="spaces-heading">
      <header className="view-header">
        <p className="eyebrow">Spaces</p>
        <h1 id="spaces-heading">Your communities</h1>
        <p>Spaces organize discussion and governed collaboration. Membership roles remain separate from your social connections.</p>
      </header>

      <section className="view-section" aria-labelledby="your-spaces-heading">
        <h2 id="your-spaces-heading">Joined Spaces</h2>
        {memberships.length === 0 && <p className="empty-state">You have not joined a Space yet.</p>}
        <div className="space-list">
          {memberships.map((membership) => {
            const space = spaceMap[membership.space_id];
            if (!space) return null;
            return (
              <a className="space-list__item" href={`/app?view=home&space=${encodeURIComponent(space.id)}`} key={space.id}>
                <strong>{space.name}</strong>
                <span>{membership.role}</span>
              </a>
            );
          })}
        </div>
      </section>

      {availableSpaces.length > 0 && (
        <section className="view-section" aria-labelledby="available-spaces-heading">
          <h2 id="available-spaces-heading">Available Spaces</h2>
          <div className="space-list">
            {availableSpaces.map((space) => (
              <form action={joinSpace} className="space-list__item" key={space.id}>
                <input type="hidden" name="space_id" value={space.id} />
                <div><strong>{space.name}</strong>{space.description && <p className="context-note">{space.description}</p>}</div>
                <button type="submit" className="secondary-button">Join</button>
              </form>
            ))}
          </div>
        </section>
      )}

      <section className="view-section" aria-labelledby="create-space-heading">
        <h2 id="create-space-heading">Create a Space</h2>
        <form action={createSpace} className="login-form">
          <label htmlFor="space-name">Name</label><input id="space-name" name="name" required />
          <label htmlFor="space-slug">Slug</label><input id="space-slug" name="slug" pattern="[a-z0-9][a-z0-9-]{1,62}" required />
          <label htmlFor="space-description">Description</label><textarea id="space-description" name="description" />
          <button type="submit">Create Space</button>
        </form>
      </section>
    </section>
  );
}
