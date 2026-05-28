"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useCompany } from "@/context/CompanyContext";
import { getEmployees, Employee } from "@/lib/employee";
import { createStitchEntry, updateStitchEntry, deleteStitchEntry, getDailyStitchData, StitchEntry, getYesterday } from "@/lib/stitchData";
import { AppLayout } from "@/components/AppLayout";

const BONUS_RANGES = [200, 250, 300, 350, 400];
const PAISA_OPTIONS = [1, 1.25, 1.5, 1.75, 2];

// ─── Add Stitch Modal ─────────────────────────────────────────────────────────

function AddStitchModal({
  companyId,
  machineCount,
  employees,
  onClose,
  onSaved,
}: {
  companyId: string;
  machineCount: number;
  employees: Employee[];
  onClose: () => void;
  onSaved: (entry: StitchEntry) => void;
}) {
  const [date, setDate] = useState(getYesterday());
  const [employeeId, setEmployeeId] = useState("");
  const [shift, setShift] = useState<"day" | "night">("day");
  const [machineNo, setMachineNo] = useState(1);
  const [bonusRange, setBonusRange] = useState(200);
  const [stitchCount, setStitchCount] = useState("");
  const [stitchPerPaisa, setStitchPerPaisa] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const extraBonusCount = useMemo(() => Math.max(0, (parseInt(stitchCount) || 0) - bonusRange), [stitchCount, bonusRange]);
  const bonusEarned = useMemo(() => extraBonusCount * stitchPerPaisa, [extraBonusCount, stitchPerPaisa]);
  const machineOptions = Array.from({ length: machineCount }, (_, i) => i + 1);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    if (!employeeId) { setError("Please select an employee."); return; }
    if (!stitchCount || parseInt(stitchCount) < 1) { setError("Stitch count must be at least 1."); return; }
    setLoading(true);
    try {
      const entry = await createStitchEntry({ companyId, employeeId, date, shift, machineNo, bonusRange, stitchCount: parseInt(stitchCount), stitchPerPaisa });
      onSaved(entry);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save entry.");
    } finally {
      setLoading(false);
    }
  };

  const selectCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none bg-white";
  const inputCls  = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-base font-bold text-gray-900">Add Stitch Entry</h2>
              <p className="text-xs text-gray-400 mt-0.5">Log production data for an employee</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} disabled={loading} /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Employee</label>
                <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={selectCls} disabled={loading}>
                  <option value="">Select employee</option>
                  {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Shift</label>
                <select value={shift} onChange={(e) => setShift(e.target.value as "day" | "night")} className={selectCls} disabled={loading}>
                  <option value="day">☀️ Day</option>
                  <option value="night">🌙 Night</option>
                </select></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Machine No</label>
                <select value={machineNo} onChange={(e) => setMachineNo(Number(e.target.value))} className={selectCls} disabled={loading}>
                  {machineOptions.map((n) => <option key={n} value={n}>Machine {n}</option>)}
                </select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Bonus Range</label>
                <select value={bonusRange} onChange={(e) => setBonusRange(Number(e.target.value))} className={selectCls} disabled={loading}>
                  {BONUS_RANGES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Stitch Count</label>
                <input type="number" min={1} value={stitchCount} onChange={(e) => setStitchCount(e.target.value)} placeholder="e.g. 350" className={inputCls} disabled={loading} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Extra Bonus Count</label>
                <input type="number" value={extraBonusCount} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-bold outline-none cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Stitch − Bonus Range (min 0)</p></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Stitch Per Paisa</label>
                <select value={stitchPerPaisa} onChange={(e) => setStitchPerPaisa(Number(e.target.value))} className={selectCls} disabled={loading}>
                  {PAISA_OPTIONS.map((v) => <option key={v} value={v}>₹{v}</option>)}
                </select></div>
            </div>
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl px-5 py-4 flex items-center justify-between text-white">
              <div>
                <p className="text-blue-200 text-xs font-medium">Bonus Earned</p>
                <p className="text-2xl font-black mt-0.5">₹{bonusEarned.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:border-gray-400 transition text-sm font-medium">
              Cancel
            </button>
            <button onClick={handleSubmit as any} disabled={loading}
              className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white rounded-xl transition text-sm font-semibold">
              {loading ? "Saving..." : "Submit Entry"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Edit Entry Modal ─────────────────────────────────────────────────────────

function EditEntryModal({
  entry,
  machineCount,
  employees,
  onClose,
  onUpdated,
}: {
  entry: StitchEntry;
  machineCount: number;
  employees: Employee[];
  onClose: () => void;
  onUpdated: (updated: StitchEntry) => void;
}) {
  const [date, setDate] = useState(entry.date ? entry.date.slice(0, 10) : "");
  const [employeeId, setEmployeeId] = useState(entry.employeeId);
  const [shift, setShift] = useState<"day" | "night">(entry.shift);
  const [machineNo, setMachineNo] = useState(entry.machineNo);
  const [bonusRange, setBonusRange] = useState(entry.bonusRange);
  const [stitchCount, setStitchCount] = useState(String(entry.stitchCount));
  const [stitchPerPaisa, setStitchPerPaisa] = useState(Number(entry.stitchPerPaisa));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const machineOptions = Array.from({ length: machineCount }, (_, i) => i + 1);
  const extraBonusCount = useMemo(() => Math.max(0, (parseInt(stitchCount) || 0) - bonusRange), [stitchCount, bonusRange]);
  const bonusEarned = useMemo(() => extraBonusCount * stitchPerPaisa, [extraBonusCount, stitchPerPaisa]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    if (!employeeId) { setError("Please select an employee."); return; }
    if (!stitchCount || parseInt(stitchCount) < 1) { setError("Stitch count must be at least 1."); return; }
    setLoading(true);
    try {
      const updated = await updateStitchEntry(entry.id, {
        employeeId, date, shift, machineNo,
        bonusRange, stitchCount: parseInt(stitchCount), stitchPerPaisa,
      });
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update entry.");
    } finally {
      setLoading(false);
    }
  };

  const selectCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none bg-white";
  const inputCls  = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-base font-bold text-gray-900">Edit Entry</h2>
              <p className="text-xs text-gray-400 mt-0.5">{entry.employeeName}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} disabled={loading} /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Employee</label>
                <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={selectCls} disabled={loading}>
                  <option value="">Select employee</option>
                  {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Shift</label>
                <select value={shift} onChange={(e) => setShift(e.target.value as "day" | "night")} className={selectCls} disabled={loading}>
                  <option value="day">☀️ Day</option>
                  <option value="night">🌙 Night</option>
                </select></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Machine No</label>
                <select value={machineNo} onChange={(e) => setMachineNo(Number(e.target.value))} className={selectCls} disabled={loading}>
                  {machineOptions.map((n) => <option key={n} value={n}>Machine {n}</option>)}
                </select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Bonus Range</label>
                <select value={bonusRange} onChange={(e) => setBonusRange(Number(e.target.value))} className={selectCls} disabled={loading}>
                  {BONUS_RANGES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Stitch Count</label>
                <input type="number" min={1} value={stitchCount} onChange={(e) => setStitchCount(e.target.value)} className={inputCls} disabled={loading} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Extra Bonus Count</label>
                <input type="number" value={extraBonusCount} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-bold outline-none cursor-not-allowed" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Stitch Per Paisa</label>
                <select value={stitchPerPaisa} onChange={(e) => setStitchPerPaisa(Number(e.target.value))} className={selectCls} disabled={loading}>
                  {PAISA_OPTIONS.map((v) => <option key={v} value={v}>₹{v}</option>)}
                </select></div>
            </div>
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl px-5 py-4 flex items-center justify-between text-white">
              <div>
                <p className="text-blue-200 text-xs font-medium">Bonus Earned</p>
                <p className="text-2xl font-black mt-0.5">₹{bonusEarned.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:border-gray-400 transition text-sm font-medium">
              Cancel
            </button>
            <button onClick={handleSubmit as any} disabled={loading}
              className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white rounded-xl transition text-sm font-semibold">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Entry Row ────────────────────────────────────────────────────────────────

function EntryRow({
  entry, index, onEdit, onDelete,
}: {
  entry: StitchEntry;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isDay = entry.shift === "day";
  return (
    <div className="grid grid-cols-[28px_1fr_60px_60px_70px_70px_80px_72px] items-center gap-2 px-4 py-3 hover:bg-gray-50 transition text-sm border-b border-gray-50 last:border-0 group">
      <span className="text-xs text-gray-400 font-medium text-center">{index + 1}</span>
      <span className="font-medium text-gray-800 truncate">{entry.employeeName}</span>
      <span className="text-center text-gray-600 font-medium">M-{entry.machineNo}</span>
      <span className={`text-center text-xs font-semibold px-1.5 py-0.5 rounded-md ${isDay ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-700"}`}>
        {isDay ? "Day" : "Night"}
      </span>
      <span className="text-center font-semibold text-gray-800">{entry.stitchCount.toLocaleString()}</span>
      <span className="text-center font-semibold text-violet-700">{entry.extraBonusCount.toLocaleString()}</span>
      <span className="text-right font-bold text-blue-900">₹{Number(entry.bonusEarned).toFixed(2)}</span>
      {/* Actions */}
      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-900 hover:bg-blue-50 transition"
          title="Edit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
          title="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StitchDataPage() {
  const router = useRouter();
  const { currentCompany } = useCompany();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<StitchEntry[]>([]);
  const [viewDate, setViewDate] = useState(getYesterday());
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<StitchEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StitchEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { if (!isAuthenticated()) { router.push("/login"); } }, [router]);

  useEffect(() => {
    if (!currentCompany) return;
    getEmployees(currentCompany.id).then(setEmployees).catch(() => setEmployees([]));
  }, [currentCompany]);

  useEffect(() => {
    if (!currentCompany) return;
    setLoadingEntries(true);
    getDailyStitchData(currentCompany.id, viewDate)
      .then(setEntries).catch(() => setEntries([]))
      .finally(() => setLoadingEntries(false));
  }, [currentCompany, viewDate]);

  const handleSaved = (entry: StitchEntry) => {
    if (entry.date === viewDate) setEntries((prev) => [entry, ...prev]);
  };

  const handleUpdated = (updated: StitchEntry) => {
    if (updated.date !== viewDate) {
      // Entry moved to a different date — remove it from current view
      setEntries((prev) => prev.filter((e) => e.id !== updated.id));
    } else {
      // Same date — replace in-place then re-fetch to get server-fresh values
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      getDailyStitchData(currentCompany!.id, viewDate)
        .then(setEntries)
        .catch(() => {});
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteStitchEntry(deleteTarget.id);
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // keep modal open
    } finally {
      setDeleteLoading(false);
    }
  };

  const shiftDate = (days: number) => {
    const d = new Date(viewDate + "T00:00:00");
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setViewDate(`${y}-${m}-${day}`);
  };

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const totalBonus = entries.reduce((s, e) => s + Number(e.bonusEarned), 0);
  const totalStitch = entries.reduce((s, e) => s + e.stitchCount, 0);

  const displayDate = new Date(viewDate + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <AppLayout>
      <div className="max-w-5xl w-full mx-auto space-y-4">

        {/* Hero header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-violet-800 rounded-2xl px-5 py-6 text-white">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-blue-200 text-xs font-medium uppercase tracking-widest">Daily Production</p>
              <h1 className="text-xl sm:text-2xl font-black mt-1 uppercase">Stitch Data</h1>
              <p className="text-blue-200 text-sm mt-0.5 truncate">{currentCompany?.name}</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-900 rounded-xl font-semibold text-sm hover:bg-blue-50 transition shrink-0 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Entry</span>
            </button>
          </div>
        </div>

        {/* Date + summary bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-50 rounded-2xl p-1 border border-gray-100">
              {/* Prev day */}
              <button
                onClick={() => shiftDate(-1)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-blue-900 hover:text-white border border-gray-200 hover:border-blue-900 flex items-center justify-center text-gray-400 transition shadow-sm shrink-0"
                title="Previous day"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Date input — pill style */}
              <div className="flex flex-col items-center px-3">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest leading-none mb-0.5">Viewing</p>
                <input
                  type="date" value={viewDate}
                  onChange={(e) => setViewDate(e.target.value)}
                  className="text-sm font-bold text-blue-900 outline-none border-none bg-transparent cursor-pointer text-center"
                />
              </div>

              {/* Next day */}
              <button
                onClick={() => shiftDate(1)}
                disabled={viewDate >= today}
                className="w-8 h-8 rounded-xl bg-white hover:bg-blue-900 hover:text-white border border-gray-200 hover:border-blue-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-400 transition shadow-sm shrink-0"
                title="Next day"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {entries.length > 0 && (
              <div className="flex gap-3 sm:ml-auto">
                <div className="flex-1 sm:flex-none text-center bg-gray-50 rounded-xl px-4 py-2">
                  <p className="text-xs text-gray-400">Entries</p>
                  <p className="text-base font-black text-gray-800">{entries.length}</p>
                </div>
                <div className="flex-1 sm:flex-none text-center bg-violet-50 rounded-xl px-4 py-2">
                  <p className="text-xs text-violet-400">Total Stitch</p>
                  <p className="text-base font-black text-violet-800">{totalStitch.toLocaleString()}</p>
                </div>
                <div className="flex-1 sm:flex-none text-center bg-blue-50 rounded-xl px-4 py-2">
                  <p className="text-xs text-blue-400">Total Bonus</p>
                  <p className="text-base font-black text-blue-900">₹{totalBonus.toFixed(0)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Entries list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Entries</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{displayDate}</p>
            </div>
            {entries.length > 0 && (
              <span className="px-2.5 py-1 bg-blue-900 text-white text-xs font-bold rounded-full">
                {entries.length}
              </span>
            )}
          </div>

          {entries.length === 0 && !loadingEntries ? (
            <div className="py-14 flex flex-col items-center text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 font-semibold text-sm">No entries for this date</p>
              <p className="text-gray-400 text-xs mt-1 mb-5">Log production output for your team.</p>
              <button onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Entry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Table header */}
              <div className="grid grid-cols-[28px_1fr_60px_60px_70px_70px_80px_72px] min-w-[530px] items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <span className="text-center">#</span>
                <span>Employee</span>
                <span className="text-center">Machine</span>
                <span className="text-center">Shift</span>
                <span className="text-center">Stitch</span>
                <span className="text-center">Extra</span>
                <span className="text-right">Bonus</span>
                <span></span>
              </div>
              {loadingEntries ? (
                <div className="divide-y divide-gray-50 min-w-[530px]">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-4 animate-pulse">
                      <div className="w-6 h-3 bg-gray-100 rounded shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-gray-100 rounded w-1/3" />
                        <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                      </div>
                      <div className="h-8 w-16 bg-gray-100 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="min-w-[530px]">
                  {entries.map((entry, i) => (
                    <EntryRow
                      key={entry.id}
                      entry={entry}
                      index={i}
                      onEdit={() => setEditEntry(entry)}
                      onDelete={() => setDeleteTarget(entry)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {modalOpen && currentCompany && (
        <AddStitchModal
          companyId={currentCompany.id}
          machineCount={currentCompany.machineCount}
          employees={employees}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {editEntry && currentCompany && (
        <EditEntryModal
          entry={editEntry}
          machineCount={currentCompany.machineCount}
          employees={employees}
          onClose={() => setEditEntry(null)}
          onUpdated={handleUpdated}
        />
      )}

      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Delete Entry</h3>
                  <p className="text-sm text-gray-400">This cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Delete stitch entry for <span className="font-semibold text-gray-800">{deleteTarget.employeeName}</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} disabled={deleteLoading}
                  className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-xl hover:border-gray-400 transition text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleteLoading}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-xl transition text-sm font-medium">
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
