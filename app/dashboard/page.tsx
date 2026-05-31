"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { useCompany } from "@/context/CompanyContext";
import { useTheme } from "@/context/ThemeContext";
import { AppLayout } from "@/components/AppLayout";
import { getMonthlyStitchSummary, getYesterday, MonthlyStitchSummary } from "@/lib/stitchData";
import { t, fmt, money, greet } from "@/lib/i18n";
import { useCountUp } from "@/lib/useCountUp";
import Sparkline from "@/components/sd/Sparkline";
import Bars from "@/components/sd/Bars";
import Avatar, { nameToGrad } from "@/components/sd/Avatar";
import * as I from "@/components/sd/Icons";

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function entryDateLabel(dateStr: string, lang: "en" | "gu"): string {
  const today = localDateKey(new Date());
  if (dateStr === today) return t("today", lang);
  if (dateStr === getYesterday()) return t("yesterday", lang);
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function DashboardPage() {
  const router = useRouter();
  const { currentCompany, companies, loading } = useCompany();
  const { lang } = useTheme();

  const [summary, setSummary] = useState<MonthlyStitchSummary | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    if (!loading && companies.length === 0) { router.push("/setup"); }
  }, [router, loading, companies]);

  useEffect(() => {
    if (!currentCompany) return;
    setStatsLoading(true);
    const now = new Date();
    getMonthlyStitchSummary(currentCompany.id, now.getFullYear(), now.getMonth() + 1)
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setStatsLoading(false));
  }, [currentCompany]);

  const monthlyStitch = summary?.totals.totalStitch ?? 0;
  const totalBonus = summary?.totals.totalBonus ?? 0;
  const topEmployees = useMemo(() => (summary?.employees ?? []).slice(0, 3), [summary]);
  const dailyData = useMemo(() => summary?.daily ?? [], [summary]);
  const machineData = useMemo(() => summary?.machines ?? [], [summary]);
  const dayCount = summary?.totals.dayStitch ?? 0;
  const nightCount = summary?.totals.nightStitch ?? 0;
  const recentEntries = useMemo(() => summary?.recentEntries ?? [], [summary]);
  const shiftTotal = dayCount + nightCount;
  const dayPct = shiftTotal > 0 ? Math.round((dayCount / shiftTotal) * 100) : 0;

  const now = new Date();
  const daysElapsed = now.getDate();
  const todayKey = localDateKey(now);
  const monthlyTarget = (currentCompany?.machineCount ?? 1) * 10000 * 30;
  const pct = monthlyStitch > 0 ? Math.min(100, (monthlyStitch / monthlyTarget) * 100) : 0;
  const animStitch = useCountUp(monthlyStitch, 1100);
  const dailyAvg = monthlyStitch > 0 && daysElapsed > 0 ? Math.round(monthlyStitch / daysElapsed) : 0;
  const projected = Math.round((monthlyStitch / (daysElapsed || 1)) * 30);
  const todayTotal = dailyData.find((d) => d.date === todayKey)?.total ?? 0;
  const activeDays = dailyData.length;
  const bestDay = dailyData.reduce((b, d) => (d.total > (b?.total ?? 0) ? d : b), null as { date: string; total: number } | null);

  const barsData = useMemo(() => dailyData.slice(-14).map((d) => {
    const date = new Date(d.date + "T00:00:00");
    return { d: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), total: d.total };
  }), [dailyData]);

  if (loading || !currentCompany) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
        <div className="skel" style={{ width: 56, height: 56, borderRadius: 18 }} />
        <p className="muted" style={{ fontSize: 13 }}>Loading…</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="screen">
        {/* Title */}
        <div style={{ padding: "6px 2px 16px" }}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>{greet(lang)}, {currentCompany.name.split(" ")[0]}</p>
          <h1 className="page-title">{t("dashboard", lang)}</h1>
        </div>

        {/* Hero — luxury production stat */}
        <div className="hero weave" style={{ marginBottom: 13 }}>

          {/* Top row: label + % badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p className="eyebrow">{t("monthStitches", lang)}</p>
            <div style={{
              padding: "4px 12px", borderRadius: 999,
              background: "linear-gradient(135deg, var(--violet-2), var(--teal))",
              fontSize: 12.5, fontWeight: 800, color: "#fff",
              fontVariantNumeric: "tabular-nums",
              boxShadow: "0 2px 12px rgba(109,93,245,.35)",
            }}>
              {Math.round(pct)}%
            </div>
          </div>

          {/* Hero number */}
          <div className="num display" style={{ fontSize: 52, color: "var(--hi)", letterSpacing: "-.03em", lineHeight: .95, marginBottom: 20 }}>
            {fmt(animStitch, lang)}
          </div>

          {/* Gradient progress strip with glowing head dot */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ position: "relative", height: 6, borderRadius: 999, background: "var(--s3)" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${pct > 0 ? Math.max(pct, 1.5) : 0}%`,
                borderRadius: 999,
                background: "linear-gradient(90deg, var(--violet-2), var(--violet) 55%, var(--teal))",
                boxShadow: "0 0 10px rgba(109,93,245,.45)",
                transition: "width 1.2s cubic-bezier(.16,1,.3,1)",
              }}>
                {pct > 0 && (
                  <div style={{
                    position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)",
                    width: 14, height: 14, borderRadius: "50%",
                    background: "var(--teal)",
                    boxShadow: "0 0 0 2px var(--s0), 0 0 10px rgba(47,216,182,.7)",
                  }} />
                )}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
              <span className="dim" style={{ fontSize: 10.5 }}>0</span>
              <span className="dim" style={{ fontSize: 10.5 }}>{fmt(monthlyTarget, lang)} {t("target", lang).toLowerCase()}</span>
            </div>
          </div>

          {/* Bottom stats row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span className="tier tier-2" style={{ flexShrink: 0 }}><I.arrowUp w={11} /> {t("onTrack", lang)}</span>
            <span className="dim" style={{ fontSize: 10 }}>·</span>
            <span className="dim" style={{ fontSize: 11.5, whiteSpace: "nowrap" }}>{t("dailyAvg", lang)} {fmt(dailyAvg, lang)}</span>
            <span className="dim" style={{ fontSize: 10 }}>·</span>
            <span style={{ fontSize: 11.5, color: "var(--teal)", fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(projected, lang)} {t("projected", lang).split(" ").slice(-1)[0]}</span>
          </div>

        </div>

        {/* Stat tiles */}
        <div className="grid2" style={{ marginBottom: 13 }}>
          {[
            { k: t("today", lang), v: fmt(todayTotal, lang), s: t("stitches", lang), c: "c-hi" },
            { k: t("bonusEarned", lang), v: money(totalBonus, lang), s: t("totalPayout", lang), c: "money" },
            { k: t("entries", lang), v: fmt(summary?.totals.entries ?? 0, lang), s: t("thisMonth", lang), c: "c-hi" },
            { k: t("activeDays", lang), v: fmt(activeDays, lang), s: `${fmt(summary?.totals.activeEmployeeCount ?? 0, lang)} ${t("employees", lang).toLowerCase()}`, c: "c-teal" },
          ].map((s, i) => (
            <div className="tile" key={i}>
              <div className="k">{s.k}</div>
              <div className={"v num " + s.c}>{statsLoading ? <span className="skel" style={{ display: "inline-block", width: 60, height: 22, borderRadius: 6 }} /> : s.v}</div>
              <div className="s">{s.s}</div>
            </div>
          ))}
        </div>

        {/* Daily production */}
        <div className="card weave" style={{ marginBottom: 13 }}>
          <div className="sec-head" style={{ margin: "0 0 14px" }}>
            <div>
              <p className="eyebrow">{t("dailyProduction", lang)}</p>
              <p className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>{t("last14", lang)}</p>
            </div>
            {bestDay && (
              <div style={{ textAlign: "right" }}>
                <p className="dim" style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase" }}>{t("bestDay", lang)}</p>
                <p className="c-gold num" style={{ fontSize: 13, fontWeight: 700 }}>{fmtDate(bestDay.date)}</p>
              </div>
            )}
          </div>
          {barsData.length > 0 ? <Bars data={barsData} lang={lang} /> : (
            <p className="muted" style={{ textAlign: "center", padding: "20px 0" }}>No data yet this month</p>
          )}
        </div>

        {/* Shift split + pace */}
        <div className="grid2" style={{ marginBottom: 13 }}>
          <div className="card">
            <p className="eyebrow" style={{ marginBottom: 12 }}>{t("shiftSplit", lang)}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { l: t("day", lang), v: dayCount, pct: dayPct, cls: "gold", c: "var(--gold)" },
                { l: t("night", lang), v: nightCount, pct: 100 - dayPct, cls: "", c: "var(--violet)" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.c }}>{s.l}</span>
                    <span className="num dim" style={{ fontSize: 11.5 }}>{s.pct}%</span>
                  </div>
                  <div className="bar-track"><div className={"bar-fill " + s.cls} style={{ width: s.pct + "%" }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ display: "flex", flexDirection: "column" }}>
            <p className="eyebrow" style={{ marginBottom: 10 }}>{t("pace", lang)}</p>
            {barsData.length > 0 ? (
              <Sparkline data={barsData.map((d) => d.total)} height={48} color="var(--teal)" />
            ) : (
              <div style={{ height: 48, background: "var(--s2)", borderRadius: 8 }} />
            )}
            <div className="stitch-divider" style={{ margin: "12px 0 11px" }} />
            <p className="dim" style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase" }}>{t("projected", lang)}</p>
            <p className="num display c-teal" style={{ fontSize: 24, marginTop: 4 }}>{fmt(projected, lang)}</p>
          </div>
        </div>

        {/* Machine utilisation */}
        {machineData.length > 0 && (
          <div className="card" style={{ marginBottom: 13 }}>
            <p className="eyebrow" style={{ marginBottom: 13 }}>{t("machineUtil", lang)}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {machineData.map((m) => {
                const pctM = Math.round((m.total / (machineData[0]?.total ?? 1)) * 100);
                return (
                  <div key={m.machine} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="num" style={{ fontSize: 11, fontWeight: 700, color: "var(--mid)", width: 28 }}>M{m.machine}</span>
                    <div className="bar-track" style={{ flex: 1 }}>
                      <div className="bar-fill" style={{ width: pctM + "%" }} />
                    </div>
                    <span className="num dim" style={{ fontSize: 10, width: 48, textAlign: "right" }}>{fmt(m.total, lang)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top performers */}
        {topEmployees.length > 0 && (
          <>
            <div className="sec-head"><p className="eyebrow">{t("topPerformers", lang)}</p></div>
            <div className="card flush" style={{ marginBottom: 13 }}>
              {topEmployees.map((p, i) => (
                <div className="row" key={p.name} style={{ borderTop: i ? "1px solid var(--line)" : "none" }}>
                  <div className={"medal medal-" + (i + 1)}>{i + 1}</div>
                  <Avatar name={p.name} grad={nameToGrad(p.name)} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--hi)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                    <p className="num dim" style={{ fontSize: 11.5, marginTop: 2 }}>{fmt(p.stitches, lang)} {t("stitches", lang)}</p>
                  </div>
                  <p className="money num" style={{ fontSize: 15, fontWeight: 700 }}>{money(p.bonus, lang)}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Recent entries */}
        <div className="sec-head">
          <p className="eyebrow">{t("recentEntries", lang)}</p>
          <Link href="/stitch-data" className="link">{t("seeAll", lang)}</Link>
        </div>
        <div className="card flush">
          {statsLoading ? (
            [0, 1, 2].map((i) => (
              <div className="row" key={i} style={{ borderTop: i ? "1px solid var(--line)" : "none" }}>
                <div className="skel" style={{ width: 40, height: 40, borderRadius: 13, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skel" style={{ width: "60%", height: 14, borderRadius: 6, marginBottom: 6 }} />
                  <div className="skel" style={{ width: "40%", height: 11, borderRadius: 5 }} />
                </div>
              </div>
            ))
          ) : recentEntries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <p className="muted" style={{ fontSize: 13 }}>No entries this month yet</p>
            </div>
          ) : recentEntries.map((r, i) => (
            <div className="row" key={r.id} style={{ borderTop: i ? "1px solid var(--line)" : "none" }}>
              <Avatar name={r.employeeName} grad={nameToGrad(r.employeeName)} size={40} style={{ borderRadius: 13 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--hi)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.employeeName}</p>
                <p className="num dim" style={{ fontSize: 11, marginTop: 2 }}>{fmt(r.stitchCount, lang)} · M{r.machineNo}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={"badge " + (r.shift === "day" ? "badge-day" : "badge-night")}>
                  {r.shift === "day" ? t("day", lang) : t("night", lang)}
                </span>
                <p className="dim" style={{ fontSize: 10.5, marginTop: 4 }}>{entryDateLabel(r.date, lang)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
