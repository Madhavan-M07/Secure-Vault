import { useState, useEffect } from 'react';
import { X, Search, Terminal, Loader2, FileUp, Share2, Shield, UserPlus, RefreshCw } from 'lucide-react';
import { getAdminRecentActivity } from '../services/adminService';

export default function AdminLogsModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await getAdminRecentActivity();
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to load system logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    (async () => {
      try {
        const data = await getAdminRecentActivity();
        if (active) {
          setLogs(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          console.error('Failed to load system logs:', err);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIconMeta = (actionType) => {
    switch (actionType) {
      case 'Upload':
        return { icon: FileUp, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' };
      case 'Share':
        return { icon: Share2, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' };
      case 'Security':
        return { icon: Shield, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' };
      default:
        return { icon: UserPlus, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' };
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.user_email.toLowerCase().includes(search.toLowerCase()) ||
      (l.detail && l.detail.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'All' ||
      (categoryFilter === 'Uploads' && l.action_type === 'Upload') ||
      (categoryFilter === 'Shares' && l.action_type === 'Share') ||
      (categoryFilter === 'Security' && (l.action_type === 'Security' || l.category === 'Security'));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-3xl rounded-2xl border border-zinc-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                Platform Audit & System Logs
              </h2>
              <p className="text-xs text-zinc-400">
                Live cryptographic transaction ledger across all tenants
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh logs"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-slate-800 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-zinc-100 dark:border-slate-800/80 bg-zinc-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs by action, user..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
            {['All', 'Uploads', 'Shares', 'Security'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-slate-800 hover:bg-zinc-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600 dark:text-purple-400" />
              <p className="text-xs font-mono">Streaming system audit trail...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs">
              No matching activity logs recorded.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-slate-800">
              {filteredLogs.map((log) => {
                const meta = getIconMeta(log.action_type);
                const Icon = meta.icon;
                return (
                  <div
                    key={log.id}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-zinc-50/80 dark:hover:bg-slate-850/50 px-2 rounded-xl transition"
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl ${meta.color} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {log.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-medium">
                            {log.user_email}
                          </span>{' '}
                          • {log.detail || 'Verified audit event'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0 mt-0.5">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
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
