"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { getSessionByCode, listPlayers, subscribeToPlayers } from "@/src/lib/api";
import type { Session, Player } from "@/src/lib/supabase";
import { Layout } from "@/src/components/layout";
import { Loader, EmptyState } from "@/src/components/ui";
import { ArrowLeft } from "lucide-react";

const rupiah = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function RecapPage() {
  const params = useParams();
  const code = params.code as string;

  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [s, p] = await Promise.all([
        getSessionByCode(code),
        listPlayers(code),
      ]);
      setSession(s);
      setPlayers(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchData();
    const unsub = subscribeToPlayers(code, () => fetchData());
    return () => unsub();
  }, [code, fetchData]);

  if (loading) return <Loader />;
  if (!session) return <EmptyState title="Sesi tidak ditemukan" />;

  const totalFee = players.reduce((s, p) => s + (p.fee || 0), 0);
  const totalShuttle = players.reduce((s, p) => s + (p.shuttlecocks || 0) * session.shuttle_price, 0);
  const grandTotal = totalFee + totalShuttle;

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => history.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-tertiary">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-onSurface">Rekap Biaya</h1>
          <p className="text-sm text-muted">{session.name}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {players.map((player) => {
          const shuttleCost = (player.shuttlecocks || 0) * session.shuttle_price;
          const total = (player.fee || 0) + shuttleCost;
          return (
            <div key={player.id} className="rounded-xl border border-border bg-surface-secondary p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-onSurface">{player.name}</p>
                  <p className="text-xs text-muted">
                    {player.is_member ? "Member" : `Non-member · ${rupiah(player.fee)}`}
                    {session.shuttle_price > 0 && ` · ${player.shuttlecocks || 0} kok`}
                  </p>
                </div>
                <p className="text-lg font-extrabold text-onSurface">{rupiah(total)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-xl bg-brand-tertiary p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-on-brand-tertiary">Total Biaya Non-Member</p>
          <p className="text-lg font-extrabold text-brand">{rupiah(totalFee)}</p>
        </div>
        {session.shuttle_price > 0 && (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm font-bold text-on-brand-tertiary">Total Kok</p>
            <p className="text-lg font-extrabold text-brand">{rupiah(totalShuttle)}</p>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-brand/20 pt-3">
          <p className="text-base font-extrabold text-on-surface">Grand Total</p>
          <p className="text-xl font-extrabold text-brand">{rupiah(grandTotal)}</p>
        </div>
      </div>
    </Layout>
  );
}
