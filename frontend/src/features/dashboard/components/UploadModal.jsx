import { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadDocument } from '../services/documentService';

const CATEGORIES = [
  'Academic',
  'Identity',
  'Financial',
  'Employment',
  'Personal',
  'Healthcare',
  'Property',
  'Others',
];

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Academic');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!title) {
        const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName);
      }
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!title) {
        const cleanName = droppedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName);
      }
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a file to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title for the document.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newDoc = await uploadDocument(file, title.trim(), category);
      setSuccess(true);
      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess(newDoc);
        handleClose();
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle('');
    setCategory('Academic');
    setError('');
    setSuccess(false);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-zinc-200 dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
              Upload Document
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Secure AES-256 & SHA-256 fingerprinted storage
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 flex items-start space-x-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Document encrypted & securely uploaded!</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                : file
                ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/30'
                : 'border-zinc-200 dark:border-slate-700 hover:border-zinc-300 dark:hover:border-slate-600 bg-zinc-50/50 dark:bg-slate-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                  {file.name}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB • Click to change
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Drag & drop your file here, or{' '}
                  <span className="text-blue-600 dark:text-blue-400">browse</span>
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                  Supports PDF, PNG, JPG, DOCX (Max 50 MB)
                </p>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 10th Standard Marksheet, Passport, Degree"
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !file}
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Encrypting & Storing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Protect</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
