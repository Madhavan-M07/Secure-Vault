import AuthCard from '../features/auth/components/AuthCard';

export default function AuthPage({ initialTab = 'login' }) {
  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 sm:p-6 selection:bg-black selection:text-white">
      <AuthCard initialTab={initialTab} />
    </div>
  );
}
