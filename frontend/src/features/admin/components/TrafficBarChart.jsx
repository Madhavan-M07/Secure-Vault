import { useState } from 'react';
import { Laptop, Smartphone, Radio } from 'lucide-react';

export default function TrafficBarChart({ trafficData = null }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  const series = trafficData?.volume_series && trafficData.volume_series.length > 0
    ? trafficData.volume_series
    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...series, 1);

  const totalVisits = trafficData?.total_visits_formatted || '0';
  const growthBadge = trafficData?.traffic_growth || '0.0%';
  const webPct = trafficData?.breakdown?.web_percentage ?? 100;
  const mobilePct = trafficData?.breakdown?.mobile_percentage ?? 0;
  const othersPct = trafficData?.breakdown?.others_percentage ?? 0;

  return (
    <div className="bg-white dark:bg-[#0f172a] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white flex items-center space-x-1.5">
            <span>Traffic Overview</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              ↑ {growthBadge}
            </span>
          </h3>
          <p className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white mt-1">
            {totalVisits}
            <span className="text-xs font-normal text-zinc-400 ml-1.5 font-sans">Total Visits</span>
          </p>
        </div>

        {/* Device Badges */}
        <div className="flex flex-col space-y-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center space-x-1.5">
            <Laptop className="w-3.5 h-3.5 text-blue-500" />
            <span>Web</span>
            <span className="font-bold font-mono text-zinc-900 dark:text-white">{webPct}%</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
            <span>Mobile</span>
            <span className="font-bold font-mono text-zinc-900 dark:text-white">{mobilePct}%</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-slate-400" />
            <span>Others</span>
            <span className="font-bold font-mono text-zinc-900 dark:text-white">{othersPct}%</span>
          </div>
        </div>
      </div>

      {/* 12 Interactive Activity Bars */}
      <div className="pt-2">
        <div className="h-32 flex items-end justify-between space-x-1 sm:space-x-2 px-1">
          {series.map((val, idx) => {
            const heightPct = (val / maxVal) * 100;
            const isHovered = hoveredBar === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
                className="flex-1 flex flex-col items-center group cursor-pointer relative h-full justify-end"
              >
                {isHovered && (
                  <div className="absolute -top-7 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                    {val * 120} visits
                  </div>
                )}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isHovered
                      ? 'bg-blue-600 dark:bg-blue-400 shadow-md shadow-blue-500/30'
                      : 'bg-blue-400/80 dark:bg-blue-500/60 hover:bg-blue-500'
                  }`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] font-mono text-zinc-400 pt-2 px-1">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:59</span>
        </div>
      </div>
    </div>
  );
}

