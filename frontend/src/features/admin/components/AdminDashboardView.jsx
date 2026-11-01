import { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Database,
  Share2,
  Calendar,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  getAdminOverview,
  getUserGrowth,
  getTrafficAnalytics,
  getStorageBreakdown,
  getGeoDistribution,
  getAdminRecentActivity,
  getSystemHealth,
} from '../services/adminService';
import UserGrowthChart from './UserGrowthChart';
import TrafficBarChart from './TrafficBarChart';
import StorageDoughnutChart from './StorageDoughnutChart';
import ThreeGlobeTraffic from './ThreeGlobeTraffic';
import PlatformActivityFeed from './PlatformActivityFeed';
import SystemHealthCard from './SystemHealthCard';
import AdminUsersModal from './AdminUsersModal';
import AdminLogsModal from './AdminLogsModal';

export default function AdminDashboardView() {
  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [traffic, setTraffic] = useState(null);
  const [storage, setStorage] = useState(null);
  const [geoData, setGeoData] = useState([]);
  const [activity, setActivity] = useState([]);
  const [health, setHealth] = useState(null);

  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  const handleExportReport = () => {
    const reportData = {
      report_generated_at: new Date().toISOString(),
      report_scope: dateRange,
      platform_overview: overview,
      user_growth_velocity: growth,
      network_traffic_telemetry: traffic,
      storage_capacity_breakdown: storage,
      geographic_distribution: geoData,
      system_health_and_security: health,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `platform-audit-report-${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchAdminData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setError(null);

    try {
      const [
        overviewRes,
        growthRes,
        trafficRes,
        storageRes,
        geoRes,
        activityRes,
        healthRes,
      ] = await Promise.all([
        getAdminOverview(),
        getUserGrowth().catch(() => null),
        getTrafficAnalytics().catch(() => null),
        getStorageBreakdown().catch(() => null),
        getGeoDistribution().catch(() => ({ countries: [] })),
        getAdminRecentActivity().catch(() => []),
        getSystemHealth().catch(() => null),
      ]);

      setOverview(overviewRes);
      setGrowth(growthRes);
      setTraffic(trafficRes);
      setStorage(storageRes);
      setGeoData(geoRes?.countries || []);
      setActivity(activityRes || []);
      setHealth(healthRes);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setError(err.message || 'Access Denied: Administrator clearance required.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [
          overviewRes,
          growthRes,
          trafficRes,
          storageRes,
          geoRes,
          activityRes,
          healthRes,
        ] = await Promise.all([
          getAdminOverview(),
          getUserGrowth().catch(() => null),
          getTrafficAnalytics().catch(() => null),
          getStorageBreakdown().catch(() => null),
          getGeoDistribution().catch(() => ({ countries: [] })),
          getAdminRecentActivity().catch(() => []),
          getSystemHealth().catch(() => null),
        ]);

        if (active) {
          setOverview(overviewRes);
          setGrowth(growthRes);
          setTraffic(trafficRes);
          setStorage(storageRes);
          setGeoData(geoRes?.countries || []);
          setActivity(activityRes || []);
          setHealth(healthRes);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          console.error('Failed to load admin analytics:', err);
          setError(err.message || 'Access Denied: Administrator clearance required.');
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-zinc-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-xs font-semibold tracking-wider font-mono uppercase">
          Loading Admin Intelligence Console...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-200 dark:border-red-900/50">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-zinc-950 dark:text-white">
          403 Forbidden: Administrator Clearance Required
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Your current session does not have administrative privileges to access this analytics engine.
        </p>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Users',
      value: overview?.total_users != null ? overview.total_users.toLocaleString() : '0',
      growth: overview?.users_growth || '0.0%',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Total Documents',
      value: overview?.total_documents != null ? overview.total_documents.toLocaleString() : '0',
      growth: overview?.documents_growth || '0.0%',
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
    },
    {
      title: 'Storage Used',
      value: overview?.storage_used_formatted || '0 B',
      growth: overview?.storage_growth || '0.0%',
      icon: Database,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Documents Shared',
      value: overview?.documents_shared != null ? overview.documents_shared.toLocaleString() : '0',
      growth: overview?.shares_growth || '0.0%',
      icon: Share2,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Platform overview, cross-tenant usage, and live system health.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchAdminData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-slate-850 shadow-xs transition disabled:opacity-60"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Date Range Selector */}
          <div className="relative">
            <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer pr-1"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="All Time">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Top KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  ↑ {kpi.growth}
                </span>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white truncate">
                  {kpi.value}
                </p>
                <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {kpi.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row (3 Visualizations): User Growth | Traffic Overview | Storage Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <UserGrowthChart growthData={growth} />
        <TrafficBarChart trafficData={traffic} />
        <StorageDoughnutChart storageData={storage} />
      </div>

      {/* Third Row (2 Cards): 3D Globe Geo-Traffic + Recent Platform Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ThreeGlobeTraffic geoData={geoData} />
        </div>
        <div className="lg:col-span-1">
          <PlatformActivityFeed
            activities={activity}
            onViewAll={() => setIsLogsModalOpen(true)}
          />
        </div>
      </div>

      {/* Bottom Row: System Health + Security Compliance + Quick Actions */}
      <SystemHealthCard
        healthData={health}
        onOpenManageUsers={() => setIsUsersModalOpen(true)}
        onOpenSystemLogs={() => setIsLogsModalOpen(true)}
        onExportReport={handleExportReport}
      />

      {/* Interactive Admin Directory & Audit Modals */}
      <AdminUsersModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
      />
      <AdminLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
    </div>
  );
}
