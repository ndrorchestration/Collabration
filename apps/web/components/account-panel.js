export function AccountPanel({ profile, upsertProfile }) {
  return (
    <section className="product-view account-panel" aria-labelledby="account-heading">
      <header className="view-header">
        <p className="eyebrow">Account</p>
        <h1 id="account-heading">Profile</h1>
        <p>Your public identity is separate from Space roles, connection state, and agent authority.</p>
      </header>
      <form action={upsertProfile} className="login-form account-form">
        <label htmlFor="handle">Handle</label>
        <input id="handle" name="handle" defaultValue={profile?.handle ?? ''} required />
        <label htmlFor="display_name">Display name</label>
        <input id="display_name" name="display_name" defaultValue={profile?.display_name ?? ''} required />
        <label htmlFor="bio">Bio</label>
        <textarea id="bio" name="bio" defaultValue={profile?.bio ?? ''} />
        <button type="submit">Save profile</button>
      </form>
    </section>
  );
}
