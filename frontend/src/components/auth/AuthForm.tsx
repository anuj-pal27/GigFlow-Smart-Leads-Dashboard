import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../lib/api";
import type { ApiSuccessResponse, User } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "sales"]).optional()
});

const loginSchema = registerSchema.pick({ email: true, password: true });

type RegisterFormValues = z.infer<typeof registerSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

interface AuthFormProps {
  mode: "login" | "register";
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [apiError, setApiError] = useState<string>("");

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "sales"
    }
  });

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: RegisterFormValues | LoginFormValues) => {
    try {
      setApiError("");
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const response = await api.post<ApiSuccessResponse<{ token: string; user: User }>>(
        endpoint,
        values
      );

      login(response.data.data.token, response.data.data.user);

      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from ?? "/dashboard", { replace: true });
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ??
        "Something went wrong";
      setApiError(message);
    }
  };

  const isRegister = mode === "register";
  const formState = isRegister ? registerForm.formState : loginForm.formState;

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {isRegister ? "Create account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isRegister ? "Register to start managing leads." : "Login to access your dashboard."}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={toggleTheme}>
          {theme === "dark" ? "Light" : "Dark"}
        </Button>
      </div>

      {apiError ? (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {apiError}
        </div>
      ) : null}

      <form className="mt-4 space-y-4" onSubmit={(isRegister ? registerForm : loginForm).handleSubmit(onSubmit)}>
        {isRegister ? (
          <Input
            label="Full name"
            placeholder="Rahul Verma"
            error={registerForm.formState.errors.name?.message}
            {...registerForm.register("name")}
          />
        ) : null}
        <Input
          label="Email"
          type="email"
          placeholder="name@example.com"
          error={isRegister ? registerForm.formState.errors.email?.message : loginForm.formState.errors.email?.message}
          {...(isRegister ? registerForm.register("email") : loginForm.register("email"))}
        />
        <Input
          label="Password"
          type="password"
          placeholder="******"
          error={
            isRegister
              ? registerForm.formState.errors.password?.message
              : loginForm.formState.errors.password?.message
          }
          {...(isRegister ? registerForm.register("password") : loginForm.register("password"))}
        />
        {isRegister ? (
          <Select
            label="Role"
            options={[
              { value: "sales", label: "Sales User" },
              { value: "admin", label: "Admin" }
            ]}
            {...registerForm.register("role")}
          />
        ) : null}
        <Button type="submit" disabled={formState.isSubmitting} className="w-full">
          {formState.isSubmitting
            ? "Please wait..."
            : isRegister
              ? "Register"
              : "Login"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        {isRegister ? "Already have an account?" : "Need an account?"}{" "}
        <Link className="font-medium text-brand hover:underline" to={isRegister ? "/login" : "/register"}>
          {isRegister ? "Login" : "Register"}
        </Link>
      </p>
    </div>
  );
};
