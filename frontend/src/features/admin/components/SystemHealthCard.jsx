import {
  CheckCircle2,
  Lock,
  Fingerprint,
  Shield,
  FileText,
  Users,
  BarChart3,
  Terminal,
  Layers,
} from 'lucide-react';

export default function SystemHealthCard({
  healthData = null,
  onOpenManageUsers,
  onOpenSystemLogs,
  onExportReport,
}) {
  const services = healthData?.services || [
    { name: 'API Services', uptime: 'Online' },
    { name: 'Storage (Cloudinary CDN)', uptime: 'Active' },
    { name: 'Database (SQLite Engine)', uptime: 'Connected' },
    { name: 'Authentication Gateway', uptime: 'Active' },
  ];

  const compliance = healthData?.compliance || [
    { label: 'AES-256 Encryption', status: 'Active', color: 'emerald' },
    { label: 'SHA-256 Verification', status: 'Active', color: 'emerald' },
    { label: '2FA Adoption', status: 'Active', color: 'indigo' },
    { label: 'Audit Logging', status: 'Active', color: 'blue' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {/* 1. System Health */}
      <div className="bg-white dark:bg-[#0f172a] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-3.5 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white">
            System Health
          </h3>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>All Systems Operational</span>
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {services.map((s) => (
            <div key={s.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-600 dark:text-zinc-400">{s.name}</span>
              </div>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {s.uptime}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Security & Compliance */}
      <div className="bg-white dark:bg-[#0f172a] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-3.5 transition-colors">
        <h3 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white">
          Security & Compliance
        </h3>

        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-400">
              <Lock className="w-3.5 h-3.5 text-blue-500" />
              <span>AES-256 Encryption</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-400">
              <Fingerprint className="w-3.5 h-3.5 text-purple-500" />
              <span>SHA-256 Verification</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>2FA Adoption</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {compliance[2]?.status || '68%'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-400">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Audit Logging</span>
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
              {compliance[3]?.status || 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions */}
      <div className="bg-white dark:bg-[#0f172a] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-3.5 transition-colors">
        <h3 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={onOpenManageUsers}
            className="p-3 rounded-xl border border-zinc-200/80 dark:border-slate-800 hover:bg-zinc-50 dark:hover:bg-slate-850 flex flex-col items-center justify-center space-y-1.5 transition text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Manage Users
            </span>
          </button>

          <button
            type="button"
            onClick={onExportReport}
            className="p-3 rounded-xl border border-zinc-200/80 dark:border-slate-800 hover:bg-zinc-50 dark:hover:bg-slate-850 flex flex-col items-center justify-center space-y-1.5 transition text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Export Report
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenSystemLogs}
            className="p-3 rounded-xl border border-zinc-200/80 dark:border-slate-800 hover:bg-zinc-50 dark:hover:bg-slate-850 flex flex-col items-center justify-center space-y-1.5 transition text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              System Logs
            </span>
          </button>

          <div
            className="p-3 rounded-xl border border-zinc-200/80 dark:border-slate-800 bg-zinc-50/50 dark:bg-slate-900/50 flex flex-col items-center justify-center space-y-1.5 text-center"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Enterprise Tier
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

