import { Shield, Lock, EyeOff, Server, FileCheck, CheckCircle2 } from 'lucide-react';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: 'zero-knowledge',
      icon: EyeOff,
      title: '1. Zero-Knowledge Architecture Commitment',
      content:
        'SecureVault operates on a zero-knowledge security philosophy. Your documents are encrypted using AES-256 GCM encryption standards before storage. We do not inspect, browse, or sell your personal files. Your documents belong solely to you.',
    },
    {
      id: 'ai-privacy',
      icon: Shield,
      title: '2. Artificial Intelligence & Vector Data Privacy',
      content:
        'Our Vault Assistant utilizes Google Gemini models for document synthesis and semantic vector embeddings (pgvector). To protect your privacy:\n• We strictly isolate vector chunks by your authenticated user ID.\n• Your private files are NEVER used to train, fine-tune, or improve foundation AI models.\n• Semantic retrieval only fetches relevant text chunks at the exact moment of your question.\n• Non-admin users receive 2 free AI document prompts, after which queries require an active Vault Pro plan.',
    },
    {
      id: 'data-collection',
      icon: Server,
      title: '3. Information We Collect',
      content:
        'We collect only the minimal data required to provide a reliable service:\n• Account Credentials: Your username, email address, and hashed passwords (salted with bcrypt).\n• File Metadata: File names, categories, file sizes, and upload timestamps.\n• Activity & Audit Logs: Actions taken within your vault (uploads, downloads, share links created) to help you monitor unauthorized access.',
    },
    {
      id: 'sharing-security',
      icon: Lock,
      title: '4. Expiring Shared Links & Third-Party Protections',
      content:
        'When you generate a shared link for a document, SecureVault creates an isolated cryptographic token with an automated expiration date (e.g. 7 days). You can revoke access at any time, instantly invalidating all active share links.',
    },
    {
      id: 'retention-erasure',
      icon: FileCheck,
      title: '5. Data Retention & Permanent Deletion Rights',
      content:
        'You maintain complete control over your vault data:\n• When you delete a document, its file, vector embeddings, and chunk records are permanently purged from Neon PostgreSQL and Cloudinary.\n• Using the "Clear All Chats" feature immediately cascades and deletes all conversation threads and stored AI messages permanently.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#070b14] text-zinc-900 dark:text-zinc-100 transition-colors">
      <PublicNavbar />

      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>Last Updated: November 2, 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            SecureVault Privacy Policy
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            This Privacy Policy describes how SecureVault collects, encrypts, and handles your data when you use our encrypted cloud vault and AI Document Assistant.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 sm:space-y-8">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                    {sec.title}
                  </h2>
                </div>
                <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line pl-0 sm:pl-12">
                  {sec.content}
                </div>
              </div>
            );
          })}

          {/* Contact Box */}
          <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 text-xs text-zinc-600 dark:text-zinc-400">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
              Questions or Data Requests?
            </h3>
            <p>
              If you have any questions regarding this Privacy Policy or wish to exercise your data rights under GDPR or CCPA, please contact our Security & Data Protection team at{' '}
              <a href="mailto:privacy@securevault.io" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                privacy@securevault.io
              </a>.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

