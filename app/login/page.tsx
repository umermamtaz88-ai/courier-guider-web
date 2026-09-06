"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/lib/api/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/shared/Button";
import { ErrorState } from "@/components/shared/Status";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { loginSuccess } = useAuth();
  const [error, setError] = useState<"auth" | "backend" | false>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(false);
    try {
      await login(data.email, data.password);
      await loginSuccess();
      router.push("/chat");
    } catch (err) {
      if (err instanceof TypeError) {
        setError("backend");
      } else {
        setError("auth");
      }
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-brass/30 bg-brass/10">
              <span className="font-serif text-brass">CG</span>
            </div>
          </Link>
          <h1 className="font-serif text-2xl text-foreground">Sign in</h1>
          <p className="text-sm text-muted mt-1">Access your research desk</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-border/60 bg-surface p-6 space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-xs text-muted mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2.5 text-sm text-foreground focus:border-brass/40 focus:outline-none"
            />
            {errors.email && (
              <p className="text-xs text-error mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs text-muted mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2.5 text-sm text-foreground focus:border-brass/40 focus:outline-none"
            />
            {errors.password && (
              <p className="text-xs text-error mt-1">{errors.password.message}</p>
            )}
          </div>

          {error === "auth" && (
            <ErrorState
              type="auth_required"
              message="Invalid email or password."
              onRetry={() => setError(false)}
            />
          )}
          {error === "backend" && (
            <ErrorState
              type="backend_unavailable"
              onRetry={() => setError(false)}
            />
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          No account?{" "}
          <Link href="/register" className="text-brass hover:text-brass-light">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
