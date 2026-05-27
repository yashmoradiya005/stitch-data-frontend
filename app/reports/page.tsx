"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useCompany } from "@/context/CompanyContext";
import { AppLayout } from "@/components/AppLayout";
import { getMonthlyStitchData, StitchEntry } from "@/lib/stitchData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupByDate(entries: StitchEntry[]) {
  const map: Record<string, number> = {};
  for (const e of entries) {
    map[e.date] = (map[e.date] ?? 0) + e.stitchCount;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));
}

function groupByEmployee(entries: StitchEntry[]) {
  const map: Record<string, { name: string; stitches: number; bonus: number; entries: number }> = {};
  for (const e of entries) {
    if (!map[e.employeeId]) map[e.employeeId] = { name: e.employeeName, stitches: 0, bonus: 0, entries: 0 };
    map[e.employeeId].stitches += e.stitchCount;
    map[e.employeeId].bonus += Number(e.bonusEarned);
    map[e.employeeId].entries += 1;
  }
  return Object.values(map).sort((a, b) => b.stitches - a.stitches);
}

function groupByMachine(entries: StitchEntry[]) {
  const map: Record<number, number> = {};
  for (const e of entries) map[e.machineNo] = (map[e.machineNo] ?? 0) + e.stitchCount;
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .map(([machine, total]) => ({ machine: Number(machine), total }));
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── SVG Donut ────────────────────────────────────────────────────────────────

function DonutChart({ day, night }: { day: number; night: number }) {
  const total = day + night;
  if (total === 0) return <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No data</div>;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dayPct = day / total;
  const dayArc = dayPct * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="128" height="128" viewBox="0 0 128 128">
        {/* Night arc (background) */}
        <circle cx="64" cy="64" r={r} fill="none" stroke="#e0e7ff" strokeWidth="18" />
        {/* Day arc */}
        <circle
          cx="64" cy="64" r={r} fill="none"
          stroke="#1e3a8a"
          strokeWidth="18"
          strokeDasharray={`${dayArc} ${circ}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
        />
        <text x="64" y="60" textAnchor="middle" className="text-sm" fill="#1e3a8a" fontSize="14" fontWeight="800">
          {Math.round(dayPct * 100)}%
        </text>
        <text x="64" y="76" textAnchor="middle" fill="#9ca3af" fontSize="10">Day shift</text>
      </svg>
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-900" /><span className="text-gray-600">Day</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-indigo-100" /><span className="text-gray-600">Night</span></div>
      </div>
    </div>
  );
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

function BarChart({ data }: { data: { date: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const show = data.slice(-14); // last 14 days

  if (show.length === 0) {
    return <div className="h-40 flex items-center justify-center text-sm text-gray-400">No data</div>;
  }

  return (
    <div className="flex items-end gap-1 h-40 w-full">
      {show.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
          <div className="relative w-full flex justify-center">
            <div
              className="w-full max-w-[28px] bg-blue-900 rounded-t group-hover:bg-blue-700 transition-colors"
              style={{ height: `${Math.max(4, (d.total / max) * 120)}px` }}
            />
            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {d.total.toLocaleString()}
            </div>
          </div>
          <span className="text-[9px] text-gray-400 leading-none truncate w-full text-center">{fmtDate(d.date)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const router = useRouter();
  const { currentCompany } = useCompany();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<StitchEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!isAuthenticated()) router.push("/login"); }, [router]);

  useEffect(() => {
    if (!currentCompany) return;
    setLoading(true);
    getMonthlyStitchData(currentCompany.id, year, month)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [currentCompany, year, month]);

  const totalStitch = useMemo(() => entries.reduce((s, e) => s + e.stitchCount, 0), [entries]);
  const totalBonus = useMemo(() => entries.reduce((s, e) => s + Number(e.bonusEarned), 0), [entries]);
  const dayCount = useMemo(() => entries.filter((e) => e.shift === "day").reduce((s, e) => s + e.stitchCount, 0), [entries]);
  const nightCount = useMemo(() => entries.filter((e) => e.shift === "night").reduce((s, e) => s + e.stitchCount, 0), [entries]);
  const dailyData = useMemo(() => groupByDate(entries), [entries]);
  const employeeData = useMemo(() => groupByEmployee(entries), [entries]);
  const machineData = useMemo(() => groupByMachine(entries), [entries]);
  const avgPerDay = dailyData.length > 0 ? Math.round(totalStitch / dailyData.length) : 0;
  const bestDay = dailyData.reduce((best, d) => (d.total > (best?.total ?? 0) ? d : best), null as { date: string; total: number } | null);

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const Skeleton = () => <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />;

  return (
    <AppLayout>
      <div className="max-w-5xl w-full mx-auto space-y-4">

        {/* Hero header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-violet-800 rounded-2xl px-5 py-6 text-white">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-blue-200 text-xs font-medium uppercase tracking-widest">Production Analytics</p>
              <h1 className="text-xl sm:text-2xl font-black mt-1 uppercase">Reports</h1>
              <p className="text-blue-200 text-sm mt-0.5 truncate">{currentCompany?.name}</p>
            </div>
            {/* Month navigator */}
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={prevMonth} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-center min-w-[72px]">
                <p className="text-sm font-bold">{MONTHS[month - 1]}</p>
                <p className="text-blue-200 text-xs">{year}</p>
              </div>
              <button onClick={nextMonth} disabled={isCurrentMonth} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 disabled:opacity-40 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Entries", value: entries.length, sub: "records", color: "text-gray-800" },
            { label: "Total Stitches", value: totalStitch.toLocaleString(), sub: "stitches", color: "text-violet-700" },
            { label: "Total Bonus", value: `₹${totalBonus.toFixed(0)}`, sub: "earned", color: "text-blue-900" },
            { label: "Avg / Active Day", value: avgPerDay.toLocaleString(), sub: `${dailyData.length} active days`, color: "text-emerald-700" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
              {loading ? <Skeleton /> : (
                <>
                  <p className={`text-2xl font-black leading-none ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Bar chart + Donut */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Daily production bar chart */}
          <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Daily Production</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">Last 14 active days</p>
              </div>
              {bestDay && !loading && (
                <div className="text-right">
                  <p className="text-xs text-gray-400">Best day</p>
                  <p className="text-xs font-bold text-blue-900">{fmtDate(bestDay.date)}</p>
                  <p className="text-xs text-gray-500">{bestDay.total.toLocaleString()}</p>
                </div>
              )}
            </div>
            {loading ? (
              <div className="h-40 flex items-end gap-1">
                {[40, 70, 55, 85, 60, 90, 45, 75, 65, 80, 50, 95, 70, 60].map((h, i) => (
                  <div key={i} className="flex-1 bg-gray-100 rounded-t animate-pulse" style={{ height: `${h}%` }} />
                ))}
              </div>
            ) : (
              <BarChart data={dailyData} />
            )}
          </div>

          {/* Shift split donut */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Shift Split</p>
            <p className="text-sm font-semibold text-gray-700 mb-4">Stitches by shift</p>
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              {loading ? (
                <div className="w-32 h-32 rounded-full bg-gray-100 animate-pulse" />
              ) : (
                <DonutChart day={dayCount} night={nightCount} />
              )}
              {!loading && (
                <div className="w-full space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-amber-600 font-medium">☀️ Day</span>
                    <span className="font-semibold text-gray-700">{dayCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-600 font-medium">🌙 Night</span>
                    <span className="font-semibold text-gray-700">{nightCount.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employee leaderboard */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Employee Performance</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">Ranked by total stitches</p>
            </div>
            {!loading && employeeData.length > 0 && (
              <span className="px-2.5 py-1 bg-blue-900 text-white text-xs font-bold rounded-full">
                {employeeData.length}
              </span>
            )}
          </div>

          {/* Header */}
          <div className="grid grid-cols-[28px_1fr_90px_90px_80px] gap-2 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            <span>#</span>
            <span>Employee</span>
            <span className="text-center">Entries</span>
            <span className="text-right">Stitches</span>
            <span className="text-right">Bonus</span>
          </div>

          {loading ? (
            <div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-[28px_1fr_90px_90px_80px] gap-2 px-5 py-4 animate-pulse border-b border-gray-50">
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : employeeData.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">No data for this period</div>
          ) : (
            <div>
              {employeeData.map((emp, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={emp.name} className="grid grid-cols-[28px_1fr_90px_90px_80px] items-center gap-2 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition text-sm">
                    <span className="text-base">{medals[i] ?? <span className="text-xs text-gray-400 font-medium">{i + 1}</span>}</span>
                    <span className="font-medium text-gray-800 truncate">{emp.name}</span>
                    <span className="text-center text-gray-500">{emp.entries}</span>
                    <span className="text-right font-semibold text-gray-800">{emp.stitches.toLocaleString()}</span>
                    <span className="text-right font-bold text-blue-900">₹{emp.bonus.toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Machine utilization */}
        {!loading && machineData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Machine Utilization</p>
            <p className="text-sm font-semibold text-gray-700 mb-4">Stitches produced per machine</p>
            <div className="space-y-3">
              {machineData.map((m) => {
                const pct = Math.round((m.total / (machineData[0]?.total ?? 1)) * 100);
                return (
                  <div key={m.machine} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500 w-12 shrink-0">M-{m.machine}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="h-full bg-blue-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-20 text-right shrink-0">{m.total.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
