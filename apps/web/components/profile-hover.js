'use client';

export function ProfileHover({ author, bio }) {
  if (!author) return null;
  const displayName = author.displayName ?? author.display_name ?? 'Member';
  const handle = author.handle ?? '';
  const role = author.role ?? '';

  return (
    <div className="profile-hover">
      <div className="profile-hover__avatar" aria-hidden="true">
        {displayName.slice(0, 1)}
      </div>
      <div>
        <div className="profile-hover__name">{displayName}</div>
        {handle && <div className="profile-hover__handle">{handle}</div>}
        {role && <div className="profile-hover__role">{role}</div>}
        {bio && <div className="profile-hover__bio">{bio}</div>}
      </div>
    </div>
  );
}
