"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { useCompany } from "@/context/CompanyContext";
import { useUser } from "@/context/UserContext";
import { AppLayout } from "@/components/AppLayout";
import { getEmployees } from "@/lib/employee";
import { getMonthlyStitchData, getYesterday, StitchEntry } from "@/lib/stitchData";

function entryDateLabel(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === getYesterday()) return "Yesterday";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

const ENTRY_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-sky-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-yellow-500",
];

export default function DashboardPage() {
  const router = useRouter();
  const { currentCompany, companies, loading } = useCompany();
  const { user } = useUser();

  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
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
    Promise.all([
      getEmployees(currentCompany.id),
      getMonthlyStitchData(currentCompany.id, now.getFullYear(), now.getMonth() + 1),
    ])
      .then(([emps, monthly]) => {
        setEmployeeCount(emps.length);
        setMonthlyEntries(monthly);
        setMonthlyStitch(monthly.reduce((s, e) => s + e.stitchCount, 0));
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [currentCompany]);

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
  const dailyAvg = monthlyStitch !== null && daysElapsed > 0
    ? Math.round(monthlyStitch / daysElapsed)
    : null;

  // Progress vs estimated monthly target (machineCount × 10,000/day × 30 days)
  const monthlyTarget = currentCompany.machineCount * 10000 * 30;
  const progressPct = monthlyStitch !== null
    ? Math.min(100, Math.round((monthlyStitch / monthlyTarget) * 100))
    : 0;

  // 4 most recent entries this month
  const recentEntries = [...monthlyEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const initials = user?.name?.charAt(0).toUpperCase() ?? "?";

  const quickAccess = [
    {
      label: "Team",
      sub: employeeCount !== null ? `${employeeCount} members` : "—",
      href: "/employees",
      bg: "bg-blue-500",
      shadow: "shadow-blue-200",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Machines",
      sub: `${currentCompany.machineCount} active`,
      href: "/stitch-data",
      bg: "bg-emerald-500",
      shadow: "shadow-emerald-200",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Stitch",
      sub: "Log data",
      href: "/stitch-data",
      bg: "bg-violet-500",
      shadow: "shadow-violet-200",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: "Reports",
      sub: "View stats",
      href: "/reports",
      bg: "bg-orange-500",
      shadow: "shadow-orange-200",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-5 pb-2">

        {/* ── Page title row ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-[26px] font-black text-gray-900 leading-tight">Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-violet-700 flex items-center justify-center text-white font-bold text-base shadow-sm cursor-pointer"
            onClick={() => router.push("/profile")}
          >
            {initials}
          </div>
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
                    <p className="text-[42px] font-black leading-none tracking-tight">
                      {monthlyStitch.toLocaleString()}
                    </p>
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

            {/* Progress bar */}
            <div className="h-1.5 bg-white/25 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-100 font-medium">
                Daily avg:{" "}
                {dailyAvg !== null
                  ? dailyAvg.toLocaleString()
                  : "—"}{" "}
                stitches
              </span>
              <span className="font-bold">{progressPct}%</span>
            </div>
          </div>
        </div>

        {/* ── Recent Entries ────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Recent Entries
            </p>
            <Link href="/stitch-data" className="text-sm font-semibold text-blue-600">
              See All
            </Link>
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
                <button
                  onClick={() => router.push("/stitch-data")}
                  className="mt-1 text-xs font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full"
                >
                  + Add Stitch Data
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentEntries.map((entry, idx) => (
                  <div key={entry.id} className="flex items-center gap-3 px-4 py-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl ${ENTRY_COLORS[idx % ENTRY_COLORS.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                    >
                      {entry.employeeName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{entry.employeeName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {entry.stitchCount.toLocaleString()} stitches · Machine {entry.machineNo}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">{entryDateLabel(entry.date)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Access ──────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Quick Access
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 -mx-3 px-3" style={{ scrollbarWidth: "none" }}>
            {quickAccess.map((q) => (
              <button
                key={q.label}
                onClick={() => router.push(q.href)}
                className="flex flex-col items-center gap-2 shrink-0"
              >
                <div
                  className={`w-[72px] h-[72px] ${q.bg} rounded-3xl flex items-center justify-center shadow-lg ${q.shadow}`}
                >
                  {q.icon}
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-700">{q.label}</p>
                  <p className="text-[10px] text-gray-400">{q.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
