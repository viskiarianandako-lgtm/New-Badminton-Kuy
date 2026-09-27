"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { joinSession, getSessionByCode } from "@/src/lib/api";
import { Button, TextField } from "@/src/components/ui";
import { Layout } from "@/src/components/layout";
import { useToast } from "@/src/components/toast";
import { ArrowLeft, CheckCircle } from "lucide-react";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isMember, setIsMember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionName, setSessionName] = useState("");

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setCode(codeParam.toUpperCase());
    }
  }, [searchParams]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c || !name.trim()) {
      toast.show("Isi kode sesi dan nama Anda", "error");
      return;
    }
    setLoading(true);
    try {
      const player = await joinSession(c, name.trim(), isMember);
      const session = await getSessionByCode(c);
      setSessionName(session.name);
      setSuccess(true);
      toast.show("Berhasil gabung!", "success");
      localStorage.setItem(`bk_player_${c}`, player.id);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Gagal gabung", "error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="mx-auto max-w-md text-center">
          <div className="rounded-xl border border-border bg-surface-secondary p-8 shadow-sm">
            <CheckCircle size={48} className="mx-auto mb-4 text-success" />
            <h1 className="mb-2 text-2xl font-extrabold text-on-surface">Berhasil Gabung!</h1>
            <p className="mb-6 text-sm text-muted">Anda telah bergabung di sesi &quot;{sessionName}&quot;</p>
            <Button onClick={() => router.push(`/session/${code.toUpperCase()}`)} className="w-full">
              Buka Sesi
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-tertiary">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-onSurface">Gabung Main</h1>
            <p className="text-sm text-muted">Masukkan kode sesi & nama Anda</p>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <TextField
              label="Kode Sesi"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="8A4TKH"
              maxLength={6}
              className="uppercase tracking-widest text-center text-xl font-bold"
              required
            />

            <TextField label="Nama Pemain" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" required />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-onSurface">Status Pemain</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsMember(true)}
                  className={`flex-1 rounded-md border-2 py-3 text-center text-sm font-bold transition-all ${
                    isMember
                      ? "border-brand bg-brand-secondary text-on-brand-secondary"
                      : "border-border bg-surface-tertiary text-on-surface-tertiary"
                  }`}
                >
                  Member
                </button>
                <button
                  type="button"
                  onClick={() => setIsMember(false)}
                  className={`flex-1 rounded-md border-2 py-3 text-center text-sm font-bold transition-all ${
                    !isMember
                      ? "border-brand bg-brand-secondary text-on-brand-secondary"
                      : "border-border bg-surface-tertiary text-on-surface-tertiary"
                  }`}
                >
                  Non-Member
                </button>
              </div>
              {!isMember && (
                <p className="text-xs text-muted">Non-member mungkin dikenakan biaya sesuai aturan sesi.</p>
              )}
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Gabung
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            QR scan akan tersedia segera. Gunakan kode sesi untuk bergabung.
          </p>
        </form>
      </div>
    </Layout>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div>Memuat...</div>}>
      <JoinForm />
    </Suspense>
  );
}
