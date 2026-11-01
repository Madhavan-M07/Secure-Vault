import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Share2,
  Clock,
  ShieldCheck,
  Settings,
  Cloud,
  LogOut,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
  Bot,
  Zap,
} from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useLayout } from '../../../context/LayoutContext';
import { getDashboardStats } from '../services/documentService';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load storage in sidebar:', err));
  }, [location.pathname]);

  const handleLogout = () => {
    if (closeMobileSidebar) closeMobileSidebar();
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: FolderOpen },
    { name: 'Shared', path: '/shared', icon: Share2 },
    { name: 'Activity', path: '/activity', icon: Clock },
    { name: 'Security', path: '/security', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Chat', path: '/chat', icon: Bot },
    { name: 'Pricing', path: '/pricing', icon: Zap },
    ...(user?.role === 'admin'
      ? [{ name: 'Admin Console', path: '/admin', icon: BarChart3 }]
      : []),
  ];

  const storageUsed = stats?.storage_used_formatted || '0 B';
  const percentage = Math.max(stats?.storage_percentage || 0, 1);

  const renderContent = (isMobile = false) => {
    const collapsed = isMobile ? false : isCollapsed;
    const widthClass = isMobile ? 'w-72' : collapsed ? 'w-20' : 'w-64';

    return (
      <aside
        className={`bg-[#0c121e] dark:bg-[#070b14] text-zinc-300 flex flex-col justify-between p-4 h-full border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 select-none ${widthClass}`}
      >
        <div>
          {/* Brand Header */}
          <div
            className={`flex items-center mb-6 py-2 transition-all duration-300 ${
              collapsed ? 'justify-center px-0' : 'justify-between px-2'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                title="Lifetime Document Vault"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 cursor-pointer"
                onClick={() => {
                  if (isMobile) closeMobileSidebar();
                  navigate('/dashboard');
                }}
              >
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>

              {!collapsed && (
                <div className="overflow-hidden whitespace-nowrap">
                  <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
                    Document Vault
                  </h1>
                  <p className="text-[10px] font-mono text-cyan-400/80">LIFETIME SECURE</p>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle Button */}
            {!collapsed && !isMobile && (
              <button
                type="button"
                onClick={toggleSidebar}
                title="Collapse sidebar"
                className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Close Button */}
            {isMobile && (
              <button
                type="button"
                onClick={closeMobileSidebar}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Desktop Re-expand button when collapsed */}
          {collapsed && !isMobile && (
            <div className="hidden lg:flex justify-center mb-4">
              <button
                type="button"
                onClick={toggleSidebar}
                title="Expand sidebar"
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => {
                    if (isMobile) closeMobileSidebar();
                  }}
                  title={collapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl text-xs font-medium transition duration-150 ${
                      collapsed
                        ? 'justify-center p-3'
                        : 'space-x-3 px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-blue-600/90 text-white font-semibold shadow-md shadow-blue-600/20'
                        : 'text-zinc-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Storage Meter & Sign Out */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          {collapsed ? (
            /* Compact Storage Meter */
            <div
              title={`Storage: ${storageUsed} of 10 GB (${percentage}%)`}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/70 flex flex-col items-center justify-center cursor-pointer group"
            >
              <Cloud className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="text-[10px] font-mono text-zinc-400">{percentage}%</span>
            </div>
          ) : (
            /* Full Storage Meter */
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center space-x-1.5 text-xs font-medium text-white">
                  <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Storage</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400">{percentage}%</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-2">{storageUsed} of 10 GB used</p>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center rounded-lg text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition ${
              collapsed ? 'justify-center p-2.5' : 'justify-center space-x-2 py-2 px-3'
            }`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block min-h-screen shrink-0">{renderContent(false)}</div>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full flex">
          {renderContent(true)}
        </div>
      </div>
    </>
  );
}
