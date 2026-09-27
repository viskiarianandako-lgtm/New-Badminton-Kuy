"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSessionByCode, listMatches, updateMatchScore, resetMatch, subscribeToMatches } from "@/src/lib/api";
import type { Session, Match } from "@/src/lib/supabase";
import { Layout } from "@/src/components/layout";
import { Loader, Button } from "@/src/components/ui";
import { useToast } from "@/src/components/toast";
import { ArrowLeft, RotateCcw, Trophy, Minus } from "lucide-react";
import { clsx } from "clsx";

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const code = params.code as string;
  const id = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [s, matches] = await Promise.all([
        getSessionByCode(code),
        listMatches(code),
      ]);
      setSession(s);
      const m = matches.find((x) => x.id === id);
      if (m) {
        setMatch(m);
        setScoreA(m.score_a);
        setScoreB(m.score_b);
      }
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Gagal memuat", "error");
    } finally {
      setLoading(false);
    }
  }, [code, id]);

  useEffect(() => {
    fetchData();
    const unsub = subscribeToMatches(code, () => fetchData());
    return () => unsub();
  }, [code, fetchData]);

  const target = session?.scoring_rule === "15" ? 15 : 21;
  const winner = scoreA >= target && scoreA - scoreB >= 2 ? "a" : scoreB >= target && scoreB - scoreA >= 2 ? "b" : null;

  const bump = async (side: "a" | "b", delta: number) => {
    if (winner && delta > 0) return;
    const na = side === "a" ? Math.max(0, scoreA + delta) : scoreA;
    const nb = side === "b" ? Math.max(0, scoreB + delta) : scoreB;
    setScoreA(na);
    setScoreB(nb);

    setSaving(true);
    try {
      await updateMatchScore(code, id, na, nb);
      if (winner) {
        toast.show("Pertandingan selesai!", "success");
      }
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Gagal simpan skor", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setScoreA(0);
    setScoreB(0);
    try {
      await resetMatch(code, id);
      toast.show("Skor direset", "info");
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Gagal reset", "error");
    }
  };

  if (loading) return <Loader />;
  if (!match) return null;

  const aLeading = scoreA > scoreB;
  const bLeading = scoreB > scoreA;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-tertiary">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-on-surface">Lapangan {match.court}</h1>
            <p className="text-sm text-muted">Ronde {match.round} · {target} rally point</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleReset} icon={<RotateCcw size={16} />}>
          Reset
        </Button>
      </div>

      {/* Score display */}
      <div className="flex">
        <button
          onClick={() => bump("a", 1)}
          className={clsx(
            "flex flex-1 flex-col items-center justify-center gap-4 rounded-l-2xl p-8 transition-all",
            aLeading ? "bg-brand text-on-brand" : "bg-surface-tertiary text-onSurface"
          )}
        >
          <p className={clsx("text-lg font-extrabold text-center", aLeading && "text-on-brand")}>
            {match.team_a_names.join(" & ")}
          </p>
          <p className={clsx("text-8xl font-extrabold leading-none", aLeading && "text-on-brand")}>{scoreA}</p>
          {winner === "a" && <Trophy size={40} className="text-on-brand" />}
          <button
            onClick={(e) => { e.stopPropagation(); bump("a", -1); }}
            className={clsx(
              "flex h-12 w-12 items-center justify-center rounded-full",
              aLeading ? "bg-black/10" : "bg-black/5"
            )}
          >
            <Minus size={20} />
          </button>
        </button>

        <div className="flex items-center justify-center bg-surface-secondary px-4">
          <span className="rounded-full bg-surface-tertiary px-3 py-2 text-sm font-extrabold text-onSurface">VS</span>
        </div>

        <button
          onClick={() => bump("b", 1)}
          className={clsx(
            "flex flex-1 flex-col items-center justify-center gap-4 rounded-r-2xl p-8 transition-all",
            bLeading ? "bg-brand text-on-brand" : "bg-surface-tertiary text-onSurface"
          )}
        >
          <p className={clsx("text-lg font-extrabold text-center", bLeading && "text-on-brand")}>
            {match.team_b_names.join(" & ")}
          </p>
          <p className={clsx("text-8xl font-extrabold leading-none", bLeading && "text-on-brand")}>{scoreB}</p>
          {winner === "b" && <Trophy size={40} className="text-on-brand" />}
          <button
            onClick={(e) => { e.stopPropagation(); bump("b", -1); }}
            className={clsx(
              "flex h-12 w-12 items-center justify-center rounded-full",
              bLeading ? "bg-black/10" : "bg-black/5"
            )}
          >
            <Minus size={20} />
          </button>
        </button>
      </div>

      {/* Winner banner */}
      {winner && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-success p-4">
          <Trophy size={20} className="text-white" />
          <p className="text-base font-extrabold text-white">
            {(winner === "a" ? match.team_a_names : match.team_b_names).join(" & ")} menang!
          </p>
          <button onClick={() => router.back()} className="ml-2 text-sm font-bold text-white underline">
            Selesai
          </button>
        </div>
      )}

      {!winner && (
        <p className="mt-4 text-center text-sm text-muted">
          Ketuk area untuk menambah skor · ikon minus untuk mengurangi
        </p>
      )}
    </Layout>
  );
}
