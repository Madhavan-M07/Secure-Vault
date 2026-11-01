import { Zap, Sparkles, X, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PromptLimitModal({ isOpen, onClose, promptCount = 2, maxPrompts = 2 }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl border border-zinc-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 text-center overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 mb-4">
          <Zap className="w-7 h-7 fill-white" />
        </div>

        {/* Title & Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Free Tier Limit Reached ({promptCount}/{maxPrompts} Prompts)</span>
        </div>

        <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Upgrade to Vault Pro
        </h3>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
          You've used all <strong>{maxPrompts} free AI document assistant prompts</strong>. Upgrade to <strong>Vault Pro</strong> for unlimited AI search, OCR extraction, and 50 GB storage.
        </p>

        {/* Feature Pills */}
        <div className="my-5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-slate-900/80 border border-zinc-200/80 dark:border-slate-800 text-left space-y-2">
          <div className="flex items-center space-x-2.5 text-xs text-zinc-700 dark:text-zinc-300">
            <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 stroke-[3]" />
            <span><strong>Unlimited</strong> AI Document Q&A & Summaries</span>
          </div>
          <div className="flex items-center space-x-2.5 text-xs text-zinc-700 dark:text-zinc-300">
            <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 stroke-[3]" />
            <span><strong>50 GB</strong> High-Speed Cloud Vault Storage</span>
          </div>
          <div className="flex items-center space-x-2.5 text-xs text-zinc-700 dark:text-zinc-300">
            <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 stroke-[3]" />
            <span><strong>OCR Auto-Extraction</strong> for IDs, Licences & Invoices</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleUpgrade}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <span>View Pricing & Upgrade ($9/mo)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

