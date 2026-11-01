import { UserPlus, FileUp, Share2, Shield } from 'lucide-react';

export default function PlatformActivityFeed({ activities = [], onViewAll }) {
  const getIconMeta = (actionType) => {
    switch (actionType) {
      case 'Upload':
        return {
          icon: FileUp,
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
        };
      case 'Share':
        return {
          icon: Share2,
          bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
        };
      case 'Security':
        return {
          icon: Shield,
          bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
        };
      default:
        return {
          icon: UserPlus,
          bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
        };
    }
  };

  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Just now';
    const now = new Date();
    const past = new Date(isoString);
    const diffMin = Math.max(1, Math.floor((now - past) / 60000));
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white">
            Recent Platform Activity
          </h3>
          <p className="text-[11px] text-zinc-400 font-medium">Real-time cross-tenant audit ledger</p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
        >
          View All →
        </button>
      </div>

      {activities.length === 0 ? (
        <p className="text-xs text-zinc-400 py-6 text-center font-medium">
          No platform activities recorded yet.
        </p>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-slate-800/80">
          {activities.slice(0, 5).map((act) => {
            const meta = getIconMeta(act.action_type);
            const Icon = meta.icon;

            return (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <div className={`w-8 h-8 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {act.title}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate">
                      {act.user_email || 'User'} • {act.detail || 'Verified event'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                  {formatTimeAgo(act.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
