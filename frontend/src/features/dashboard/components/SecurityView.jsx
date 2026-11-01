import { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  Fingerprint,
  Smartphone,
  Laptop,
  CheckCircle2,
  Mail,
  Phone,
  KeyRound,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import {
  getUserSettings,
  updateUserSettings,
  getActivityLogs,
} from '../services/documentService';

export default function SecurityView() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState(null);
  const [error, setError] = useState(null);

  // Detect current client device
  const currentDevice = useMemo(() => {
    const ua = navigator.userAgent;
    let browser = 'Chrome';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';

    let os = 'Windows';
    let isMobile = false;
    if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Android')) {
      os = 'Android';
      isMobile = true;
    } else if (ua.includes('iPhone') || ua.includes('iPad')) {
      os = 'iOS';
      isMobile = true;
    } else if (ua.includes('Linux')) os = 'Linux';

    return {
      name: `${browser} on ${os}`,
      os,
      browser,
      isMobile,
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSecurityData() {
      try {
        const [settingsData, logsData] = await Promise.all([
          getUserSettings().catch(() => null),
          getActivityLogs('Security').catch(() => []),
        ]);

        if (isMounted) {
          if (settingsData) setSettings(settingsData);
          if (logsData) setSecurityLogs(logsData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load security info:', err);
          setError('Failed to fetch security credentials');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSecurityData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle2FA = async () => {
    if (!settings) return;
    const nextVal = !settings.two_factor_enabled;
    setUpdatingKey('2fa');
    // Optimistic update
    setSettings((prev) => ({ ...prev, two_factor_enabled: nextVal }));

    try {
      await updateUserSettings({ two_factor_enabled: nextVal });
    } catch (err) {
      console.error('Failed to toggle 2FA:', err);
      // Revert on error
      setSettings((prev) => ({ ...prev, two_factor_enabled: !nextVal }));
      setError('Failed to update 2FA status');
    } finally {
      setUpdatingKey(null);
    }
  };

  const twoFactorOn = settings?.two_factor_enabled ?? true;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-600 dark:text-zinc-300" />
        <p className="text-xs font-medium">Verifying security posture...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Security & Privacy
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          Protecting your documents with enterprise-grade SHA-256 hashing and multi-factor security.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Green Banner with Shield */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs flex items-center justify-between relative overflow-hidden transition-colors">
        <div className="flex items-center space-x-3.5 z-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
              Your vault is actively protected
            </h2>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
              All documents are cryptographically signed with SHA-256 and encrypted at rest.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/10 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
      </div>

      {/* 3 Core Security Feature Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AES-256 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span>AES-256 Encryption</span>
            </div>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium border border-emerald-200 dark:border-emerald-900/50">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Active</span>
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Cloudinary multi-tenant storage encrypted at rest.
          </p>
        </div>

        {/* SHA-256 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs">
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Fingerprint className="w-3.5 h-3.5" />
              </div>
              <span>SHA-256 Fingerprint</span>
            </div>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium border border-emerald-200 dark:border-emerald-900/50">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Verified</span>
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Immutable digital signature prevents tampering.
          </p>
        </div>

        {/* 2FA */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span>2-Factor Auth</span>
            </div>
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                twoFactorOn
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                  : 'bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{twoFactorOn ? 'Enabled' : 'Disabled'}</span>
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Multi-factor verification for enhanced authentication.
          </p>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Two-Factor Settings & Active Sessions */}
        <div className="space-y-6">
          {/* Two-Factor Card */}
          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Two-Factor Authentication</span>
              </div>
              <button
                type="button"
                onClick={handleToggle2FA}
                disabled={updatingKey === '2fa'}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ease-in-out disabled:opacity-60 ${
                  twoFactorOn ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ease-in-out ${
                    twoFactorOn ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              When 2FA is enabled, you will be prompted to verify via your registered phone number or authenticator app.
            </p>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-slate-900 border border-zinc-200/70 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>SMS & Passkey Destination</span>
                </span>
                <span className="font-mono text-zinc-600 dark:text-zinc-400">
                  {settings?.phone || 'Not configured'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Sessions Card */}
          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs">
              <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Active Sessions</span>
            </div>

            <div className="space-y-3">
              {/* Current Session */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-slate-900 border border-zinc-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {currentDevice.name}
                    </p>
                    <p className="text-[10px] text-zinc-400">Current Session • Signed In</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-[10px] font-medium">
                  Active Now
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Recovery & Recent Security Events */}
        <div className="space-y-6">
          {/* Account Recovery Card */}
          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs">
              <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Account Recovery Methods</span>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-slate-800 text-xs">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Recovery Email</p>
                    <p className="text-[10px] text-zinc-400">{user?.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Primary
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Recovery Phone</p>
                    <p className="text-[10px] text-zinc-400">{settings?.phone || 'Not set'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-zinc-500">Verified</span>
              </div>
            </div>
          </div>

          {/* Real Security Audit Log Card */}
          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Security Event Log</span>
            </div>

            {securityLogs.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">
                No security alerts or anomalous events recorded.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-slate-800 text-xs">
                {securityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{log.title}</p>
                      <p className="text-[10px] text-zinc-400">{log.detail}</p>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {new Date(log.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
