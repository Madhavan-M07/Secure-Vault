import { useState, useEffect, useRef } from 'react';
import { Bot, User, Sparkles } from 'lucide-react';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import DocumentCard from '../../pages/chat/DocumentCard';
import { streamChatMessage, getChatSuggestions } from '../../services/chatService';

export default function ChatPopup({ isOpen, onMinimize, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      content: 'Hello! I am your **Vault Assistant**. Ask me anything about your stored documents, or select a prompt below.',
      document_references: [],
      action_chips: [],
    },
  ]);
  const [suggestions, setSuggestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load dynamic prompt suggestions
  useEffect(() => {
    if (isOpen) {
      getChatSuggestions()
        .then((res) => setSuggestions(res.suggestions || []))
        .catch(() => {});
    }
  }, [isOpen]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    // 1. Add User message immediately
    const userMsgId = `user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      content: text,
      document_references: [],
      action_chips: [],
    };

    // 2. Add placeholder Assistant message for streaming
    const asstMsgId = `asst-${Date.now()}`;
    const placeholderAsstMsg = {
      id: asstMsgId,
      sender: 'assistant',
      content: '',
      document_references: [],
      action_chips: [],
    };

    setMessages((prev) => [...prev, userMsg, placeholderAsstMsg]);
    setIsLoading(true);

    try {
      await streamChatMessage({
        message: text,
        sessionId,
        onToken: (token) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === asstMsgId
                ? { ...msg, content: msg.content + token }
                : msg
            )
          );
        },
        onComplete: (data) => {
          if (data.session_id) setSessionId(data.session_id);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === asstMsgId
                ? {
                    ...msg,
                    document_references: data.document_references || [],
                    action_chips: data.action_chips || [],
                  }
                : msg
            )
          );
          setIsLoading(false);
        },
        onError: (err) => {
          console.error('Chat error:', err);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === asstMsgId
                ? {
                    ...msg,
                    content: 'I encountered an issue searching your vault. Please try again.',
                  }
                : msg
            )
          );
          setIsLoading(false);
        },
      });
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-6 z-50 w-full sm:w-[390px] h-[100dvh] sm:h-[540px] max-h-[100dvh] sm:max-h-[85vh] flex flex-col bg-white dark:bg-[#0b1324] rounded-none sm:rounded-2xl border-0 sm:border border-zinc-200/90 dark:border-slate-800 shadow-2xl shadow-blue-950/20 overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <ChatHeader
        onMinimize={onMinimize}
        onClose={onClose}
        sessionId={sessionId}
      />

      {/* Messages Scroll View */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 ${
              m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40'
              }`}
            >
              {m.sender === 'user' ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-zinc-100 dark:bg-[#131d31] text-zinc-900 dark:text-zinc-100 border border-zinc-200/70 dark:border-slate-800 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Interactive Document Cards */}
              {m.document_references && m.document_references.length > 0 && (
                <div className="mt-2 space-y-2">
                  {m.document_references.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                </div>
              )}

              {/* Action Chips */}
              {m.action_chips && m.action_chips.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-zinc-200/50 dark:border-slate-800/80">
                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    You can also:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.action_chips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(chip)}
                        className="text-[11px] font-medium px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Dynamic Prompt Suggestions (Shown when only welcome message exists) */}
        {messages.length === 1 && suggestions.length > 0 && (
          <div className="pt-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Suggested for you</span>
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(s)}
                  className="text-left text-xs p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/70 dark:border-slate-800 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{s}</span>
                  <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder="Ask about your documents..."
      />
    </div>
  );
}
