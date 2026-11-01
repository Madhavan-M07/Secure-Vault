import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';
import AuthCard from '../features/auth/components/AuthCard';

export default function AuthPage({ initialTab = 'login' }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#070b14] text-zinc-900 dark:text-zinc-100 selection:bg-blue-600 selection:text-white transition-colors">
      <PublicNavbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <AuthCard initialTab={initialTab} />
      </main>
      <PublicFooter />
    </div>
  );
}
