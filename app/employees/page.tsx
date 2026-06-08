"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useCompany } from "@/context/CompanyContext";
import { useTheme } from "@/context/ThemeContext";
import { AppLayout } from "@/components/AppLayout";
import {
  createEmployee, updateEmployee, deleteEmployee, getEmployees,
  getLeaveDays, setLeaveDays, calcSalary,
  toBase64, Employee, SalaryRecord,
} from "@/lib/employee";
import { t, money, nums } from "@/lib/i18n";
import Avatar, { nameToGrad } from "@/components/sd/Avatar";
import Modal from "@/components/sd/Modal";
import * as I from "@/components/sd/Icons";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── ID Card Modal ────────────────────────────────────────────────────────────

function IDCardModal({ employee, onClose, onEdit, onDelete }: {
  employee: Employee;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { lang } = useTheme();
  const grad = nameToGrad(employee.name);
  const joined = new Date(employee.createdAt).toLocaleDateString(lang === "gu" ? "en-IN" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Modal open onClose={onClose} maxW={330}>
      <div style={{ position: "relative", height: 188, borderRadius: "26px 26px 0 0", overflow: "hidden", background: "var(--s2)" }}>
        <div className={"av-grad-" + grad} style={{ position: "absolute", inset: 0, opacity: .95 }} />
        <div className="weave" style={{ position: "absolute", inset: 0 }} />
        <button className="icon-btn" onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,.3)", color: "#fff", border: "none" }}>
          <I.close w={16} />
        </button>
        {employee.imageData && (
          <img src={employee.imageData} alt={employee.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
        )}
        <div style={{ position: "absolute", left: 18, bottom: 16, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,.4)" }}>
          <div style={{ fontSize: 56, fontFamily: "var(--font-display)", lineHeight: 1, opacity: .95 }}>{employee.name.charAt(0)}</div>
          <h2 className="display" style={{ fontSize: 26, marginTop: 4 }}>{employee.name}</h2>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        {[
          { icon: <I.phone w={16} />, v: employee.phone || t("noPhone", lang) },
          { icon: <I.rupee w={16} />, v: employee.salary !== null ? money(employee.salary, lang) + " · " + t("salary", lang).toLowerCase() : t("salary", lang) },
          { icon: <I.calendar w={16} />, v: t("joined", lang) + " " + nums(joined, lang) },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", background: "var(--s2)", borderRadius: 13, marginBottom: 8, color: "var(--mid)" }}>
            <span style={{ color: "var(--violet)" }}>{r.icon}</span>
            <span className="num" style={{ fontSize: 13.5, color: "var(--hi)" }}>{r.v}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button className="btn btn--ghost" onClick={() => { onClose(); onEdit(); }}><I.edit w={16} /> {t("edit", lang)}</button>
          <button className="btn btn--danger" onClick={() => { onClose(); onDelete(); }}><I.trash w={16} /> {t("delete", lang)}</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Employee Drawer (Add / Edit) ─────────────────────────────────────────────

function EmployeeDrawer({
  companyId, employee, onClose, onSaved, onUpdated,
}: {
  companyId: string;
  employee?: Employee;
  onClose: () => void;
  onSaved?: (emp: Employee) => void;
  onUpdated?: (emp: Employee) => void;
}) {
  const { lang } = useTheme();
  const isEdit = !!employee;
  const [name, setName] = useState(employee?.name ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [salary, setSalary] = useState(employee?.salary !== null && employee?.salary !== undefined ? String(employee.salary) : "");
  const [imagePreview, setImagePreview] = useState<string | null>(employee?.imageData ?? null);
  const [imageData, setImageData] = useState<string | null | undefined>(employee?.imageData ?? undefined);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2 MB."); return; }
    const b64 = await toBase64(file);
    setImagePreview(b64);
    setImageData(b64);
    setError("");
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Employee name is required."); return; }
    const salaryValue = salary.trim() === "" ? null : Number(salary);
    if (salaryValue !== null && (!Number.isFinite(salaryValue) || salaryValue < 0)) {
      setError("Salary must be a valid non-negative number."); return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        const updated = await updateEmployee(employee.id, name, phone, salaryValue, imageData);
        onUpdated?.(updated);
      } else {
        const created = await createEmployee(companyId, name, phone, salaryValue, imageData ?? undefined);
        onSaved?.(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? "update" : "add"} employee.`);
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="sheet-backdrop show" onClick={onClose} />
      <div style={{ position: "fixed", right: 0, top: 0, height: "100%", width: "100%", maxWidth: 420, background: "var(--s1)", zIndex: 95, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,.3)" }}>
        <div className="sheet__head" style={{ borderBottom: "1px solid var(--line)", padding: "14px 16px" }}>
          <h3 className="display" style={{ fontSize: 20, color: "var(--hi)" }}>{isEdit ? t("edit", lang) : t("addEmployee", lang)}</h3>
          <button className="icon-btn" onClick={onClose} style={{ background: "var(--s2)" }}><I.close w={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Photo */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div onClick={() => fileRef.current?.click()}
              style={{ width: 88, height: 88, borderRadius: "50%", border: "2px dashed var(--line)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}>
              {imagePreview
                ? <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <Avatar name={name || "?"} grad={nameToGrad(name || "?")} size={88} />
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" style={{ display: "none" }} onChange={handleImage} />
            {imagePreview && (
              <button type="button" className="link" style={{ fontSize: 12, color: "var(--danger)" }} onClick={() => { setImagePreview(null); setImageData(null); }}>
                Remove photo
              </button>
            )}
          </div>

          {error && <div style={{ padding: "10px 12px", background: "rgba(239,68,68,.1)", borderRadius: 10, fontSize: 12.5, color: "var(--danger)" }}>{error}</div>}

          <div className="field">
            <label className="label">{t("name", lang)} <span style={{ color: "var(--danger)" }}>*</span></label>
            <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} required placeholder="e.g. Priya Sharma" />
          </div>
          <div className="field">
            <label className="label">{t("phone", lang)}</label>
            <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} placeholder="+91 98765 43210" />
          </div>
          <div className="field">
            <label className="label">{t("salary", lang)}</label>
            <input className="input" type="number" min={0} step="0.01" value={salary} onChange={(e) => setSalary(e.target.value)} disabled={loading} placeholder="e.g. 15000" />
          </div>
        </form>

        <div style={{ padding: 16, borderTop: "1px solid var(--line)", display: "flex", gap: 10 }}>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={loading}>{t("cancel", lang)}</button>
          <button className="btn btn--primary" onClick={handleSubmit as any} disabled={loading}>
            {loading ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? t("saveChanges", lang) : t("addEmployee", lang))}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ employee, onCancel, onConfirm, loading }: {
  employee: Employee;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const { lang } = useTheme();
  return (
    <Modal open onClose={onCancel} maxW={340}>
      <div style={{ padding: 20, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, margin: "0 auto 14px", borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(239,68,68,.12)", color: "var(--danger)" }}>
          <I.trash w={22} />
        </div>
        <h3 className="display" style={{ fontSize: 18, color: "var(--hi)", marginBottom: 8 }}>{t("deleteEmployee", lang)}</h3>
        <p className="muted" style={{ fontSize: 13 }}>
          {t("confirmDelete", lang)} <strong style={{ color: "var(--hi)" }}>{employee.name}</strong>?
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="btn btn--ghost" onClick={onCancel} disabled={loading}>{t("cancel", lang)}</button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={loading}>{loading ? "Deleting…" : t("delete", lang)}</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Salary Card ─────────────────────────────────────────────────────────────

function SalaryCard({
  record,
  companyId,
  year,
  month,
  onUpdated,
}: {
  record: SalaryRecord;
  companyId: string;
  year: number;
  month: number;
  onUpdated: (r: SalaryRecord) => void;
}) {
  const { lang } = useTheme();
  const [saving, setSaving] = useState(false);
  const [inputVal, setInputVal] = useState(String(record.leaveDays));

  // keep input in sync if parent reloads
  useEffect(() => { setInputVal(String(record.leaveDays)); }, [record.leaveDays]);

  const hasSalary = record.monthlySalary !== null && record.monthlySalary > 0;
  const calc = hasSalary ? calcSalary(record.monthlySalary, Number(inputVal) || 0) : null;

  const commit = useCallback(async (val: number) => {
    if (!hasSalary) return;
    const clamped = Math.max(0, Math.min(31, val));
    if (clamped === record.leaveDays) return;
    setSaving(true);
    try {
      const updated = await setLeaveDays(companyId, record.employeeId, year, month, clamped);
      onUpdated(updated);
    } catch { } finally { setSaving(false); }
  }, [companyId, record, year, month, hasSalary, onUpdated]);

  const stepLeave = (delta: number) => {
    const next = Math.max(0, Math.min(31, (Number(inputVal) || 0) + delta));
    setInputVal(String(next));
    commit(next);
  };

  const grad = nameToGrad(record.employeeName);

  return (
    <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Employee header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={record.employeeName} grad={grad} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--hi)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{record.employeeName}</p>
          {hasSalary
            ? <p className="num dim" style={{ fontSize: 11.5 }}>{money(record.monthlySalary!, lang)} / month</p>
            : <p className="dim" style={{ fontSize: 11.5 }}>{t("noSalarySet", lang)}</p>
          }
        </div>
      </div>

      {hasSalary && (
        <>
          {/* Daily rate row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={{ padding: "7px 10px", background: "var(--s2)", borderRadius: 10 }}>
              <p className="dim" style={{ fontSize: 10, marginBottom: 2 }}>{t("dailyRate", lang)}</p>
              <p className="num" style={{ fontSize: 13, fontWeight: 700, color: "var(--mid)" }}>
                {money(calc!.dailyRate, lang)}
              </p>
            </div>
            <div style={{ padding: "7px 10px", background: "var(--s2)", borderRadius: 10 }}>
              <p className="dim" style={{ fontSize: 10, marginBottom: 2 }}>{t("deduction", lang)}</p>
              <p className="num" style={{ fontSize: 13, fontWeight: 700, color: calc!.deduction > 0 ? "var(--danger)" : "var(--low)" }}>
                {calc!.deduction > 0 ? `- ${money(calc!.deduction, lang)}` : "—"}
              </p>
            </div>
          </div>

          {/* Leave days stepper */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--s2)", borderRadius: 12 }}>
            <span style={{ fontSize: 12.5, color: "var(--mid)", fontWeight: 600 }}>{t("leaveDays", lang)}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className="icon-btn"
                style={{ width: 30, height: 30, background: "var(--s1)", fontSize: 18, fontWeight: 700 }}
                onClick={() => stepLeave(-1)}
                disabled={saving || Number(inputVal) <= 0}
                aria-label="Decrease leave"
              >−</button>
              <input
                className="num"
                type="number"
                min={0}
                max={31}
                step={0.5}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onBlur={() => commit(Number(inputVal) || 0)}
                disabled={saving}
                style={{ width: 48, textAlign: "center", fontSize: 15, fontWeight: 800, color: "var(--hi)", background: "transparent", border: "none", outline: "none" }}
              />
              <button
                className="icon-btn"
                style={{ width: 30, height: 30, background: "var(--s1)", fontSize: 18, fontWeight: 700 }}
                onClick={() => stepLeave(1)}
                disabled={saving || Number(inputVal) >= 31}
                aria-label="Increase leave"
              >+</button>
            </div>
          </div>

          {/* Final salary */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: calc!.deduction > 0 ? "rgba(239,68,68,.07)" : "rgba(16,185,129,.07)", borderRadius: 12, border: `1px solid ${calc!.deduction > 0 ? "rgba(239,68,68,.18)" : "rgba(16,185,129,.18)"}` }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--mid)" }}>{t("finalSalary", lang)}</span>
            <span className="num" style={{ fontSize: 15, fontWeight: 900, color: calc!.deduction > 0 ? "var(--danger)" : "var(--teal)" }}>
              {saving ? "…" : money(calc!.finalSalary, lang)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function sortByName(list: Employee[]) {
  return [...list].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

type PageTab = "team" | "salary";

export default function EmployeesPage() {
  const router = useRouter();
  const { currentCompany } = useCompany();
  const { lang } = useTheme();
  const [tab, setTab] = useState<PageTab>("team");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [cardEmployee, setCardEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState("");

  // Salary tab state
  const now = new Date();
  const [salaryYear, setSalaryYear] = useState(now.getFullYear());
  const [salaryMonth, setSalaryMonth] = useState(now.getMonth() + 1);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [salaryLoading, setSalaryLoading] = useState(false);

  const filtered = useMemo(
    () => search.trim() === ""
      ? employees
      : employees.filter((e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          (e.phone && e.phone.includes(search))
        ),
    [employees, search]
  );

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
  }, [router]);

  useEffect(() => {
    if (!currentCompany) return;
    setPageLoading(true);
    getEmployees(currentCompany.id)
      .then((data) => setEmployees(sortByName(data)))
      .catch(() => setEmployees([]))
      .finally(() => setPageLoading(false));
  }, [currentCompany]);

  useEffect(() => {
    if (!currentCompany || tab !== "salary") return;
    setSalaryLoading(true);
    getLeaveDays(currentCompany.id, salaryYear, salaryMonth)
      .then(setSalaryRecords)
      .catch(() => setSalaryRecords([]))
      .finally(() => setSalaryLoading(false));
  }, [currentCompany, tab, salaryYear, salaryMonth]);

  const handleSaved = (emp: Employee) => setEmployees((prev) => sortByName([...prev, emp]));
  const handleUpdated = (emp: Employee) => setEmployees((prev) => sortByName(prev.map((e) => (e.id === emp.id ? emp : e))));
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteEmployee(deleteTarget.id);
      setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch { } finally { setDeleteLoading(false); }
  };

  const prevSalaryMonth = () => {
    if (salaryMonth === 1) { setSalaryYear((y) => y - 1); setSalaryMonth(12); }
    else setSalaryMonth((m) => m - 1);
  };
  const nextSalaryMonth = () => {
    const isCurrent = salaryYear === now.getFullYear() && salaryMonth === now.getMonth() + 1;
    if (isCurrent) return;
    if (salaryMonth === 12) { setSalaryYear((y) => y + 1); setSalaryMonth(1); }
    else setSalaryMonth((m) => m + 1);
  };

  const handleLeaveUpdated = useCallback((updated: SalaryRecord) => {
    setSalaryRecords((prev) => prev.map((r) => r.employeeId === updated.employeeId ? updated : r));
  }, []);

  const isSalaryCurrent = salaryYear === now.getFullYear() && salaryMonth === now.getMonth() + 1;

  return (
    <AppLayout>
      <div className="screen">
        {/* Header */}
        <div style={{ padding: "6px 2px 12px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 6 }}>{t("teamMembers", lang)} · {nums(String(employees.length), lang)}</p>
            <h1 className="page-title">{t("employees", lang)}</h1>
          </div>
          <button className="btn btn--primary" style={{ width: "auto", padding: "11px 15px", fontSize: 13 }}
            onClick={() => { setEditTarget(null); setDrawerOpen(true); }}>
            <I.plus w={16} /> {t("add", lang)}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {([["team", t("employees", lang)], ["salary", t("salaryMgmt", lang)]] as [PageTab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={"chip" + (tab === id ? " on" : "")}
              style={{ flexShrink: 0 }}
            >{label}</button>
          ))}
        </div>

        {/* ── Team tab ── */}
        {tab === "team" && (
          <>
            {/* Search */}
            <div style={{ position: "relative", marginBottom: 14 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--low)" }}><I.search w={18} /></span>
              <input className="input" style={{ paddingLeft: 42 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search", lang)} />
            </div>

            {pageLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="card" style={{ padding: 0 }}>
                    <div className="skel" style={{ aspectRatio: "1.15", width: "100%", borderRadius: "var(--r) var(--r) 0 0" }} />
                    <div style={{ padding: "11px 13px 13px" }}>
                      <div className="skel" style={{ height: 14, width: "70%", borderRadius: 5, marginBottom: 6 }} />
                      <div className="skel" style={{ height: 11, width: "50%", borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : employees.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
                <p className="muted" style={{ marginBottom: 14 }}>{t("noEmployees", lang)}</p>
                <button className="btn btn--primary" style={{ width: "auto", margin: "0 auto" }} onClick={() => setDrawerOpen(true)}>
                  <I.plus w={16} /> {t("addEmployee", lang)}
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "30px 20px" }}>
                <p className="muted">No results for "{search}"</p>
                <button className="link" style={{ marginTop: 10 }} onClick={() => setSearch("")}>Clear search</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {filtered.map((emp) => (
                  <button key={emp.id} className="card" style={{ padding: 0, textAlign: "left" }} onClick={() => setCardEmployee(emp)}>
                    <div style={{ position: "relative", aspectRatio: "1.15", overflow: "hidden" }}>
                      {emp.imageData
                        ? <img src={emp.imageData} alt={emp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <>
                            <div className={"av-grad-" + nameToGrad(emp.name)} style={{ position: "absolute", inset: 0 }} />
                            <div className="weave" style={{ position: "absolute", inset: 0 }} />
                            <span style={{ position: "absolute", left: 14, top: 10, fontSize: 44, fontFamily: "var(--font-display)", color: "rgba(255,255,255,.92)", lineHeight: 1 }}>{emp.name.charAt(0)}</span>
                          </>
                      }
                    </div>
                    <div style={{ padding: "11px 13px 13px" }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--hi)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.name}</p>
                      <p className="num dim" style={{ fontSize: 11, marginTop: 3 }}>{emp.phone || t("noPhone", lang)}</p>
                      {emp.salary !== null && (
                        <p className="money num" style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>{money(emp.salary, lang)}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Salary tab ── */}
        {tab === "salary" && (
          <>
            {/* Month navigator */}
            <div className="card" style={{ padding: "10px 16px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button className="icon-btn" onClick={prevSalaryMonth} aria-label="Previous month"><I.chevLeft w={18} /></button>
              <div style={{ textAlign: "center" }}>
                <p className="num" style={{ fontSize: 17, fontWeight: 800, color: "var(--hi)", lineHeight: 1.1 }}>{MONTHS[salaryMonth - 1]}</p>
                <p className="dim" style={{ fontSize: 12, marginTop: 2 }}>{salaryYear}</p>
              </div>
              <button className="icon-btn" onClick={nextSalaryMonth} disabled={isSalaryCurrent} style={{ opacity: isSalaryCurrent ? 0.35 : 1 }} aria-label="Next month"><I.chevRight w={18} /></button>
            </div>

            {/* Formula note */}
            <div style={{ padding: "8px 12px", marginBottom: 12, background: "var(--s2)", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <I.rupee w={14} />
              <p style={{ fontSize: 11.5, color: "var(--mid)" }}>
                Daily rate = Salary ÷ 30 · Deduction = Daily rate × Leave days
              </p>
            </div>

            {salaryLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 148, borderRadius: "var(--r)" }} />)}
              </div>
            ) : salaryRecords.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
                <p className="muted">{t("noEmployees", lang)}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {salaryRecords.map((record) => (
                  <SalaryCard
                    key={record.employeeId}
                    record={record}
                    companyId={currentCompany!.id}
                    year={salaryYear}
                    month={salaryMonth}
                    onUpdated={handleLeaveUpdated}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {drawerOpen && currentCompany && (
        <EmployeeDrawer
          companyId={currentCompany.id}
          employee={editTarget ?? undefined}
          onClose={() => { setDrawerOpen(false); setEditTarget(null); }}
          onSaved={handleSaved}
          onUpdated={handleUpdated}
        />
      )}

      {deleteTarget && (
        <DeleteModal employee={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} />
      )}

      {cardEmployee && (
        <IDCardModal
          employee={cardEmployee}
          onClose={() => setCardEmployee(null)}
          onEdit={() => { setEditTarget(cardEmployee); setDrawerOpen(true); }}
          onDelete={() => setDeleteTarget(cardEmployee)}
        />
      )}
    </AppLayout>
  );
}
