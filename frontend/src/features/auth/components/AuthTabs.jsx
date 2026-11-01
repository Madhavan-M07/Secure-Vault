export default function AuthTabs({ activeTab, onTabChange }) {
  return (
    <div className="mb-6">
      <div className="text-center mb-6">
        <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
          Professional Credential Vault
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 mt-1">
          {activeTab === 'login' ? 'Welcome back' : 'Secure your future'}
        </h2>
        <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto">
          {activeTab === 'login'
            ? 'Enter your credentials to access your verified documents.'
            : 'Store your Document safely for a lifetime.'}
        </p>
      </div>

      <div className="flex justify-center space-x-10 border-b border-zinc-200">
        <button
          type="button"
          onClick={() => onTabChange('login')}
          className={`pb-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-150 ${activeTab === 'login'
            ? 'text-black border-b-2 border-black'
            : 'text-zinc-400 hover:text-zinc-600'
            }`}
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={() => onTabChange('register')}
          className={`pb-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-150 ${activeTab === 'register'
            ? 'text-black border-b-2 border-black'
            : 'text-zinc-400 hover:text-zinc-600'
            }`}
        >
          Register
        </button>
      </div>
    </div>
  );
}
