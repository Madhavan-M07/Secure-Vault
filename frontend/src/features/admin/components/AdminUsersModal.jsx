import { useState, useEffect } from 'react';
import { X, Search, User, Loader2, FileText, Database } from 'lucide-react';
import { getAdminUsers } from '../services/adminService';

export default function AdminUsersModal({ isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminUsers();
        if (active) setUsers(data || []);
      } catch (err) {
        if (active) setError(err.message || 'Failed to load user directory');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchUsers();

    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-3xl rounded-2xl border border-zinc-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-950 dark:text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Platform Users Directory</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Cross-tenant account management ({users.length} registered accounts)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-zinc-100 dark:border-slate-800/80 bg-zinc-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-mono">Loading user directory...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-rose-500 text-xs">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs">
              No matching accounts found.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-50/80 dark:hover:bg-slate-850/50 px-2 rounded-xl transition"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300 shrink-0">
                      #{u.id}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {u.email}
                        </span>
                        {u.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-medium">
                            Standard
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                        Joined: {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-medium text-zinc-600 dark:text-zinc-400 self-end sm:self-center">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{u.documents_count} docs</span>
                    </div>
                    <div className="flex items-center space-x-1 font-mono">
                      <Database className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{u.storage_formatted}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
