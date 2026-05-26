"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, logout } from "@/lib/auth";
import { useCompany } from "@/context/CompanyContext";
import { StitchIcon } from "@/components/icons/StitchIcon";
import { BusinessSwitcher } from "@/components/BusinessSwitcher";

export default function DashboardPage() {
  const router = useRouter();
  const { currentCompany, loading } = useCompany();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <StitchIcon className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <StitchIcon className="w-8 h-8" />
              <h1 className="text-xl font-bold text-gray-900">Stitch Data</h1>
            </div>
            <div className="h-5 w-px bg-gray-200" />
            <BusinessSwitcher />
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {currentCompany ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-blue-900 text-white flex items-center justify-center text-2xl font-bold">
                  {currentCompany.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentCompany.name}</h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {currentCompany.machineCount} embroidery machine{currentCompany.machineCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-sm">More features coming soon...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <StitchIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No business set up yet</h2>
            <p className="text-gray-400 text-sm mb-6">Create your first business to get started.</p>
            <button
              onClick={() => router.push("/setup")}
              className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition text-sm font-medium"
            >
              Set up a business
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
