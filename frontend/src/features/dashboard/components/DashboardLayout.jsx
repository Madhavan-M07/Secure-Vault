import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import ChatWidget from '../../../components/chat/ChatWidget';

export default function DashboardLayout({ children, noPadding = false, hideHeader = false, hideMobileNav = false }) {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#070b13] text-zinc-900 dark:text-zinc-100 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Permanent / Collapsible Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area (pb-20 on mobile to clear bottom navigation unless hideMobileNav is true) */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-y-auto ${hideMobileNav ? 'pb-0' : 'pb-20 lg:pb-0'}`}>
        {!hideHeader && <Header />}
        <main className={`flex-1 ${noPadding ? 'p-0 max-w-full' : 'p-3.5 sm:p-6 lg:p-8 max-w-7xl'} w-full mx-auto`}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {!hideMobileNav && <MobileBottomNav />}

      {/* Omnipresent Floating Chatbot Widget */}
      <ChatWidget />
    </div>
  );
}
