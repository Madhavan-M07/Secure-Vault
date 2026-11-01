import { useState } from 'react';
import { FileText, Eye, Download, Share2, Check } from 'lucide-react';

export default function DocumentCard({ doc, onPreview, onShare }) {
  const [copied, setCopied] = useState(false);

  if (!doc) return null;

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const normalized = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`;
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const handleDownload = () => {
    if (doc.file_url) {
      const link = document.createElement('a');
      link.href = doc.file_url;
      link.target = '_blank';
      link.download = doc.title || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare(doc);
    } else if (doc.file_url) {
      navigator.clipboard.writeText(doc.file_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-2 p-3 sm:p-4 rounded-xl bg-white dark:bg-[#131d31] border border-zinc-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 transition-all hover:border-blue-400/50 dark:hover:border-blue-500/30">
      {/* File Info */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white truncate">
            {doc.title}
          </p>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-1 mt-0.5">
            <span className="font-medium">{doc.category || 'General'}</span>
            <span>•</span>
            <span>{formatSize(doc.file_size_bytes)}</span>
            <span>•</span>
            <span>{formatDate(doc.created_at)}</span>
          </p>
        </div>
      </div>

      {/* Action Buttons: Touch-friendly grid on mobile, row on desktop */}
      <div className="grid grid-cols-3 sm:flex items-center gap-1.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-slate-800/80">
        {/* Preview Button */}
        <a
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-blue-500" />
          <span>Preview</span>
        </a>

        {/* Download Button */}
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-emerald-500" />
          <span>Download</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShareClick}
          className="inline-flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
