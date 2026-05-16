import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../lib/api";
import type { ApiSuccessResponse, User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_STORAGE_KEY = "smart-leads-user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(token && !user));

  useEffect(() => {
    const loadMe = async () => {
      if (!token || user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<ApiSuccessResponse<{ user: User }>>("/auth/me");
        setUser(response.data.data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.data.user));
      } catch (_error) {
        localStorage.removeItem("token");
        localStorage.removeItem(USER_STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadMe();
  }, [token, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      login: (newToken: string, newUser: User) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem(USER_STORAGE_KEY);
        setToken(null);
        setUser(null);
      }
    }),
    [isLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
