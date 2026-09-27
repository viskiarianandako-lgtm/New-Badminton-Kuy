"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSessionByCode, listMatches, subscribeToMatches } from "@/src/lib/api";
import type { Session, Match } from "@/src/lib/supabase";
import { Layout } from "@/src/components/layout";
import { Loader } from "@/src/components/ui";
import { X } from "lucide-react";

export default function ScoreboardPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [session, setSession] = useState<Session | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [s, m] = await Promise.all([
        getSessionByCode(code),
        listMatches(code),
      ]);
      setSession(s);
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

  if (loading) return <Loader label="Memuat..." />;
  if (!session) return null;

  const courts = Array.from({ length: session.num_courts }, (_, i) => i + 1);
  const activePerCourt = courts.map((court) => {
    const inCourt = matches.filter((m) => m.court === court);
    const live = inCourt.find((m) => m.status === "in_progress");
    const pending = inCourt.filter((m) => m.status === "pending").sort((a, b) => a.round - b.round)[0];
    const finished = inCourt.filter((m) => m.status === "finished").sort((a, b) => b.round - a.round)[0];
    return { court, match: live ?? pending ?? finished ?? null };
  });

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-xl font-extrabold">{session?.name ?? "Badminton Kuy"}</h1>
          <p className="text-sm text-gray-400">Kode {code} · {session?.scoring_rule ?? ""} rally point</p>
        </div>
        <button onClick={() => router.back()} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10">
          <X size={24} />
        </button>
      </div>

      {/* Courts grid */}
      <div className="grid gap-4 p-4">
        {activePerCourt.map(({ court, match }) => (
          <div key={court} className="rounded-2xl bg-[#1A1A1A] p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-extrabold tracking-widest text-[#B5FF3A]">LAPANGAN {court}</p>
              {match && (
                <p className="text-xs font-extrabold tracking-wider text-[#E7A200]">
                  {match.status === "in_progress" ? "● LIVE" : match.status === "finished" ? "SELESAI" : `RONDE ${match.round}`}
                </p>
              )}
            </div>
            {match ? (
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <p className={`text-base font-bold ${match.winner === "a" ? "text-[#B5FF3A]" : "text-gray-300"}`}>
                    {match.team_a_names.join(" & ")}
                  </p>
                  <p className={`text-6xl font-extrabold leading-none ${match.winner === "a" ? "text-[#B5FF3A]" : "text-white"}`}>
                    {match.score_a}
                  </p>
                </div>
                <p className="text-4xl font-extrabold text-gray-500 px-4">:</p>
                <div className="flex-1 text-center">
                  <p className={`text-base font-bold ${match.winner === "b" ? "text-[#B5FF3A]" : "text-gray-300"}`}>
                    {match.team_b_names.join(" & ")}
                  </p>
                  <p className={`text-6xl font-extrabold leading-none ${match.winner === "b" ? "text-[#B5FF3A]" : "text-white"}`}>
                    {match.score_b}
                  </p>
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-sm font-semibold text-gray-500">Menunggu pertandingan...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
