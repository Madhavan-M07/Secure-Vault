import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c121e] flex items-center justify-center">
        <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 animate-pulse">
          Verifying administrative clearance...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Strictly enforce user.role === 'admin'
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0f172a] border border-red-900/50 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-950/60 text-red-400 flex items-center justify-center mx-auto border border-red-800/60 shadow-lg shadow-red-950/40">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            403 Forbidden: Administrator Only
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your account ({user?.email}) is a standard member and does not hold Super Administrator clearance to access the Analytics & Traffic Engine.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to My Vault</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

