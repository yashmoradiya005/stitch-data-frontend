import apiClient from "./api";

export interface Company {
  id: string;
  name: string;
  machineCount: number;
  createdAt: string;
}

export async function createCompany(name: string, machineCount: number): Promise<Company> {
  const response = await apiClient.post("/api/companies", { name, machineCount });
  return response.data;
}

export async function getCompanies(): Promise<Company[]> {
  const response = await apiClient.get("/api/companies");
  return response.data;
}
