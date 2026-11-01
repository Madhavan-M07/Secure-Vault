import { useState, useRef, useEffect } from 'react';
import { Bot, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MessageBubble from './MessageBubble';
import ChatInput from '../../components/chat/ChatInput';

export default function ChatWindow({
  messages = [],
  isLoading,
  onSendMessage,
  suggestions = [],
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
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#0f172a] border-b border-zinc-200/80 dark:border-slate-800 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-zinc-950 dark:text-white leading-none">
              Vault Assistant
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              Your AI helper for documents
            </p>
          </div>
        </div>

        {/* Back to Dashboard Button */}
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="max-w-xl mx-auto my-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                How can I help you today?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Search, summarize, extract IDs, and verify details across all your encrypted vault documents.
              </p>
            </div>

            {/* Suggestions Grid */}
            {suggestions.length > 0 && (
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
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
      <div className="p-4 sm:px-8 bg-white dark:bg-[#0f172a] border-t border-zinc-200/80 dark:border-slate-800 shrink-0">
        <ChatInput
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          placeholder="Ask about your documents..."
        />
      </div>
    </div>
  );
}

