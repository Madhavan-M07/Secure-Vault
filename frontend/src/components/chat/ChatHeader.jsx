import { Bot, Maximize2, Minus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatHeader({ onMinimize, onClose, sessionId }) {
  const navigate = useNavigate();

  const handleExpand = () => {
    // Navigate to full /chat page and pass the active session ID
    if (sessionId) {
      navigate(`/chat?session_id=${sessionId}`);
    } else {
      navigate('/chat');
    }
  };

  return (
    <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl shadow-xs">
      <div className="flex items-center space-x-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold tracking-tight leading-none truncate">
            Vault Assistant
          </h3>
          <p className="text-[11px] text-blue-100/90 font-medium truncate mt-0.5">
            Ask anything about your documents
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1 shrink-0">
        {/* Minimize Button */}
        <button
          type="button"
          onClick={onMinimize}
          title="Minimize"
          className="p-1 rounded-lg hover:bg-white/15 text-blue-100 hover:text-white transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Expand to Full /chat Page Button */}
        <button
          type="button"
          onClick={handleExpand}
          title="Open in full screen"
          className="p-1 rounded-lg hover:bg-white/15 text-blue-100 hover:text-white transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          title="Close assistant"
          className="p-1 rounded-lg hover:bg-white/15 text-blue-100 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

