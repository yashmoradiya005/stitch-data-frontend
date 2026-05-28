"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCompany } from "@/context/CompanyContext";
import { useUser } from "@/context/UserContext";
import { logout } from "@/lib/auth";
import { updateCompany, deleteCompany } from "@/lib/company";
import { getEmployees } from "@/lib/employee";
import type { Employee } from "@/lib/employee";
import { createStitchEntry } from "@/lib/stitchData";

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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

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
        className="flex items-center p-0.5 rounded-full hover:opacity-80 transition active:scale-95"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-300 to-violet-400 text-white flex items-center justify-center text-sm font-bold shrink-0 ring-2 ring-white/40 shadow-lg">
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
                {editError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{editError}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                    disabled={editLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Machines</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setMachineCount((v) => Math.max(1, v - 1))} disabled={editLoading || machineCount <= 1}
                      className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition font-bold">−</button>
                    <input type="number" min={1} value={machineCount} onChange={(e) => setMachineCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center px-2 py-2 border border-gray-300 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-900" disabled={editLoading} />
                    <button type="button" onClick={() => setMachineCount((v) => v + 1)} disabled={editLoading}
                      className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition font-bold">+</button>
                    <span className="text-sm text-gray-400">machine{machineCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} disabled={editLoading}
                    className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 transition text-sm font-medium">Cancel</button>
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
                {deleteError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{deleteError}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="font-bold text-gray-900">"{company.name}"</span> to confirm
                  </label>
                  <input type="text" value={confirmName} onChange={(e) => setConfirmName(e.target.value)}
                    placeholder="Type business name here"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    disabled={deleteLoading} />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} disabled={deleteLoading}
                    className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 transition text-sm font-medium">Cancel</button>
                  <button onClick={handleDelete} disabled={deleteLoading || confirmName !== company.name}
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

// ─── Quick Add Modal ──────────────────────────────────────────────────────────

function QuickAddModal({ open, onClose, companyId }: { open: boolean; onClose: () => void; companyId: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState<"day" | "night">("day");
  const [machineNo, setMachineNo] = useState(1);
  const [stitchCount, setStitchCount] = useState("");
  const [bonusRange, setBonusRange] = useState("");
  const [stitchPerPaisa, setStitchPerPaisa] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open && companyId) {
      getEmployees(companyId).then(setEmployees).catch(() => {});
    }
    if (!open) {
      setEmployeeId("");
      setDate(new Date().toISOString().slice(0, 10));
      setShift("day");
      setMachineNo(1);
      setStitchCount("");
      setBonusRange("");
      setStitchPerPaisa("");
      setError("");
      setSuccess(false);
      setLoading(false);
    }
  }, [open, companyId]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    if (!employeeId) { setError("Please select an employee."); return; }
    const sc = parseInt(stitchCount);
    const br = parseInt(bonusRange);
    const spp = parseInt(stitchPerPaisa);
    if (!stitchCount || sc < 1) { setError("Enter a valid stitch count."); return; }
    if (bonusRange === "" || br < 0) { setError("Enter a valid bonus range."); return; }
    if (!stitchPerPaisa || spp < 1) { setError("Enter a valid rate."); return; }
    setLoading(true);
    try {
      await createStitchEntry({ companyId, employeeId, date, shift, machineNo, bonusRange: br, stitchCount: sc, stitchPerPaisa: spp });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployee = employees.find((e) => e.id === employeeId);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 inset-x-0 z-[70] transition-transform duration-300 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

          {/* Sheet header */}
          <div className="relative bg-gradient-to-r from-blue-950 via-blue-900 to-violet-900 px-5 pt-6 pb-5 shrink-0">
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-t-3xl">
              <div className="absolute -top-6 left-1/4 w-40 h-24 bg-blue-500/20 rounded-full blur-2xl" />
              <div className="absolute -top-4 right-1/4 w-32 h-20 bg-violet-500/20 rounded-full blur-2xl" />
            </div>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/30" />
            <div className="flex items-start justify-between relative">
              <div>
                <h2 className="text-lg font-bold text-white">Log Stitch Entry</h2>
                <p className="text-xs text-blue-300 mt-0.5">Record your production data</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-200 hover:bg-white/20 transition active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {success ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Entry Logged!</h3>
                {selectedEmployee && <p className="text-sm text-gray-500 mb-2">{selectedEmployee.name}</p>}
                <p className="text-3xl font-black text-blue-900">{parseInt(stitchCount).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mb-8 mt-1">stitches recorded</p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setEmployeeId("");
                      setStitchCount("");
                      setBonusRange("");
                      setDate(new Date().toISOString().slice(0, 10));
                      setShift("day");
                      setMachineNo(1);
                    }}
                    className="flex-1 py-3 border border-blue-200 text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-50 transition active:scale-95"
                  >
                    Add Another
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold text-sm active:scale-95 transition-transform"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4 pb-6">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                )}

                {/* Employee */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Employee</label>
                  <div className="relative">
                    <select
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none pr-10"
                    >
                      <option value="">Select employee...</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Date + Shift */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Date</label>
                    <input
                      type="date" value={date} onChange={(e) => setDate(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="shrink-0">
                    <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Shift</label>
                    <div className="flex rounded-xl border border-gray-200 bg-gray-50 h-[46px] overflow-hidden">
                      <button
                        type="button" onClick={() => setShift("day")} disabled={loading}
                        className={`flex items-center gap-1.5 px-3.5 transition-colors ${shift === "day" ? "bg-blue-600 text-white" : "text-gray-400"}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="12" r="4" />
                          <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                        </svg>
                        <span className="text-xs font-semibold">Day</span>
                      </button>
                      <button
                        type="button" onClick={() => setShift("night")} disabled={loading}
                        className={`flex items-center gap-1.5 px-3.5 transition-colors ${shift === "night" ? "bg-violet-600 text-white" : "text-gray-400"}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <span className="text-xs font-semibold">Night</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Machine No */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Machine No.</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setMachineNo((v) => Math.max(1, v - 1))} disabled={loading || machineNo <= 1}
                      className="w-11 h-11 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition font-bold text-xl">
                      −
                    </button>
                    <div className="flex-1 h-11 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center">
                      <span className="text-base font-bold text-gray-900">{machineNo}</span>
                    </div>
                    <button type="button" onClick={() => setMachineNo((v) => v + 1)} disabled={loading}
                      className="w-11 h-11 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition font-bold text-xl">
                      +
                    </button>
                  </div>
                </div>

                {/* Stitch Count + Bonus Range */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Stitch Count</label>
                    <input
                      type="number" min={0} value={stitchCount} onChange={(e) => setStitchCount(e.target.value)}
                      placeholder="0" disabled={loading}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Bonus Range</label>
                    <input
                      type="number" min={0} value={bonusRange} onChange={(e) => setBonusRange(e.target.value)}
                      placeholder="0" disabled={loading}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Rate */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Rate (Paisa / stitch)</label>
                  <input
                    type="number" min={1} value={stitchPerPaisa} onChange={(e) => setStitchPerPaisa(e.target.value)}
                    placeholder="e.g. 2" disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold text-base shadow-lg shadow-violet-500/25 disabled:opacity-60 active:scale-95 transition-transform"
                >
                  {loading ? "Saving..." : "Log Entry"}
                </button>
              </form>
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
  const { user } = useUser();
  const router = useRouter();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [companySwitcherOpen, setCompanySwitcherOpen] = useState(false);
  const companySwitcherRef = useRef<HTMLDivElement>(null);

  const greeting = getGreeting();
  const firstName = user?.name?.split(" ")[0] ?? "";

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (companySwitcherRef.current && !companySwitcherRef.current.contains(e.target as Node)) {
        setCompanySwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Gradient header ─────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 inset-x-0 z-40"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="relative h-14 bg-gradient-to-r from-blue-950 via-blue-900 to-violet-900 flex items-center px-4 gap-3">
          {/* Decorative glow orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-8 left-1/4 w-48 h-28 bg-blue-500/25 rounded-full blur-3xl" />
            <div className="absolute -top-6 right-1/5 w-36 h-24 bg-violet-500/25 rounded-full blur-3xl" />
          </div>

          {/* Logo */}
          <Link href="/dashboard" className="shrink-0 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
              <img src="/logo-only.png" alt="StitchDesk" className="h-6 w-6 object-contain" />
            </div>
          </Link>

          {/* Greeting + inline company switcher */}
          <div className="flex-1 min-w-0 relative z-10" ref={companySwitcherRef}>
            {currentCompany ? (
              <>
                <button
                  onClick={() => companies.length > 1 && setCompanySwitcherOpen((v) => !v)}
                  className="flex flex-col items-start w-full min-w-0 active:opacity-70 transition-opacity"
                >
                  <span className="text-[10px] text-blue-300/90 font-medium leading-none mb-0.5 tracking-wide">
                    {greeting}{firstName ? `, ${firstName}` : ""}
                  </span>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-sm font-bold text-white truncate leading-tight">
                      {currentCompany.name}
                    </span>
                    {companies.length > 1 && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-3.5 h-3.5 text-blue-300 shrink-0 transition-transform duration-200 ${companySwitcherOpen ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Company dropdown */}
                {companySwitcherOpen && companies.length > 1 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    {companies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => { setCurrentCompany(company); setCompanySwitcherOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition text-left ${company.id === currentCompany.id ? "bg-blue-50" : ""}`}
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${company.id === currentCompany.id ? "bg-blue-600" : "bg-gray-300"}`} />
                        <span className={`text-sm font-medium ${company.id === currentCompany.id ? "text-blue-900" : "text-gray-700"}`}>
                          {company.name}
                        </span>
                        {company.id === currentCompany.id && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-300/90 font-medium leading-none mb-0.5">{greeting}</span>
                <span className="text-sm font-bold text-white">StitchDesk</span>
              </div>
            )}
          </div>

          {/* Edit business button */}
          {currentCompany && (
            <button
              onClick={() => setEditModalOpen(true)}
              title="Manage business"
              className="relative z-10 shrink-0 w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-blue-200 hover:bg-white/20 active:scale-90 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {/* Profile avatar */}
          <div className="relative z-10 shrink-0">
            <ProfileMenu />
          </div>
        </div>
      </header>

      {/* ── Scrollable main content ──────────────────────────────────────────── */}
      <main
        style={{
          paddingTop: "calc(56px + env(safe-area-inset-top, 0px))",
          paddingBottom: currentCompany
            ? "calc(72px + env(safe-area-inset-bottom, 0px) + 8px)"
            : "calc(8px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="p-3 sm:p-4">
          {children}
        </div>
      </main>

      {/* ── Center FAB ──────────────────────────────────────────────────────── */}
      {currentCompany && (
        <button
          onClick={() => setQuickAddOpen(true)}
          className="fixed left-1/2 -translate-x-1/2 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-2xl shadow-violet-500/50 flex items-center justify-center border-[3px] border-white active:scale-90 transition-transform"
          style={{ bottom: "calc(66px + env(safe-area-inset-bottom, 0px))" }}
          aria-label="Add stitch entry"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* ── Fixed bottom tab bar ────────────────────────────────────────────── */}
      {currentCompany && (
        <nav
          className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-2px_20px_rgba(0,0,0,0.06)]"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex items-end h-16 px-1">
            {/* First 2 tabs */}
            {navItems.slice(0, 2).map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1">
                  <div className={`rounded-2xl px-3.5 py-1.5 transition-all duration-200 ${active ? item.activePill : ""}`}>
                    <span className={`block transition-colors duration-200 ${active ? item.activeIcon : "text-gray-400"}`}>
                      {item.icon}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold transition-colors duration-200 ${active ? item.activeText : "text-gray-400"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Center spacer for FAB */}
            <div className="w-16 shrink-0 flex flex-col items-center justify-end pb-2">
              <span className="text-[10px] font-semibold text-violet-500">Add</span>
            </div>

            {/* Last 2 tabs */}
            {navItems.slice(2).map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1">
                  <div className={`rounded-2xl px-3.5 py-1.5 transition-all duration-200 ${active ? item.activePill : ""}`}>
                    <span className={`block transition-colors duration-200 ${active ? item.activeIcon : "text-gray-400"}`}>
                      {item.icon}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold transition-colors duration-200 ${active ? item.activeText : "text-gray-400"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* ── Edit business modal ──────────────────────────────────────────────── */}
      {editModalOpen && currentCompany && (
        <EditBusinessModal
          company={currentCompany}
          onClose={() => setEditModalOpen(false)}
          onUpdated={async (newName, newMachineCount) => {
            await refreshCompanies();
            setCurrentCompany({ ...currentCompany, name: newName, machineCount: newMachineCount });
          }}
          onDeleted={async () => {
            await refreshCompanies();
            const remaining = companies.filter((c) => c.id !== currentCompany.id);
            router.push(remaining.length === 0 ? "/setup" : "/dashboard");
          }}
        />
      )}

      {/* ── Quick add modal ──────────────────────────────────────────────────── */}
      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        companyId={currentCompany?.id ?? ""}
      />
    </div>
  );
}
