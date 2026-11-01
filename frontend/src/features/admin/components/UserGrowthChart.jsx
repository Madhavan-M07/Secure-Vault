import { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export default function UserGrowthChart({ growthData = null }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const points = growthData?.timeline && growthData.timeline.length > 0
    ? growthData.timeline
    : [
        { month: 'Jun', users: 0, display: '0' },
        { month: 'Jul', users: 0, display: '0' },
        { month: 'Aug', users: 0, display: '0' },
        { month: 'Sep', users: 0, display: '0' },
        { month: 'Oct', users: 0, display: '0' },
        { month: 'Nov', users: 0, display: '0' },
      ];

  const maxVal = Math.max(...points.map((p) => p.users), 1);

  // SVG coordinate calculations
  const svgWidth = 400;
  const svgHeight = 160;
  const paddingX = 35;
  const paddingY = 25;

  const getCoordinates = (idx, val) => {
    const x = paddingX + (idx / Math.max(points.length - 1, 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - paddingY * 2);
    return { x, y };
  };

  const coords = points.map((p, i) => getCoordinates(i, p.users));

  // Construct smooth bezier spline path
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const cpx1 = p0.x + (p1.x - p0.x) / 2;
    const cpy1 = p0.y;
    const cpx2 = p0.x + (p1.x - p0.x) / 2;
    const cpy2 = p1.y;
    pathD += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1.y}`;
  }

  // Area path closing down to bottom
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${svgHeight - paddingY} L ${coords[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="bg-white dark:bg-[#0f172a] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white">
            User Growth
          </h3>
          <p className="text-[11px] text-zinc-400 font-medium">Monthly active onboarding velocity</p>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200/80 dark:border-blue-900/50">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>
            {growthData?.current_total != null
              ? `${growthData.current_total.toLocaleString()} Users`
              : `${points[points.length - 1]?.users ?? 0} Users`}
          </span>
        </div>
      </div>

      <div className="relative pt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 overflow-visible"
        >
          <defs>
            <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const y = svgHeight - paddingY - pct * (svgHeight - paddingY * 2);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="currentColor"
                className="text-zinc-100 dark:text-slate-800"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Gradient Area Fill */}
          <path d={areaD} fill="url(#userGrowthGrad)" />

          {/* Spline Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactive Data Dots & Tooltips */}
          {coords.map((c, idx) => (
            <g key={idx}>
              <circle
                cx={c.x}
                cy={c.y}
                r={hoveredIdx === idx ? 6 : 4}
                className="fill-blue-600 dark:fill-blue-400 stroke-white dark:stroke-slate-900 stroke-2 transition-all cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              {/* Month label */}
              <text
                x={c.x}
                y={svgHeight - 6}
                textAnchor="middle"
                className="text-[10px] fill-zinc-400 font-mono font-medium"
              >
                {points[idx].month}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="absolute -top-3 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-2 py-1 rounded-lg text-[10px] font-bold shadow-lg pointer-events-none transform -translate-x-1/2"
            style={{
              left: `${(coords[hoveredIdx].x / svgWidth) * 100}%`,
            }}
          >
            {points[hoveredIdx].month}: {points[hoveredIdx].display || points[hoveredIdx].users} Users
          </div>
        )}
      </div>
    </div>
  );
}

