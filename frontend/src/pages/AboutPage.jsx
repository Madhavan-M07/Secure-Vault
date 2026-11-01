import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Cpu,
  Share2,
  CheckCircle2,
  ArrowRight,
  Database,
  Users,
  Award,
  Zap,
} from 'lucide-react';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';

export default function AboutPage() {
  const pillars = [
    {
      icon: Lock,
      title: 'Zero-Knowledge Cryptography',
      desc: 'All stored documents are encrypted with AES-256 GCM standards. Your private encryption keys remain strictly isolated to your authenticated session.',
    },
    {
      icon: Cpu,
      title: 'Private Agentic RAG Intelligence',
      desc: 'Our Gemini-powered Vault Assistant parses, indexes, and searches only your own authorized files with mathematical vector isolation in PostgreSQL pgvector.',
    },
    {
      icon: Share2,
      title: 'Self-Destructing Share Tokens',
      desc: 'Generate secure, expiring links with custom view counts and expiration dates. Never leave unmanaged copies of your sensitive files in emails or chats.',
    },
    {
      icon: Database,
      title: 'Row-Level Multi-Tenancy',
      desc: 'Built on Neon Serverless Cloud PostgreSQL with strict row-level isolation guarantees. No other user can ever access or leak into your vault data.',
    },
  ];

  const stats = [
    { value: '256-bit', label: 'AES Encryption Standard' },
    { value: '100%', label: 'Private Multi-Tenant Isolation' },
    { value: '99.99%', label: 'Cloud Availability SLA' },
    { value: '< 1s', label: 'AI Document Retrieval Speed' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#070b14] text-zinc-900 dark:text-zinc-100 transition-colors">
      <PublicNavbar />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 dark:border-slate-800/80">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>Pioneering Private Document Management</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight">
              The Secure Home for Your Most Critical Documents
            </h1>

            <p className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              SecureVault was engineered to solve a fundamental modern problem: how to store, search, and share highly confidential documents with AI intelligence without sacrificing privacy or cryptographic security.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 active:scale-98 transition-all"
              >
                <span>Create Your Free Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-700 text-xs sm:text-sm font-semibold transition-all"
              >
                <span>View Plans & Pricing</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Key Metrics */}
        <section className="py-12 bg-white dark:bg-[#0c121e] border-b border-zinc-200/80 dark:border-slate-800/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((s, idx) => (
                <div key={idx} className="p-4">
                  <div className="text-2xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                    {s.value}
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Core Architectural Pillars */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white">
              Engineered on Four Pillars of Trust
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Every layer of our stack is purpose-built to prevent unauthorized access, data leakage, or model poisoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-slate-800 shadow-xs hover:border-blue-400/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Bottom CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Secure Your Critical Documents?
            </h2>
            <p className="mt-3 text-xs sm:text-base text-blue-100 max-w-xl mx-auto">
              Join thousands of professionals who trust SecureVault for encrypted document storage and private AI assistance.
            </p>
            <div className="mt-8">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-white text-blue-600 font-extrabold text-sm shadow-xl hover:bg-blue-50 active:scale-98 transition-all"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

