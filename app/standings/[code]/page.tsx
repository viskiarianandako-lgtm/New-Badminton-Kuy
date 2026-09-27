"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { getSessionByCode, listPlayers, listMatches, subscribeToMatches } from "@/src/lib/api";
import type { Session, Player, Match } from "@/src/lib/supabase";
import { Layout } from "@/src/components/layout";
import { Loader, EmptyState, Avatar } from "@/src/components/ui";
import { ArrowLeft, Trophy } from "lucide-react";

export default function StandingsPage() {
  const params = useParams();
  const code = params.code as string;

  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [s, p, m] = await Promise.all([
        getSessionByCode(code),
        listPlayers(code),
        listMatches(code),
      ]);
      setSession(s);
      setPlayers(p);
      setMatches(m);
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

  // Calculate standings
  const stats: Record<string, { wins: number; losses: number; games: number }> = {};
  players.forEach((p) => {
    stats[p.id] = { wins: 0, losses: 0, games: 0 };
  });

  matches.forEach((m) => {
    if (m.status === "finished" && m.winner) {
      const winnerTeam = m.winner === "a" ? m.team_a : m.team_b;
      const loserTeam = m.winner === "a" ? m.team_b : m.team_a;
      winnerTeam.forEach((pid) => {
        if (stats[pid]) {
          stats[pid].wins++;
          stats[pid].games++;
        }
      });
      loserTeam.forEach((pid) => {
        if (stats[pid]) {
          stats[pid].losses++;
          stats[pid].games++;
        }
      });
    }
  });

  const standings = players
    .map((p) => ({
      ...p,
      ...stats[p.id],
      winRate: stats[p.id].games > 0 ? (stats[p.id].wins / stats[p.id].games) * 100 : 0,
    }))
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => history.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-tertiary">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-onSurface">Riwayat Skor</h1>
          <p className="text-sm text-muted">{session.name}</p>
        </div>
      </div>

      {standings.length === 0 ? (
        <EmptyState title="Belum ada data" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface-secondary">
          <div className="grid grid-cols-12 gap-2 border-b border-divider bg-surface-tertiary p-3 text-xs font-extrabold uppercase text-muted">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Pemain</div>
            <div className="col-span-2 text-center">Menang</div>
            <div className="col-span-2 text-center">Kalah</div>
            <div className="col-span-2 text-center">Win%</div>
          </div>
          {standings.map((player, idx) => (
            <div key={player.id} className="grid grid-cols-12 items-center gap-2 border-b border-divider p-3 last:border-0">
              <div className="col-span-1">
                {idx === 0 && <Trophy size={16} className="text-brand" />}
                <span className="text-sm font-bold text-onSurface">{idx + 1}</span>
              </div>
              <div className="col-span-5 flex items-center gap-2">
                <Avatar name={player.name} size={32} />
                <span className="text-sm font-bold text-onSurface truncate">{player.name}</span>
              </div>
              <div className="col-span-2 text-center text-sm font-bold text-success">{player.wins}</div>
              <div className="col-span-2 text-center text-sm font-bold text-error">{player.losses}</div>
              <div className="col-span-2 text-center text-sm font-bold text-onSurface">{player.winRate.toFixed(0)}%</div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
