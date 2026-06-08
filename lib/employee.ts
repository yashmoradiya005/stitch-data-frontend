import apiClient from "./api";

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  phone: string | null;
  salary: number | null;
  imageData: string | null;
  createdAt: string;
}

export async function createEmployee(
  companyId: string,
  name: string,
  phone: string,
  salary?: number | null,
  imageData?: string
): Promise<Employee> {
  const res = await apiClient.post("/api/employees", { companyId, name, phone, salary, imageData });
  return res.data;
}

export async function getEmployees(companyId: string, options?: { includeImages?: boolean }): Promise<Employee[]> {
  const params = new URLSearchParams({ companyId });
  if (options?.includeImages === false) params.set("includeImages", "false");
  const res = await apiClient.get(`/api/employees?${params}`);
  return res.data;
}

export async function updateEmployee(
  id: string,
  name: string,
  phone: string,
  salary?: number | null,
  imageData?: string | null
): Promise<Employee> {
  const res = await apiClient.put(`/api/employees/${id}`, { name, phone, salary, imageData });
  return res.data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await apiClient.delete(`/api/employees/${id}`);
}

export interface SalaryRecord {
  employeeId: string;
  employeeName: string;
  monthlySalary: number | null;
  leaveDays: number;
  dailyRate: number;
  deduction: number;
  finalSalary: number;
}

export function calcSalary(monthlySalary: number | null, leaveDays: number): { dailyRate: number; deduction: number; finalSalary: number } {
  if (!monthlySalary || monthlySalary <= 0) return { dailyRate: 0, deduction: 0, finalSalary: 0 };
  const dailyRate = Math.round((monthlySalary / 30) * 100) / 100;
  const deduction = Math.round(dailyRate * leaveDays * 100) / 100;
  const finalSalary = Math.max(0, Math.round((monthlySalary - deduction) * 100) / 100);
  return { dailyRate, deduction, finalSalary };
}

export async function getLeaveDays(companyId: string, year: number, month: number): Promise<SalaryRecord[]> {
  const params = new URLSearchParams({ companyId, year: String(year), month: String(month) });
  const res = await apiClient.get(`/api/salary/leaves?${params}`);
  return res.data;
}

export async function setLeaveDays(
  companyId: string,
  employeeId: string,
  year: number,
  month: number,
  leaveDays: number
): Promise<SalaryRecord> {
  const res = await apiClient.post("/api/salary/leaves", { companyId, employeeId, year, month, leaveDays });
  return res.data;
}

export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
