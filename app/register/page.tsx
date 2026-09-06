"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { register as registerUser } from "@/lib/api/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/shared/Button";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  tenant_name: z.string().min(2, "Business name is required"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { loginSuccess } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await registerUser(data.email, data.name, data.password, data.tenant_name);
      await loginSuccess();
      router.push("/chat");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
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
          <h1 className="font-serif text-2xl text-foreground">Create account</h1>
          <p className="text-sm text-muted mt-1">Start your logistics research desk</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-border/60 bg-surface p-6 space-y-4"
        >
          {(["name", "email", "password", "tenant_name"] as const).map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-xs text-muted mb-1.5 capitalize">
                {field === "tenant_name" ? "Business name" : field}
              </label>
              <input
                id={field}
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                autoComplete={
                  field === "email"
                    ? "email"
                    : field === "password"
                      ? "new-password"
                      : "name"
                }
                {...register(field)}
                className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2.5 text-sm text-foreground focus:border-brass/40 focus:outline-none"
              />
              {errors[field] && (
                <p className="text-xs text-error mt-1">{errors[field]?.message}</p>
              )}
            </div>
          ))}

          {error && <p className="text-xs text-error">{error}</p>}

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brass hover:text-brass-light">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
