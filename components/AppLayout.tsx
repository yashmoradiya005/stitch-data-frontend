"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCompany } from "@/context/CompanyContext";
import { useUser } from "@/context/UserContext";
import { useTheme } from "@/context/ThemeContext";
import { logout } from "@/lib/auth";
import { updateCompany, deleteCompany } from "@/lib/company";
import { getEmployees } from "@/lib/employee";
import type { Employee } from "@/lib/employee";
import { createStitchEntry, getYesterday } from "@/lib/stitchData";
import { t, fmt, money, greet, BONUS_RANGES, RATES } from "@/lib/i18n";
import { useCountUp } from "@/lib/useCountUp";
import Avatar, { nameToGrad } from "@/components/sd/Avatar";
import Sheet from "@/components/sd/Sheet";
import Burst from "@/components/sd/Burst";
import * as I from "@/components/sd/Icons";

// ─── Tiers ────────────────────────────────────────────────────────────────────

const TIERS = [
  { cls: "tier-0", label: ["Below range", "રેન્જથી નીચે"] },
  { cls: "tier-1", label: ["Earning", "કમાણી"] },
  { cls: "tier-2", label: ["Strong", "મજબૂત"] },
  { cls: "tier-3", label: ["Elite", "ઉત્તમ"] },
];

// ─── Edit Business Modal ──────────────────────────────────────────────────────

