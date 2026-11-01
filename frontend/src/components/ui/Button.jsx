export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  isLoading = false,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles =
    'w-full py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none';

  const variants = {
    primary: 'bg-zinc-950 text-white hover:bg-black active:scale-[0.99]',
    secondary: 'bg-white text-zinc-900 border border-zinc-200 hover:border-black hover:bg-zinc-50',
    ghost: 'bg-transparent text-zinc-600 hover:text-black hover:bg-zinc-100 shadow-none',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center space-x-2">
          <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
