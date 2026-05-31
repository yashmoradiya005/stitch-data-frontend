"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useCompany } from "@/context/CompanyContext";
import { useTheme } from "@/context/ThemeContext";
import { getEmployees, Employee } from "@/lib/employee";
import { updateStitchEntry, deleteStitchEntry, getDailyStitchData, StitchEntry, getYesterday } from "@/lib/stitchData";
import { AppLayout } from "@/components/AppLayout";
import { t, fmt, money, BONUS_RANGES } from "@/lib/i18n";
import Avatar, { nameToGrad } from "@/components/sd/Avatar";
import Sheet from "@/components/sd/Sheet";
import Modal from "@/components/sd/Modal";
import * as I from "@/components/sd/Icons";

const PAISA_OPTIONS = [1, 1.25, 1.5, 1.75, 2];

// ─── Edit Entry Sheet ─────────────────────────────────────────────────────────

function EditEntrySheet({
  entry, machineCount, employees, onClose, onUpdated,
}: {
  entry: StitchEntry;
  machineCount: number;
  employees: Employee[];
  onClose: () => void;
  onUpdated: (updated: StitchEntry) => void;
}) {
  const { lang } = useTheme();
  const [date, setDate] = useState(entry.date ? entry.date.slice(0, 10) : "");
  const [employeeId, setEmployeeId] = useState(entry.employeeId);
  const [shift, setShift] = useState<"day" | "night">(entry.shift);
  const [machineNo, setMachineNo] = useState(entry.machineNo);
  const [bonusRange, setBonusRange] = useState(entry.bonusRange);
  const [stitchCount, setStitchCount] = useState(String(entry.stitchCount));
  const [stitchPerPaisa, setStitchPerPaisa] = useState(Number(entry.stitchPerPaisa));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const extraBonusCount = useMemo(() => Math.max(0, (parseInt(stitchCount) || 0) - bonusRange), [stitchCount, bonusRange]);
  const bonusEarned = useMemo(() => extraBonusCount * stitchPerPaisa, [extraBonusCount, stitchPerPaisa]);

  const handleSubmit = async () => {
    setError("");
    if (!employeeId) { setError("Please select an employee."); return; }
    if (!stitchCount || parseInt(stitchCount) < 1) { setError("Stitch count must be at least 1."); return; }
    setLoading(true);
    try {
      const updated = await updateStitchEntry(entry.id, {
        employeeId, date, shift, machineNo, bonusRange, stitchCount: parseInt(stitchCount), stitchPerPaisa,
      });
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update entry.");
    } finally { setLoading(false); }
  };

  return (
    <Sheet open onClose={onClose} title={t("edit", lang)} sub={entry.employeeName}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {error && <div style={{ padding: "10px 12px", background: "rgba(239,68,68,.1)", borderRadius: 10, fontSize: 12.5, color: "var(--danger)" }}>{error}</div>}

        <div className="field">
          <label className="label">{t("date", lang)}</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={loading} />
        </div>

        <div className="field">
          <label className="label">{t("employee", lang)}</label>
          <select className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} disabled={loading}
            style={{ appearance: "none", WebkitAppearance: "none" }}>
            <option value="">{t("selectEmployee", lang)}</option>
            {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
        </div>

        <div className="field">
          <label className="label">{t("shift", lang)}</label>
          <div className="seg">
            <button className={"seg__btn" + (shift === "day" ? " on" : "")} onClick={() => setShift("day")}
              style={{ color: shift === "day" ? "var(--gold)" : "var(--mid)" }}>
              <I.sun w={17} /> {t("dayShift", lang)}
            </button>
            <button className={"seg__btn" + (shift === "night" ? " on" : "")} onClick={() => setShift("night")}
              style={{ color: shift === "night" ? "var(--violet)" : "var(--mid)" }}>
              <I.moon w={16} /> {t("nightShift", lang)}
            </button>
          </div>
        </div>

        <div className="field">
          <label className="label">{t("machineNo", lang)}</label>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(machineCount, 6)}, 1fr)`, gap: 7 }}>
            {Array.from({ length: machineCount }, (_, i) => i + 1).map((n) => (
              <button key={n} className={"chip" + (machineNo === n ? " on" : "")}
                style={{ padding: "10px 0", textAlign: "center", justifyContent: "center" }}
                onClick={() => setMachineNo(n)}>{n}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="label">{t("bonusRange", lang)}</label>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {BONUS_RANGES.map((r) => (
              <button key={r} className={"chip" + (bonusRange === r ? " on" : "")} onClick={() => setBonusRange(r)}>{r}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="label">{t("stitchCount", lang)}</label>
          <input className="input big" type="number" inputMode="numeric" value={stitchCount}
            onChange={(e) => setStitchCount(e.target.value)} disabled={loading} />
        </div>

        <div className="field">
          <label className="label">{t("rate", lang)}</label>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {PAISA_OPTIONS.map((r) => (
              <button key={r} className={"chip" + (stitchPerPaisa === r ? " on-gold on" : "")} onClick={() => setStitchPerPaisa(r)}>₹{r}</button>
            ))}
          </div>
        </div>

        <div className="engine" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="dim" style={{ fontSize: 10.5 }}>{t("extraStitches", lang)}: <strong style={{ color: "var(--violet)" }}>{fmt(extraBonusCount, lang)}</strong></span>
            <span className="money num" style={{ fontSize: 18, fontWeight: 700 }}>₹{bonusEarned.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn--ghost" onClick={onClose} disabled={loading}>{t("cancel", lang)}</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : t("saveChanges", lang)}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ entry, onCancel, onConfirm, loading }: {
  entry: StitchEntry;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const { lang } = useTheme();
  return (
    <Modal open onClose={onCancel} maxW={320}>
      <div style={{ padding: 20, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, margin: "0 auto 14px", borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(239,68,68,.12)", color: "var(--danger)" }}>
          <I.trash w={22} />
        </div>
        <h3 className="display" style={{ fontSize: 17, color: "var(--hi)", marginBottom: 8 }}>Delete Entry</h3>
        <p className="muted" style={{ fontSize: 13 }}>
          Delete stitch entry for <strong style={{ color: "var(--hi)" }}>{entry.employeeName}</strong>?
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="btn btn--ghost" onClick={onCancel} disabled={loading}>{t("cancel", lang)}</button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={loading}>{loading ? "Deleting…" : t("delete", lang)}</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Entry Card ───────────────────────────────────────────────────────────────

function EntryCard({ entry, index, onEdit, onDelete, lang }: {
  entry: StitchEntry;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  lang: "en" | "gu";
}) {
  return (
    <div className="row" style={{ borderTop: index ? "1px solid var(--line)" : "none", alignItems: "flex-start", flexDirection: "column", gap: 11 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, width: "100%" }}>
        <Avatar name={entry.employeeName} grad={nameToGrad(entry.employeeName)} size={36} style={{ borderRadius: 12 }} />
        <p style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--hi)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.employeeName}</p>
        <span className="badge badge-mach num">M{entry.machineNo}</span>
        <span className={"badge " + (entry.shift === "day" ? "badge-day" : "badge-night")}>
          {entry.shift === "day" ? t("day", lang) : t("night", lang)}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, width: "100%" }}>
        {[
          { k: t("stitch", lang), v: fmt(entry.stitchCount, lang), c: "var(--hi)", bg: "var(--s2)" },
          { k: t("extra", lang), v: fmt(entry.extraBonusCount, lang), c: "var(--violet)", bg: "var(--violet-soft)" },
          { k: t("bonus", lang), v: money(Number(entry.bonusEarned), lang), c: "var(--gold)", bg: "var(--gold-soft)" },
        ].map((b, j) => (
          <div key={j} style={{ flex: 1, background: b.bg, borderRadius: 13, padding: "8px 4px", textAlign: "center" }}>
            <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--low)", marginBottom: 3 }}>{b.k}</p>
            <p className="num" style={{ fontSize: 13.5, fontWeight: 700, color: b.c }}>{b.v}</p>
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button className="icon-btn" style={{ width: 32, height: 24, color: "var(--violet)" }} onClick={onEdit}><I.edit w={15} /></button>
          <button className="icon-btn" style={{ width: 32, height: 24, color: "var(--danger)" }} onClick={onDelete}><I.trash w={15} /></button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StitchDataPage() {
  const router = useRouter();
  const { currentCompany } = useCompany();
  const { lang } = useTheme();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<StitchEntry[]>([]);
  const [viewDate, setViewDate] = useState(getYesterday());
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [editEntry, setEditEntry] = useState<StitchEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StitchEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { if (!isAuthenticated()) { router.push("/login"); } }, [router]);

  useEffect(() => {
    if (!currentCompany) return;
    getEmployees(currentCompany.id, { includeImages: false }).then(setEmployees).catch(() => setEmployees([]));
  }, [currentCompany]);

  useEffect(() => {
    if (!currentCompany) return;
    setLoadingEntries(true);
    getDailyStitchData(currentCompany.id, viewDate)
      .then(setEntries).catch(() => setEntries([]))
      .finally(() => setLoadingEntries(false));
  }, [currentCompany, viewDate]);

  const handleUpdated = (updated: StitchEntry) => {
    if (updated.date !== viewDate) {
      setEntries((prev) => prev.filter((e) => e.id !== updated.id));
    } else {
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      getDailyStitchData(currentCompany!.id, viewDate).then(setEntries).catch(() => {});
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteStitchEntry(deleteTarget.id);
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch { } finally { setDeleteLoading(false); }
  };

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  function shiftDate(days: number) {
    const d = new Date(viewDate + "T00:00:00");
    d.setDate(d.getDate() + days);
    setViewDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }

  const totalStitch = entries.reduce((s, e) => s + e.stitchCount, 0);
  const totalBonus = entries.reduce((s, e) => s + Number(e.bonusEarned), 0);

  const dateDisplay = (() => {
    if (viewDate === today) return t("today", lang);
    if (viewDate === getYesterday()) return t("yesterday", lang);
    return new Date(viewDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  })();

  return (
    <AppLayout>
      <div className="screen">
        {/* Title */}
        <div style={{ padding: "6px 2px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 6 }}>{t("dailyProduction", lang)}</p>
            <h1 className="page-title">{t("production", lang)}</h1>
          </div>
        </div>

        {/* Date navigator */}
        <div className="card" style={{ padding: 8, display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
          <button className="icon-btn" onClick={() => shiftDate(-1)}><I.chevLeft w={16} /></button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <p className="dim" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase" }}>{t("date", lang)}</p>
            <p className="num" style={{ fontSize: 14, fontWeight: 700, color: "var(--hi)", marginTop: 2 }}>{dateDisplay}</p>
          </div>
          <button className="icon-btn" onClick={() => shiftDate(1)} disabled={viewDate >= today}><I.chevRight w={16} /></button>
        </div>

        {/* Summary tiles */}
        <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 13 }}>
          {[
            { k: t("entries", lang), v: fmt(entries.length, lang), c: "c-hi" },
            { k: t("stitch", lang), v: fmt(totalStitch, lang), c: "c-violet" },
            { k: t("bonus", lang), v: money(totalBonus, lang), c: "money" },
          ].map((s, i) => (
            <div className="tile" key={i} style={{ padding: "12px 11px" }}>
              <div className="k">{s.k}</div>
              <div className={"v num " + s.c} style={{ fontSize: 20 }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Entry list */}
        <div className="card flush">
          {loadingEntries ? (
            [0, 1, 2].map((i) => (
              <div key={i} style={{ padding: "14px 16px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <div className="skel" style={{ height: 14, width: "60%", borderRadius: 5, marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <div className="skel" style={{ flex: 1, height: 44, borderRadius: 10 }} />
                  <div className="skel" style={{ flex: 1, height: 44, borderRadius: 10 }} />
                  <div className="skel" style={{ flex: 1, height: 44, borderRadius: 10 }} />
                </div>
              </div>
            ))
          ) : entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 20px" }}>
              <p className="muted" style={{ marginBottom: 6 }}>{t("noEntries", lang)}</p>
              <p className="dim" style={{ fontSize: 12 }}>Use the + button to log a stitch entry</p>
            </div>
          ) : entries.map((e, i) => (
            <EntryCard key={e.id} entry={e} index={i} lang={lang}
              onEdit={() => setEditEntry(e)}
              onDelete={() => setDeleteTarget(e)} />
          ))}
        </div>
      </div>

      {editEntry && currentCompany && (
        <EditEntrySheet
          entry={editEntry}
          machineCount={currentCompany.machineCount}
          employees={employees}
          onClose={() => setEditEntry(null)}
          onUpdated={handleUpdated}
        />
      )}

      {deleteTarget && (
        <DeleteModal entry={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} />
      )}
    </AppLayout>
  );
}
