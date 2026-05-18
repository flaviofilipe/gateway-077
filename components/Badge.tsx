interface BadgeProps {
  children: React.ReactNode;
  variant?: 'uf' | 'tag' | 'past';
}

export default function Badge({ children, variant = 'tag' }: BadgeProps) {
  const styles: Record<string, string> = {
    uf: 'bg-amber-500/15 text-amber-500 border border-amber-500/25 font-semibold',
    tag: 'bg-[var(--surface)] text-stone-400 border border-[var(--border)]',
    past: 'bg-stone-500/10 text-stone-500 border border-stone-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${styles[variant]}`}>
      {children}
    </span>
  );
}
