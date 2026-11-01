import { useState, useEffect, useCallback } from 'react';
import {
  Link as LinkIcon,
  Eye,
  Clock,
  Check,
  Copy,
  ChevronDown,
  Trash2,
  Share2,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  getDocuments,
  getSharedLinks,
  getSharedStats,
  createShareLink,
  deleteShareLink,
} from '../services/documentService';

export default function SharedView() {
  const [documents, setDocuments] = useState([]);
  const [sharedLinks, setSharedLinks] = useState([]);
  const [stats, setStats] = useState({ active_links: 0, total_views: 0, expiring_soon: 0 });
  const [selectedDocId, setSelectedDocId] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [permission, setPermission] = useState('View only');
  const [expirationDays, setExpirationDays] = useState('7');
  const [copiedId, setCopiedId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      const [docsData, linksData, statsData] = await Promise.all([
        getDocuments(),
        getSharedLinks(),
        getSharedStats(),
      ]);
      setDocuments(docsData || []);
      setSharedLinks(linksData || []);
      setStats(statsData || { active_links: 0, total_views: 0, expiring_soon: 0 });

      if (docsData && docsData.length > 0 && !selectedDocId) {
        setSelectedDocId(docsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load shared links data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDocId]);

  useEffect(() => {
    let ignore = false;
    const fetchAll = async () => {
      try {
        const [docsData, linksData, statsData] = await Promise.all([
          getDocuments(),
          getSharedLinks(),
          getSharedStats(),
        ]);
        if (!ignore) {
          setDocuments(docsData || []);
          setSharedLinks(linksData || []);
          setStats(statsData || { active_links: 0, total_views: 0, expiring_soon: 0 });
          if (docsData && docsData.length > 0) {
            setSelectedDocId(docsData[0].id);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setIsLoading(false);
        }
      }
    };
    fetchAll();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateShareLink = async (e) => {
    e.preventDefault();
    if (!selectedDocId) {
      setErrorMessage('Please select a document to share.');
      return;
    }
    if (!recipientEmail) {
      setErrorMessage('Please enter a recipient email.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await createShareLink({
        document_id: selectedDocId,
        recipient_email: recipientEmail,
        permission,
        expires_in_days: expirationDays,
      });

      setStatusMessage(`Secure share link generated for ${recipientEmail}`);
      setRecipientEmail('');
      await loadData(false);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate share link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Revoke shared access for ${email}?`)) return;
    try {
      setDeletingId(id);
      await deleteShareLink(id);
      await loadData(false);
    } catch (err) {
      alert(`Failed to revoke link: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Active';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Shared Documents
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Manage access to your files.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const formElement = document.getElementById('share-form-card');
            formElement?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition active:scale-98"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Create Share Link</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-base sm:text-xl font-bold text-zinc-950 dark:text-white">
                {stats.active_links}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Active Links</p>
          </div>
        </div>

        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-base sm:text-xl font-bold text-zinc-950 dark:text-white">
                {stats.total_views}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Live
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Views</p>
          </div>
        </div>

        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-base sm:text-xl font-bold text-zinc-950 dark:text-white">
                {stats.expiring_soon}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Expiring Soon</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Shared Links Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-tight text-zinc-900 dark:text-white">
              Your Shared Links ({sharedLinks.length})
            </h2>
            <div className="relative">
              <select className="appearance-none pl-3 pr-7 py-1.5 text-xs font-medium bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-xl text-zinc-700 dark:text-zinc-300 focus:outline-none">
                <option>All Links</option>
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p className="text-xs">Loading shared links...</p>
            </div>
          ) : sharedLinks.length === 0 ? (
            <div className="py-12 text-center rounded-xl border border-dashed border-zinc-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
                <LinkIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">No active shared links</p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                Use the form on the right to share your marksheets or IDs securely with an employer or university.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-slate-800 text-zinc-400 dark:text-zinc-500 font-mono text-[10px] uppercase">
                    <th className="pb-3 font-medium">Document</th>
                    <th className="pb-3 font-medium">Recipient</th>
                    <th className="pb-3 font-medium">Permission</th>
                    <th className="pb-3 font-medium hidden md:table-cell">Expires</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Views</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-slate-850">
                  {sharedLinks.map((link) => (
                    <tr
                      key={link.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-slate-800/40 transition group"
                    >
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-[8px] border border-red-100 dark:border-red-900/40">
                            PDF
                          </div>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {link.document_title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                        {link.recipient_email}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            link.permission === 'Download'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50'
                          }`}
                        >
                          {link.permission === 'Download' ? (
                            <Download className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                          <span>{link.permission}</span>
                        </span>
                      </td>
                      <td className="py-3 text-zinc-500 dark:text-zinc-400 text-[11px] hidden md:table-cell">
                        {formatDate(link.expires_at)}
                      </td>
                      <td className="py-3 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] hidden sm:table-cell">
                        {link.view_count}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center space-x-1 text-[11px] font-medium ${
                            link.status === 'Active'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : link.status === 'Expiring'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-zinc-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              link.status === 'Active'
                                ? 'bg-emerald-500'
                                : link.status === 'Expiring'
                                ? 'bg-amber-500'
                                : 'bg-zinc-400'
                            }`}
                          />
                          <span>{link.status}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => handleCopy(link.id, link.share_url)}
                            title="Copy Public Link"
                            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800 transition"
                          >
                            {copiedId === link.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(link.id, link.recipient_email)}
                            disabled={deletingId === link.id}
                            title="Revoke Link"
                            className="p-1 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50"
                          >
                            {deletingId === link.id ? (
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

        {/* Right 1 Col: Share Form & Recent Activity */}
        <div className="space-y-6">
          {/* Share a Document Form Card */}
          <div
            id="share-form-card"
            className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors"
          >
            <h3 className="text-xs font-bold tracking-tight text-zinc-900 dark:text-white">
              Share a Document
            </h3>

            {statusMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{statusMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateShareLink} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Select Document
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.title}
                      </option>
                    ))
                  ) : (
                    <option value="">No documents uploaded yet</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Permission
                </label>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="View only">View only</option>
                  <option value="Download">Download & Print</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Expiration
                </label>
                <select
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="1">24 hours</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || documents.length === 0}
                className="w-full mt-2 inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Link...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Create Link</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Recently Accessed Card */}
          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-tight text-zinc-900 dark:text-white">
                Recently accessed
              </h3>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                Live Audit
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {sharedLinks.length === 0 ? (
                <p className="text-[11px] text-zinc-400">No share links accessed yet.</p>
              ) : (
                sharedLinks.slice(0, 3).map((l) => (
                  <div key={l.id} className="flex items-start space-x-3 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Share2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {l.document_title}
                      </p>
                      <p className="text-[10px] text-zinc-400">with {l.recipient_email}</p>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {l.view_count} views
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
