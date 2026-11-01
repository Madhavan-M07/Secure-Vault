import { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Shield,
  Home,
  BarChart3,
  Sun,
  Moon,
  PanelLeft,
  Menu,
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { useLayout } from '../../../context/LayoutContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { toggleSidebar, toggleMobileSidebar } = useLayout();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'MM';
  const rawName = user?.email ? user.email.split('@')[0] : 'Member';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const pageNames = {
    '/dashboard': 'Dashboard',
    '/documents': 'Documents',
    '/shared': 'Shared',
    '/activity': 'Activity',
    '/security': 'Security',
    '/settings': 'Settings',
    '/admin': 'Admin Console',
  };
  const currentPage = pageNames[location.pathname] || 'Vault';

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate('/documents');
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-[#0c121e] border-b border-zinc-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      {/* Left Navigation Toggle, Breadcrumb & Search */}
      <div className="flex items-center space-x-3 sm:space-x-5 flex-1 max-w-2xl">
        {/* Navigation / Sidebar Toggle Icon (Desktop: Collapse, Mobile: Open Drawer) */}
        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 1024) {
              toggleMobileSidebar();
            } else {
              toggleSidebar();
            }
          }}
          title="Toggle Navigation Sidebar"
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-slate-800 transition"
        >
          <span className="hidden lg:inline">
            <PanelLeft className="w-4 h-4" />
          </span>
          <span className="lg:hidden">
            <Menu className="w-4 h-4" />
          </span>
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 shrink-0">
          <Link
            to="/dashboard"
            className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
          >
            <Home className="w-4 h-4" />
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600">›</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{currentPage}</span>
        </div>

        {/* Search Input */}
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Search documents..."
            className="w-full pl-10 pr-12 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-700 bg-zinc-50/80 dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-zinc-400 dark:focus:border-blue-500 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-blue-500 transition"
          />
          <kbd className="hidden md:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-slate-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-slate-700">
            ⌘ K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3 ml-2 sm:ml-4">
        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-slate-800 transition"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-600 animate-in spin-in-90 duration-300" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => navigate('/activity')}
          title="Notifications"
          className="relative p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-slate-800 transition"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
                {displayName}
              </p>
              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5 capitalize flex items-center space-x-1">
                <span>{user?.role || 'Verified User'}</span>
                {user?.role === 'admin' && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 font-bold text-[8px] uppercase">Admin</span>
                )}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f172a] rounded-xl shadow-xl border border-zinc-200 dark:border-slate-800 py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-zinc-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{user?.email}</p>
                <div className="flex items-center space-x-1.5 mt-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <Shield className="w-3 h-3" />
                  <span>256-Bit Encrypted Session</span>
                </div>
              </div>

              <div className="py-1">
                {user?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Admin Analytics</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                >
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Account Settings</span>
                </button>
              </div>

              <div className="border-t border-zinc-100 dark:border-slate-800 pt-1">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
