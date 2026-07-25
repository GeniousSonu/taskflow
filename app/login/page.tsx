"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Loader2,
  Mail,
  Lock,
  Zap,
  Users,
  BarChart3,
  GitBranch,
  Eye,
  EyeOff,
} from "lucide-react";

// Allow plain usernames (e.g. "admin") or real emails
const schema = z.object({
  email: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

const DEMO_USERS = [
  { name: "Sahinur Islam", email: "admin", password: "admin", role: "Admin" },
  { name: "Faisal", email: "faisal@ibarts.in", password: "admin", role: "Member" },
];

const FEATURES = [
  { icon: Zap, label: "Real-time collaboration", desc: "See changes instantly" },
  { icon: GitBranch, label: "Kanban boards", desc: "Drag & drop tasks" },
  { icon: Users, label: "Team presence", desc: "Know who's online" },
  { icon: BarChart3, label: "Analytics", desc: "Track team progress" },
];

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid credentials. Try admin / admin");
      setLoading(false);
    } else {
      router.push("/board");
    }
  }

  function loginAs(email: string, password: string) {
    setValue("email", email);
    setValue("password", password);
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "hsl(222 47% 6%)" }}
    >
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12"
        style={{
          background:
            "linear-gradient(135deg, hsl(239 84% 10%) 0%, hsl(222 47% 8%) 100%)",
          borderRight: "1px solid hsl(222 25% 14%)",
        }}
      >
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(239 84% 67%)" }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TaskFlow</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Built for teams
              <br />
              <span style={{ color: "hsl(239 84% 72%)" }}>that move fast.</span>
            </h1>
            <p className="text-lg mb-12" style={{ color: "hsl(215 20% 65%)" }}>
              Real-time kanban, subtasks, comments, and live collaboration — all
              in one beautiful workspace.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(99,102,241,0.15)" }}
                >
                  <f.icon
                    className="w-5 h-5"
                    style={{ color: "hsl(239 84% 72%)" }}
                  />
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{f.label}</div>
                  <div className="text-xs" style={{ color: "hsl(215 15% 45%)" }}>
                    {f.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-sm" style={{ color: "hsl(215 15% 45%)" }}>
          © 2026 TaskFlow · Blue Lane Cabinetry Workspace
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(239 84% 67%)" }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TaskFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
          <p className="mb-8" style={{ color: "hsl(215 20% 65%)" }}>
            Sign in to your workspace
          </p>

          {/* Quick-login cards */}
          <div
            className="mb-6 p-4 rounded-xl"
            style={{
              background: "hsl(222 35% 12%)",
              border: "1px solid hsl(222 25% 18%)",
            }}
          >
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "hsl(215 15% 45%)" }}
            >
              Quick login — Blue Lane Cabinetry
            </div>
            <div className="flex flex-col gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => loginAs(u.email, u.password)}
                  className="flex items-center justify-between p-2 rounded-lg text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        background:
                          u.role === "Admin" ? "#6366f1" : "#10b981",
                      }}
                    >
                      {u.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {u.name}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "hsl(215 15% 45%)" }}
                      >
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      color: "hsl(239 84% 72%)",
                    }}
                  >
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email / Username */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "hsl(215 20% 65%)" }}
              >
                Email or Username
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "hsl(215 15% 45%)" }}
                />
                <input
                  {...register("email")}
                  type="text"
                  placeholder="admin or you@example.com"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-2"
                  style={
                    {
                      background: "hsl(222 35% 12%)",
                      border: "1px solid hsl(222 25% 20%)",
                      "--tw-ring-color": "hsl(239 84% 67%)",
                    } as React.CSSProperties
                  }
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password with eye toggle */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "hsl(215 20% 65%)" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "hsl(215 15% 45%)" }}
                />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-2"
                  style={
                    {
                      background: "hsl(222 35% 12%)",
                      border: "1px solid hsl(222 25% 20%)",
                      "--tw-ring-color": "hsl(239 84% 67%)",
                    } as React.CSSProperties
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-white focus:outline-none"
                  style={{ color: "hsl(215 15% 45%)" }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div
                className="p-3 rounded-lg text-sm text-red-400"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, hsl(239 84% 67%), hsl(270 84% 67%))",
              }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p
            className="mt-6 text-center text-xs"
            style={{ color: "hsl(215 15% 45%)" }}
          >
            Demo credentials:{" "}
            <code className="text-indigo-400">admin</code>{" "}
            /{" "}
            <code className="text-indigo-400">admin</code>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
