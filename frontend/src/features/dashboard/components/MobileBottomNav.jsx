import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Share2,
  Clock,
  Settings,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export default function MobileBottomNav() {
  const { user } = useAuth();

  const tabs = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: FolderOpen },
    { name: 'Shared', path: '/shared', icon: Share2 },
    { name: 'Activity', path: '/activity', icon: Clock },
    ...(user?.role === 'admin'
      ? [{ name: 'Admin', path: '/admin', icon: BarChart3 }]
      : [{ name: 'Settings', path: '/settings', icon: Settings }]),
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-slate-800/80 px-2 py-1 shadow-lg transition-colors"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition duration-150 min-w-[56px] select-none ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className="w-5 h-5 transition-transform duration-150" />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight mt-1">
                    {tab.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
