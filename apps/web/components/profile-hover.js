'use client';

export function ProfileHover({ author, bio }) {
  if (!author) return null;
  return (
    <div className="profile-hover">
      <div className="profile-hover__avatar" aria-hidden="true">
        {author.displayName.slice(0, 1)}
      </div>
      <div>
        <div className="profile-hover__name">{author.displayName}</div>
        <div className="profile-hover__handle">{author.handle}</div>
        {author.role && <div className="profile-hover__role">{author.role}</div>}
        {bio && <div className="profile-hover__bio">{bio}</div>}
      </div>
    </div>
  );
}
