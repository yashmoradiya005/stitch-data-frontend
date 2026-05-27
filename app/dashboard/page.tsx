"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useCompany } from "@/context/CompanyContext";
import { AppLayout } from "@/components/AppLayout";
import { getEmployees } from "@/lib/employee";
import { getDailyStitchData, getMonthlyStitchData, getYesterday } from "@/lib/stitchData";

export default function DashboardPage() {
  const router = useRouter();
  const { currentCompany, companies, loading } = useCompany();

  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [yesterdayStitch, setYesterdayStitch] = useState<number | null>(null);
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
      getDailyStitchData(currentCompany.id, getYesterday()),
      getMonthlyStitchData(currentCompany.id, now.getFullYear(), now.getMonth() + 1),
    ])
      .then(([emps, daily, monthly]) => {
        setEmployeeCount(emps.length);
        setYesterdayStitch(daily.reduce((s, e) => s + e.stitchCount, 0));
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

  const yesterdayDate = new Date(getYesterday() + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const monthLabel = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const stats = [
    {
      label: "Total Employees",
      value: employeeCount,
      sub: "Team members",
      href: "/employees",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: "from-blue-600 to-blue-800",
      lightBg: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      label: "Yesterday's Stitches",
      value: yesterdayStitch,
      sub: yesterdayDate,
      href: "/stitch-data",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: "from-violet-500 to-violet-700",
      lightBg: "bg-violet-50",
      textColor: "text-violet-700",
    },
    {
      label: "Monthly Stitches",
      value: monthlyStitch,
      sub: monthLabel,
      href: "/reports",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: "from-emerald-500 to-emerald-700",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
  ];

  return (
    <AppLayout>
      <div className="min-h-full flex items-start justify-center">
        <div className="w-full max-w-5xl mx-auto space-y-4">

          {/* Business Hero Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-violet-800 rounded-2xl shadow-lg px-6 py-8 text-white">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/5 rounded-full" />

            <div className="relative flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-3xl font-black shrink-0 border border-white/20">
                {currentCompany.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-blue-200 text-xs font-medium uppercase tracking-widest mb-1">Active Business</p>
                <h1 className="text-2xl sm:text-3xl font-bold truncate">{currentCompany.name}</h1>
                <p className="text-blue-200 text-sm mt-1">
                  {currentCompany.machineCount} embroidery machine{currentCompany.machineCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <button
                key={stat.label}
                onClick={() => router.push(stat.href)}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 text-left w-full flex flex-col gap-4"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                  {stat.icon}
                </div>

                {/* Value */}
                <div>
                  {statsLoading || stat.value === null ? (
                    <>
                      <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse mb-2" />
                      <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                    </>
                  ) : (
                    <>
                      <p className="text-3xl font-black text-gray-900 leading-none">
                        {stat.value.toLocaleString()}
                      </p>
                      <p className="text-sm font-medium text-gray-600 mt-1">{stat.label}</p>
                    </>
                  )}
                </div>

                {/* Sub label + arrow */}
                <div className="flex items-center justify-between mt-auto">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.lightBg} ${stat.textColor}`}>
                    {stat.sub}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Quick actions row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/stitch-data")}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-blue-100 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Add Stitch Data</p>
                <p className="text-xs text-gray-400">Log today's production</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/employees")}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-blue-100 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Add Employee</p>
                <p className="text-xs text-gray-400">Register a team member</p>
              </div>
            </button>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
