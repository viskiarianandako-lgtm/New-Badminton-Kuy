"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/src/components/layout";
import { Button, TextField } from "@/src/components/ui";
import { ArrowLeft } from "lucide-react";

export default function DisplayPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-tertiary">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface">Papan Skor</h1>
            <p className="text-sm text-muted">Masukkan kode sesi untuk menampilkan papan skor</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
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
            <Button
              onClick={() => code.trim() && router.push(`/scoreboard/${code.trim().toUpperCase()}`)}
              disabled={!code.trim()}
              className="w-full"
            >
              Tampilkan Papan Skor
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
