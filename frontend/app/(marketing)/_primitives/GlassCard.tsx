export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl ${className}`}>{children}</div>;
}
