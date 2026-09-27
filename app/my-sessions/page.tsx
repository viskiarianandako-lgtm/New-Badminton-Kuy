"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listSessions, getCurrentUser, logout } from "@/src/lib/api";
import type { Session } from "@/src/lib/supabase";
import { Layout } from "@/src/components/layout";
import { Button, Loader, EmptyState, Badge } from "@/src/components/ui";
import { useToast } from "@/src/components/toast";
import { Plus, LogOut, ArrowRight } from "lucide-react";

export default function MySessionsPage() {
  const router = useRouter();
  const toast = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUserId(user.id);
        const data = await listSessions(user.id);
        setSessions(data);
      } catch (e) {
        toast.show(e instanceof Error ? e.message : "Gagal memuat sesi", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.show("Berhasil keluar", "success");
      router.push("/");
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Gagal keluar", "error");
    }
  };

  if (loading) return <Loader label="Memuat sesi..." />;

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface">Sesi Saya</h1>
          <p className="text-sm text-muted">Kelola semua sesi mabar Anda</p>
        </div>
        <Button variant="outline" onClick={handleLogout} icon={<LogOut size={16} />}>
          Keluar
        </Button>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          title="Belum ada sesi"
          subtitle="Buat sesi pertama Anda untuk mulai mabar"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => router.push(`/session/${session.code}`)}
              className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary p-4 text-left transition-all hover:border-brand"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-bold text-on-surface">{session.name}</p>
                  <Badge label={session.status === "active" ? "Aktif" : "Selesai"} tone={session.status === "active" ? "success" : "neutral"} />
                </div>
                <p className="text-xs text-muted">
                  {session.date} · {session.location} · {session.num_courts} lapangan
                </p>
                <p className="text-xs font-bold text-brand">{session.code}</p>
              </div>
              <ArrowRight size={20} className="text-muted" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Button onClick={() => router.push("/create-session")} icon={<Plus size={18} />} className="w-full">
          Buat Sesi Baru
        </Button>
      </div>
    </Layout>
  );
}
