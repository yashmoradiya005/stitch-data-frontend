"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";

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

export default function ChangePasswordPage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (next !== confirm) { setError("New passwords do not match."); return; }
    if (next.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (next === current) { setError("New password must be different from current password."); return; }

    setLoading(true);
    try {
      await apiClient.put("/api/users/change-password", {
        currentPassword: current,
        newPassword: next,
      });
      setSuccess("Password changed successfully!");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const PasswordField = ({
    id, label, value, setValue, show, setShow, placeholder,
  }: {
    id: string; label: string; value: string;
    setValue: (v: string) => void; show: boolean;
    setShow: (v: boolean) => void; placeholder: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          id={id} type={show ? "text" : "password"} value={value}
          onChange={(e) => setValue(e.target.value)}
          required disabled={loading}
          className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
          placeholder={placeholder}
        />
        <button type="button" onClick={() => setShow(!show)} tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple back nav */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-3 sticky top-0 z-10">
        <button onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Profile
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center p-6 pt-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
            <p className="text-gray-400 text-sm mt-1">Choose a strong password you haven&apos;t used before.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
              <PasswordField id="current" label="Current Password" value={current} setValue={setCurrent}
                show={showCurrent} setShow={setShowCurrent} placeholder="Your current password" />
              <PasswordField id="new" label="New Password" value={next} setValue={setNext}
                show={showNext} setShow={setShowNext} placeholder="Min. 8 characters" />
              <PasswordField id="confirm" label="Confirm New Password" value={confirm} setValue={setConfirm}
                show={showConfirm} setShow={setShowConfirm} placeholder="Repeat new password" />

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition text-sm">
                  {loading ? "Changing..." : "Change Password"}
                </button>
                <button type="button" onClick={() => router.push("/profile")} disabled={loading}
                  className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-600 rounded-lg transition text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
