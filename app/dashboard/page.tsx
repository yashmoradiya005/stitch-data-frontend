"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useCompany } from "@/context/CompanyContext";
import { AppLayout } from "@/components/AppLayout";
import { StitchIcon } from "@/components/icons/StitchIcon";

export default function DashboardPage() {
  const router = useRouter();
  const { currentCompany, companies, loading } = useCompany();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    // Once companies are loaded, redirect to setup if none exist
    if (!loading && companies.length === 0) {
      router.push("/setup");
    }
  }, [router, loading, companies]);

  if (loading || !currentCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <StitchIcon className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-6">
        {/* Business header card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-900 text-white flex items-center justify-center text-2xl font-bold shrink-0">
              {currentCompany.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentCompany.name}</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {currentCompany.machineCount} embroidery machine{currentCompany.machineCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Employees", value: "—", icon: "👥" },
            { label: "Today's Stitches", value: "—", icon: "🧵" },
            { label: "This Month", value: "—", icon: "📋" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
              <span className="text-3xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-400 text-sm">More features coming soon...</p>
        </div>
      </div>
    </AppLayout>
  );
}
