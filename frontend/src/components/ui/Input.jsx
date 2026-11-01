export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-600 mb-1.5">
          {label} {required && <span className="text-zinc-400">*</span>}
        </label>
      )}
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 text-xs rounded-lg border bg-zinc-50/70 text-zinc-900 placeholder:text-zinc-400 transition duration-150 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-zinc-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}
