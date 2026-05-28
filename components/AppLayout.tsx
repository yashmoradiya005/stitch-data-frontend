"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BusinessSwitcher } from "./BusinessSwitcher";
import { useCompany } from "@/context/CompanyContext";
import { useUser } from "@/context/UserContext";
import { logout } from "@/lib/auth";
import { updateCompany, deleteCompany } from "@/lib/company";

const sidebarItems = [
  {
    label: "Overview",
    href: "/dashboard",
    activeBar: "bg-blue-400",
    activeIcon: "text-blue-300",
    activeDot: "bg-blue-400",
    activeBg: "bg-blue-500/15",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Employees",
    href: "/employees",
    activeBar: "bg-sky-400",
    activeIcon: "text-sky-300",
    activeDot: "bg-sky-400",
    activeBg: "bg-sky-500/15",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Daily Stitch Data",
    href: "/stitch-data",
    activeBar: "bg-violet-400",
    activeIcon: "text-violet-300",
    activeDot: "bg-violet-400",
    activeBg: "bg-violet-500/15",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Reports",
    href: "/reports",
    activeBar: "bg-emerald-400",
    activeIcon: "text-emerald-300",
    activeDot: "bg-emerald-400",
    activeBg: "bg-emerald-500/15",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

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
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900 to-violet-700 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
          {initials}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[100px] truncate">
          {user?.name ?? "Profile"}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 text-gray-400 transition-transform hidden sm:block ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
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

  // Edit state
  const [name, setName] = useState(company.name);
  const [machineCount, setMachineCount] = useState(company.machineCount);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
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
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Manage Business</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentCompany, setCurrentCompany, refreshCompanies, companies } = useCompany();
  const { user } = useUser();
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Desktop: open by default. Mobile: closed by default.
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") return window.innerWidth >= 768;
    return false;
  });
  // Desktop icon-only collapse — persisted in localStorage so it survives page navigation
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });
  const setCollapsed = (value: boolean) => {
    setSidebarCollapsed(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", String(value));
    }
  };

  // On mobile, close sidebar when navigating
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  const toggle = () => setSidebarOpen((v) => !v);

  return (
    <div className="min-h-screen flex bg-gray-50">

        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        {currentCompany && (
          <>
            {/* Mobile backdrop */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <aside
              className={[
                "fixed inset-y-0 left-0 z-50",
                "md:relative md:inset-auto md:z-auto md:translate-x-0",
                "flex flex-col shrink-0 overflow-hidden",
                "transition-all duration-300 ease-in-out",
                "bg-gradient-to-b from-blue-900 via-blue-800 to-violet-900",
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
                "w-72",
                sidebarCollapsed ? "md:w-16" : "md:w-64",
              ].join(" ")}
            >
              {/* ── Brand row ─────────────────────────────────────────────── */}
              <div className="flex items-center px-3 py-4 border-b border-white/10 shrink-0 h-[68px]">
                <button
                  onClick={() => { setSidebarOpen(false); router.push("/dashboard"); }}
                  className={`flex items-center gap-3 text-left overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "w-0 opacity-0 pointer-events-none" : "flex-1 opacity-100"}`}
                >
                  <img
                    src="/logo-only.png"
                    alt="StitchDesk"
                    className="h-9 w-9 object-contain shrink-0 bg-white rounded-xl p-1"
                  />
                  <div className="flex flex-col min-w-0 overflow-hidden">
                    <span className="text-base font-black tracking-tight text-white leading-none whitespace-nowrap">
                      Stitch<span className="text-blue-300">Desk</span>
                    </span>
                    <span className="text-[9px] font-semibold text-white/50 uppercase tracking-wide whitespace-nowrap mt-0.5">
                      Embroidery Production Suite
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setCollapsed(!sidebarCollapsed)}
                  title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-colors shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="2" y="3" width="20" height="18" rx="2" strokeWidth={1.8} />
                    <line x1="9" y1="3" x2="9" y2="21" strokeWidth={1.8} />
                    <line x1="12" y1="8" x2="19" y2="8" strokeWidth={1.5} strokeLinecap="round" />
                    <line x1="12" y1="12" x2="19" y2="12" strokeWidth={1.5} strokeLinecap="round" />
                    <line x1="12" y1="16" x2="19" y2="16" strokeWidth={1.5} strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* ── Company card ──────────────────────────────────────────── */}
              <div className="px-3 py-4 border-b border-white/10 shrink-0">
                <div className="md:hidden flex items-center justify-between mb-3 overflow-hidden">
                  <div className={`transition-all duration-300 overflow-hidden ${sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100"}`}>
                    <BusinessSwitcher />
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={`p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition shrink-0 ${sidebarCollapsed ? "hidden" : ""}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-black shrink-0 shadow-lg"
                    title={currentCompany.name}
                  >
                    {currentCompany.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`flex items-center gap-2 flex-1 min-w-0 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100"}`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{currentCompany.name}</p>
                      <p className="text-xs text-blue-300 mt-0.5 whitespace-nowrap">{currentCompany.machineCount} machine{currentCompany.machineCount !== 1 ? "s" : ""}</p>
                    </div>
                    <button
                      onClick={() => { setSidebarOpen(false); setEditModalOpen(true); }}
                      title="Edit business"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Navigation ────────────────────────────────────────────── */}
              <nav className="flex-1 px-2 py-4 overflow-y-auto">
                <div className={`overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "max-h-0 opacity-0" : "max-h-8 opacity-100"}`}>
                  <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.12em] px-3 mb-3">Menu</p>
                </div>
                <div className="space-y-1">
                  {sidebarItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={[
                          "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                          active
                            ? `${item.activeBg} text-white shadow-sm`
                            : "text-white/55 hover:bg-white/8 hover:text-white/90",
                        ].join(" ")}
                      >
                        {active && (
                          <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 ${item.activeBar} rounded-r-full transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0" : "opacity-100"}`} />
                        )}
                        <span className={`shrink-0 ${active ? item.activeIcon : "text-white/35"}`}>
                          {item.icon}
                        </span>
                        <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"}`}>
                          {item.label}
                        </span>
                        {active && (
                          <span className={`ml-auto w-1.5 h-1.5 rounded-full ${item.activeDot} shrink-0 transition-all duration-300 ${sidebarCollapsed ? "opacity-0 scale-0" : "opacity-100 scale-100"}`} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* ── User footer ───────────────────────────────────────────── */}
              <div className="px-3 py-3 border-t border-white/10 shrink-0">
                <div className="flex items-center gap-3 px-1">
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0"
                    title={user?.name ?? ""}
                  >
                    {user?.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div className={`flex items-center gap-2 flex-1 min-w-0 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100"}`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white/80 truncate">{user?.name}</p>
                      <p className="text-[10px] text-white/35 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => logout()}
                      title="Logout"
                      className="p-1.5 rounded-lg bg-white/8 hover:bg-red-500/25 text-white/40 hover:text-red-300 transition shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* ── Right column: header + content ──────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Header */}
          <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-5 gap-3 shrink-0 z-30 sticky top-0 shadow-sm">

            {/* Hamburger — mobile only */}
            {currentCompany && (
              <button
                onClick={toggle}
                className="md:hidden relative w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl hover:bg-gray-100 transition shrink-0"
                aria-label="Toggle menu"
              >
                <span className={`block w-5 h-[2px] bg-gray-700 rounded-full transition-all duration-200 ${sidebarOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                <span className={`block w-5 h-[2px] bg-gray-700 rounded-full transition-all duration-200 ${sidebarOpen ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`block w-5 h-[2px] bg-gray-700 rounded-full transition-all duration-200 ${sidebarOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
              </button>
            )}

            {currentCompany && (
              <div className="flex-1 min-w-0">
                <BusinessSwitcher />
              </div>
            )}

            <div className={currentCompany ? "" : "ml-auto"}>
              <ProfileMenu />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 pb-[calc(12px+env(safe-area-inset-bottom))]">
            {children}
          </main>
        </div>

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
