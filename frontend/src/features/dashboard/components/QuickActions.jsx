import { Upload, FolderPlus, Share2, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions({ onOpenUpload }) {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Upload Document',
      icon: Upload,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      onClick: () => {
        if (onOpenUpload) onOpenUpload();
      },
    },
    {
      title: 'My Documents & Folders',
      icon: FolderPlus,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/40',
      onClick: () => navigate('/documents'),
    },
    {
      title: 'Share Document',
      icon: Share2,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      onClick: () => navigate('/shared'),
    },
    {
      title: 'View Activity Log',
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      onClick: () => navigate('/activity'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Promo Banner Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
        <div className="relative z-10 max-w-[200px]">
          <h3 className="text-base font-bold tracking-tight text-white leading-snug">
            Store Any Important Document
          </h3>
          <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
            Upload, organize and access securely for life.
          </p>

          <button
            type="button"
            onClick={onOpenUpload}
            className="mt-5 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-100 shadow-sm transition active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* 3D Glowing Box graphic on the right */}
        <div className="absolute -right-4 -bottom-4 w-40 h-40 opacity-90 pointer-events-none">
          <img
            src="/assets/auth-banner.png"
            alt="Vault Box"
            className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(59,130,246,0.3)]"
          />
        </div>
      </div>

      {/* Quick Actions List Card */}
      <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <h3 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white mb-3">
          Quick Actions
        </h3>

        <div className="space-y-1">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.title}
                type="button"
                onClick={act.onClick}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-slate-800/60 transition group text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg ${act.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${act.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">
                    {act.title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
