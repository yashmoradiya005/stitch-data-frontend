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

export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
