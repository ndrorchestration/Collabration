function connectionCounterpartId(connection, userId) {
  return connection.requester_id === userId ? connection.recipient_id : connection.requester_id;
}

function personLabel(person, fallbackId) {
  return person?.display_name ?? person?.handle ?? fallbackId.slice(0, 8);
}

function SafetyActions({ targetUserId, muteMember, blockMember }) {
  return (
    <div className="row-actions person-safety-actions" aria-label="Safety actions">
      <form action={muteMember}>
        <input type="hidden" name="target_user_id" value={targetUserId} />
        <button type="submit" className="secondary-button">Mute</button>
      </form>
      <form action={blockMember}>
        <input type="hidden" name="target_user_id" value={targetUserId} />
        <button type="submit" className="danger-button">Block</button>
      </form>
    </div>
  );
}

export function PeoplePanel({
  acceptedConnections = [],
  incomingConnectionRequests = [],
  outgoingConnectionRequests = [],
  discoverablePeople = [],
  peopleMap = {},
  userId,
  requestConnection,
  decideConnectionRequest,
  disconnectConnection,
  muteMember,
  blockMember
}) {
  const empty = acceptedConnections.length === 0
    && incomingConnectionRequests.length === 0
    && outgoingConnectionRequests.length === 0
    && discoverablePeople.length === 0;

  return (
    <section className="product-view people-panel" aria-labelledby="people-heading">
      <header className="view-header">
        <p className="eyebrow">People</p>
        <h1 id="people-heading">Connections</h1>
        <p>Connections are human social relationships. They do not grant agent permissions, Space roles, or governance authority.</p>
      </header>

      {acceptedConnections.length > 0 && (
        <section className="view-section" aria-labelledby="connected-heading">
          <h2 id="connected-heading">Connected · {acceptedConnections.length}</h2>
          <div className="people-list">
            {acceptedConnections.map((connection) => {
              const counterpartId = connectionCounterpartId(connection, userId);
              const person = peopleMap[counterpartId];
              return (
                <div className="person-row" key={connection.id}>
                  <div className="person-identity"><strong>{personLabel(person, counterpartId)}</strong>{person?.handle && <span className="muted"> · @{person.handle}</span>}</div>
                  <div className="person-actions">
                    <form action={disconnectConnection}>
                      <input type="hidden" name="request_id" value={connection.id} />
                      <button type="submit" className="secondary-button">Disconnect</button>
                    </form>
                    <SafetyActions targetUserId={counterpartId} muteMember={muteMember} blockMember={blockMember} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {incomingConnectionRequests.length > 0 && (
        <section className="view-section" aria-labelledby="incoming-heading">
          <h2 id="incoming-heading">Incoming requests</h2>
          <div className="people-list">
            {incomingConnectionRequests.map((connection) => {
              const person = peopleMap[connection.requester_id];
              return (
                <div className="person-row" key={connection.id}>
                  <div className="person-identity"><strong>{personLabel(person, connection.requester_id)}</strong>{person?.handle && <span className="muted"> · @{person.handle}</span>}</div>
                  <div className="person-actions">
                    <div className="row-actions">
                      <form action={decideConnectionRequest}>
                        <input type="hidden" name="request_id" value={connection.id} />
                        <input type="hidden" name="decision" value="accepted" />
                        <button type="submit" className="primary-button">Accept</button>
                      </form>
                      <form action={decideConnectionRequest}>
                        <input type="hidden" name="request_id" value={connection.id} />
                        <input type="hidden" name="decision" value="declined" />
                        <button type="submit" className="secondary-button">Decline</button>
                      </form>
                    </div>
                    <SafetyActions targetUserId={connection.requester_id} muteMember={muteMember} blockMember={blockMember} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {outgoingConnectionRequests.length > 0 && (
        <section className="view-section" aria-labelledby="sent-heading">
          <h2 id="sent-heading">Sent requests</h2>
          <div className="people-list">
            {outgoingConnectionRequests.map((connection) => {
              const person = peopleMap[connection.recipient_id];
              return (
                <div className="person-row" key={connection.id}>
                  <div className="person-identity"><strong>{personLabel(person, connection.recipient_id)}</strong>{person?.handle && <span className="muted"> · @{person.handle}</span>}</div>
                  <div className="person-actions">
                    <form action={decideConnectionRequest}>
                      <input type="hidden" name="request_id" value={connection.id} />
                      <input type="hidden" name="decision" value="cancelled" />
                      <button type="submit" className="secondary-button">Cancel request</button>
                    </form>
                    <SafetyActions targetUserId={connection.recipient_id} muteMember={muteMember} blockMember={blockMember} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {discoverablePeople.length > 0 && (
        <section className="view-section" aria-labelledby="discover-heading">
          <h2 id="discover-heading">Discover people</h2>
          <div className="people-list">
            {discoverablePeople.map((person) => (
              <div className="person-row" key={person.id}>
                <div className="person-identity"><strong>{person.display_name || person.handle}</strong>{person.handle && <span className="muted"> · @{person.handle}</span>}</div>
                <div className="person-actions">
                  <form action={requestConnection}>
                    <input type="hidden" name="target_user_id" value={person.id} />
                    <button type="submit" className="secondary-button">Connect</button>
                  </form>
                  <SafetyActions targetUserId={person.id} muteMember={muteMember} blockMember={blockMember} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {empty && <p className="empty-state">No discoverable people or active connection requests yet.</p>}
    </section>
  );
}
