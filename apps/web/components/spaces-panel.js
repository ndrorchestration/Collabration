function personLabel(person, fallbackId) {
  return person?.display_name ?? person?.handle ?? fallbackId.slice(0, 8);
}

export function SpacesPanel({
  memberships = [],
  spaceMap = {},
  availableSpaces = [],
  incomingSpaceInvitations = [],
  outgoingSpaceInvitations = [],
  invitablePeople = [],
  peopleMap = {},
  createSpace,
  joinSpace,
  inviteToSpace,
  decideSpaceInvitation,
  revokeSpaceInvitation,
  setSpaceJoinPolicy
}) {
  const adminMemberships = memberships.filter((membership) => membership.role === 'admin');

  return (
    <section className="product-view spaces-panel" aria-labelledby="spaces-heading">
      <header className="view-header">
        <p className="eyebrow">Spaces</p>
        <h1 id="spaces-heading">Your communities</h1>
        <p>Spaces organize discussion and governed collaboration. Membership, social connections, and agent authority remain separate.</p>
      </header>

      {incomingSpaceInvitations.length > 0 && (
        <section className="view-section" aria-labelledby="incoming-space-invitations-heading">
          <h2 id="incoming-space-invitations-heading">Incoming invitations</h2>
          <div className="space-list">
            {incomingSpaceInvitations.map((invitation) => {
              const space = spaceMap[invitation.space_id];
              const inviter = peopleMap[invitation.inviter_id];
              return (
                <div className="space-list__item" key={invitation.id}>
                  <div>
                    <strong>{space?.name ?? 'Space invitation'}</strong>
                    <p className="context-note">Invited by {personLabel(inviter, invitation.inviter_id)} · member access only</p>
                  </div>
                  <div className="row-actions">
                    <form action={decideSpaceInvitation}>
                      <input type="hidden" name="invitation_id" value={invitation.id} />
                      <input type="hidden" name="decision" value="accepted" />
                      <button type="submit" className="primary-button">Accept</button>
                    </form>
                    <form action={decideSpaceInvitation}>
                      <input type="hidden" name="invitation_id" value={invitation.id} />
                      <input type="hidden" name="decision" value="declined" />
                      <button type="submit" className="secondary-button">Decline</button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="view-section" aria-labelledby="your-spaces-heading">
        <h2 id="your-spaces-heading">Joined Spaces</h2>
        {memberships.length === 0 && <p className="empty-state">You have not joined a Space yet.</p>}
        <div className="space-list">
          {memberships.map((membership) => {
            const space = spaceMap[membership.space_id];
            if (!space) return null;
            return (
              <a className="space-list__item" href={`/app?view=home&space=${encodeURIComponent(space.id)}`} key={space.id}>
                <div>
                  <strong>{space.name}</strong>
                  <p className="context-note">{space.join_policy === 'invite_only' ? 'Invite only' : 'Open join'}</p>
                </div>
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
              <div className="space-list__item" key={space.id}>
                <div><strong>{space.name}</strong>{space.description && <p className="context-note">{space.description}</p>}</div>
                {space.join_policy === 'open' ? (
                  <form action={joinSpace}>
                    <input type="hidden" name="space_id" value={space.id} />
                    <button type="submit" className="secondary-button">Join</button>
                  </form>
                ) : <span className="context-note">Invite only</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {adminMemberships.length > 0 && (
        <section className="view-section" aria-labelledby="space-admin-heading">
          <h2 id="space-admin-heading">Space access controls</h2>
          <p className="context-note">Invitations grant member access only. They do not grant moderator, admin, agent, or governance authority.</p>
          {adminMemberships.map((membership) => {
            const space = spaceMap[membership.space_id];
            if (!space) return null;
            return (
              <div className="review-row" key={space.id}>
                <div>
                  <strong>{space.name}</strong>
                  <p className="context-note">Current join policy: {space.join_policy === 'invite_only' ? 'Invite only' : 'Open'}</p>
                </div>
                <div className="review-row__decision">
                  <form action={setSpaceJoinPolicy} className="login-form">
                    <input type="hidden" name="space_id" value={space.id} />
                    <label htmlFor={`join-policy-${space.id}`}>Join policy</label>
                    <select id={`join-policy-${space.id}`} name="join_policy" defaultValue={space.join_policy ?? 'open'}>
                      <option value="open">Open</option>
                      <option value="invite_only">Invite only</option>
                    </select>
                    <button type="submit" className="secondary-button">Update access</button>
                  </form>
                  {space.join_policy === 'invite_only' && invitablePeople.length > 0 && (
                    <form action={inviteToSpace} className="login-form">
                      <input type="hidden" name="space_id" value={space.id} />
                      <label htmlFor={`invitee-${space.id}`}>Invite person</label>
                      <select id={`invitee-${space.id}`} name="invitee_id" required defaultValue="">
                        <option value="" disabled>Select a person</option>
                        {invitablePeople.map((person) => <option value={person.id} key={person.id}>{personLabel(person, person.id)}</option>)}
                      </select>
                      <button type="submit" className="secondary-button">Send invitation</button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {outgoingSpaceInvitations.length > 0 && (
        <section className="view-section" aria-labelledby="sent-space-invitations-heading">
          <h2 id="sent-space-invitations-heading">Sent invitations</h2>
          <div className="space-list">
            {outgoingSpaceInvitations.map((invitation) => {
              const space = spaceMap[invitation.space_id];
              const invitee = peopleMap[invitation.invitee_id];
              return (
                <div className="space-list__item" key={invitation.id}>
                  <div>
                    <strong>{space?.name ?? 'Space'}</strong>
                    <p className="context-note">Pending for {personLabel(invitee, invitation.invitee_id)}</p>
                  </div>
                  <form action={revokeSpaceInvitation}>
                    <input type="hidden" name="invitation_id" value={invitation.id} />
                    <button type="submit" className="secondary-button">Revoke</button>
                  </form>
                </div>
              );
            })}
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
