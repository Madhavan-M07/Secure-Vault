import { FileText, ShieldCheck, Share2, Cloud } from 'lucide-react';

export default function StatsOverview({ stats, isLoading }) {
  const statItems = [
    {
      title: 'Total Documents',
      value: isLoading ? '...' : String(stats?.total_documents ?? 0),
      icon: FileText,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      title: 'Secure & Encrypted',
      value: '100%',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      title: 'Shared Links',
      value: isLoading ? '...' : String(stats?.shared_links_count ?? 0),
      icon: Share2,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      title: 'Storage Used',
      value: isLoading ? '...' : `${stats?.storage_used_formatted || '0 B'} / 10 GB`,
      icon: Cloud,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3 sm:space-x-4 transition-colors"
          >
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-xl font-bold tracking-tight text-zinc-950 dark:text-white truncate">
                {stat.value}
              </p>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
                {stat.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
