"use client";

import { createContext, useContext, useState } from "react";
import { AuthUser, getStoredUser } from "@/lib/auth";

interface UserContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") return getStoredUser();
    return null;
  });

  const setUser = (user: AuthUser) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUserState(user);
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
