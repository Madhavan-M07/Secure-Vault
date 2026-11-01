import { useState, useRef, useEffect } from 'react';
import { Bot, ArrowLeft, Sparkles, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MessageBubble from './MessageBubble';
import ChatInput from '../../components/chat/ChatInput';

export default function ChatWindow({
  messages = [],
  isLoading,
  onSendMessage,
  suggestions = [],
  onBackToSidebar,
  user,
  promptCount = 0,
  onOpenPricing,
}) {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#070b13] overflow-hidden">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-3.5 sm:px-6 py-3.5 sm:py-4 bg-white dark:bg-[#0f172a] border-b border-zinc-200/80 dark:border-slate-800 shrink-0">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Mobile Back to Sidebar Button */}
          {onBackToSidebar && (
            <button
              type="button"
              onClick={onBackToSidebar}
              className="lg:hidden p-1.5 -ml-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-lg flex items-center space-x-1"
              title="Back to conversation list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-zinc-950 dark:text-white leading-none truncate">
              Vault Assistant
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1 truncate">
              Your AI helper for documents
            </p>
          </div>
        </div>

        {/* Back to Dashboard Button */}
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 hidden sm:inline" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3.5 sm:px-8 py-4 sm:py-6 space-y-3.5 sm:space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="max-w-xl mx-auto my-8 sm:my-12 text-center space-y-4 px-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                How can I help you today?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Search, summarize, extract IDs, and verify details across all your encrypted vault documents.
              </p>
            </div>

            {/* Suggestions Grid */}
            {suggestions.length > 0 && (
              <div className="pt-2 sm:pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSendMessage(s)}
                    className="p-3 rounded-xl bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-slate-800 hover:border-blue-500/50 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group"
                  >
                    <span className="truncate">{s}</span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1.5" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              onActionClick={(actionText) => onSendMessage(actionText)}
            />
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Footer */}
      <div className="p-3 sm:p-4 sm:px-8 bg-white dark:bg-[#0f172a] border-t border-zinc-200/80 dark:border-slate-800 shrink-0">
        {/* Tier & Quota Bar */}
        <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-slate-900 border border-zinc-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
          {user?.role === 'admin' ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1.5">
              <span>⚡</span>
              <span>Admin VIP • Unlimited AI Prompts</span>
            </span>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs">
                Free Plan: <strong className={promptCount >= 2 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-zinc-800 dark:text-zinc-200 font-bold'}>{promptCount}/2</strong> prompts used
              </span>
              <button
                type="button"
                onClick={onOpenPricing}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline text-[11px] sm:text-xs ml-2"
              >
                Upgrade to Pro
              </button>
            </div>
          )}
        </div>

        <ChatInput
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          placeholder="Ask about your documents..."
        />
      </div>
    </div>
  );
}
