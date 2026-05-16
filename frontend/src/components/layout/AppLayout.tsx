import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../ui/Button";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Smart Leads Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Logged in as {user?.name} ({user?.role})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={toggleTheme}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </Button>
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
};
