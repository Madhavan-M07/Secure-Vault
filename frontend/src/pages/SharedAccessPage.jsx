import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Download,
  Eye,
  AlertCircle,
  Loader2,
  Calendar,
  Lock,
} from 'lucide-react';
import { accessSharedDocument } from '../features/dashboard/services/documentService';

export default function SharedAccessPage() {
  const { shareToken } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const fetchDoc = async () => {
      try {
        setIsLoading(true);
        const result = await accessSharedDocument(shareToken);
        if (!ignore) {
          setData(result);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'This share link is invalid or has expired.');
          setIsLoading(false);
        }
      }
    };
    fetchDoc();
    return () => {
      ignore = true;
    };
  }, [shareToken]);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-zinc-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navbar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
              Document Vault
            </h1>
            <p className="text-[10px] font-mono text-cyan-400">LIFETIME SECURE VERIFICATION</p>
          </div>
        </div>

        <Link
          to="/login"
          className="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
        >
          Sign In
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="max-w-2xl w-full mx-auto my-12">
        {isLoading ? (
          <div className="bg-[#0f172a] p-12 rounded-2xl border border-slate-800 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
            <p className="text-xs text-zinc-400">Verifying secure cryptographic access token...</p>
          </div>
        ) : error ? (
          <div className="bg-[#0f172a] p-8 rounded-2xl border border-red-900/50 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 text-red-400 flex items-center justify-center mx-auto border border-red-800/60">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">Access Denied or Expired</h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">{error}</p>
            <Link
              to="/"
              className="inline-block mt-4 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold hover:bg-slate-750 transition"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{data?.document_title}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 text-[10px] font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      <span>SHA-256 Verified</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Expires {formatDate(data?.expires_at)}
                    </span>
                  </div>
                </div>
              </div>

              {data?.permission === 'Download' ? (
                <a
                  href={data?.file_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-98"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              ) : (
                <a
                  href={data?.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Document</span>
                </a>
              )}
            </div>

            {/* Document Details & Hash */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 font-mono">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-semibold">
                  Tamper-Proof SHA-256 Fingerprint:
                </p>
                <p className="text-[11px] text-cyan-400 break-all select-all">
                  {data?.sha256_hash}
                </p>
              </div>

              <div className="flex items-center justify-between text-zinc-400 text-[11px] pt-2">
                <span className="flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit Encrypted Transfer</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Verified Access</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-zinc-600 pb-4">
        Powered by Lifetime Document Vault • Enterprise Multi-Tenant Storage
      </footer>
    </div>
  );
}
