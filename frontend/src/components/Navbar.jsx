import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm">
            V
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-zinc-950">
              Vault
            </span>
            <span className="text-zinc-400 text-xs ml-1.5 font-mono">
              v1.0
            </span>
          </div>
        </div>

        {/* User Session Info & Logout */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-zinc-900">{user?.email}</p>
            <p className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
              Role: <span className="text-zinc-700 font-semibold">{user?.role}</span>
            </p>
          </div>

          <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

          <button
            onClick={logout}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-black hover:border-black transition duration-150"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
