"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useUser } from "@/context/UserContext";
import { AppLayout } from "@/components/AppLayout";
import apiClient from "@/lib/api";

// ─── Eye Icon ─────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// ─── Password Row (module-level so it never remounts on parent re-render) ──────

function PasswordRow({
  label, value, setValue, show, setShow, placeholder, loading,
}: {
  label: string; value: string; setValue: (v: string) => void;
  show: boolean; setShow: (v: boolean) => void; placeholder: string; loading: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"} value={value}
          onChange={(e) => setValue(e.target.value)}
          required disabled={loading}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 active:text-gray-700 active:scale-90 transition-all"
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    if (next !== confirm) { setError("New passwords do not match."); return; }
    if (next.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (next === current) { setError("New password must be different from current password."); return; }

    setLoading(true);
    try {
      await apiClient.put("/api/users/change-password", {
        currentPassword: current,
        newPassword: next,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-base font-bold text-gray-900">Change Password</h2>
              <p className="text-xs text-gray-400 mt-0.5">Choose a strong, unique password</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 active:scale-90 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 overflow-y-auto">
            {success ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-base font-bold text-gray-800 mb-1">Password changed!</p>
                <p className="text-sm text-gray-400 mb-6">Your account is now secured with the new password.</p>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-blue-900 text-white rounded-xl font-semibold text-sm active:scale-95 transition-transform"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <PasswordRow
                  label="Current Password" value={current} setValue={setCurrent}
                  show={showCurrent} setShow={setShowCurrent} placeholder="Enter current password" loading={loading}
                />
                <PasswordRow
                  label="New Password" value={next} setValue={setNext}
                  show={showNext} setShow={setShowNext} placeholder="Min. 8 characters" loading={loading}
                />
                <PasswordRow
                  label="Confirm New Password" value={confirm} setValue={setConfirm}
                  show={showConfirm} setShow={setShowConfirm} placeholder="Repeat new password" loading={loading}
                />

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} disabled={loading}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium active:scale-95 transition-transform">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform">
                    {loading ? "Saving..." : "Change Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [name, setName] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);

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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Password</h2>
            <p className="text-sm text-gray-400 mt-0.5">Update your password to keep your account secure.</p>
          </div>
          <button
            onClick={() => setPwModalOpen(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Change
          </button>
        </div>

      </div>

      {pwModalOpen && <ChangePasswordModal onClose={() => setPwModalOpen(false)} />}
    </AppLayout>
  );
}
