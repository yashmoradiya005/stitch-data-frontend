"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useCompany } from "@/context/CompanyContext";
import { useUser } from "@/context/UserContext";
import { useTheme } from "@/context/ThemeContext";
import { AppLayout } from "@/components/AppLayout";
import { getMonthlyStitchSummary, MonthlyStitchSummary } from "@/lib/stitchData";
import { t, fmt, money } from "@/lib/i18n";
import * as I from "@/components/sd/Icons";

// ─── PDF Generator ────────────────────────────────────────────────────────────

async function generatePayoutPDF(opts: {
  businessName: string;
  userName: string;
  monthLabel: string;
  generatedDate: string;
  rows: Array<{ name: string; stitches: number; salary: number; bonus: number; totalPay: number; entries: number }>;
  totalSalary: number;
  totalBonus: number;
  totalPay: number;
  filename: string;
}) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  type RGB = [number, number, number];
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ── Layout constants ──────────────────────────────────────────────────────
  const PW = 210, PH = 297;
  const ML = 14, MR = 14, CW = PW - ML - MR; // 182mm usable

  // ── Color palette (matches app + logo) ───────────────────────────────────
  const NAVY:    RGB = [13,  27,  75 ];
  const ORANGE:  RGB = [234, 88,  12 ];  // logo orange
  const OR_SOFT: RGB = [255, 237, 213];  // orange-100
  const BLUE:    RGB = [30,  58,  138];  // blue-900
  const BL_SOFT: RGB = [239, 246, 255];  // blue-50
  const GREEN:   RGB = [5,   150, 105];  // emerald-600
  const GR_SOFT: RGB = [240, 253, 244];  // emerald-50
  const WHITE:   RGB = [255, 255, 255];
  const G50:     RGB = [249, 250, 251];
  const G100:    RGB = [243, 244, 246];
  const G200:    RGB = [229, 231, 235];
  const G400:    RGB = [156, 163, 175];
  const G600:    RGB = [75,  85,  99 ];
  const G900:    RGB = [17,  24,  39 ];

  const rs = (n: number) => `Rs ${n.toLocaleString("en-IN")}`;

  // ── HEADER (page 1, clean typography only) ───────────────────────────────
  function drawHeader() {
    // Top navy rule
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, PW, 1.2, "F");

    // Left: label + company name + meta
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...G400);
    doc.text("SALARY & BONUS STATEMENT", ML, 10);

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    const bizName = doc.splitTextToSize(opts.businessName, 110)[0] as string;
    doc.text(bizName, ML, 20);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...G400);
    doc.text(`Prepared by ${opts.userName}  ·  Generated ${opts.generatedDate}`, ML, 27);

    // Right: period
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...G400);
    doc.text("PERIOD", PW - MR, 10, { align: "right" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text(opts.monthLabel, PW - MR, 20, { align: "right" });

    // Bottom divider
    doc.setDrawColor(...G200);
    doc.setLineWidth(0.4);
    doc.line(ML, 31, PW - MR, 31);
  }

  // ── MINI HEADER (continuation pages) ─────────────────────────────────────
  function drawMiniHeader() {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text(`${opts.businessName}  ·  Salary & Bonus Statement`, ML, 8);
    doc.setTextColor(...G400);
    doc.text(opts.monthLabel, PW - MR, 8, { align: "right" });
    doc.setDrawColor(...G200);
    doc.setLineWidth(0.4);
    doc.line(ML, 11, PW - MR, 11);
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  function drawFooter(pg: number, total: number) {
    const fy = PH - 9;
    doc.setDrawColor(...G200);
    doc.setLineWidth(0.3);
    doc.line(ML, fy, PW - MR, fy);

    // Orange dot accent
    doc.setFillColor(...ORANGE);
    doc.circle(ML + 1.5, fy + 3.5, 1.2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...G600);
    doc.text("StitchDesk", ML + 5, fy + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...G400);
    doc.text("Embroidery Production & Payout Management", ML + 30, fy + 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...G600);
    doc.text(`Page ${pg} / ${total}`, PW - MR, fy + 4, { align: "right" });
  }

  // ── Draw page 1 header ────────────────────────────────────────────────────
  drawHeader();

  // ── STAT TILES (3 cards with colored left accent bar) ─────────────────────
  const tileY = 37;
  const tileH = 20;
  const tileW = (CW - 8) / 3;
  const tileAccent: RGB[] = [ORANGE, BLUE, GREEN];
  const tileFill: RGB[]   = [OR_SOFT, BL_SOFT, GR_SOFT];
  const tileLabels = ["BASE SALARY", "PRODUCTION BONUS", "NET PAYABLE"];
  const tileValues = [rs(opts.totalSalary), rs(opts.totalBonus), rs(opts.totalPay)];

  tileLabels.forEach((label, i) => {
    const x = ML + i * (tileW + 4);
    // Card background
    doc.setFillColor(...tileFill[i]);
    doc.setDrawColor(...G200);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, tileY, tileW, tileH, 3, 3, "FD");
    // Left accent bar (drawn after background so it's on top)
    doc.setFillColor(...tileAccent[i]);
    doc.roundedRect(x, tileY, 3.5, tileH, 2, 2, "F");
    doc.rect(x + 1.5, tileY, 2, tileH, "F"); // square off right half of rounded rect
    // Label
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...G600);
    doc.text(label, x + 7, tileY + 7);
    // Value
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...G900);
    doc.text(tileValues[i], x + 7, tileY + 16);
  });

  // ── Section label before table ────────────────────────────────────────────
  const secY = tileY + tileH + 6;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...G400);
  doc.text("EMPLOYEE PAYOUT BREAKDOWN", ML, secY);
  doc.setFillColor(...ORANGE);
  doc.rect(ML, secY + 1.5, 40, 0.8, "F");
  doc.setFillColor(...G200);
  doc.rect(ML + 40, secY + 1.5, CW - 40, 0.8, "F");

  // ── TABLE ─────────────────────────────────────────────────────────────────
  const tableRows = opts.rows.map((emp, i) => [
    String(i + 1),
    emp.name,
    emp.stitches.toLocaleString("en-IN"),
    rs(emp.salary),
    rs(emp.bonus),
    rs(emp.totalPay),
    String(emp.entries),
  ]);

  // totalRow is drawn manually below so we control page-break behaviour
  autoTable(doc, {
    startY: secY + 5,
    margin: { left: ML, right: MR },
    head: [["#", "Employee", "Stitches", "Salary", "Bonus", "Total Pay", "Entries"]],
    body: tableRows,
    columnStyles: {
      0: { cellWidth: 9,  halign: "center",  textColor: G400 },
      1: { cellWidth: 58, halign: "left" },
      2: { cellWidth: 22, halign: "right" },
      3: { cellWidth: 26, halign: "right" },
      4: { cellWidth: 26, halign: "right",  textColor: BLUE },
      5: { cellWidth: 28, halign: "right",  fontStyle: "bold", textColor: G900 },
      6: { cellWidth: 13, halign: "center", textColor: G400 },
    },
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
      lineColor: NAVY,
      lineWidth: 0,
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
      textColor: G900,
      lineColor: G200,
      lineWidth: 0.2,
    },
    alternateRowStyles: { fillColor: G50 },
    tableLineColor: G200,
    tableLineWidth: 0.2,
    didDrawPage({ pageNumber }: { pageNumber: number }) {
      if (pageNumber > 1) drawMiniHeader();
      drawFooter(pageNumber, 999);
    },
  });

  // ── POST-TABLE: space-aware totals + summary ──────────────────────────────
  // Heights of each piece
  const TOTALS_H  = 9;   // totals row
  const CARDS_H   = 18;  // 3 stat mini-cards
  const SIG_H     = 22;  // signature section
  const COMPACT_H = 8;   // compact inline summary (fallback)
  const CONTENT_BOTTOM = PH - 14; // bottom of usable area (above footer)

  let afterY = (doc as any).lastAutoTable.finalY;
  const statW = (CW - 8) / 3;

  // Helper: draw the totals bar (manually, not via autoTable)
  function drawTotals(y: number) {
    doc.setFillColor(...G100);
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.8);
    doc.line(ML, y, ML + CW, y);
    doc.setLineWidth(0.2);
    doc.rect(ML, y, CW, TOTALS_H, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);

    // column x-positions mirror the autoTable layout
    const cols = [
      { x: ML + 9 + 58 + 22 + 26,      text: rs(opts.totalSalary), align: "right" as const, color: G900 },
      { x: ML + 9 + 58 + 22 + 26 + 26, text: rs(opts.totalBonus),  align: "right" as const, color: BLUE },
      { x: ML + CW - 13,                text: rs(opts.totalPay),    align: "right" as const, color: NAVY },
    ];
    doc.setTextColor(...NAVY);
    doc.text("TOTAL", ML + 11, y + 6);
    cols.forEach(c => {
      doc.setTextColor(...c.color);
      doc.text(c.text, c.x, y + 6, { align: c.align });
    });
    doc.setDrawColor(...G200);
    doc.setLineWidth(0.2);
    doc.rect(ML, y, CW, TOTALS_H, "S");
  }

  // Helper: draw stat cards
  function drawCards(y: number) {
    const labels = ["TOTAL EMPLOYEES", "TOTAL ENTRIES", "TOTAL STITCHES"];
    const vals   = [
      String(opts.rows.length),
      String(opts.rows.reduce((s, e) => s + e.entries, 0)),
      opts.rows.reduce((s, e) => s + e.stitches, 0).toLocaleString("en-IN"),
    ];
    labels.forEach((label, i) => {
      const x = ML + i * (statW + 4);
      doc.setFillColor(...G50);
      doc.setDrawColor(...G200);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, y, statW, CARDS_H, 2, 2, "FD");
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...G400);
      doc.text(label, x + 4, y + 6);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...G900);
      doc.text(vals[i], x + 4, y + 14);
    });
  }

  // Helper: compact inline summary (one line, used when space is tight)
  function drawCompactSummary(y: number) {
    doc.setFillColor(...G50);
    doc.setDrawColor(...G200);
    doc.setLineWidth(0.25);
    doc.roundedRect(ML, y, CW, COMPACT_H, 2, 2, "FD");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...G600);
    const txt = [
      `${opts.rows.length} Employees`,
      `${opts.rows.reduce((s, e) => s + e.entries, 0)} Entries`,
      `${opts.rows.reduce((s, e) => s + e.stitches, 0).toLocaleString("en-IN")} Stitches`,
    ].join("   ·   ");
    doc.text(txt, PW / 2, y + 5.5, { align: "center" });
  }

  // Helper: draw signature lines
  function drawSignatures(y: number) {
    const sigLen = CW * 0.38;
    doc.setDrawColor(...G400);
    doc.setLineWidth(0.5);
    doc.line(ML, y, ML + sigLen, y);
    doc.line(PW - MR - sigLen, y, PW - MR, y);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...G400);
    doc.text("Authorised Signatory", ML, y + 5);
    doc.text("Verified by", PW - MR - sigLen, y + 5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...G600);
    doc.text(opts.userName, ML, y + 10);
  }

  // Decide layout based on remaining space
  const spaceLeft = CONTENT_BOTTOM - afterY - 4;
  const needFull    = TOTALS_H + 6 + CARDS_H + 6 + SIG_H;  // ~61mm
  const needCompact = TOTALS_H + 4 + COMPACT_H + 6 + SIG_H; // ~49mm

  if (spaceLeft >= needFull) {
    // ── Plenty of room: totals + cards + signatures ──
    drawTotals(afterY + 4);
    drawCards(afterY + 4 + TOTALS_H + 6);
    drawSignatures(afterY + 4 + TOTALS_H + 6 + CARDS_H + 6);
  } else if (spaceLeft >= needCompact) {
    // ── Tight: totals + compact single-line summary + signatures ──
    drawTotals(afterY + 4);
    drawCompactSummary(afterY + 4 + TOTALS_H + 4);
    drawSignatures(afterY + 4 + TOTALS_H + 4 + COMPACT_H + 6);
  } else {
    // ── Not enough room at all: new page ──
    doc.addPage();
    drawMiniHeader();
    afterY = 16;
    drawTotals(afterY);
    drawCards(afterY + TOTALS_H + 6);
    drawSignatures(afterY + TOTALS_H + 6 + CARDS_H + 6);
  }

  // ── Fix footer page totals on every page ─────────────────────────────────
  const totalPg = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPg; p++) {
    doc.setPage(p);
    drawFooter(p, totalPg);
  }

  doc.save(opts.filename);
}

