export default function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    dark: 'bg-zinc-900 text-zinc-100 border-zinc-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
        variants[variant] || variants.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}
