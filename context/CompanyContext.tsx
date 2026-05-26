"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCompanies, Company } from "@/lib/company";
import { isAuthenticated } from "@/lib/auth";

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  setCurrentCompany: (company: Company) => void;
  refreshCompanies: () => Promise<void>;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextType | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompanyState] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCompanies = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getCompanies();
      setCompanies(data);
      const savedId = localStorage.getItem("currentCompanyId");
      const saved = data.find((c) => c.id === savedId);
      if (saved) {
        setCurrentCompanyState(saved);
      } else if (data.length > 0) {
        // default to most recently created business
        const latest = data[data.length - 1];
        setCurrentCompanyState(latest);
        localStorage.setItem("currentCompanyId", latest.id);
      }
    } catch {
      // not authenticated or network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCompanies();
  }, [refreshCompanies]);

  const setCurrentCompany = (company: Company) => {
    setCurrentCompanyState(company);
    localStorage.setItem("currentCompanyId", company.id);
  };

  return (
    <CompanyContext.Provider value={{ companies, currentCompany, setCurrentCompany, refreshCompanies, loading }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}
