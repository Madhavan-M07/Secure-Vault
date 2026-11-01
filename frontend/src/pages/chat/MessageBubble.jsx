import { Bot, User } from 'lucide-react';
import DocumentCard from './DocumentCard';

export default function MessageBubble({ message, onActionClick }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start space-x-3 my-4 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
      {/* Avatar Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
          isUser
            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
            : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/20'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Message Content Bubble */}
      <div className={`max-w-[85%] lg:max-w-[75%] space-y-2`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-purple-50 dark:bg-purple-950/30 text-zinc-900 dark:text-zinc-100 border border-purple-200/80 dark:border-purple-900/40 rounded-tr-xs'
              : 'bg-white dark:bg-[#111928] text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-slate-800 rounded-tl-xs shadow-xs'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Interactive Document Cards */}
          {message.document_references && message.document_references.length > 0 && (
            <div className="mt-3 space-y-2.5">
              {message.document_references.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}

          {/* Follow-up Action Chips */}
          {message.action_chips && message.action_chips.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-slate-800/80">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                You can also:
              </p>
              <div className="flex flex-wrap gap-2">
                {message.action_chips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onActionClick && onActionClick(chip)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-2xs"
                  >
                    <span>{chip}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

