import { useState, useRef } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';

export default function ChatInput({ onSendMessage, isLoading, placeholder = "Ask a question..." }) {
  const [text, setText] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Pre-fill input with prompt to analyze the selected document
      setText(`Please review and summarize my document "${file.name}"`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-white dark:bg-[#0f172a] border-t border-zinc-200/80 dark:border-slate-800 rounded-b-2xl flex items-center space-x-2"
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
      />

      {/* Attachment Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        title="Attach document"
        className="p-2 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
      >
        <Paperclip className="w-4 h-4" />
      </button>

      {/* Text Input */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 bg-zinc-50 dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200/80 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-zinc-400"
      />

      {/* Send Button */}
      <button
        type="submit"
        disabled={!text.trim() || isLoading}
        className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center justify-center transition-all shrink-0 shadow-xs shadow-blue-500/20"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </form>
  );
}

