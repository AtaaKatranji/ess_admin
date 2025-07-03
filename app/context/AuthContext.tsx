"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type AdminRole = "admin" | "manager" | null;

interface AuthContextType {
  adminId: string | null;
  role: AdminRole;
  setAuthInfo: (info: { adminId: string; role: AdminRole }) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminId, setAdminId] = useState<string | null>(null);
  const [role, setRole] = useState<AdminRole>(null);

  useEffect(() => {
    // Load from localStorage if already logged in
    const savedAdminId = localStorage.getItem("adminId");
    const savedRole = localStorage.getItem("adminRole") as AdminRole | null;
    if (savedAdminId && savedRole) {
      setAdminId(savedAdminId);
      setRole(savedRole);
    }
  }, []);

  const setAuthInfo = ({ adminId, role }: { adminId: string; role: AdminRole }) => {
    setAdminId(adminId);
    setRole(role);
    localStorage.setItem("adminId", adminId);
    localStorage.setItem("adminRole", role ?? "");
  };

  const clearAuth = () => {
    setAdminId(null);
    setRole(null);
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminRole");
  };

  return (
    <AuthContext.Provider value={{ adminId, role, setAuthInfo, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
