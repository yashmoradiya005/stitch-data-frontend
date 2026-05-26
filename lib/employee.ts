import apiClient from "./api";

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  phone: string | null;
  imageData: string | null;
  createdAt: string;
}

export async function createEmployee(
  companyId: string,
  name: string,
  phone: string,
  imageData?: string
): Promise<Employee> {
  const res = await apiClient.post("/api/employees", { companyId, name, phone, imageData });
  return res.data;
}

export async function getEmployees(companyId: string): Promise<Employee[]> {
  const res = await apiClient.get(`/api/employees?companyId=${companyId}`);
  return res.data;
}

export async function updateEmployee(
  id: string,
  name: string,
  phone: string,
  imageData?: string | null
): Promise<Employee> {
  const res = await apiClient.put(`/api/employees/${id}`, { name, phone, imageData });
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
