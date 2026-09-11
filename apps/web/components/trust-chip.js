export function TrustChip({ children, tone = 'neutral' }) {
  return <span className={`trust-chip trust-chip--${tone}`}>{children}</span>;
}
