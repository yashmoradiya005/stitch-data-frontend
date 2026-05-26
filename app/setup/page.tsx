"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { createCompany } from "@/lib/company";
import { useCompany } from "@/context/CompanyContext";
import { StitchIcon } from "@/components/icons/StitchIcon";

export default function SetupPage() {
  const router = useRouter();
  const { refreshCompanies, companies, loading: companiesLoading } = useCompany();
  const [name, setName] = useState("");
  const [machineCount, setMachineCount] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    // Already has businesses — go straight to dashboard
    if (!companiesLoading && companies.length > 0) {
      router.push("/dashboard");
    }
  }, [router, companies, companiesLoading]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Business name is required.");
      return;
    }
    if (machineCount < 1) {
      setError("You must have at least 1 machine.");
      return;
    }

    setLoading(true);
    try {
      await createCompany(name.trim(), machineCount);
      await refreshCompanies();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create business. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <StitchIcon className="w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Set Up Your Business</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Tell us about your embroidery business to get started
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              id="businessName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
              placeholder="e.g. Stitch Works Studio"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="machineCount" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Machines
            </label>
            <p className="text-xs text-gray-400 mb-2">How many embroidery machines does this business have?</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMachineCount((v) => Math.max(1, v - 1))}
                disabled={loading || machineCount <= 1}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition text-lg font-bold"
              >
                −
              </button>
              <input
                id="machineCount"
                type="number"
                min={1}
                value={machineCount}
                onChange={(e) => setMachineCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition font-semibold text-lg"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setMachineCount((v) => v + 1)}
                disabled={loading}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition text-lg font-bold"
              >
                +
              </button>
              <span className="text-gray-500 text-sm">machine{machineCount !== 1 ? "s" : ""}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 mt-2"
          >
            {loading ? "Creating..." : "Create Business"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-8 border-t border-gray-200 pt-4">
          © 2024 Stitch Data. All rights reserved.
        </p>
      </div>
    </div>
  );
}
