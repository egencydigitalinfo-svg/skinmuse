"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "superAdmin"; // ✅ Added superadmin
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = "https://backendskinmuse.vercel.app/api/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const restoreSession = () => {
    // 1. SuperAdmin first
    const superAdminUser = localStorage.getItem("skinmuse_superadmin_user");
    const superAdminToken = localStorage.getItem("skinmuse_superadmin_token");
    if (superAdminUser && superAdminToken) {
      const parsed = JSON.parse(superAdminUser);
      setUser(parsed);
      axios.defaults.headers.common["Authorization"] = `Bearer ${superAdminToken}`;
      setLoading(false);
      return;
    }

    // 2. Admin next
    const adminUser = localStorage.getItem("skinmuse_admin_user");
    const adminToken = localStorage.getItem("skinmuse_admin_token");
    if (adminUser && adminToken) {
      const parsed = JSON.parse(adminUser);
      setUser(parsed);
      axios.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;
      setLoading(false);
      return;
    }

    // 3. Customer last
    const storedUser = localStorage.getItem("skinmuse_user");
    const token = localStorage.getItem("skinmuse_token");
    if (storedUser && token) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  restoreSession();
}, []);

  // ✅ Register user
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
      });
      const { user: newUser, token } = res.data;

      setUser(newUser);
      localStorage.setItem("skinmuse_user", JSON.stringify(newUser));
      localStorage.setItem("skinmuse_token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return {
        success: false,
        error: err.response?.data?.error || err.message,
      };
    }
  };

  // ✅ Login for customer, admin & superadmin
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const { user: loggedInUser, token } = res.data;

      setUser(loggedInUser);

      if (loggedInUser.role === "superAdmin") {
        localStorage.setItem("skinmuse_superadmin_user", JSON.stringify(loggedInUser));
        localStorage.setItem("skinmuse_superadmin_token", token);
      } else if (loggedInUser.role === "admin") {
        localStorage.setItem("skinmuse_admin_user", JSON.stringify(loggedInUser));
        localStorage.setItem("skinmuse_admin_token", token);
      } else {
        localStorage.setItem("skinmuse_user", JSON.stringify(loggedInUser));
        localStorage.setItem("skinmuse_token", token);
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return {
        success: false,
        error: err.response?.data?.error || err.message,
      };
    }
  };

  // ✅ Logout
  const logout = () => {
    if (user?.role === "superAdmin") {
      localStorage.removeItem("skinmuse_superadmin_user");
      localStorage.removeItem("skinmuse_superadmin_token");
    } else if (user?.role === "admin") {
      localStorage.removeItem("skinmuse_admin_user");
      localStorage.removeItem("skinmuse_admin_token");
    } else {
      localStorage.removeItem("skinmuse_user");
      localStorage.removeItem("skinmuse_token");
    }

    setUser(null);
    delete axios.defaults.headers.common["Authorization"];

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
