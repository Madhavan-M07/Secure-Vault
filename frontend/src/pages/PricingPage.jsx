import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Zap,
  Shield,
  Sparkles,
  Bot,
  Cloud,
  ChevronDown,
  ArrowRight,
  Lock,
  Star,
  Users,
} from 'lucide-react';
import DashboardLayout from '../features/dashboard/components/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const plans = [
    {
      id: 'free',
      name: 'Starter Vault',
      badge: 'Free Forever',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Essential encrypted storage with basic AI document assistant access.',
      features: [
        '2 AI Document Prompts included',
        '1 GB Encrypted Cloud Storage',
        'AES-256 Bit Zero-Knowledge Encryption',
        'Standard PDF & Image Uploads',
        'Secure Expiring Share Links',
        'Community Support',
      ],
      ctaText: user?.role === 'admin' ? 'Included' : 'Current Plan',
      ctaDisabled: user?.role !== 'admin',
      highlighted: false,
    },
    {
      id: 'pro',
      name: 'Vault Pro',
      badge: 'Most Popular',
      priceMonthly: 12,
      priceYearly: 9,
      description: 'For professionals who need unlimited AI document intelligence and expanded vault storage.',
      features: [
        'Unlimited AI Document Assistant Prompts',
        '50 GB High-Speed Cloud Storage',
        'OCR & License / ID Auto-Extraction',
        'Real-time Token Streaming (ChatGPT-style)',
        'Multi-Format Document Q&A & Summaries',
        'Custom Share Passwords & Expiries',
        'Priority 24/7 Support',
      ],
      ctaText: user?.role === 'admin' ? 'Active (Admin VIP)' : 'Upgrade to Pro',
      ctaDisabled: false,
      highlighted: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise Vault',
      badge: 'Teams & Firms',
      priceMonthly: 49,
      priceYearly: 39,
      description: 'Maximum security, custom AI models, and unlimited capacity for teams and organizations.',
      features: [
        'Everything in Vault Pro',
        'Unlimited Cloud Storage Capacity',
        'Multi-User Shared Team Vaults',
        'Dedicated AI Instance & Custom Prompts',
        'Detailed Audit Logs & Compliance Export',
        '99.99% Guaranteed SLA Uptime',
        'Dedicated Security Account Manager',
      ],
      ctaText: 'Contact Sales',
      ctaDisabled: false,
      highlighted: false,
    },
  ];

  const faqs = [
    {
      q: 'How does the 2 AI prompt limit work on the free plan?',
      a: 'Free Starter accounts receive 2 free AI document prompts. You can search, summarize, or extract details from any document. Once the 2 prompts are used, upgrading to Vault Pro unlocks unlimited prompts with real-time streaming.',
    },
    {
      q: 'Can I upgrade or cancel my subscription at any time?',
      a: 'Yes, you can upgrade, downgrade, or cancel anytime from your settings. If you cancel, your Pro features remain active until the end of your billing cycle.',
    },
    {
      q: 'Are my uploaded documents and AI queries private?',
      a: '100% yes. SecureVault uses strict multi-tenant isolation. Your documents are encrypted with AES-256 and your AI vector embeddings are strictly quarantined to your account. No other user or AI model ever trains on your private data.',
    },
    {
      q: 'Do Administrators have prompt limits?',
      a: 'No. Super Admin accounts enjoy unlimited AI assistant prompts, full diagnostic telemetry, and unlimited platform storage.',
    },
  ];

  const handlePlanAction = (planId) => {
    setSelectedPlan(planId);
    if (planId === 'free') return;
    alert(`Thank you for selecting the ${planId.toUpperCase()} plan! Billing checkout gateway will connect here.`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6 sm:py-10 px-2 sm:px-4">
        {/* 1. Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent, Scalable Vault Plans</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Unlock the Full Power of Your AI Vault
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Choose the plan that fits your storage and document intelligence needs. Upgrade to Pro for unlimited AI prompts, instant OCR extraction, and 50 GB storage.
          </p>

          {/* 2. Billing Cycle Toggle */}
          <div className="mt-6 inline-flex items-center p-1 bg-zinc-100 dark:bg-slate-900 rounded-xl border border-zinc-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-800 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* 3. Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-16">
          {plans.map((p) => {
            const price = billingCycle === 'yearly' ? p.priceYearly : p.priceMonthly;
            const isSelected = selectedPlan === p.id;

            return (
              <div
                key={p.id}
                className={`relative rounded-2xl flex flex-col justify-between transition-all duration-200 ${
                  p.highlighted
                    ? 'bg-white dark:bg-[#0f172a] border-2 border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-600/10 scale-100 md:scale-103 z-10'
                    : 'bg-white/80 dark:bg-slate-900/80 border border-zinc-200 dark:border-slate-800 hover:border-zinc-300 dark:hover:border-slate-700 shadow-sm'
                } p-6 sm:p-7`}
              >
                {/* Top Badge */}
                {p.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                      p.highlighted
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-zinc-200 dark:bg-slate-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {p.badge}
                  </div>
                )}

                <div>
                  {/* Plan Name & Desc */}
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center justify-between">
                    <span>{p.name}</span>
                    {p.highlighted && <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 min-h-[32px]">
                    {p.description}
                  </p>

                  {/* Price */}
                  <div className="my-5 flex items-baseline space-x-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white">
                      ${price}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      /{billingCycle === 'yearly' ? 'mo (billed annually)' : 'month'}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2.5 my-6 text-xs text-zinc-700 dark:text-zinc-300">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action CTA Button */}
                <div className="pt-4 border-t border-zinc-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handlePlanAction(p.id)}
                    disabled={p.ctaDisabled}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                      p.highlighted
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25 active:scale-98'
                        : p.ctaDisabled
                        ? 'bg-zinc-100 dark:bg-slate-800 text-zinc-400 cursor-default'
                        : 'bg-zinc-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
                    }`}
                  >
                    <span>{p.ctaText}</span>
                    {!p.ctaDisabled && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Enterprise & Security Guarantee Bar */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-blue-900/10 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 mb-16">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                Enterprise-Grade Privacy & Compliance
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Every document is protected with client-isolated AES-256 encryption. We never sell or train public models on your private documents.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-center px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-zinc-200 dark:border-slate-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              🔒 Zero-Knowledge
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-zinc-200 dark:border-slate-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              ⚡ 99.99% Uptime
            </div>
          </div>
        </div>

        {/* 5. Frequently Asked Questions */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Have questions about our plans and AI prompt limits?
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span>{f.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-2 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-slate-800/60">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

