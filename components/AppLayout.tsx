"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BusinessSwitcher } from "./BusinessSwitcher";
import { useCompany } from "@/context/CompanyContext";
import { useUser } from "@/context/UserContext";
import { logout } from "@/lib/auth";
import { updateCompany, deleteCompany } from "@/lib/company";

const navItems = [
  {
    label: "Home",
    href: "/dashboard",
    activePill: "bg-blue-100",
    activeIcon: "text-blue-700",
    activeText: "text-blue-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Team",
    href: "/employees",
    activePill: "bg-sky-100",
    activeIcon: "text-sky-600",
    activeText: "text-sky-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Stitch",
    href: "/stitch-data",
    activePill: "bg-violet-100",
    activeIcon: "text-violet-700",
    activeText: "text-violet-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Reports",
    href: "/reports",
    activePill: "bg-emerald-100",
    activeIcon: "text-emerald-700",
    activeText: "text-emerald-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

// ─── Profile Menu ─────────────────────────────────────────────────────────────

function ProfileMenu() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900 to-violet-700 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
          {initials}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); router.push("/profile"); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left text-sm text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Profile
          </button>
          <div className="border-t border-gray-50 mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition text-left text-sm text-red-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Edit Business Modal ──────────────────────────────────────────────────────

function EditBusinessModal({
  company,
  onClose,
  onUpdated,
  onDeleted,
}: {
  company: { id: string; name: string; machineCount: number };
  onClose: () => void;
  onUpdated: (name: string, machineCount: number) => void;
  onDeleted: () => void;
}) {
  const [tab, setTab] = useState<"edit" | "delete">("edit");

  const [name, setName] = useState(company.name);
  const [machineCount, setMachineCount] = useState(company.machineCount);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [confirmName, setConfirmName] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdate = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setEditError("");
    if (!name.trim()) { setEditError("Business name is required."); return; }
    if (machineCount < 1) { setEditError("At least 1 machine required."); return; }
    setEditLoading(true);
    try {
      await updateCompany(company.id, name.trim(), machineCount);
      onUpdated(name.trim(), machineCount);
      onClose();
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update business.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError("");
    if (confirmName !== company.name) {
      setDeleteError("Business name does not match. Please type it exactly.");
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteCompany(company.id);
      onDeleted();
      onClose();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || "Failed to delete business.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Manage Business</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setTab("edit")}
              className={`flex-1 py-2.5 text-sm font-medium transition ${tab === "edit" ? "text-blue-900 border-b-2 border-blue-900" : "text-gray-400 hover:text-gray-600"}`}
            >
              Edit
            </button>
            <button
              onClick={() => setTab("delete")}
              className={`flex-1 py-2.5 text-sm font-medium transition ${tab === "delete" ? "text-red-600 border-b-2 border-red-500" : "text-gray-400 hover:text-gray-600"}`}
            >
              Delete
            </button>
          </div>

          <div className="px-5 py-5">
            {tab === "edit" ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                {editError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{editError}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                    disabled={editLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Machines</label>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => setMachineCount((v) => Math.max(1, v - 1))}
                      disabled={editLoading || machineCount <= 1}
                      className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition font-bold">
                      −
                    </button>
                    <input type="number" min={1} value={machineCount}
                      onChange={(e) => setMachineCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center px-2 py-2 border border-gray-300 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-900"
                      disabled={editLoading}
                    />
                    <button type="button"
                      onClick={() => setMachineCount((v) => v + 1)}
                      disabled={editLoading}
                      className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition font-bold">
                      +
                    </button>
                    <span className="text-sm text-gray-400">machine{machineCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} disabled={editLoading}
                    className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 transition text-sm font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={editLoading}
                    className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white rounded-lg transition text-sm font-medium">
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Delete this business?</p>
                  <p className="text-xs text-red-600">All data is preserved but this business will be hidden from your account.</p>
                </div>
                {deleteError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{deleteError}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="font-bold text-gray-900">"{company.name}"</span> to confirm
                  </label>
                  <input
                    type="text" value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder="Type business name here"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    disabled={deleteLoading}
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} disabled={deleteLoading}
                    className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 transition text-sm font-medium">
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading || confirmName !== company.name}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg transition text-sm font-medium">
                    {deleteLoading ? "Deleting..." : "Delete Business"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── App Layout ───────────────────────────────────────────────────────────────

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentCompany, setCurrentCompany, refreshCompanies, companies } = useCompany();
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Fixed top header ────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center h-14 px-4 gap-3">

          {/* Logo */}
          <Link href="/dashboard" className="shrink-0">
            <img
              src="/logo-only.png"
              alt="StitchDesk"
              className="h-8 w-8 object-contain rounded-xl bg-blue-900 p-1"
            />
          </Link>

          {/* Business switcher + edit */}
          {currentCompany ? (
            <div className="flex-1 min-w-0 flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <BusinessSwitcher />
              </div>
              <button
                onClick={() => setEditModalOpen(true)}
                title="Edit business"
                className="shrink-0 p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Profile */}
          <ProfileMenu />
        </div>
      </header>

      {/* ── Scrollable main content ──────────────────────────────────────────── */}
      <main
        style={{
          paddingTop: "calc(56px + env(safe-area-inset-top, 0px))",
          paddingBottom: currentCompany
            ? "calc(64px + env(safe-area-inset-bottom, 0px) + 8px)"
            : "calc(8px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="p-3 sm:p-4">
          {children}
        </div>
      </main>

      {/* ── Fixed bottom tab bar ────────────────────────────────────────────── */}
      {currentCompany && (
        <nav
          className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-2px_20px_rgba(0,0,0,0.06)]"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex items-center h-16 px-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1"
                >
                  <div
                    className={[
                      "rounded-2xl px-3.5 py-1.5 transition-all duration-200",
                      active ? item.activePill : "",
                    ].join(" ")}
                  >
                    <span className={`block transition-colors duration-200 ${active ? item.activeIcon : "text-gray-400"}`}>
                      {item.icon}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold transition-colors duration-200 ${
                      active ? item.activeText : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Edit business modal */}
      {editModalOpen && currentCompany && (
        <EditBusinessModal
          company={currentCompany}
          onClose={() => setEditModalOpen(false)}
          onUpdated={async (newName, newMachineCount) => {
            await refreshCompanies();
            const updated = { ...currentCompany, name: newName, machineCount: newMachineCount };
            setCurrentCompany(updated);
          }}
          onDeleted={async () => {
            await refreshCompanies();
            const remaining = companies.filter((c) => c.id !== currentCompany.id);
            if (remaining.length === 0) {
              router.push("/setup");
            } else {
              router.push("/dashboard");
            }
          }}
        />
      )}
    </div>
  );
}
