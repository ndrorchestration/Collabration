import Link from 'next/link';

const MOBILE_ITEMS = [
  ['home', 'Home'],
  ['spaces', 'Spaces'],
  ['people', 'People']
];

export function MobileNav({ activeView, canReview = false }) {
  const visibleItems = canReview ? [...MOBILE_ITEMS, ['review', 'Review']] : MOBILE_ITEMS;

  return (
    <nav className="mobile-nav" aria-label="Primary mobile">
      {visibleItems.map(([view, label]) => (
        <Link
          key={view}
          className="mobile-nav__link"
          href={`/app?view=${view}`}
          aria-current={activeView === view ? 'page' : undefined}
        >
          {label}
        </Link>
      ))}
      <Link
        className="mobile-nav__link"
        href="/app?view=account"
        aria-current={activeView === 'account' ? 'page' : undefined}
      >
        You
      </Link>
    </nav>
  );
}
