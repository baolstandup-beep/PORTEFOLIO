/** Transition douce à chaque changement de page. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div style={{ animation: 'page-in 0.3s ease-out both' }}>{children}</div>;
}
