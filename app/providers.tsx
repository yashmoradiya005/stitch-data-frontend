"use client";

import { CompanyProvider } from "@/context/CompanyContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CompanyProvider>{children}</CompanyProvider>;
}
