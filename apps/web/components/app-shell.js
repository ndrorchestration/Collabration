import { ContextDrawer } from './context-drawer';

export function AppShell({ topbar, primaryNav, mobileNav, context = null, children }) {
  return (
    <main className="product-shell">
      <header className="product-topbar">
        {topbar}
        {context && (
          <div className="product-mobile-context">
            <ContextDrawer label="View page context">{context}</ContextDrawer>
          </div>
        )}
      </header>
      <aside className="product-sidebar">{primaryNav}</aside>
      <section className="product-main">{children}</section>
      <aside className="product-context">{context}</aside>
      {mobileNav}
    </main>
  );
}
