import { useState, useEffect, useMemo } from 'react';
import StatsOverview from './StatsOverview';
import CategoryGrid from './CategoryGrid';
import RecentDocumentsTable from './RecentDocumentsTable';
import QuickActions from './QuickActions';
import UploadModal from './UploadModal';
import {
  getDashboardStats,
  getCategoriesSummary,
  getRecentDocuments,
} from '../services/documentService';

export default function DashboardOverview({ user }) {
  const [stats, setStats] = useState(null);
  const [categoriesSummary, setCategoriesSummary] = useState({});
  const [recentDocs, setRecentDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const userName = user?.email ? user.email.split('@')[0] : 'Member';
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  // Dynamic greeting based on user's current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  }, []);

  const fetchLiveDashboardData = async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      const [statsData, categoriesData, recentData] = await Promise.all([
        getDashboardStats(),
        getCategoriesSummary(),
        getRecentDocuments(5),
      ]);
      setStats(statsData || null);
      setCategoriesSummary(categoriesData?.categories || {});
      setRecentDocs(recentData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const [statsData, categoriesData, recentData] = await Promise.all([
          getDashboardStats(),
          getCategoriesSummary(),
          getRecentDocuments(5),
        ]);
        if (!ignore) {
          setStats(statsData || null);
          setCategoriesSummary(categoriesData?.categories || {});
          setRecentDocs(recentData || []);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load dashboard data:', err);
          setIsLoading(false);
        }
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center">
          {greeting}, {displayName} <span className="ml-2 text-xl">👋</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
          Your documents, secure and always with you.
        </p>
      </div>

      {/* 4 Top Metric Cards */}
      <StatsOverview stats={stats} isLoading={isLoading} />

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2/3 Column: Categories + Recent Documents */}
        <div className="lg:col-span-2 space-y-8">
          <CategoryGrid categoriesSummary={categoriesSummary} />
          <RecentDocumentsTable
            documents={recentDocs}
            isLoading={isLoading}
            onRefresh={() => fetchLiveDashboardData(true)}
          />
        </div>

        {/* Right 1/3 Column: Promo Card + Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions onOpenUpload={() => setIsUploadOpen(true)} />
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={() => {
            fetchLiveDashboardData(true);
            setIsUploadOpen(false);
          }}
        />
      )}
    </div>
  );
}
