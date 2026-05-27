"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useUser } from "@/context/UserContext";
import { AppLayout } from "@/components/AppLayout";
import apiClient from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [name, setName] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    if (user) setName(user.name);
  }, [user, router]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!name.trim()) { setError("Name cannot be empty."); return; }

    setLoading(true);
    try {
      const res = await apiClient.put("/api/users/profile", { name: name.trim() });
      setUser({ ...user!, name: res.data.name });
      setSuccess("Profile updated successfully.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl w-full mx-auto space-y-4">

        {/* Hero header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-violet-800 rounded-2xl px-5 py-6 text-white">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative">
            <p className="text-blue-200 text-xs font-medium uppercase tracking-widest">Account Settings</p>
            <h1 className="text-xl sm:text-2xl font-black mt-1">My Profile</h1>
            <p className="text-blue-200 text-sm mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Profile form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Personal Information</h2>

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text" value={name}
                onChange={(e) => setName(e.target.value)}
                required disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email" value={user?.email ?? ""} disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
            <button
              type="submit" disabled={loading}
              className="px-5 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white font-medium rounded-lg transition text-sm"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change password card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Password</h2>
          <p className="text-sm text-gray-400 mb-4">Update your password to keep your account secure.</p>
          <button
            onClick={() => router.push("/profile/change-password")}
            className="px-5 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition text-sm"
          >
            Change Password
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
