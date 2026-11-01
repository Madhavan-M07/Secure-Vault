import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Heart } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="border-t border-zinc-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070b14] py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-zinc-950 dark:text-white">
                SecureVault
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Encrypted cloud document vault with zero-knowledge AI intelligence.
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              About Us
            </Link>
            <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Pricing
            </Link>
            <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Sign In
            </Link>
          </div>

          {/* Security Badge */}
          <div className="flex items-center space-x-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit AES Encryption • Strict Multi-Tenancy</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-slate-800/60 text-center text-xs text-zinc-400 dark:text-zinc-500">
          © {new Date().getFullYear()} SecureVault. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

