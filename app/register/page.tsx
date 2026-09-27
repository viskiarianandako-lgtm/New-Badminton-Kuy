"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/src/lib/api";
import { Button, TextField } from "@/src/components/ui";
import { Layout } from "@/src/components/layout";
import { useToast } from "@/src/components/toast";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) {
      toast.show("Lengkapi data, kata sandi minimal 6 karakter", "error");
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      toast.show("Akun dibuat", "success");
      router.push("/my-sessions");
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Gagal daftar", "error");
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
            <h1 className="text-2xl font-extrabold text-on-surface">Daftar Host</h1>
            <p className="text-sm text-muted">Buat akun untuk menyelenggarakan sesi</p>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <TextField
              label="Nama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda"
              autoComplete="name"
              required
            />
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
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
              required
            />
            <Button type="submit" loading={loading}>
              Daftar
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm">
            <span className="text-muted">Sudah punya akun?</span>
            <Link href="/login" className="font-extrabold text-brand-primary hover:underline">
              Masuk
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
