import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot } from 'lucide-react';
import ChatPopup from './ChatPopup';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Hide the floating widget if user is already on the dedicated /chat page
  if (location.pathname === '/chat') {
    return null;
  }

  return (
    <>
      {/* Floating Popup Dialog */}
      <ChatPopup
        isOpen={isOpen}
        onMinimize={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
      />

      {/* Floating Trigger Launcher Button (hidden when chat modal is open so it never clutters mobile screen) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            title="Open Vault Assistant"
            aria-label="Vault Assistant"
            className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-hidden focus:ring-4 focus:ring-blue-500/20"
          >
            {/* Subtle Ping Animation */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </span>

            <Bot className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-6" />
          </button>
        </div>
      )}
    </>
  );
}
