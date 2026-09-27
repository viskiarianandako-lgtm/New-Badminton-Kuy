"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSessionByCode, listMatches, subscribeToMatches } from "@/src/lib/api";
import type { Session, Match } from "@/src/lib/supabase";
import { Layout } from "@/src/components/layout";
import { Loader, EmptyState, Badge } from "@/src/components/ui";
import { ArrowLeft, Calendar } from "lucide-react";

export default function MyMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [session, setSession] = useState<Session | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [s, m] = await Promise.all([
        getSessionByCode(code),
        listMatches(code),
      ]);
      setSession(s);
      setMatches(m);
      const pid = localStorage.getItem(`bk_player_${code}`) || "";
      setMyPlayerId(pid);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchData();
    const unsub = subscribeToMatches(code, () => fetchData());
    return () => unsub();
  }, [code, fetchData]);

  if (loading) return <Loader />;
  if (!session) return <EmptyState title="Sesi tidak ditemukan" />;

  const myMatches = myPlayerId
    ? matches.filter((m) => m.team_a.includes(myPlayerId) || m.team_b.includes(myPlayerId))
    : [];

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-tertiary">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface">Jadwal Saya</h1>
          <p className="text-sm text-muted">{session.name}</p>
        </div>
      </div>

      {myMatches.length === 0 ? (
        <EmptyState
          title="Belum ada jadwal"
          subtitle="Anda belum terdaftar di pertandingan mana pun"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {myMatches.map((match) => {
            const isTeamA = match.team_a.includes(myPlayerId);
            const myTeam = isTeamA ? match.team_a_names : match.team_b_names;
            const opponent = isTeamA ? match.team_b_names : match.team_a_names;
            const finished = match.status === "finished";
            const iWon = (isTeamA && match.winner === "a") || (!isTeamA && match.winner === "b");

            return (
              <div key={match.id} className="rounded-xl border border-border bg-surface-secondary p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-on-brand-secondary">Lapangan {match.court} · Ronde {match.round}</p>
                  <Badge
                    label={finished ? (iWon ? "Menang" : "Kalah") : match.status === "in_progress" ? "Berlangsung" : "Menunggu"}
                    tone={finished ? (iWon ? "success" : "neutral") : match.status === "in_progress" ? "success" : "warning"}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-onSurface">{myTeam.join(" & ")}</p>
                    <p className="text-xs text-muted">vs {opponent.join(" & ")}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-surface-tertiary px-3 py-1">
                    <span className="text-lg font-extrabold text-onSurface">{isTeamA ? match.score_a : match.score_b}</span>
                    <span className="text-muted">:</span>
                    <span className="text-lg font-extrabold text-onSurface">{isTeamA ? match.score_b : match.score_a}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
