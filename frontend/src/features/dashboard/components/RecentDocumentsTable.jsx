import { useState } from 'react';
import { FileText, Eye, Share2, Trash2, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteDocument } from '../services/documentService';

export default function RecentDocumentsTable({ documents = [], isLoading = false, onRefresh }) {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const getCategoryBadge = (category) => {
    const badges = {
      Academic: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
      Identity: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
      Financial: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
      Employment: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
      Personal: 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-900/50',
      Healthcare: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/50',
      Property: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50',
      Others: 'bg-zinc-100 dark:bg-slate-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-slate-700',
    };
    return badges[category] || badges.Others;
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      setDeletingId(id);
      await deleteDocument(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white">
          Recent Documents
        </h2>
        <button
          type="button"
          onClick={() => navigate('/documents')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All →
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin mb-2" />
          <p className="text-xs">Loading recent documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="py-10 text-center rounded-xl border border-dashed border-zinc-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-slate-900 text-zinc-400 flex items-center justify-center mx-auto mb-2">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            No documents stored yet
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            Upload your degrees, marksheets, or IDs to view them here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs min-w-[280px] sm:min-w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-slate-800 text-zinc-400 dark:text-zinc-500 font-mono text-[10px] uppercase">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Uploaded</th>
                <th className="pb-3 font-medium hidden md:table-cell">Size</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-slate-850">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-slate-800/40 transition"
                >
                  <td className="py-3 pr-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-100/60 dark:border-red-900/40 font-bold text-[9px]">
                        PDF
                      </div>
                      <div className="min-w-0">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition truncate block max-w-[120px] sm:max-w-xs"
                        >
                          {doc.title}
                        </a>
                        <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 sm:hidden">
                          {formatSize(doc.file_size_bytes)} • {formatDate(doc.created_at)}
                        </p>
                        <p className="hidden sm:block text-[9px] font-mono text-zinc-400 dark:text-zinc-500 truncate max-w-[160px]">
                          SHA: {doc.sha256_hash?.slice(0, 10)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-1">
                    <span
                      className={`inline-block px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium border ${getCategoryBadge(
                        doc.category
                      )}`}
                    >
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-500 dark:text-zinc-400 text-[11px] hidden sm:table-cell">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="py-3 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] hidden md:table-cell">
                    {formatSize(doc.file_size_bytes)}
                  </td>
                  <td className="py-3 text-right pl-2">
                    <div className="flex items-center justify-end space-x-1">
                      {/* View document link */}
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        title="View Document"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>

                      {/* Copy Share Link */}
                      <button
                        type="button"
                        onClick={() => handleCopy(doc.id, doc.file_url)}
                        title="Copy Link"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
                      >
                        {copiedId === doc.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id, doc.title)}
                        disabled={deletingId === doc.id}
                        title="Delete Document"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50"
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