function EditBusinessModal({
  company, onClose, onUpdated, onDeleted,
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
    } finally { setEditLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteError("");
    if (confirmName !== company.name) { setDeleteError("Business name does not match."); return; }
    setDeleteLoading(true);
    try {
      await deleteCompany(company.id);
      onDeleted();
      onClose();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || "Failed to delete business.");
    } finally { setDeleteLoading(false); }
  };

  return (
    <>
      <div className="sheet-backdrop show" onClick={onClose} />
      <div className="modal-center" onClick={onClose}>
        <div className="modal-card" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
          <div className="sheet__head" style={{ borderBottom: "1px solid var(--line)" }}>
            <h3 className="display" style={{ fontSize: 20, color: "var(--hi)" }}>Manage Business</h3>
            <button className="icon-btn" onClick={onClose} style={{ background: "var(--s2)" }}><I.close w={18} /></button>
          </div>

          <div style={{ display: "flex", borderBottom: "1px solid var(--line)" }}>
            {(["edit", "delete"] as const).map((tb) => (
              <button key={tb} onClick={() => setTab(tb)}
                style={{ flex: 1, padding: "11px 0", fontSize: 13, fontWeight: 700,
                  color: tab === tb ? (tb === "delete" ? "var(--danger)" : "var(--violet)") : "var(--low)",
                  borderBottom: tab === tb ? `2px solid ${tb === "delete" ? "var(--danger)" : "var(--violet)"}` : "2px solid transparent" }}>
                {tb === "edit" ? "Edit" : "Delete"}
              </button>
            ))}
          </div>

          <div style={{ padding: 16 }}>
            {tab === "edit" ? (
              <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {editError && <div style={{ padding: "10px 12px", background: "var(--danger-soft, rgba(239,68,68,.12))", borderRadius: 10, fontSize: 12.5, color: "var(--danger)" }}>{editError}</div>}
                <div className="field">
                  <label className="label">Business Name</label>
                  <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={editLoading} />
                </div>
                <div className="field">
                  <label className="label">Machines</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button type="button" className="icon-btn" style={{ width: 36, height: 36, background: "var(--s2)" }}
                      onClick={() => setMachineCount((v) => Math.max(1, v - 1))} disabled={editLoading || machineCount <= 1}>−</button>
                    <input className="input" type="number" min={1} value={machineCount}
                      onChange={(e) => setMachineCount(Math.max(1, parseInt(e.target.value) || 1))}
                      disabled={editLoading} style={{ width: 60, textAlign: "center" }} />
                    <button type="button" className="icon-btn" style={{ width: 36, height: 36, background: "var(--s2)" }}
                      onClick={() => setMachineCount((v) => v + 1)} disabled={editLoading}>+</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn--ghost" onClick={onClose} disabled={editLoading}>Cancel</button>
                  <button type="submit" className="btn btn--primary" disabled={editLoading}>
                    {editLoading ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ padding: "10px 12px", background: "rgba(239,68,68,.08)", borderRadius: 10, fontSize: 12.5, color: "var(--danger)" }}>
                  Data is preserved (soft delete) — hidden from your account only.
                </div>
                {deleteError && <div style={{ padding: "10px 12px", background: "rgba(239,68,68,.12)", borderRadius: 10, fontSize: 12.5, color: "var(--danger)" }}>{deleteError}</div>}
                <div className="field">
                  <label className="label">Type <strong>"{company.name}"</strong> to confirm</label>
                  <input className="input" type="text" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder="Business name" disabled={deleteLoading} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn--ghost" onClick={onClose} disabled={deleteLoading}>Cancel</button>
                  <button className="btn btn--danger" onClick={handleDelete} disabled={deleteLoading || confirmName !== company.name}>
                    {deleteLoading ? "Deleting…" : "Delete Business"}
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

// ─── Log Sheet (Bonus Engine) ─────────────────────────────────────────────────

function LogSheet({
  open, onClose, companyId, employees, machineCount,
}: {
  open: boolean;
  onClose: () => void;
  companyId: string;
  employees: Employee[];
  machineCount: number;
}) {
  const { lang } = useTheme();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = getYesterday();

  const [empId, setEmpId] = useState("");
  const [empOpen, setEmpOpen] = useState(false);
  const [dateMode, setDateMode] = useState<"today" | "yesterday" | "other">("today");
  const [customDate, setCustomDate] = useState(today);
  const [shift, setShift] = useState<"day" | "night">("day");
  const [machine, setMachine] = useState(1);
  const [sc, setSc] = useState("");
  const [range, setRange] = useState(200);
  const [paisa, setPaisa] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(false);

  const date = dateMode === "today" ? today : dateMode === "yesterday" ? yesterday : customDate;
  const count = parseInt(sc) || 0;
  const extra = Math.max(0, count - range);
  const bonus = +(extra * paisa).toFixed(2);
  const projected = Math.round(bonus * 26);
  const animBonus = useCountUp(bonus, 500);

  const tier = extra <= 0 ? 0 : extra < 5000 ? 1 : extra < 15000 ? 2 : 3;
  const tm = TIERS[tier];

  const gMax = Math.max(range * 1.5, count * 1.05, range + 2000);
  const basePct = Math.min(count, range) / gMax * 100;
  const tickPct = range / gMax * 100;
  const bonusW = count > range ? (Math.min(count, gMax) - range) / gMax * 100 : 0;

  const empName = employees.find((e) => e.id === empId)?.name ?? "";

  function reset() {
    setEmpId(""); setDateMode("today"); setCustomDate(today);
    setShift("day"); setMachine(1); setSc(""); setRange(200);
    setPaisa(1); setError(""); setDone(false); setLoading(false);
  }

  function close() { onClose(); setTimeout(reset, 450); }

  async function submit() {
    setError("");
    if (!empId || count < 1) return;
    setLoading(true);
    try {
      await createStitchEntry({ companyId, employeeId: empId, date, shift, machineNo: machine, bonusRange: range, stitchCount: count, stitchPerPaisa: paisa });
      setDone(true); setBurst(true); setTimeout(() => setBurst(false), 1400);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onClose={close} title={t("logEntry", lang)} sub={done ? null : t("quickFill", lang)}>
      {done ? (
        <div style={{ position: "relative", textAlign: "center", padding: "10px 0 6px" }}>
          <Burst run={burst} />
          <div style={{ width: 68, height: 68, margin: "0 auto 14px", borderRadius: 22, display: "grid", placeItems: "center",
            background: "var(--gold-soft)", color: "var(--gold)", boxShadow: "var(--glow-gold)" }}>
            <I.check w={32} />
          </div>
          <p className="num display" style={{ fontSize: 40, color: "var(--hi)" }}>{fmt(count, lang)}</p>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
            {t("stitches", lang)} {t("logged", lang)}{empName ? ` · ${empName}` : ""}
          </p>
          {bonus > 0 && (
            <div style={{ display: "inline-flex", marginTop: 16, padding: "10px 18px", borderRadius: 16, background: "var(--gold-soft)", alignItems: "center", gap: 8 }}>
              <span className="dim" style={{ fontSize: 11 }}>{t("bonusEarned", lang)}</span>
              <span className="money num" style={{ fontSize: 19, fontWeight: 700 }}>{money(bonus, lang)}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button className="btn btn--ghost" onClick={reset}>{t("addAnother", lang)}</button>
            <button className="btn btn--primary" onClick={close}>{t("done", lang)}</button>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div style={{ padding: "10px 12px", marginBottom: 12, background: "rgba(239,68,68,.1)", borderRadius: 10, fontSize: 12.5, color: "var(--danger)" }}>
              {error}
            </div>
          )}

          {/* Employee */}
          <div className="field" style={{ position: "relative" }}>
            <label className="label">{t("employee", lang)}</label>
            <button className="input" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", color: empId ? "var(--hi)" : "var(--low)" }}
              onClick={() => setEmpOpen((v) => !v)}>
              {empName || t("selectEmployee", lang)} <I.chevDown w={16} />
            </button>
            {empOpen && (
              <div className="dropdown" style={{ top: "100%", left: 0, right: 0, marginTop: 6, maxHeight: 220, overflowY: "auto" }}>
                {employees.map((e) => (
                  <button key={e.id} className="row" style={{ width: "100%", textAlign: "left" }}
                    onClick={() => { setEmpId(e.id); setEmpOpen(false); }}>
                    <Avatar name={e.name} grad={nameToGrad(e.name)} size={30} />
                    <span style={{ fontSize: 14, color: "var(--hi)" }}>{e.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="field">
            <label className="label">{t("date", lang)}</label>
            <div className="seg">
              {(["today", "yesterday", "other"] as const).map((k) => (
                <button key={k} className={"seg__btn" + (dateMode === k ? " on" : "")} onClick={() => setDateMode(k)}>
                  {t(k, lang)}
                </button>
              ))}
            </div>
            {dateMode === "other" && (
              <input className="input" type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} style={{ marginTop: 8 }} />
            )}
          </div>

          {/* Shift */}
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

          {/* Machine */}
          <div className="field">
            <label className="label">{t("machineNo", lang)}</label>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(machineCount, 6)}, 1fr)`, gap: 7 }}>
              {Array.from({ length: machineCount }, (_, i) => i + 1).map((n) => (
                <button key={n} className={"chip" + (machine === n ? " on" : "")}
                  style={{ padding: "10px 0", textAlign: "center", justifyContent: "center" }}
                  onClick={() => setMachine(n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Stitch count */}
          <div className="field">
            <label className="label">{t("stitchCount", lang)}</label>
            <input className="input big" type="number" inputMode="numeric" value={sc} placeholder="0"
              onChange={(e) => setSc(e.target.value)} />
          </div>

          {/* Bonus Engine */}
          <div className="engine" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)" }}>
                <I.bolt w={13} /> {t("bonusEngine", lang)}
              </span>
              <span className={"tier " + tm.cls}>{lang === "gu" ? tm.label[1] : tm.label[0]}</span>
            </div>

            <div className="gauge">
              <div className="gauge__base" style={{ width: basePct + "%" }} />
              <div className="gauge__bonus" style={{ left: tickPct + "%", width: bonusW + "%" }} />
              <div className="gauge__tick" style={{ left: tickPct + "%" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5 }}>
              <span className="dim">{t("base", lang)} {range}</span>
              <span className="c-gold" style={{ fontWeight: 700 }}>+{fmt(extra, lang)} {t("extra", lang).toLowerCase()}</span>
            </div>

            <div className="stitch-divider" style={{ margin: "14px 0 12px" }} />

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div>
                <p className="dim" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" }}>{t("bonusEarned", lang)}</p>
                <p className="big-money num">{money(animBonus, lang)}</p>
              </div>
              <div style={{ textAlign: "right", maxWidth: 130 }}>
                <p className="num c-teal" style={{ fontSize: 14, fontWeight: 700 }}>{t("atThisPace", lang)}{fmt(projected, lang)}</p>
                <p className="dim" style={{ fontSize: 10 }}>{t("perMonth", lang)}</p>
              </div>
            </div>
          </div>

          {/* Bonus range */}
          <div className="field">
            <label className="label">{t("bonusRange", lang)}</label>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {BONUS_RANGES.map((r) => (
                <button key={r} className={"chip" + (range === r ? " on" : "")} onClick={() => setRange(r)}>{r}</button>
              ))}
            </div>
          </div>

          {/* Rate */}
          <div className="field">
            <label className="label">{t("rate", lang)} <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--low)" }}>· {t("perStitch", lang)}</span></label>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {RATES.map((r) => (
                <button key={r} className={"chip" + (paisa === r ? " on-gold on" : "")} onClick={() => setPaisa(r)}>₹{r}</button>
              ))}
            </div>
          </div>

          <button className="btn btn--gold" style={{ marginTop: 6 }} onClick={submit} disabled={!empId || count < 1 || loading}>
            <I.bolt w={17} /> {t("logEntry", lang)} · {money(bonus, lang)}
          </button>
        </>
      )}
    </Sheet>
  );
}

// ─── App Layout ───────────────────────────────────────────────────────────────

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentCompany, setCurrentCompany, refreshCompanies, companies } = useCompany();
  const { user } = useUser();
  const { theme, toggleTheme, lang, toggleLang } = useTheme();
  const router = useRouter();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [companySwitcherOpen, setCompanySwitcherOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  useEffect(() => {
    if (!currentCompany) return;
    getEmployees(currentCompany.id, { includeImages: false }).then(setEmployees).catch(() => {});
  }, [currentCompany?.id]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setCompanySwitcherOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const greeting = mounted ? greet(lang) : "";
  const firstName = mounted ? (user?.name?.split(" ")[0] ?? "") : "";

  const tabs = [
    { href: "/dashboard", icon: I.home, label: t("home", lang) },
    { href: "/employees", icon: I.users, label: t("employee", lang) },
    { href: "/stitch-data", icon: I.chart, label: t("production", lang) },
    { href: "/reports", icon: I.doc, label: t("reports", lang) },
  ];

  return (
    <>
      {/* Top bar */}
      <div className="topbar" ref={headerRef}>
        <div className="brand-mark"><I.spool w={19} /></div>

        {/* Company switcher */}
        <div className="co-switch" style={{ position: "relative" }}>
          <span className="greet">{greeting}{firstName ? `, ${firstName}` : ""}</span>
          <button className="co" onClick={() => companies.length > 1 && setCompanySwitcherOpen((v) => !v)}>
            <b>{currentCompany?.name ?? "StitchDesk"}</b>
            {companies.length > 1 && <span className="dim"><I.chevDown w={13} /></span>}
          </button>
          {companySwitcherOpen && companies.length > 1 && (
            <div className="dropdown" style={{ top: "calc(100% + 6px)", left: 0, minWidth: 200 }}>
              {companies.map((c) => (
                <button key={c.id} className="row" style={{ width: "100%", textAlign: "left", gap: 10 }}
                  onClick={() => { setCurrentCompany(c); setCompanySwitcherOpen(false); }}>
                  <i style={{ width: 8, height: 8, borderRadius: 9, background: c.id === currentCompany?.id ? "var(--violet)" : "var(--s3)", flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: c.id === currentCompany?.id ? "var(--hi)" : "var(--mid)", fontWeight: c.id === currentCompany?.id ? 600 : 400 }}>{c.name}</span>
                  {c.id === currentCompany?.id && <span style={{ marginLeft: "auto", color: "var(--violet)" }}><I.check w={16} /></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Edit business button */}
        {currentCompany && (
          <button className="icon-btn" onClick={() => setEditModalOpen(true)} title="Edit business">
            <I.edit w={17} />
          </button>
        )}

        {/* Lang toggle */}
        <button className="icon-btn" onClick={toggleLang}
          style={{ fontSize: 12, fontWeight: 800, color: "var(--violet)", letterSpacing: ".02em" }}>
          {lang === "en" ? "EN" : "ગુ"}
        </button>

        {/* Theme toggle */}
        <button className="icon-btn" onClick={toggleTheme}>
          {theme === "dark" ? <I.sun w={18} /> : <I.moon w={17} />}
        </button>

        {/* Profile */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setProfileOpen((v) => !v)} style={{ display: "block" }}>
            <Avatar name={mounted ? (user?.name ?? "?") : "?"} grad={mounted ? nameToGrad(user?.name ?? "") : 0} size={34} />
          </button>
          {profileOpen && (
            <div className="dropdown" style={{ top: "calc(100% + 8px)", right: 0, minWidth: 200 }}>
              <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--hi)" }}>{user?.name}</p>
                <p className="dim" style={{ fontSize: 11, marginTop: 2 }}>{user?.email}</p>
              </div>
              <button className="row" style={{ width: "100%", gap: 11, color: "var(--mid)" }}
                onClick={() => { setProfileOpen(false); router.push("/profile"); }}>
                <I.user w={17} /> <span style={{ fontSize: 13.5 }}>{t("myProfile", lang)}</span>
              </button>
              <button className="row" style={{ width: "100%", gap: 11, color: "var(--danger)", borderTop: "1px solid var(--line)" }}
                onClick={() => { setProfileOpen(false); logout(); }}>
                <I.logout w={17} /> <span style={{ fontSize: 13.5 }}>{t("logout", lang)}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="viewport">
        {children}
      </main>

      {/* Bottom tab bar */}
      {currentCompany && (
        <div className="tabbar">
          <div className="tabbar__inner">
            {tabs.slice(0, 2).map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={"tab" + (active ? " on" : "")}>
                  <Icon w={23} /><span>{item.label}</span>
                </Link>
              );
            })}
            <button className="fab" onClick={() => setLogOpen(true)} aria-label="Add stitch entry">
              <I.plus w={26} />
            </button>
            {tabs.slice(2).map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={"tab" + (active ? " on" : "")}>
                  <Icon w={23} /><span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit business modal */}
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

      {/* Log sheet */}
      <LogSheet
        open={logOpen}
        onClose={() => setLogOpen(false)}
        companyId={currentCompany?.id ?? ""}
        employees={employees}
        machineCount={currentCompany?.machineCount ?? 1}
      />
    </>
  );
}