type ReportView = "payout" | "employee" | "daily" | "machine" | "summary";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function currency(value: number) {
  return `Rs ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SD";
}

function formatMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function csvEscape(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const router = useRouter();
  const { currentCompany } = useCompany();
  const { user } = useUser();
  const { lang } = useTheme();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [view, setView] = useState<ReportView>("payout");
  const [summary, setSummary] = useState<MonthlyStitchSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!isAuthenticated()) router.push("/login"); }, [router]);

  useEffect(() => {
    if (!currentCompany) return;
    setLoading(true);
    getMonthlyStitchSummary(currentCompany.id, year, month)
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [currentCompany, year, month]);

  const totals = summary?.totals;
  const employeeRows = useMemo(() => summary?.employees ?? [], [summary]);
  const dailyRows = useMemo(() => summary?.daily ?? [], [summary]);
  const machineRows = useMemo(() => summary?.machines ?? [], [summary]);
  const activeDayAvg = totals && dailyRows.length > 0 ? Math.round(totals.totalStitch / dailyRows.length) : 0;
  const bestDay = dailyRows.reduce((best, day) => (day.total > (best?.total ?? 0) ? day : best), null as { date: string; total: number } | null);
  const reportLabel = `${MONTHS[month - 1]}-${year}`;
  const monthLabel = formatMonth(year, month);
  const generatedDate = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const payoutRows = useMemo(
    () => employeeRows.map((emp) => ({
      ...emp,
      salary: emp.salary ?? 0,
      totalPay: (emp.salary ?? 0) + emp.bonus,
    })),
    [employeeRows]
  );
  const totalSalary = payoutRows.reduce((sum, emp) => sum + emp.salary, 0);
  const totalPay = payoutRows.reduce((sum, emp) => sum + emp.totalPay, 0);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };

  const downloadCurrentReport = () => {
    if (!summary || !currentCompany) return;
    const prefix = `${currentCompany.name.replace(/\s+/g, "-").toLowerCase()}-${reportLabel.toLowerCase()}`;

    if (view === "payout") {
      downloadCsv(`${prefix}-salary-bonus-report.csv`, [
        ["Employee", "Salary", "Bonus", "Total Pay", "Entries", "Stitches"],
        ...payoutRows.map((emp) => [emp.name, emp.salary, emp.bonus, emp.totalPay, emp.entries, emp.stitches]),
        ["Total", totalSalary, totals?.totalBonus ?? 0, totalPay, totals?.entries ?? 0, totals?.totalStitch ?? 0],
      ]);
      return;
    }

    if (view === "employee") {
      downloadCsv(`${prefix}-employee-payout.csv`, [
        ["Employee", "Entries", "Stitches", "Salary", "Bonus", "Total Pay"],
        ...payoutRows.map((emp) => [emp.name, emp.entries, emp.stitches, emp.salary, emp.bonus, emp.totalPay]),
      ]);
      return;
    }

    if (view === "daily") {
      downloadCsv(`${prefix}-daily-production.csv`, [
        ["Date", "Stitches"],
        ...dailyRows.map((day) => [day.date, day.total]),
      ]);
      return;
    }

    if (view === "machine") {
      downloadCsv(`${prefix}-machine-utilization.csv`, [
        ["Machine", "Stitches"],
        ...machineRows.map((machine) => [`M-${machine.machine}`, machine.total]),
      ]);
      return;
    }

    downloadCsv(`${prefix}-summary.csv`, [
      ["Metric", "Value"],
      ["Total entries", totals?.entries ?? 0],
      ["Total stitches", totals?.totalStitch ?? 0],
      ["Total bonus", totals?.totalBonus ?? 0],
      ["Active employees", totals?.activeEmployeeCount ?? 0],
      ["Active days", dailyRows.length],
      ["Active day average", activeDayAvg],
      ["Day shift stitches", totals?.dayStitch ?? 0],
      ["Night shift stitches", totals?.nightStitch ?? 0],
    ]);
  };

  const VIEW_TABS: Array<{ id: ReportView; label: string }> = [
    { id: "payout",   label: t("payout", lang) },
    { id: "employee", label: t("employees", lang) },
    { id: "daily",    label: t("daily", lang) },
    { id: "machine",  label: t("machines", lang) },
    { id: "summary",  label: t("summary", lang) },
  ];

  return (
    <AppLayout>
      <div className="screen">

        {/* Title */}
        <div style={{ padding: "6px 2px 16px" }}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>{t("reportCenter", lang)}</p>
          <h1 className="page-title">{t("monthlyReports", lang)}</h1>
          {currentCompany && (
            <p className="dim" style={{ fontSize: 12, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentCompany.name}
            </p>
          )}
        </div>

        {/* Controls card: month nav + tabs + export */}
        <div className="card" style={{ marginBottom: 13, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Month navigator */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <button className="icon-btn" onClick={prevMonth} aria-label="Previous month">
              <I.chevLeft w={18} />
            </button>
            <div style={{ textAlign: "center", minWidth: 84 }}>
              <p className="num" style={{ fontSize: 17, fontWeight: 800, color: "var(--hi)", lineHeight: 1.1 }}>{MONTHS[month - 1]}</p>
              <p className="dim" style={{ fontSize: 12, marginTop: 2 }}>{year}</p>
            </div>
            <button
              className="icon-btn"
              onClick={nextMonth}
              disabled={isCurrentMonth}
              aria-label="Next month"
              style={{ opacity: isCurrentMonth ? 0.35 : 1 }}
            >
              <I.chevRight w={18} />
            </button>
          </div>

          {/* View tabs */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={"chip" + (view === tab.id ? " on" : "")}
                style={{ flexShrink: 0 }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn--ghost"
              style={{ flex: 1 }}
              disabled={!summary || loading}
              onClick={() => {
                if (!summary || !currentCompany) return;
                const prefix = `${currentCompany.name.replace(/\s+/g, "-").toLowerCase()}-${reportLabel.toLowerCase()}`;
                generatePayoutPDF({
                  businessName: currentCompany.name,
                  userName: user?.name ?? "User",
                  monthLabel,
                  generatedDate,
                  rows: payoutRows,
                  totalSalary,
                  totalBonus: totals?.totalBonus ?? 0,
                  totalPay,
                  filename: `${prefix}-payout-report.pdf`,
                });
              }}
            >
              <I.download w={15} /> {t("savePdf", lang)}
            </button>
            <button
              className="btn btn--primary"
              style={{ flex: 1 }}
              disabled={!summary || loading}
              onClick={downloadCurrentReport}
            >
              <I.download w={15} /> {t("csv", lang)}
            </button>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid2" style={{ marginBottom: 13 }}>
          {[
            { k: t("entries", lang),   v: fmt(totals?.entries ?? 0, lang),         s: t("records", lang) },
            { k: t("stitches", lang),  v: fmt(totals?.totalStitch ?? 0, lang),      s: t("total", lang) },
            { k: t("bonus", lang),     v: money(totals?.totalBonus ?? 0, lang),     s: t("totalPayout", lang) },
            { k: t("activeAvg", lang), v: fmt(activeDayAvg, lang),                  s: `${fmt(dailyRows.length, lang)} ${t("activeDays", lang).toLowerCase()}` },
          ].map((s, i) => (
            <div className="tile" key={i}>
              <div className="k">{s.k}</div>
              <div className="v num c-hi">
                {loading
                  ? <span className="skel" style={{ display: "inline-block", width: 60, height: 22, borderRadius: 6 }} />
                  : s.v}
              </div>
              <div className="s">{s.s}</div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="card flush" style={{ marginBottom: 20 }}>
          {view === "payout" && (
            <PrintablePayoutReport
              businessName={currentCompany?.name ?? ""}
              userName={user?.name ?? "User"}
              monthLabel={monthLabel}
              generatedDate={generatedDate}
              rows={payoutRows}
              totalSalary={totalSalary}
              totalBonus={totals?.totalBonus ?? 0}
              totalPay={totalPay}
              loading={loading}
            />
          )}

          {view === "employee" && (
            <>
              <ReportHeader
                title={t("employees", lang)}
                subtitle={t("payoutBreakdown", lang)}
                count={employeeRows.length}
              />
              <TableShell empty={!loading && employeeRows.length === 0} loading={loading} emptyText="No employee production for this month">
                <div style={{ overflowX: "auto" }}>
                  <div style={{ minWidth: 520 }}>
                    <div className="row" style={{ background: "var(--s2)", borderBottom: "1px solid var(--line)" }}>
                      <span style={{ flex: 1, fontSize: 10, fontWeight: 700, color: "var(--low)", textTransform: "uppercase", letterSpacing: ".08em" }}>{t("name", lang)}</span>
                      <span style={{ width: 52, textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--low)", textTransform: "uppercase", letterSpacing: ".08em" }}>{t("entries", lang)}</span>
                      <span style={{ width: 76, textAlign: "right", fontSize: 10, fontWeight: 700, color: "var(--low)", textTransform: "uppercase", letterSpacing: ".08em" }}>{t("salary", lang)}</span>
                      <span style={{ width: 76, textAlign: "right", fontSize: 10, fontWeight: 700, color: "var(--low)", textTransform: "uppercase", letterSpacing: ".08em" }}>{t("bonus", lang)}</span>
                      <span style={{ width: 80, textAlign: "right", fontSize: 10, fontWeight: 700, color: "var(--low)", textTransform: "uppercase", letterSpacing: ".08em" }}>{t("total", lang)}</span>
                    </div>
                    {payoutRows.map((emp, i) => (
                      <div className="row" key={emp.employeeId} style={{ borderTop: i ? "1px solid var(--line)" : "none" }}>
                        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "var(--hi)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.name}</span>
                        <span style={{ width: 52, textAlign: "center", fontSize: 12, color: "var(--mid)" }}>{emp.entries}</span>
                        <span style={{ width: 76, textAlign: "right", fontSize: 12, fontWeight: 600, color: "var(--mid)" }}>{currency(emp.salary)}</span>
                        <span style={{ width: 76, textAlign: "right", fontSize: 12, fontWeight: 700, color: "var(--violet)" }}>{currency(emp.bonus)}</span>
                        <span style={{ width: 80, textAlign: "right", fontSize: 13, fontWeight: 800, color: "var(--hi)" }}>{currency(emp.totalPay)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TableShell>
            </>
          )}

          {view === "daily" && (
            <>
              <ReportHeader
                title={t("dailyProduction", lang)}
                subtitle={bestDay ? `Best: ${fmtDate(bestDay.date)} · ${bestDay.total.toLocaleString()}` : "Date-wise production"}
                count={dailyRows.length}
              />
              <TableShell empty={!loading && dailyRows.length === 0} loading={loading} emptyText="No daily production for this month">
                {dailyRows.map((day, i) => (
                  <div className="row" key={day.date} style={{ borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "var(--hi)" }}>{fmtDate(day.date)}</span>
                    <span className="num" style={{ fontSize: 13, fontWeight: 700, color: "var(--teal)" }}>{fmt(day.total, lang)}</span>
                  </div>
                ))}
              </TableShell>
            </>
          )}

          {view === "machine" && (
            <>
              <ReportHeader
                title={t("machineUtil", lang)}
                subtitle="Production totals grouped by machine"
                count={machineRows.length}
              />
              <TableShell empty={!loading && machineRows.length === 0} loading={loading} emptyText="No machine data for this month">
                {machineRows.map((machine, i) => (
                  <div className="row" key={machine.machine} style={{ borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "var(--hi)" }}>M-{machine.machine}</span>
                    <span className="num" style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{fmt(machine.total, lang)}</span>
                  </div>
                ))}
              </TableShell>
            </>
          )}

          {view === "summary" && (
            <>
              <ReportHeader
                title={t("summary", lang)}
                subtitle="High-level production and payout totals"
              />
              <TableShell empty={!loading && !summary} loading={loading} emptyText="No summary for this month">
                {[
                  [t("entries", lang),    fmt(totals?.entries ?? 0, lang)],
                  [t("stitches", lang),   fmt(totals?.totalStitch ?? 0, lang)],
                  [t("bonus", lang),      money(totals?.totalBonus ?? 0, lang)],
                  ["Active employees",    fmt(totals?.activeEmployeeCount ?? 0, lang)],
                  [t("activeDays", lang), fmt(dailyRows.length, lang)],
                  [t("activeAvg", lang),  fmt(activeDayAvg, lang)],
                  [t("dayShift", lang),   fmt(totals?.dayStitch ?? 0, lang)],
                  [t("nightShift", lang), fmt(totals?.nightStitch ?? 0, lang)],
                ].map(([label, value], i) => (
                  <div className="row" key={label} style={{ borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "var(--mid)" }}>{label}</span>
                    <span className="num" style={{ fontSize: 13, fontWeight: 700, color: "var(--hi)" }}>{value}</span>
                  </div>
                ))}
              </TableShell>
            </>
          )}
        </div>

      </div>
    </AppLayout>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReportHeader({ title, subtitle, count }: { title: string; subtitle: string; count?: number }) {
  return (
    <div className="row" style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="eyebrow" style={{ marginBottom: 4 }}>{title}</p>
        <p className="muted" style={{ fontSize: 11.5 }}>{subtitle}</p>
      </div>
      {count !== undefined && (
        <span className="tier tier-2" style={{ flexShrink: 0 }}>{count}</span>
      )}
    </div>
  );
}

function PrintablePayoutReport({
  businessName,
  userName,
  monthLabel,
  generatedDate,
  rows,
  totalSalary,
  totalBonus,
  totalPay,
  loading,
}: {
  businessName: string;
  userName: string;
  monthLabel: string;
  generatedDate: string;
  rows: Array<{
    employeeId: string;
    name: string;
    salary: number;
    bonus: number;
    totalPay: number;
    entries: number;
    stitches: number;
  }>;
  totalSalary: number;
  totalBonus: number;
  totalPay: number;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skel" style={{ height: 44, borderRadius: 10 }} />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <p className="muted" style={{ fontSize: 13 }}>No payout data for this month</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "20px 20px 16px", background: "linear-gradient(135deg, #0d1b4b 0%, #1e3a8a 60%, #1e293b 100%)", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, minWidth: 0 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 900, flexShrink: 0 }}>
              {initials(businessName)}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(219,234,254,.8)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>Salary &amp; Bonus Statement</p>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{businessName}</h2>
              <p style={{ fontSize: 12, color: "rgba(219,234,254,.7)", marginTop: 3 }}>Prepared by {userName}</p>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontSize: 10, color: "rgba(219,234,254,.7)", textTransform: "uppercase", letterSpacing: ".1em" }}>Report Month</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginTop: 3 }}>{monthLabel}</p>
            <p style={{ fontSize: 11.5, color: "rgba(219,234,254,.7)", marginTop: 2 }}>Generated {generatedDate}</p>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "14px 16px" }}>
        {[
          { label: "Base Salary",      value: currency(totalSalary), border: "#e2e8f0" },
          { label: "Production Bonus", value: currency(totalBonus),  border: "#bfdbfe" },
          { label: "Net Payable",      value: currency(totalPay),    border: "#a7f3d0" },
        ].map((item) => (
          <div key={item.label} style={{ borderRadius: 10, border: `1px solid ${item.border}`, padding: "10px 12px", background: "#fff" }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{item.label}</p>
            <p style={{ fontSize: 15, fontWeight: 900, color: "#111827" }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Employee table */}
      <div style={{ padding: "0 16px 14px", overflowX: "auto" }}>
        <div style={{ borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", minWidth: 480 }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 82px 82px 88px 52px", gap: 8, padding: "8px 14px", background: "#0d1b4b", color: "#fff" }}>
            {["#", "Employee", "Salary", "Bonus", "Total Pay", "Entries"].map((h, i) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", textAlign: i > 1 ? "right" : "left" }}>{h}</span>
            ))}
          </div>
          {rows.map((emp, index) => (
            <div key={emp.employeeId} style={{ display: "grid", gridTemplateColumns: "28px 1fr 82px 82px 88px 52px", gap: 8, padding: "9px 14px", borderTop: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>{index + 1}</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.name}</p>
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{emp.stitches.toLocaleString()} stitches</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", textAlign: "right" }}>{currency(emp.salary)}</span>
              <span style={{ fontSize: 12, fontWeight: 900, color: "#1e3a8a", textAlign: "right" }}>{currency(emp.bonus)}</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#111827", textAlign: "right" }}>{currency(emp.totalPay)}</span>
              <span style={{ fontSize: 12, color: "#6b7280", textAlign: "right" }}>{emp.entries}</span>
            </div>
          ))}
          {/* Totals row */}
          <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 82px 82px 88px 52px", gap: 8, padding: "9px 14px", borderTop: "2px solid #d1d5db", background: "#f9fafb" }}>
            <span />
            <span style={{ fontSize: 13, fontWeight: 900, color: "#111827" }}>Total</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: "#111827", textAlign: "right" }}>{currency(totalSalary)}</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: "#111827", textAlign: "right" }}>{currency(totalBonus)}</span>
            <span style={{ fontSize: 13, fontWeight: 900, color: "#111827", textAlign: "right" }}>{currency(totalPay)}</span>
            <span />
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "0 16px 14px" }}>
        {[
          { label: "Employees",     value: rows.length },
          { label: "Total Entries", value: rows.reduce((s, e) => s + e.entries, 0) },
          { label: "Total Stitches",value: rows.reduce((s, e) => s + e.stitches, 0).toLocaleString() },
        ].map((item) => (
          <div key={item.label} style={{ borderRadius: 10, border: "1px solid #e5e7eb", padding: "10px 12px", background: "#fff" }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>{item.label}</p>
            <p style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Signature lines */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, padding: "0 16px 16px" }}>
        <div style={{ borderTop: "1px solid #9ca3af", paddingTop: 6, fontSize: 11, color: "#6b7280" }}>Prepared by</div>
        <div style={{ borderTop: "1px solid #9ca3af", paddingTop: 6, fontSize: 11, color: "#6b7280", textAlign: "right" }}>Approved by</div>
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>StitchDesk</span>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>Embroidery Production &amp; Payout Management</span>
      </div>
    </div>
  );
}

function TableShell({
  children,
  empty,
  loading,
  emptyText,
}: {
  children: React.ReactNode;
  empty: boolean;
  loading: boolean;
  emptyText: string;
}) {
  if (loading) {
    return (
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skel" style={{ height: 44, borderRadius: 10 }} />
        ))}
      </div>
    );
  }

  if (empty) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <p className="muted" style={{ fontSize: 13 }}>{emptyText}</p>
      </div>
    );
  }

  return <>{children}</>;
}
