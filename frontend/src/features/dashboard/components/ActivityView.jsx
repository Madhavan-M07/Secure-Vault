import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Download,
  Upload,
  Eye,
  Share2,
  Shield,
  Laptop,
  Smartphone,
  Edit3,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getActivityLogs, getActivityStats } from '../services/documentService';

export default function ActivityView() {
  const [activeFilter, setActiveFilter] = useState('All Activity');
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    events_today: 0,
    uploads: 0,
    shares: 0,
    security_events: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const filterPills = ['All Activity', 'Documents', 'Sharing', 'Security'];

  // Detect current client device and browser
  const currentDevice = useMemo(() => {
    const ua = navigator.userAgent;
    let browser = 'Browser';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/')) browser = 'Safari';

    let os = 'Unknown OS';
    let isMobile = false;
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Android')) {
      os = 'Android';
      isMobile = true;
    } else if (ua.includes('iPhone') || ua.includes('iPad')) {
      os = 'iOS';
      isMobile = true;
    } else if (ua.includes('Linux')) os = 'Linux';

    return {
      name: `${browser} on ${os}`,
      os,
      browser,
      isMobile,
      time: 'Just now',
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchActivities() {
      try {
        const [statsData, logsData] = await Promise.all([
          getActivityStats(),
          getActivityLogs(activeFilter === 'All Activity' ? null : activeFilter),
        ]);
        if (isMounted) {
          setStats(statsData);
          setLogs(logsData || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load activity logs:', err);
          setError(err.message || 'Failed to fetch activity records');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, [activeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [statsData, logsData] = await Promise.all([
        getActivityStats(),
        getActivityLogs(activeFilter === 'All Activity' ? null : activeFilter),
      ]);
      setStats(statsData);
      setLogs(logsData || []);
    } catch (err) {
      console.error('Failed to refresh activity logs:', err);
      setError(err.message || 'Failed to refresh activity records');
    } finally {
      setRefreshing(false);
    }
  };

  // Group logs into Today, Yesterday, and Earlier
  const { todayList, yesterdayList, earlierList } = useMemo(() => {
    const today = [];
    const yesterday = [];
    const earlier = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    logs.forEach((item) => {
      const itemDate = new Date(item.created_at);
      const timeMs = itemDate.getTime();

      const timeFormatted = itemDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const dateFormatted = itemDate.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const enrichedItem = {
        ...item,
        timeFormatted,
        dateFormatted,
      };

      if (timeMs >= startOfToday) {
        today.push(enrichedItem);
      } else if (timeMs >= startOfYesterday) {
        yesterday.push(enrichedItem);
      } else {
        earlier.push(enrichedItem);
      }
    });

    return { todayList: today, yesterdayList: yesterday, earlierList: earlier };
  }, [logs]);

  // Helper for action badges and icons
  const getActionMeta = (actionType) => {
    switch (actionType) {
      case 'Upload':
        return {
          icon: Upload,
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
          badgeClass:
            'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
        };
      case 'Share':
        return {
          icon: Share2,
          iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
          badgeClass:
            'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50',
        };
      case 'Delete':
        return {
          icon: Trash2,
          iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
          badgeClass:
            'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
        };
      case 'Security':
        return {
          icon: Shield,
          iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
          badgeClass:
            'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
        };
      case 'View':
        return {
          icon: Eye,
          iconBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
          badgeClass:
            'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/50',
        };
      case 'Update':
      default:
        return {
          icon: Edit3,
          iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
          badgeClass:
            'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
        };
    }
  };

  // Export audit log to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert('No activity logs to export.');
      return;
    }

    const headers = ['ID', 'Action', 'Category', 'Title', 'Detail', 'Timestamp'];
    const rows = logs.map((log) => [
      log.id,
      `"${log.action_type}"`,
      `"${log.category}"`,
      `"${(log.title || '').replace(/"/g, '""')}"`,
      `"${(log.detail || '').replace(/"/g, '""')}"`,
      `"${log.created_at}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vault-audit-log-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statCards = [
    {
      title: 'Events Today',
      value: stats.events_today ?? 0,
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Uploads',
      value: stats.uploads ?? 0,
      icon: Upload,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Shares',
      value: stats.shares ?? 0,
      icon: Share2,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      title: 'Security Events',
      value: stats.security_events ?? 0,
      icon: Shield,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Activity Log
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Real-time audit trail of all vault access, uploads, and security events.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-slate-850 shadow-xs transition disabled:opacity-60"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-100 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3.5 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-zinc-950 dark:text-white">{s.value}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{s.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {filterPills.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => setActiveFilter(pill)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeFilter === pill
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-slate-850'
            }`}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-600 dark:text-zinc-300" />
              <p className="text-xs font-medium">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 space-y-2">
              <Shield className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                No activity logs found
              </p>
              <p className="text-xs">Activities like document uploads and sharing will show up here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Today Section */}
              {todayList.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">Today</span>
                    <span className="text-[11px] text-zinc-400">Recent activities</span>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-slate-800">
                    {todayList.map((event) => {
                      const meta = getActionMeta(event.action_type);
                      const Icon = meta.icon;
                      return (
                        <div
                          key={event.id}
                          className="relative flex items-center justify-between text-xs group"
                        >
                          <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />

                          <div className="flex items-center space-x-3 min-w-0 pr-2">
                            <span className="text-[11px] font-mono text-zinc-400 w-16 shrink-0">
                              {event.timeFormatted}
                            </span>
                            <div
                              className={`w-8 h-8 rounded-lg ${meta.iconBg} flex items-center justify-center shrink-0`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {event.title}
                              </p>
                              <p className="text-[11px] text-zinc-400 truncate">{event.detail}</p>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${meta.badgeClass}`}
                          >
                            {event.action_type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Yesterday Section */}
              {yesterdayList.length > 0 && (
                <div className="pt-4 border-t border-zinc-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">Yesterday</span>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-slate-800">
                    {yesterdayList.map((event) => {
                      const meta = getActionMeta(event.action_type);
                      const Icon = meta.icon;
                      return (
                        <div
                          key={event.id}
                          className="relative flex items-center justify-between text-xs group"
                        >
                          <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-900" />

                          <div className="flex items-center space-x-3 min-w-0 pr-2">
                            <span className="text-[11px] font-mono text-zinc-400 w-16 shrink-0">
                              {event.timeFormatted}
                            </span>
                            <div
                              className={`w-8 h-8 rounded-lg ${meta.iconBg} flex items-center justify-center shrink-0`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {event.title}
                              </p>
                              <p className="text-[11px] text-zinc-400 truncate">{event.detail}</p>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${meta.badgeClass}`}
                          >
                            {event.action_type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Earlier Section */}
              {earlierList.length > 0 && (
                <div className="pt-4 border-t border-zinc-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">Earlier</span>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-slate-800">
                    {earlierList.map((event) => {
                      const meta = getActionMeta(event.action_type);
                      const Icon = meta.icon;
                      return (
                        <div
                          key={event.id}
                          className="relative flex items-center justify-between text-xs group"
                        >
                          <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-900" />

                          <div className="flex items-center space-x-3 min-w-0 pr-2">
                            <span className="text-[11px] font-mono text-zinc-400 w-24 shrink-0">
                              {event.dateFormatted}
                            </span>
                            <div
                              className={`w-8 h-8 rounded-lg ${meta.iconBg} flex items-center justify-center shrink-0`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {event.title}
                              </p>
                              <p className="text-[11px] text-zinc-400 truncate">{event.detail}</p>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${meta.badgeClass}`}
                          >
                            {event.action_type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Active Session & Devices */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs">
            <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <span>Active Sessions</span>
              <p className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
                Verified devices connected to your vault.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* Detected Current Session */}
            <div className="p-3 rounded-xl bg-zinc-50/80 dark:bg-slate-900 border border-zinc-200/70 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1.5">
                  {currentDevice.isMobile ? (
                    <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Laptop className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                  <span>{currentDevice.name}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-[10px] font-medium">
                  Current Session
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Connected • Secure TLS</p>
            </div>

            {/* List other security login history from real database */}
            {logs
              .filter((l) => l.action_type === 'Security' || l.category === 'Security')
              .slice(0, 3)
              .map((secLog) => (
                <div
                  key={secLog.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900/40 border border-zinc-200/70 dark:border-slate-800 space-y-1"
                >
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>{secLog.title}</span>
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {new Date(secLog.created_at).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              ))}
          </div>

          <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-zinc-200 flex items-center space-x-1 mb-1">
              <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Immutable Ledger</span>
            </span>
            All activities are signed and logged to guarantee complete document provenance.
          </div>
        </div>
      </div>
    </div>
  );
}
