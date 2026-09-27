"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui";
import { Layout } from "@/src/components/layout";
import { Plus, Users, Tv, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-inverse to-surface-inverse/90 p-8 text-white md:p-12">
        <div className="absolute -right-12 -top-12 text-[180px] opacity-10 rotate-[-18deg]">
          🏸
        </div>
        <div className="relative z-10">
          <p className="mb-2 text-sm font-bold text-white/80">BADMINTON KUY</p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-6xl">
            Datang.
            <br />
            Join.
            <br />
            Gas Mabar.
          </h1>
          <p className="mb-8 max-w-md text-base text-white/80 md:text-lg">
            Temukan format main badminton yang seru: masuk pakai kode, kumpulkan pemain, lalu biarkan sistem mengacak pasangan dan rotasi supaya semua kebagian main.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/create-session">
              <Button className="bg-brand text-on-brand hover:bg-brand/90">
                <Plus size={20} />
                Buat Sesi
              </Button>
            </Link>
            <Link href="/join">
              <Button variant="secondary">
                <Users size={20} />
                Gabung Sesi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-tertiary text-on-brand-tertiary">
              <Plus size={24} />
            </div>
            <h3 className="mb-2 text-lg font-extrabold text-on-surface">1. Host bikin sesi</h3>
            <p className="text-sm text-muted">Atur nama, jumlah lapangan, dan target game.</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-tertiary text-on-brand-tertiary">
              <Users size={24} />
            </div>
            <h3 className="mb-2 text-lg font-extrabold text-on-surface">2. Share kode</h3>
            <p className="text-sm text-muted">Teman masuk cukup dengan nama + kode sesi.</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-tertiary text-on-brand-tertiary">
              <Tv size={24} />
            </div>
            <h3 className="mb-2 text-lg font-extrabold text-on-surface">3. Random & rotasi</h3>
            <p className="text-sm text-muted">Klik &quot;Kuy Random!&quot; untuk susun match berikutnya.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-extrabold text-on-surface">🎲 Random Fair</h3>
            <p className="text-sm text-muted">Prioritaskan pemain yang lebih sedikit bermain dan kurangi pengulangan pasangan.</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-extrabold text-on-surface">🏟️ Multi Court</h3>
            <p className="text-sm text-muted">Cocok untuk mabar beberapa lapangan sekaligus.</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-extrabold text-on-surface">📊 Statistik</h3>
            <p className="text-sm text-muted">Menang, kalah, game dimainkan, dan win rate per sesi.</p>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center gap-4 rounded-xl bg-brand-tertiary p-6">
          <div className="flex items-center gap-3">
            <Tv size={24} className="text-brand" />
            <div>
              <p className="text-base font-extrabold text-on-surface">Papan skor langsung</p>
              <p className="text-sm text-on-brand-tertiary">Untuk TV atau HP lain di lapangan</p>
            </div>
          </div>
          <Link href="/display" className="ml-auto">
            <Button variant="outline">
              Buka
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
