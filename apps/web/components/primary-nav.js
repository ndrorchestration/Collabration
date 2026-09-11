import Link from 'next/link';

const PRIMARY_ITEMS = [
  ['home', 'Home'],
  ['spaces', 'Spaces'],
  ['people', 'People']
];

export function PrimaryNav({ activeView, spaces = [], activeSpaceId = null, canReview = false }) {
  const visibleItems = canReview ? [...PRIMARY_ITEMS, ['review', 'Review']] : PRIMARY_ITEMS;

  return (
    <nav className="primary-nav" aria-label="Primary">
      <div className="primary-nav__items">
        {visibleItems.map(([view, label]) => (
          <Link
            key={view}
            className="primary-nav__link"
            href={`/app?view=${view}`}
            aria-current={activeView === view ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
        <Link
          className="primary-nav__link"
          href="/app?view=account"
          aria-current={activeView === 'account' ? 'page' : undefined}
        >
          Account
        </Link>
      </div>

      <div className="nav-divider" />
      <p className="nav-section-label">Your Spaces</p>
      <div className="primary-nav__spaces">
        {spaces.map((space) => (
          <Link
            key={space.id}
            className="primary-nav__space-link"
            href={`/app?view=home&space=${encodeURIComponent(space.id)}`}
            aria-current={space.id === activeSpaceId && activeView === 'home' ? 'page' : undefined}
          >
            {space.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
