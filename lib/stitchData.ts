import apiClient from "./api";

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

export function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
