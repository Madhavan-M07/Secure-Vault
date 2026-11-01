import { useState } from 'react';
import AuthBanner from './AuthBanner';
import AuthTabs from './AuthTabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthCard({ initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-zinc-200/70 min-h-[480px]">
      <AuthBanner />

      <div className="md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center bg-white">
        <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
