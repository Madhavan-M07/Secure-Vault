import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Folder,
  Upload,
  FolderPlus,
  ChevronDown,
  LayoutGrid,
  List,
  FileText,
  Eye,
  Share2,
  Trash2,
  MoreVertical,
  Check,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import {
  getDocuments,
  getCategoriesSummary,
  getDashboardStats,
  deleteDocument,
  uploadDocument,
} from '../services/documentService';
import UploadModal from './UploadModal';

export default function DocumentsView() {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState({});
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedFileType, setSelectedFileType] = useState('All File Types');
  const [viewMode, setViewMode] = useState('list');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const fileInputRef = useRef(null);

  // Load all live data
  const loadData = useCallback(
    async (showSpinner = false) => {
      try {
        if (showSpinner) setIsLoading(true);
        const [docsData, catData, statsData] = await Promise.all([
          getDocuments({
            category: selectedCategory === 'All Categories' ? null : selectedCategory,
          }),
          getCategoriesSummary(),
          getDashboardStats(),
        ]);
        setDocuments(docsData || []);
        setCategories(catData?.categories || {});
        setStats(statsData || null);
      } catch (err) {
        console.error('Failed to load documents data:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCategory]
  );

  useEffect(() => {
    let ignore = false;
    const fetchAll = async () => {
      try {
        const [docsData, catData, statsData] = await Promise.all([
          getDocuments({
            category: selectedCategory === 'All Categories' ? null : selectedCategory,
          }),
          getCategoriesSummary(),
          getDashboardStats(),
        ]);
        if (!ignore) {
          setDocuments(docsData || []);
          setCategories(catData?.categories || {});
          setStats(statsData || null);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load documents data:', err);
          setIsLoading(false);
        }
      }
    };
    fetchAll();
    return () => {
      ignore = true;
    };
  }, [selectedCategory]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      setActionLoadingId(id);
      await deleteDocument(id);
      await loadData(true);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyLink = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDropUpload = async (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files?.[0];
    if (!droppedFile) return;
    await processQuickUpload(droppedFile);
  };

  const handleQuickUploadChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    await processQuickUpload(selectedFile);
  };

  const processQuickUpload = async (fileToUpload) => {
    try {
      setIsLoading(true);
      const cleanTitle = fileToUpload.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const categoryToUse = selectedCategory !== 'All Categories' ? selectedCategory : 'Academic';
      await uploadDocument(fileToUpload, cleanTitle, categoryToUse);
      await loadData(true);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const folderConfigs = [
    {
      name: 'Identity',
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-100 dark:border-blue-900/50',
    },
    {
      name: 'Academic',
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      border: 'border-purple-100 dark:border-purple-900/50',
    },
    {
      name: 'Financial',
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-100 dark:border-emerald-900/50',
    },
    {
      name: 'Employment',
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-100 dark:border-amber-900/50',
    },
    {
      name: 'Personal',
      color: 'text-pink-500 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-950/30',
      border: 'border-pink-100 dark:border-pink-900/50',
    },
    {
      name: 'Property',
      color: 'text-cyan-500 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/30',
      border: 'border-cyan-100 dark:border-cyan-900/50',
    },
    {
      name: 'Others',
      color: 'text-zinc-500 dark:text-zinc-400',
      bg: 'bg-zinc-100 dark:bg-slate-800/40',
      border: 'border-zinc-200 dark:border-slate-800',
    },
  ];

  const getCategoryBadge = (cat) => {
    const colors = {
      Identity:
        'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
      Academic:
        'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
      Financial:
        'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
      Employment:
        'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
      Personal:
        'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-900/50',
      Property:
        'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/50',
      Others:
        'bg-zinc-100 dark:bg-slate-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-slate-700',
    };
    return colors[cat] || colors.Others;
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
              My Documents
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Manage your files in one secure place.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-3 sm:px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition active:scale-98"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-3 sm:px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-slate-850 text-xs font-semibold shadow-xs transition"
          >
            <FolderPlus className="w-3.5 h-3.5 text-zinc-500" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white dark:bg-[#0f172a] rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 text-xs font-medium bg-zinc-50/80 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-xl text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-slate-850 focus:outline-none focus:border-zinc-400 transition"
            >
              <option value="All Categories">All Categories</option>
              {folderConfigs.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* File Type Filter */}
          <div className="relative">
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 text-xs font-medium bg-zinc-50/80 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-xl text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-slate-850 focus:outline-none focus:border-zinc-400 transition"
            >
              <option value="All File Types">All File Types</option>
              <option value="PDF">PDF Documents</option>
              <option value="Images">Images (PNG/JPG)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <select className="appearance-none pl-3.5 pr-8 py-2 text-xs font-medium bg-zinc-50/80 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-xl text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-slate-850 focus:outline-none focus:border-zinc-400 transition">
              <option value="Any Date">Any Date</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Year">This Year</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-zinc-100/80 dark:bg-slate-900 rounded-xl border border-zinc-200/60 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs transition ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-800 text-zinc-900 dark:text-white shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs transition ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-800 text-zinc-900 dark:text-white shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Folders + Documents | Right Upload Box + Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Folders Section */}
          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <h2 className="text-xs font-bold tracking-tight text-zinc-900 dark:text-white mb-3.5">
              Folders ({folderConfigs.length})
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {folderConfigs.map((folder) => {
                const count = categories[folder.name] || 0;
                const isSelected = selectedCategory === folder.name;
                return (
                  <div
                    key={folder.name}
                    onClick={() =>
                      setSelectedCategory(isSelected ? 'All Categories' : folder.name)
                    }
                    className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/40 ring-1 ring-blue-500/30 shadow-xs'
                        : `${folder.bg} ${folder.border} hover:shadow-xs`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Folder className={`w-5 h-5 ${folder.color}`} />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(folder.name);
                        }}
                        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {folder.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                        {count} {count === 1 ? 'document' : 'documents'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents Table Section */}
          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold tracking-tight text-zinc-900 dark:text-white">
                Documents ({documents.length})
                {selectedCategory !== 'All Categories' && (
                  <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
                    in <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedCategory}</span>
                  </span>
                )}
              </h2>
              {selectedCategory !== 'All Categories' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All Categories')}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-xs">Loading encrypted documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-dashed border-zinc-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-slate-900 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  No documents found
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                  {selectedCategory !== 'All Categories'
                    ? `No files stored in ${selectedCategory} yet.`
                    : 'Your vault is empty. Upload your marksheets, degrees or personal IDs.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  Upload First File
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-slate-800 text-zinc-400 dark:text-zinc-500 font-mono text-[10px] uppercase">
                      <th className="pb-3 w-6">
                        <input type="checkbox" className="rounded border-zinc-300 dark:border-slate-700" />
                      </th>
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium hidden sm:table-cell">Modified</th>
                      <th className="pb-3 font-medium hidden md:table-cell">Size</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-slate-850">
                    {documents.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-zinc-50/80 dark:hover:bg-slate-800/40 transition group"
                      >
                        <td className="py-3">
                          <input type="checkbox" className="rounded border-zinc-300 dark:border-slate-700" />
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-100/60 dark:border-red-900/40 font-bold text-[9px]">
                              PDF
                            </div>
                            <div>
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition"
                              >
                                {doc.title}
                              </a>
                              <p className="text-[10px] text-zinc-400 sm:hidden">{formatSize(doc.file_size_bytes)} • {formatDate(doc.created_at)}</p>
                              <p className="hidden sm:block text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate max-w-[180px]">
                                SHA: {doc.sha256_hash?.slice(0, 12)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryBadge(
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
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {/* View / Download */}
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              title="View Document"
                              className="p-1 rounded-lg text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>

                            {/* Copy Share Link */}
                            <button
                              type="button"
                              onClick={() => handleCopyLink(doc.id, doc.file_url)}
                              title="Copy Share Link"
                              className="p-1 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
                            >
                              {copiedId === doc.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Share2 className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Delete Document */}
                            <button
                              type="button"
                              onClick={() => handleDelete(doc.id, doc.title)}
                              disabled={actionLoadingId === doc.id}
                              title="Delete Document"
                              className="p-1 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50"
                            >
                              {actionLoadingId === doc.id ? (
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
        </div>

        {/* Right Column (1 Col wide): Upload Box + Storage Breakdown */}
        <div className="space-y-6">
          {/* Upload Documents Box */}
          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <h3 className="text-xs font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
              Upload Documents
            </h3>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropUpload}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 rounded-xl p-6 text-center cursor-pointer hover:bg-blue-50/60 dark:hover:bg-blue-950/40 hover:border-blue-400 transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleQuickUploadChange}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                className="hidden"
              />
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Drag & drop files here
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5 hover:underline">
                or click to browse
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2">
                Supports PDF, JPG, PNG (Max 50 MB)
              </p>
            </div>
          </div>

          {/* Storage Meter Card */}
          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-white">Storage</span>
              <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                {stats?.storage_used_formatted || '0 B'} / 10 GB
              </span>
            </div>

            <div className="w-full h-2 bg-zinc-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(stats?.storage_percentage || 0, 2)}%` }}
              />
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Documents</span>
                </div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats?.total_documents ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center space-x-2">
                  <Folder className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Folders</span>
                </div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {folderConfigs.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center space-x-2">
                  <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Shared Links</span>
                </div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats?.shared_links_count ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal Dialog */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={() => loadData(true)}
      />
    </div>
  );
}
