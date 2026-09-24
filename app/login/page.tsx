"use client";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // Prevent duplicate login requests.
    if (loading) {
      return;
    }

    const trimmedUsername = username.trim();

    if (!trimmedUsername || !password) {
      toast.error("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await authService.login({
        username: trimmedUsername,
        password,
      });

      authService.saveSession(data, rememberMe);

      toast.success("Signed in successfully");

      // Return to the page the user originally tried to open.
      // Fall back to the products page for a normal login.
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");

      const safeRedirect =
        redirect &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//")
          ? redirect
          : "/products";

      router.replace(safeRedirect);
    } catch (error) {
      console.error("Login failed:", error);

      const status = (
        error as {
          response?: {
            status?: number;
          };
        }
      )?.response?.status;

      if (status === 400 || status === 401) {
        toast.error("Invalid username or password.");
      } else {
        toast.error(
          "Unable to sign in right now. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] lg:h-screen lg:overflow-hidden">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-5 py-5 sm:px-8 lg:h-full lg:min-h-0 lg:px-10 lg:py-5">
        <div className="grid w-full overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] lg:h-full lg:min-h-0 lg:grid-cols-2">
          {/* LEFT SECTION */}
          <section className="relative hidden min-h-170 overflow-hidden bg-linear-to-br from-[#eef2ff] via-white to-[#f5f3ff] p-12 lg:flex lg:min-h-0 lg:flex-col">
            {/* Decorative circles */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-100/70" />
            <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-violet-100/60" />

            {/* Logo */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4f46e5] text-white shadow-lg shadow-indigo-200">
                <span className="text-lg font-bold">S</span>
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight text-[#0f172a]">
                  ShopAdmin
                </p>
                <p className="text-xs text-[#64748b]">
                  Product Management
                </p>
              </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-1 flex-col justify-center">
              <div className="max-w-md">
                <span className="mb-5 inline-flex items-center rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-[#4f46e5] shadow-sm">
                  Product Admin Dashboard
                </span>

                <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#0f172a] xl:text-5xl">
                  Manage your products
                  <span className="block text-[#4f46e5]">
                    effortlessly.
                  </span>
                </h1>

                <p className="mt-5 max-w-md text-base leading-7 text-[#64748b]">
                  A simple and powerful workspace to manage your product
                  inventory, monitor stock and keep everything organized.
                </p>

                {/* Feature list */}
                <div className="mt-9 space-y-4">
                  {[
                    "Secure and reliable access",
                    "Fast product management",
                    "Clean and intuitive interface",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-sm font-medium text-[#334155]"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[#4f46e5]">
                        <ShieldCheck size={16} />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom decoration */}
            <div className="relative z-10 mt-auto">
              <div className="h-1 w-16 rounded-full bg-[#4f46e5]" />
              <p className="mt-3 text-xs text-[#94a3b8]">
                Simple. Secure. Productive.
              </p>
            </div>
          </section>

          {/* RIGHT SECTION */}
          <section className="flex min-h-170 items-center justify-center p-6 sm:p-10 lg:min-h-0 lg:p-14">
            <div className="w-full max-w-md">
              {/* Mobile logo */}
              <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4f46e5] text-white shadow-lg shadow-indigo-200">
                  <span className="text-lg font-bold">S</span>
                </div>

                <div>
                  <p className="text-lg font-bold tracking-tight text-[#0f172a]">
                    ShopAdmin
                  </p>
                  <p className="text-xs text-[#64748b]">
                    Product Management
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-[#0f172a]">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-[#64748b]">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold text-[#334155]"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    placeholder="Enter your username"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#334155]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-[#e2e8f0] bg-white pl-11 pr-12 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#94a3b8] transition hover:bg-slate-50 hover:text-[#475569] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#64748b]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(event.target.checked)
                      }
                      disabled={loading}
                      className="h-4 w-4 rounded border-[#cbd5e1] accent-[#4f46e5]"
                    />
                    Remember me
                  </label>
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4f46e5] text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#4338ca] hover:shadow-xl hover:shadow-indigo-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              {/* Demo credentials */}
              <div className="mt-7 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <p className="text-xs font-semibold text-[#4338ca]">
                  Demo credentials
                </p>

                <div className="mt-2 space-y-1 text-xs text-[#64748b]">
                  <p>
                    Username:{" "}
                    <span className="font-medium text-[#334155]">
                      emilys
                    </span>
                  </p>

                  <p>
                    Password:{" "}
                    <span className="font-medium text-[#334155]">
                      emilyspass
                    </span>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <p className="mt-8 text-center text-xs text-[#94a3b8]">
                © 2026 ShopAdmin. All rights reserved.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
