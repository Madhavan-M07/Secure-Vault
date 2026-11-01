import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../features/dashboard/components/DashboardLayout';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import {
  getChatSessions,
  getSessionMessages,
  deleteChatSession,
  clearAllChatSessions,
  getChatSuggestions,
  streamChatMessage,
} from '../../services/chatService';

export default function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSessionId = searchParams.get('session_id')
    ? parseInt(searchParams.get('session_id'), 10)
    : null;

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(initialSessionId);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mobile state: 'sidebar' (list of conversations) or 'chat' (active chat window)
  const [mobileTab, setMobileTab] = useState(initialSessionId ? 'chat' : 'sidebar');

  // 1. Load All Sessions & Initial Suggestions
  const loadSessions = useCallback(async () => {
    try {
      const data = await getChatSessions();
      setSessions(data || []);

      // If no active session chosen on desktop, pick the first one
      if (!activeSessionId && data && data.length > 0 && window.innerWidth >= 1024) {
        setActiveSessionId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    }
  }, [activeSessionId]);

  useEffect(() => {
    loadSessions();
    getChatSuggestions()
      .then((res) => setSuggestions(res.suggestions || []))
      .catch(() => {});
  }, [loadSessions]);

  // 2. Load Messages when Active Session Changes
  useEffect(() => {
    if (activeSessionId) {
      setSearchParams({ session_id: String(activeSessionId) });
      getSessionMessages(activeSessionId)
        .then((msgs) => setMessages(msgs || []))
        .catch((err) => {
          console.error('Failed to load messages for session:', err);
          setMessages([]);
        });
    } else {
      setMessages([]);
      setSearchParams({});
    }
  }, [activeSessionId, setSearchParams]);

  // 3. Handle Sending a Message with Real-Time Streaming
  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    // Switch mobile view to chat window
    setMobileTab('chat');

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      document_references: [],
      action_chips: [],
    };

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
        sessionId: activeSessionId,
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
          if (data.session_id && data.session_id !== activeSessionId) {
            setActiveSessionId(data.session_id);
            loadSessions();
          }
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
                    content: 'I encountered an error searching your vault. Please try again.',
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

  // 4. Handle Starting a New Chat
  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setMobileTab('chat');
  };

  // 5. Select a Session (Opens Chat on Mobile)
  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    setMobileTab('chat');
  };

  // 6. Delete a specific session
  const handleDeleteSession = async (id) => {
    try {
      await deleteChatSession(id);
      const remaining = sessions.filter((s) => s.id !== id);
      setSessions(remaining);
      if (activeSessionId === id) {
        setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  // 7. Clear All Chats
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all chat conversations?')) return;
    try {
      await clearAllChatSessions();
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
      setMobileTab('sidebar');
    } catch (err) {
      console.error('Failed to clear sessions:', err);
    }
  };

  return (
    <DashboardLayout noPadding={true} hideHeader={true} hideMobileNav={true}>
      <div className="flex flex-col lg:flex-row h-[100dvh] w-full overflow-hidden bg-[#f8fafc] dark:bg-[#070b13]">
        {/* Sub-Sidebar: Visible on Desktop (lg:block), or on Mobile when viewing session list */}
        <div className={`w-full lg:w-72 h-full shrink-0 ${mobileTab === 'sidebar' ? 'block' : 'hidden lg:block'}`}>
          <ChatSidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            onClearAll={handleClearAll}
          />
        </div>

        {/* Main Interactive Chat Window: Visible on Desktop (lg:flex), or on Mobile when viewing conversation */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            suggestions={suggestions}
            onBackToSidebar={() => setMobileTab('sidebar')}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
