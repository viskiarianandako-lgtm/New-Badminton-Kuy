"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSessionByCode, listPlayers, listMatches, generateMatches, updatePlayerShuttlecocks, setPlayerPaid, removePlayer, subscribeToSession, subscribeToPlayers, subscribeToMatches, getCurrentUser, joinSession } from "@/src/lib/api";
import type { Session, Player, Match } from "@/src/lib/supabase";
import { Layout } from "@/src/components/layout";
import { Button, Badge, Avatar, Loader, EmptyState } from "@/src/components/ui";
import { useToast } from "@/src/components/toast";
import { Users, QrCode, Share2, Trash2, Minus, Plus, Check, UserPlus, Shuffle, ExternalLink, Receipt, BarChart3, Calendar } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { clsx } from "clsx";

const rupiah = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const code = params.code as string;

  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"players" | "matches">("players");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIsMember, setNewIsMember] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string>("");
  const [showQr, setShowQr] = useState(false);

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
      toast.show(e instanceof Error ? e.message : "Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchData();

    // Realtime subscriptions
    const unsubSession = subscribeToSession(code, () => fetchData());
    const unsubPlayers = subscribeToPlayers(code, () => fetchData());
    const unsubMatches = subscribeToMatches(code, () => fetchData());

    return () => {
      unsubSession();
      unsubPlayers();
      unsubMatches();
    };
  }, [code, fetchData]);

  useEffect(() => {
    const checkHost = async () => {
      const user = await getCurrentUser();
      if (user && session) {
        setIsHost(user.id === session.host_id);
      }
      const pid = localStorage.getItem(`bk_player_${code}`) || "";
      setMyPlayerId(pid);
    };
    if (session) checkHost();
  }, [session, code]);

  const handleGenerate = async () => {
    try {
      await generateMatches(code, session!.host_id);
      toast.show("Pertandingan dibuat", "success");
      setTab("matches");
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Gagal", "error");
    }
  };

  const handleAddPlayer = async () => {
    if (!newName.trim()) {
      toast.show("Isi nama pemain", "error");
      return;
    }
    try {
      await joinSession(code, newName.trim(), newIsMember);
      toast.show("Pemain ditambahkan", "success");
      setShowAdd(false);
      setNewName("");
      setNewIsMember(true);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Gagal menambah pemain", "error");
    }
  };

  const handleRemovePlayer = async (id: string) => {
    try {
      await removePlayer(code, id);
      toast.show("Pemain dihapus", "info");
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Gagal", "error");
    }
  };

  const handleUpdateShuttles = async (id: string, current: number, delta: number) => {
    try {
      await updatePlayerShuttlecocks(code, id, Math.max(0, current + delta));
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Gagal", "error");
    }
  };

  const handleSetPaid = async (id: string, current: boolean) => {
    try {
      await setPlayerPaid(code, id, !current);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Gagal", "error");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Badminton Kuy",
        text: `Gabung mabar "${session?.name}" di Badminton Kuy! Kode sesi: ${code}`,
      });
    } else {
      navigator.clipboard.writeText(`Gabung mabar "${session?.name}" di Badminton Kuy! Kode sesi: ${code}`);
      toast.show("Tautan disalin", "success");
    }
  };

  if (loading) return <Loader label="Memuat sesi..." />;
  if (!session) return <EmptyState title="Sesi tidak ditemukan" />;

  const nonMembers = players.filter((p) => !p.is_member);
  const totalFee = nonMembers.reduce((s, p) => s + (p.fee || 0), 0);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface">{session.name}</h1>
          <p className="text-sm text-muted">{session.date} · {session.location}</p>
        </div>
        <Badge label={session.status === "active" ? "Aktif" : "Selesai"} tone={session.status === "active" ? "success" : "neutral"} />
      </div>

      {/* Code bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-tertiary p-4">
        <div>
          <p className="text-xs font-semibold text-on-brand-tertiary">Kode Sesi</p>
          <p className="text-2xl font-extrabold tracking-widest text-brand">{session.code}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowQr(true)} icon={<QrCode size={18} />}>
            QR
          </Button>
          <Button variant="outline" onClick={handleShare} icon={<Share2 size={18} />}>
            Bagikan
          </Button>
          <Button variant="secondary" onClick={() => router.push(`/scoreboard/${code}`)} icon={<ExternalLink size={18} />}>
            Papan Skor
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4 flex items-center justify-around rounded-xl border border-border bg-surface-secondary p-4">
        <div className="text-center">
          <p className="text-2xl font-extrabold text-on-surface">{players.length}</p>
          <p className="text-xs text-muted">Pemain</p>
        </div>
        <div className="h-8 w-px bg-divider" />
        <div className="text-center">
          <p className="text-lg font-extrabold text-on-surface">{nonMembers.length}</p>
          <p className="text-xs text-muted">Non-Member</p>
        </div>
        <div className="h-8 w-px bg-divider" />
        <div className="text-center">
          <p className="text-lg font-extrabold text-success">{rupiah(totalFee)}</p>
          <p className="text-xs text-muted">Total Biaya</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => router.push(`/recap/${code}`)} className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-brand-tertiary px-4 py-2 text-xs font-bold text-on-brand-tertiary">
          <Receipt size={14} />
          Rekap Biaya
        </button>
        <button onClick={() => router.push(`/standings/${code}`)} className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-brand-tertiary px-4 py-2 text-xs font-bold text-on-brand-tertiary">
          <BarChart3 size={14} />
          Riwayat Skor
        </button>
        {myPlayerId && (
          <button onClick={() => router.push(`/my-matches/${code}`)} className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-brand px-4 py-2 text-xs font-bold text-white">
            <Calendar size={14} />
            Jadwal Saya
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("players")}
          className={clsx(
            "flex-1 rounded-full py-2.5 text-sm font-bold transition-all",
            tab === "players" ? "bg-brand text-white" : "bg-surface-tertiary text-on-surface-tertiary"
          )}
        >
          Pemain
        </button>
        <button
          onClick={() => setTab("matches")}
          className={clsx(
            "flex-1 rounded-full py-2.5 text-sm font-bold transition-all",
            tab === "matches" ? "bg-brand text-white" : "bg-surface-tertiary text-on-surface-tertiary"
          )}
        >
          Pertandingan
        </button>
      </div>

      {/* Content */}
      {tab === "players" ? (
        <div className="flex flex-col gap-3">
          {players.length === 0 ? (
            <EmptyState title="Belum ada pemain bergabung" subtitle={`Bagikan kode ${session.code}`} />
          ) : (
            players.map((player) => (
              <div key={player.id} className="rounded-xl border border-border bg-surface-secondary p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={player.name} />
                  <div className="flex-1">
                    <p className="font-bold text-onSurface">{player.name}</p>
                    <p className="text-xs text-muted">
                      {player.is_member ? "Member" : `Non-member · ${rupiah(player.fee)}`}
                      {session.shuttle_price > 0 && ` · Total ${rupiah((player.fee || 0) + (player.shuttlecocks || 0) * session.shuttle_price)}`}
                    </p>
                  </div>
                  <Badge label={player.is_member ? "Member" : "Non"} tone={player.is_member ? "brand" : "warning"} />
                  {isHost && (
                    <button onClick={() => handleRemovePlayer(player.id)} className="p-2 text-error hover:bg-error/10 rounded-full">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Shuttlecocks */}
                <div className="mt-3 flex items-center justify-between border-t border-divider pt-3">
                  <p className="text-xs font-semibold text-on-surface-tertiary">
                    🏸 Kok dipakai {session.shuttle_price > 0 && `· ${rupiah((player.shuttlecocks || 0) * session.shuttle_price)}`}
                  </p>
                  {isHost ? (
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleUpdateShuttles(player.id, player.shuttlecocks, -1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-tertiary">
                        <Minus size={16} />
                      </button>
                      <span className="min-w-[24px] text-center text-lg font-extrabold text-onSurface">{player.shuttlecocks || 0}</span>
                      <button onClick={() => handleUpdateShuttles(player.id, player.shuttlecocks, 1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-onSurface">{player.shuttlecocks || 0}</span>
                  )}
                </div>

                {/* Paid toggle */}
                <button
                  onClick={() => isHost && handleSetPaid(player.id, player.paid)}
                  disabled={!isHost}
                  className={clsx(
                    "mt-3 flex items-center gap-2 border-t border-divider pt-3 w-full",
                    !isHost && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={clsx("flex h-5 w-5 items-center justify-center rounded border-2", player.paid ? "bg-brand border-brand" : "border-borderStrong")}>
                    {player.paid && <Check size={12} className="text-white" />}
                  </div>
                  <span className={clsx("text-xs font-bold", player.paid ? "text-on-brand-secondary" : "text-muted")}>
                    {player.paid ? "Sudah Lunas" : isHost ? "Tandai Lunas" : "Belum Lunas"}
                  </span>
                </button>
              </div>
            ))
          )}

          {isHost && (
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={() => setShowAdd(true)} icon={<UserPlus size={18} />} className="flex-1">
                Tambah Pemain
              </Button>
              <Button onClick={handleGenerate} icon={<Shuffle size={18} />} className="flex-1">
                {session.matches_generated ? "Acak Ulang" : "Buat Pertandingan"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.length === 0 ? (
            <EmptyState title="Belum ada pertandingan" subtitle={isHost ? "Tekan 'Buat Pertandingan' di tab Pemain" : "Menunggu host membuat jadwal"} />
          ) : (
            matches.map((match) => {
              const finished = match.status === "finished";
              return (
                <button
                  key={match.id}
                  onClick={() => router.push(`/match/${code}/${match.id}`)}
                  className="w-full rounded-xl border border-border bg-surface-secondary p-4 text-left transition-all hover:border-brand"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold text-on-brand-secondary">Lapangan {match.court} · Ronde {match.round}</p>
                    <Badge
                      label={finished ? "Selesai" : match.status === "in_progress" ? "Berlangsung" : "Menunggu"}
                      tone={finished ? "neutral" : match.status === "in_progress" ? "success" : "warning"}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className={clsx("font-bold text-onSurface", match.winner === "a" && "text-success")}>
                        {match.team_a_names.join(" & ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-surface-tertiary px-3 py-1">
                      <span className="text-xl font-extrabold text-onSurface">{match.score_a}</span>
                      <span className="text-lg text-muted">:</span>
                      <span className="text-xl font-extrabold text-onSurface">{match.score_b}</span>
                    </div>
                    <div className="flex-1 text-right">
                      <p className={clsx("font-bold text-onSurface", match.winner === "b" && "text-success")}>
                        {match.team_b_names.join(" & ")}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Add player modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-t-2xl bg-surface-secondary p-6 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-onSurface">Tambah Pemain Manual</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 text-muted hover:text-onSurface">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nama pemain"
                className="w-full rounded-md border border-border bg-surface-tertiary px-4 py-3 text-base"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setNewIsMember(true)}
                  className={clsx("flex-1 rounded-md border-2 py-2.5 text-sm font-bold", newIsMember ? "border-brand bg-brand-secondary text-on-brand-secondary" : "border-border bg-surface-tertiary")}
                >
                  Member
                </button>
                <button
                  onClick={() => setNewIsMember(false)}
                  className={clsx("flex-1 rounded-md border-2 py-2.5 text-sm font-bold", !newIsMember ? "border-brand bg-brand-secondary text-on-brand-secondary" : "border-border bg-surface-tertiary")}
                >
                  Non-Member{session.non_member_fee > 0 ? ` · ${rupiah(session.non_member_fee)}` : ""}
                </button>
              </div>
              <Button onClick={handleAddPlayer}>Tambahkan</Button>
            </div>
          </div>
        </div>
      )}

      {/* QR modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onClick={() => setShowQr(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-surface-secondary p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-xl font-extrabold text-onSurface">Scan untuk Gabung</h3>
            <p className="mb-4 text-sm text-muted">Arahkan kamera ke QR ini</p>
            <div className="mx-auto mb-4 flex h-56 w-56 items-center justify-center rounded-xl bg-white p-4">
              <QRCodeDisplay value={`${window.location.origin}/join?code=${session.code}`} size={200} />
            </div>
            <p className="mb-4 text-2xl font-extrabold tracking-widest text-brand">{session.code}</p>
            <Button onClick={() => setShowQr(false)} className="w-full">Tutup</Button>
          </div>
        </div>
      )}
    </Layout>
  );
}

// Simple QR code component for web
function QRCodeDisplay({ value, size }: { value: string; size: number }) {
  return (
    <div className="flex justify-center">
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        includeMargin
        bgColor="#FFFFFF"
        fgColor="#1A1A1A"
      />
    </div>
  );
}
