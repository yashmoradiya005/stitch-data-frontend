import apiClient from "./api";
import axios from "axios";

export interface StitchEntry {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  employeeImage: string | null;
  date: string;
  shift: "day" | "night";
  machineNo: number;
  bonusRange: number;
  stitchCount: number;
  stitchPerPaisa: number;
  extraBonusCount: number;
  bonusEarned: number;
  createdAt: string;
}

export interface MonthlyStitchSummary {
  totals: {
    entries: number;
    totalStitch: number;
    totalBonus: number;
    activeEmployeeCount: number;
    dayStitch: number;
    nightStitch: number;
  };
  daily: { date: string; total: number }[];
  employees: {
    employeeId: string;
    name: string;
    salary: number | null;
    stitches: number;
    bonus: number;
    entries: number;
  }[];
  machines: { machine: number; total: number }[];
  recentEntries: StitchEntry[];
}

export interface CreateStitchPayload {
  companyId: string;
  employeeId: string;
  date: string;
  shift: "day" | "night";
  machineNo: number;
  bonusRange: number;
  stitchCount: number;
  stitchPerPaisa: number;
}

export async function createStitchEntry(payload: CreateStitchPayload): Promise<StitchEntry> {
  const res = await apiClient.post("/api/stitch-data", payload);
  return res.data;
}

export async function getDailyStitchData(companyId: string, date?: string): Promise<StitchEntry[]> {
  const params = new URLSearchParams({ companyId });
  if (date) params.set("date", date);
  const res = await apiClient.get(`/api/stitch-data?${params}`);
  return res.data;
}

export async function updateStitchEntry(id: string, payload: Omit<CreateStitchPayload, "companyId">): Promise<StitchEntry> {
  const res = await apiClient.put(`/api/stitch-data/${id}`, payload);
  return res.data;
}

export async function deleteStitchEntry(id: string): Promise<void> {
  await apiClient.delete(`/api/stitch-data/${id}`);
}

export async function getMonthlyStitchData(companyId: string, year: number, month: number): Promise<StitchEntry[]> {
  const res = await apiClient.get(`/api/stitch-data/monthly?companyId=${companyId}&year=${year}&month=${month}`);
  return res.data;
}

export async function getMonthlyStitchSummary(companyId: string, year: number, month: number): Promise<MonthlyStitchSummary> {
  try {
    const res = await apiClient.get(`/api/stitch-data/monthly-summary?companyId=${companyId}&year=${year}&month=${month}`);
    return res.data;
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) {
      throw error;
    }

    const entries = await getMonthlyStitchData(companyId, year, month);
    return buildMonthlySummary(entries);
  }
}

function buildMonthlySummary(entries: StitchEntry[]): MonthlyStitchSummary {
  const dailyMap = new Map<string, number>();
  const employeeMap = new Map<string, { employeeId: string; name: string; salary: number | null; stitches: number; bonus: number; entries: number }>();
  const machineMap = new Map<number, number>();
  let totalStitch = 0;
  let totalBonus = 0;
  let dayStitch = 0;
  let nightStitch = 0;

  for (const entry of entries) {
    totalStitch += entry.stitchCount;
    totalBonus += Number(entry.bonusEarned);
    if (entry.shift === "day") dayStitch += entry.stitchCount;
    else nightStitch += entry.stitchCount;

    dailyMap.set(entry.date, (dailyMap.get(entry.date) ?? 0) + entry.stitchCount);
    machineMap.set(entry.machineNo, (machineMap.get(entry.machineNo) ?? 0) + entry.stitchCount);

    const employee = employeeMap.get(entry.employeeId) ?? {
      employeeId: entry.employeeId,
      name: entry.employeeName,
      salary: null,
      stitches: 0,
      bonus: 0,
      entries: 0,
    };
    employee.stitches += entry.stitchCount;
    employee.bonus += Number(entry.bonusEarned);
    employee.entries += 1;
    employeeMap.set(entry.employeeId, employee);
  }

  return {
    totals: {
      entries: entries.length,
      totalStitch,
      totalBonus,
      activeEmployeeCount: employeeMap.size,
      dayStitch,
      nightStitch,
    },
    daily: [...dailyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total })),
    employees: [...employeeMap.values()].sort((a, b) => b.stitches - a.stitches),
    machines: [...machineMap.entries()]
      .sort(([, a], [, b]) => b - a)
      .map(([machine, total]) => ({ machine, total })),
    recentEntries: [...entries]
      .sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 4),
  };
}

export function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
