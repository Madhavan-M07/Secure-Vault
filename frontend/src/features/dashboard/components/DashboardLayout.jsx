import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#070b13] text-zinc-900 dark:text-zinc-100 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Permanent / Collapsible Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area (pb-20 on mobile to clear bottom navigation) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 lg:pb-0">
        <Header />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Amazon / Flipkart Style Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
