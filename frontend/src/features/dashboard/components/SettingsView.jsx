import { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Bell,
  Smartphone,
  Laptop,
  Globe,
  Database,
  Download,
  CheckCircle2,
  HardDrive,
  Loader2,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import {
  getDashboardStats,
  getUserSettings,
  updateUserSettings,
  getDocuments,
} from '../services/documentService';

export default function SettingsView() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Database-backed settings states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [language, setLanguage] = useState('English');
  const [phone, setPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [statsData, settingsData] = await Promise.all([
          getDashboardStats().catch(() => null),
          getUserSettings().catch(() => null),
        ]);

        if (isMounted) {
          if (statsData) setStats(statsData);
          if (settingsData) {
            setTwoFactorEnabled(settingsData.two_factor_enabled);
            setEmailNotifications(settingsData.email_notifications);
            setSecurityAlerts(settingsData.security_alerts);
            setLanguage(settingsData.language);
            if (settingsData.phone) {
              setPhone(settingsData.phone);
              setPhoneInput(settingsData.phone);
            }
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load settings:', err);
          setError('Failed to load user settings');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdate = async (key, value) => {
    setSavingKey(key);
    setError(null);

    // Optimistic UI update
    if (key === 'two_factor_enabled') setTwoFactorEnabled(value);
    if (key === 'email_notifications') setEmailNotifications(value);
    if (key === 'security_alerts') setSecurityAlerts(value);
    if (key === 'language') setLanguage(value);
    if (key === 'phone') setPhone(value);

    try {
      await updateUserSettings({ [key]: value });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save setting:', err);
      setError(`Failed to update ${key.replace(/_/g, ' ')}`);
    } finally {
      setSavingKey(null);
    }
  };

  const handleSavePhone = async () => {
    if (!phoneInput.trim()) return;
    await handleUpdate('phone', phoneInput.trim());
    setIsEditingPhone(false);
  };

  // Real "Download My Data" feature: exports complete profile and vault manifest
  const handleDownloadMyData = async () => {
    try {
      const docs = await getDocuments();
      const exportData = {
        exported_at: new Date().toISOString(),
        user_profile: {
          id: user?.id,
          email: user?.email,
          role: user?.role,
        },
        preferences: {
          two_factor_enabled: twoFactorEnabled,
          email_notifications: emailNotifications,
          security_alerts: securityAlerts,
          language,
          phone,
        },
        vault_stats: stats,
        documents: docs || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `vault-data-export-${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export data:', err);
      alert('Failed to generate data export.');
    }
  };

  const userName = user?.email ? user.email.split('@')[0] : 'Member';
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'VA';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-600 dark:text-zinc-300" />
        <p className="text-xs font-medium">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">Settings</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Manage your account preferences, security, and data privacy.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-xs font-semibold animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Preferences saved to database</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Profile & Security */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs mb-4">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Profile</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-base flex items-center justify-center shadow-md">
                  {initials}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{displayName}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {user?.email || ''}
                  </p>
                  <div className="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-[10px] font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Verified Lifetime Vault</span>
                  </div>
                </div>
              </div>

              {/* Editable Phone */}
              <div className="text-xs">
                {isEditingPhone ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+91..."
                      className="px-2.5 py-1 text-xs rounded-lg border border-zinc-300 dark:border-slate-700 bg-zinc-50 dark:bg-slate-900 text-zinc-900 dark:text-white focus:outline-none w-36"
                    />
                    <button
                      type="button"
                      onClick={handleSavePhone}
                      className="px-2 py-1 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-medium text-[11px]"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneInput(phone);
                      setIsEditingPhone(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-slate-700 hover:bg-zinc-50 dark:hover:bg-slate-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-xs transition"
                  >
                    Edit Phone
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-slate-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Contact Phone:</span>
              <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{phone || 'Not configured'}</span>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span>Security</span>
                <p className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
                  Manage multi-factor authentication and session controls.
                </p>
              </div>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-slate-800 pt-1">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-3 px-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                      <span>Two-Factor Authentication (2FA)</span>
                      {savingKey === 'two_factor_enabled' && (
                        <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                      )}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Require biometric or passkey verification on new logins.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdate('two_factor_enabled', !twoFactorEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ease-in-out ${
                    twoFactorEnabled ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ease-in-out ${
                      twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Active Sessions Overview */}
              <div className="flex items-center justify-between py-3 px-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Active Web Session
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Signed in via secure JWT token.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                  Active Now
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Preferences & Storage */}
        <div className="space-y-6">
          {/* Preferences Card */}
          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs">
              <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <div>
                <span>Preferences</span>
                <p className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
                  Customize your notifications and language.
                </p>
              </div>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-slate-800 pt-1">
              {/* Email Notifications */}
              <div className="flex items-center justify-between py-3 px-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                      <span>Email Notifications</span>
                      {savingKey === 'email_notifications' && (
                        <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                      )}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Get updates about your documents and share link accesses.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdate('email_notifications', !emailNotifications)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ease-in-out ${
                    emailNotifications ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ease-in-out ${
                      emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Security Alerts */}
              <div className="flex items-center justify-between py-3 px-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                      <span>Security Alerts</span>
                      {savingKey === 'security_alerts' && (
                        <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                      )}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Receive alerts for logins, deletions, and vault events.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdate('security_alerts', !securityAlerts)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ease-in-out ${
                    securityAlerts ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ease-in-out ${
                      securityAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex items-center justify-between py-3 px-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                      <span>Language</span>
                      {savingKey === 'language' && (
                        <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                      )}
                    </p>
                    <p className="text-[10px] text-zinc-400">Choose your preferred language.</p>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => handleUpdate('language', e.target.value)}
                  className="text-xs font-medium bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400"
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                  <option value="Spanish">Español</option>
                </select>
              </div>
            </div>
          </div>

          {/* Storage & Account Card */}
          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs">
              <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <div>
                <span>Storage & Export</span>
                <p className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
                  Real storage usage and data portability.
                </p>
              </div>
            </div>

            {/* Storage Meter */}
            <div className="p-3.5 bg-zinc-50 dark:bg-slate-900 rounded-xl border border-zinc-200/70 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Cloudinary Storage Usage</span>
                </span>
                <span className="font-mono text-zinc-600 dark:text-zinc-400">
                  {stats?.storage_used_formatted || '0 B'} / 10 GB
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-500 rounded-full"
                  style={{ width: `${Math.max(stats?.storage_percentage || 0, 2)}%` }}
                />
              </div>
            </div>

            <div className="pt-2">
              {/* Download My Data */}
              <button
                type="button"
                onClick={handleDownloadMyData}
                className="w-full flex items-center justify-between py-3 hover:bg-zinc-50/80 dark:hover:bg-slate-800/50 px-2 rounded-xl transition text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Download My Data
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Export all documents, hash manifest, and profile metadata.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Export JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
