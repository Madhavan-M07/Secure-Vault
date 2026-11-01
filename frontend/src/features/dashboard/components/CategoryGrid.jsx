import {
  GraduationCap,
  CreditCard,
  BadgeDollarSign,
  Briefcase,
  User,
  HeartPulse,
  Home,
  LayoutGrid,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CategoryGrid({ categoriesSummary = {} }) {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'Academic',
      icon: GraduationCap,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50',
    },
    {
      name: 'Identity',
      icon: CreditCard,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/50',
    },
    {
      name: 'Financial',
      icon: BadgeDollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50',
    },
    {
      name: 'Employment',
      icon: Briefcase,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50',
    },
    {
      name: 'Personal',
      icon: User,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50/70 dark:bg-pink-950/30 border-pink-100 dark:border-pink-900/50',
    },
    {
      name: 'Healthcare',
      icon: HeartPulse,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50/70 dark:bg-cyan-950/30 border-cyan-100 dark:border-cyan-900/50',
    },
    {
      name: 'Property',
      icon: Home,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50',
    },
    {
      name: 'Others',
      icon: LayoutGrid,
      color: 'text-zinc-600 dark:text-zinc-400',
      bg: 'bg-zinc-100/70 dark:bg-slate-800/40 border-zinc-200 dark:border-slate-800',
    },
  ];

  const handleCategoryClick = () => {
    navigate('/documents');
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white">
          Your Categories
        </h2>
        <button
          type="button"
          onClick={() => navigate('/documents')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All →
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const count = categoriesSummary[cat.name] || 0;
          return (
            <div
              key={cat.name}
              onClick={handleCategoryClick}
              className={`p-3.5 rounded-xl border ${cat.bg} hover:shadow-xs transition cursor-pointer flex flex-col justify-between group`}
            >
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 shadow-xs flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Icon className={`w-4 h-4 ${cat.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{cat.name}</p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                  {count} {count === 1 ? 'document' : 'documents'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
