"use client";

import { CompanyProvider } from "@/context/CompanyContext";
import { UserProvider } from "@/context/UserContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <CompanyProvider>{children}</CompanyProvider>
    </UserProvider>
  );
}
