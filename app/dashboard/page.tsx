"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { useCompany } from "@/context/CompanyContext";
import { AppLayout } from "@/components/AppLayout";
import { getMonthlyStitchData, getYesterday, StitchEntry } from "@/lib/stitchData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function entryDateLabel(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === getYesterday()) return "Yesterday";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function groupByDate(entries: StitchEntry[]) {
  const map: Record<string, number> = {};
  for (const e of entries) map[e.date] = (map[e.date] ?? 0) + e.stitchCount;
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));
}

function groupByEmployee(entries: StitchEntry[]) {
  const map: Record<string, { name: string; stitches: number; bonus: number }> = {};
  for (const e of entries) {
    if (!map[e.employeeId]) map[e.employeeId] = { name: e.employeeName, stitches: 0, bonus: 0 };
    map[e.employeeId].stitches += e.stitchCount;
    map[e.employeeId].bonus += Number(e.bonusEarned);
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

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({ data }: { data: { date: string; total: number }[] }) {
  const show = data.slice(-10);
  const max = Math.max(...show.map((d) => d.total), 1);

  if (show.length === 0) {
    return (
      <div className="h-40 flex flex-col items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-xs text-gray-400">No entries yet this month</p>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 w-full" style={{ height: "148px" }}>
      {show.map((d) => {
        const barH = Math.max(8, (d.total / max) * 104);
        const isMax = d.total === max;
        const date = new Date(d.date + "T00:00:00");
        const dayNum = date.getDate();
        const dayName = date.toLocaleDateString("en", { weekday: "short" }).slice(0, 3);
        const label = d.total >= 1000 ? `${(d.total / 1000).toFixed(1)}k` : String(d.total);

        return (
          <div key={d.date} className="flex-1 flex flex-col items-center min-w-0" style={{ gap: 3 }}>
            {/* Count label above bar */}
            <span className={`text-[9px] font-black leading-none tabular-nums ${isMax ? "text-violet-600" : "text-gray-400"}`}>
              {label}
            </span>
            {/* Bar */}
            <div
              className="w-full rounded-t-lg"
              style={{
                height: `${barH}px`,
                background: isMax
                  ? "linear-gradient(180deg, #7c3aed 0%, #2563eb 100%)"
                  : "linear-gradient(180deg, #93c5fd 0%, #3b82f6 100%)",
              }}
            />
            {/* Day number */}
            <span className={`text-[10px] font-bold leading-none ${isMax ? "text-violet-600" : "text-gray-600"}`}>{dayNum}</span>
            {/* Day name */}
            <span className="text-[8px] text-gray-400 leading-none">{dayName}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ day, night }: { day: number; night: number }) {
  const total = day + night;
  if (total === 0) {
    return (
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
        No data
      </div>
    );
  }
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dayArc = (day / total) * circ;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#ddd6fe" strokeWidth="14" />
      <circle cx="48" cy="48" r={r} fill="none" stroke="#1e3a8a" strokeWidth="14"
        strokeDasharray={`${dayArc} ${circ}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
      />
      <text x="48" y="45" textAnchor="middle" fill="#1e3a8a" fontSize="12" fontWeight="800">
        {Math.round((day / total) * 100)}%
      </text>
      <text x="48" y="57" textAnchor="middle" fill="#9ca3af" fontSize="8">Day</text>
    </svg>
  );
}

// ─── Entry color palette ──────────────────────────────────────────────────────

const ENTRY_COLORS = ["bg-blue-500","bg-emerald-500","bg-violet-500","bg-orange-500","bg-sky-500","bg-pink-500","bg-teal-500","bg-yellow-500"];
const MEDALS = ["🥇", "🥈", "🥉"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { currentCompany, companies, loading } = useCompany();

  const [monthlyEntries, setMonthlyEntries] = useState<StitchEntry[]>([]);
  const [monthlyStitch, setMonthlyStitch] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    if (!loading && companies.length === 0) { router.push("/setup"); }
  }, [router, loading, companies]);

  useEffect(() => {
    if (!currentCompany) return;
    setStatsLoading(true);
    const now = new Date();
    getMonthlyStitchData(currentCompany.id, now.getFullYear(), now.getMonth() + 1)
      .then((monthly) => {
        setMonthlyEntries(monthly);
        setMonthlyStitch(monthly.reduce((s, e) => s + e.stitchCount, 0));
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [currentCompany]);

  // All hooks before any early return
  const activeEmployeeCount = useMemo(() => new Set(monthlyEntries.map((e) => e.employeeId)).size, [monthlyEntries]);
  const totalBonus = useMemo(() => monthlyEntries.reduce((s, e) => s + Number(e.bonusEarned), 0), [monthlyEntries]);
  const topEmployees = useMemo(() => groupByEmployee(monthlyEntries).slice(0, 3), [monthlyEntries]);
  const dailyData = useMemo(() => groupByDate(monthlyEntries), [monthlyEntries]);
  const machineData = useMemo(() => groupByMachine(monthlyEntries), [monthlyEntries]);
  const dayCount = useMemo(() => monthlyEntries.filter((e) => e.shift === "day").reduce((s, e) => s + e.stitchCount, 0), [monthlyEntries]);
  const nightCount = useMemo(() => monthlyEntries.filter((e) => e.shift === "night").reduce((s, e) => s + e.stitchCount, 0), [monthlyEntries]);
  const recentEntries = useMemo(
    () => [...monthlyEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4),
    [monthlyEntries]
  );

  if (loading || !currentCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="StitchDesk" className="h-14 w-auto object-contain animate-pulse" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const daysElapsed = now.getDate();
  const dailyAvg = monthlyStitch !== null && daysElapsed > 0 ? Math.round(monthlyStitch / daysElapsed) : null;
  const monthlyTarget = currentCompany.machineCount * 10000 * 30;
  const progressPct = monthlyStitch !== null ? Math.min(100, Math.round((monthlyStitch / monthlyTarget) * 100)) : 0;
  const bestDay = dailyData.reduce((b, d) => (d.total > (b?.total ?? 0) ? d : b), null as { date: string; total: number } | null);

  return (
    <AppLayout>
      <div className="space-y-5 pb-2">

        {/* ── Title ─────────────────────────────────────────────────────── */}
        <div className="pt-1">
          <h1 className="text-[26px] font-black text-gray-900 leading-tight">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        {/* ── Hero card ──────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-5 text-white shadow-xl shadow-blue-200">
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -left-5 w-28 h-28 bg-white/10 rounded-full" />
          <div className="relative">
            <p className="text-xs font-semibold text-blue-100 mb-4">{monthLabel}</p>
            <div className="flex items-start justify-between mb-5">
              <div>
                {statsLoading || monthlyStitch === null ? (
                  <>
                    <div className="h-10 w-36 bg-white/20 rounded-xl animate-pulse mb-1" />
                    <div className="h-3 w-28 bg-white/15 rounded-full animate-pulse" />
                  </>
                ) : (
                  <>
                    <p className="text-[42px] font-black leading-none tracking-tight">{monthlyStitch.toLocaleString()}</p>
                    <p className="text-xs text-blue-100 mt-1.5 font-medium">Total stitches this month</p>
                  </>
                )}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center border border-white/25 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="h-1.5 bg-white/25 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-white rounded-full transition-all duration-700 ease-out" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-100 font-medium">Daily avg: {dailyAvg !== null ? dailyAvg.toLocaleString() : "—"} stitches</span>
              <span className="font-bold">{progressPct}%</span>
            </div>
          </div>
        </div>

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Entries", value: statsLoading ? null : monthlyEntries.length, sub: "this month", color: "text-gray-800" },
            { label: "Employees", value: statsLoading ? null : activeEmployeeCount, sub: "active", color: "text-blue-700" },
            { label: "Bonus Earned", value: statsLoading ? null : `₹${totalBonus.toFixed(0)}`, sub: "total payout", color: "text-violet-700" },
            { label: "Avg / Day", value: statsLoading ? null : (dailyAvg !== null ? dailyAvg.toLocaleString() : "0"), sub: "stitches/day", color: "text-emerald-700" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{s.label}</p>
              {s.value === null
                ? <div className="h-7 w-16 bg-gray-100 rounded-lg animate-pulse" />
                : <>
                    <p className={`text-2xl font-black leading-none ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{s.sub}</p>
                  </>
              }
            </div>
          ))}
        </div>

        {/* ── Daily Production bar chart — full width ────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Daily Production</p>
              <p className="text-xs font-semibold text-gray-600 mt-0.5">Last 10 active days</p>
            </div>
            {bestDay && !statsLoading && (
              <div className="text-right shrink-0">
                <p className="text-[9px] text-gray-400 uppercase tracking-wide">Best day</p>
                <p className="text-xs font-black text-violet-600">{fmtDate(bestDay.date)}</p>
                <p className="text-[10px] text-gray-500 font-semibold">{bestDay.total.toLocaleString()}</p>
              </div>
            )}
          </div>
          {statsLoading ? (
            <div className="flex items-end gap-2" style={{ height: "148px" }}>
              {[55, 80, 45, 90, 65, 75, 50, 95, 70, 60].map((h, i) => (
                <div key={i} className="flex-1 bg-gray-100 rounded-t-lg animate-pulse" style={{ height: `${h}%` }} />
              ))}
            </div>
          ) : (
            <BarChart data={dailyData} />
          )}
        </div>

        {/* ── Shift Split + Machine Utilization — side by side ──────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Donut */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest self-start">Shift Split</p>
            {statsLoading
              ? <div className="w-24 h-24 rounded-full bg-gray-100 animate-pulse" />
              : <DonutChart day={dayCount} night={nightCount} />
            }
            {!statsLoading && (
              <div className="w-full space-y-1.5 text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="text-amber-600 font-semibold">☀️ Day</span>
                  <span className="font-black text-gray-700">{dayCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-500 font-semibold">🌙 Night</span>
                  <span className="font-black text-gray-700">{nightCount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Machine utilization */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Machines</p>
            {statsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-2.5 w-8 bg-gray-100 rounded animate-pulse shrink-0" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : machineData.length === 0 ? (
              <p className="text-xs text-gray-400 mt-6 text-center">No data</p>
            ) : (
              <div className="space-y-2.5">
                {machineData.map((m) => {
                  const pct = Math.round((m.total / (machineData[0]?.total ?? 1)) * 100);
                  return (
                    <div key={m.machine}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-gray-600">M-{m.machine}</span>
                        <span className="text-[9px] font-semibold text-gray-400">{m.total.toLocaleString()}</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: "linear-gradient(to right, #2563eb, #7c3aed)" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Top Performers ────────────────────────────────────────────── */}
        {(statsLoading || topEmployees.length > 0) && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Top Performers</p>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {statsLoading ? (
                <div className="p-4 space-y-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-24 bg-gray-100 rounded-full animate-pulse" />
                        <div className="h-2.5 w-16 bg-gray-100 rounded-full animate-pulse" />
                      </div>
                      <div className="h-2.5 w-14 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {topEmployees.map((emp, i) => (
                    <div key={emp.name} className="flex items-center gap-3 px-4 py-3.5">
                      <span className="text-xl w-8 text-center shrink-0">{MEDALS[i]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{emp.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{emp.stitches.toLocaleString()} stitches</p>
                      </div>
                      <p className="text-sm font-bold text-blue-900 shrink-0">₹{emp.bonus.toFixed(0)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Recent Entries ────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recent Entries</p>
            <Link href="/stitch-data" className="text-sm font-semibold text-blue-600">See All</Link>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {statsLoading ? (
              <div className="p-4 space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-24 bg-gray-100 rounded-full animate-pulse" />
                      <div className="h-2.5 w-16 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                    <div className="h-2.5 w-14 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : recentEntries.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No entries this month yet</p>
                <button onClick={() => router.push("/stitch-data")}
                  className="mt-1 text-xs font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full">
                  + Add Stitch Data
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentEntries.map((entry, idx) => (
                  <div key={entry.id} className="flex items-center gap-3 px-4 py-3.5">
                    <div className={`w-11 h-11 rounded-2xl ${ENTRY_COLORS[idx % ENTRY_COLORS.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {entry.employeeName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{entry.employeeName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{entry.stitchCount.toLocaleString()} stitches · Machine {entry.machineNo}</p>
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">{entryDateLabel(entry.date)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
