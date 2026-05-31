"use client";

import { CompanyProvider } from "@/context/CompanyContext";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <CompanyProvider>{children}</CompanyProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
