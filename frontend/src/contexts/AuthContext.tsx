import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, loginUser, registerUser, updateWalletAddress } from "@/services/api";
import type { User } from "@/services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: "student" | "issuer" | "verifier";
    institution?: string;
  }) => Promise<void>;
  logout: () => void;
  linkWallet: (address: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("certchain_token")
  );
  const [loading, setLoading] = useState(true);

  // Load user profile from token on mount
  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem("certchain_token");
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getMe();
      setUser(data.user);
    } catch {
      // Token is invalid or expired
      localStorage.removeItem("certchain_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string, role?: string) => {
    const data = await loginUser({ email, password, role });
    localStorage.setItem("certchain_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role: "student" | "issuer" | "verifier";
    institution?: string;
  }) => {
    const data = await registerUser(userData);
    localStorage.setItem("certchain_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("certchain_token");
    setToken(null);
    setUser(null);
  };

  const linkWallet = async (address: string) => {
    const data = await updateWalletAddress(address);
    setUser(data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        linkWallet,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
