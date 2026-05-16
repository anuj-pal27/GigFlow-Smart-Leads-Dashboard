import { Navigate } from "react-router-dom";
import { AuthForm } from "../components/auth/AuthForm";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <AuthForm mode="login" />
    </div>
  );
};
