export default function StorageDoughnutChart({ storageData = null }) {
  const used = storageData?.used_formatted || '0 B';
  const capacity = storageData?.capacity || '500 GB';

  const categories = storageData?.categories && storageData.categories.length > 0
    ? storageData.categories
    : [{ name: 'Documents', percentage: 100, color: '#3b82f6' }];

  // SVG circular calculations
  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Pre-calculate slice offsets purely functionally without local reassignment
  const categorySlices = categories.reduce(
    (acc, cat) => {
      const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -acc.offset;
      const nextOffset = acc.offset + (cat.percentage / 100) * circumference;
      return {
        offset: nextOffset,
        slices: [
          ...acc.slices,
          {
            ...cat,
            strokeDasharray,
            strokeDashoffset,
          },
        ],
      };
    },
    { offset: 0, slices: [] }
  ).slices;

  return (
    <div className="bg-white dark:bg-[#0f172a] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
      <div>
        <h3 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white">
          Storage Usage
        </h3>
        <p className="text-[11px] text-zinc-400 font-medium">Enterprise multi-tenant capacity</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-1">
        {/* Doughnut SVG */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              className="text-zinc-100 dark:text-slate-800"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Slices */}
            {categorySlices.map((cat, idx) => (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={cat.color}
                strokeWidth={strokeWidth}
                strokeDasharray={cat.strokeDasharray}
                strokeDashoffset={cat.strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-base font-bold text-zinc-950 dark:text-white leading-tight">
              {used}
            </span>
            <span className="text-[10px] text-zinc-400">of {capacity}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between sm:justify-start sm:space-x-3 text-xs">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {cat.name}
                </span>
              </div>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {cat.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
