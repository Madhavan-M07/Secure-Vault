import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Search, Trash2, Clock, Trash, ArrowLeft } from 'lucide-react';

export default function ChatSidebar({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Format relative timestamp
  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    const dateStr = isoString.endsWith('Z') || isoString.includes('+') ? isoString : `${isoString}Z`;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - date.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessions;
    return sessions.filter((s) =>
      s.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [sessions, search]);

  return (
    <div className="w-full lg:w-72 flex flex-col h-full bg-white dark:bg-[#0c1424] border-r border-zinc-200/80 dark:border-slate-800 p-4 transition-colors">
      {/* Mobile-only Top Navigation Bar back to Dashboard */}
      <div className="flex lg:hidden items-center justify-between pb-3 mb-2 border-b border-zinc-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Conversations</span>
      </div>

      {/* 1. New Chat Button */}
      <button
        type="button"
        onClick={onNewChat}
        className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 active:scale-98 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>New Chat</span>
      </button>

      {/* 2. Search Conversations */}
      <div className="relative my-3.5">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chats..."
          className="w-full bg-zinc-50 dark:bg-slate-900 text-zinc-800 dark:text-zinc-200 text-xs pl-8 pr-3 py-2 rounded-xl border border-zinc-200/80 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 placeholder:text-zinc-400"
        />
      </div>

      {/* 3. Section Title */}
      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 px-1">
        Chats
      </p>

      {/* 4. Chat Sessions List */}
      <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin pr-1">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-400 dark:text-zinc-500">
            No chats yet. Start a conversation!
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = activeSessionId === session.id;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-900/50'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'
                    }`}
                  />
                  <span className="truncate">{session.title}</span>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium group-hover:hidden">
                    {formatTime(session.updated_at)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    title="Delete chat"
                    className="hidden group-hover:flex p-1 text-zinc-400 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Clear All Chats Footer */}
      {sessions.length > 0 && (
        <div className="pt-3 border-t border-zinc-200/80 dark:border-slate-800 mt-2">
          <button
            type="button"
            onClick={onClearAll}
            className="w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Chats</span>
          </button>
        </div>
      )}
    </div>
  );
}

