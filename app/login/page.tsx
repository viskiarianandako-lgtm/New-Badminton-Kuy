"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/src/lib/api";
import { Button, TextField } from "@/src/components/ui";
import { Layout } from "@/src/components/layout";
import { useToast } from "@/src/components/toast";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    console.log("[LOGIN_FLOW] submit handler entered");
    e.preventDefault();
    console.log("[LOGIN_FLOW] preventDefault completed");
    if (!email.trim() || !password) {
      toast.show("Isi email dan kata sandi", "error");
      return;
    }
    setLoading(true);
    try {
      console.log("[LOGIN_FLOW] calling login()");
      await login(email.trim(), password);
      console.log("[LOGIN_FLOW] login returned successfully");
      toast.show("Berhasil masuk", "success");
      console.log("[LOGIN_FLOW] redirecting to my-sessions");
      router.push("/my-sessions");
    } catch (e) {
      console.log("[LOGIN_FLOW] login failed");
      toast.show(e instanceof Error ? e.message : "Gagal masuk", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-tertiary">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface">Masuk Host</h1>
            <p className="text-sm text-muted">Kelola sesi mabar Anda</p>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="host@email.com"
              autoComplete="email"
              required
            />
            <TextField
              label="Kata Sandi"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
              required
            />
            <Button type="submit" loading={loading}>
              Masuk
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm">
            <span className="text-muted">Belum punya akun?</span>
            <Link href="/register" className="font-extrabold text-brand-primary hover:underline">
              Daftar
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
