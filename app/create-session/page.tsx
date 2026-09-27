"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession, getCurrentUser } from "@/src/lib/api";
import { Button, TextField, Segmented, Stepper, Select } from "@/src/components/ui";
import { Layout } from "@/src/components/layout";
import { useToast } from "@/src/components/toast";
import { ArrowLeft, CheckCircle } from "lucide-react";

type Rule = "15" | "21";

export default function CreateSessionPage() {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [courts, setCourts] = useState(1);
  const [rule, setRule] = useState<Rule>("21");
  const [rounds, setRounds] = useState(4);
  const [feeText, setFeeText] = useState("");
  const [shuttleText, setShuttleText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionCode, setSessionCode] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      toast.show("Isi nama sesi dan lokasi", "error");
      return;
    }
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.show("Silakan masuk terlebih dahulu", "error");
        router.push("/login");
        return;
      }

      const fee = parseInt(feeText.replace(/[^0-9]/g, "") || "0", 10);
      const shuttle = parseInt(shuttleText.replace(/[^0-9]/g, "") || "0", 10);

      const session = await createSession({
        name: name.trim(),
        date,
        location: location.trim(),
        num_courts: courts,
        scoring_rule: rule,
        rounds_per_player: rounds,
        non_member_fee: fee,
        shuttle_price: shuttle,
        host_id: user.id,
        host_name: user.user_metadata?.name || user.email || "Host",
      });

      setSessionCode(session.code);
      setSuccess(true);
      toast.show("Sesi dibuat", "success");
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Gagal membuat sesi", "error");
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
            <h1 className="mb-2 text-2xl font-extrabold text-on-surface">Sesi Dibuat!</h1>
            <p className="mb-4 text-sm text-muted">Bagikan kode ini ke pemain</p>
            <div className="mb-6 rounded-lg bg-brand-tertiary p-4">
              <p className="text-3xl font-extrabold tracking-widest text-brand">{sessionCode}</p>
            </div>
            <Button onClick={() => router.push(`/session/${sessionCode}`)} className="w-full">
              Buka Sesi
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-tertiary">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-onSurface">Buat Sesi</h1>
            <p className="text-sm text-muted">Atur lapangan, skor, dan biaya</p>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
          <div className="flex flex-col gap-6">
            <TextField label="Nama Sesi" value={name} onChange={(e) => setName(e.target.value)} placeholder="Badminton Kuy" required />
            <TextField label="Tanggal" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <TextField label="Lokasi / GOR" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="GOR Srikandi" required />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-onSurface">Jumlah Lapangan</label>
              <Stepper value={courts} onChange={setCourts} min={1} max={12} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-onSurface">Aturan Skor</label>
              <Segmented<Rule>
                value={rule}
                onChange={setRule}
                options={[
                  { label: "15 Rally Point", value: "15" },
                  { label: "21 Rally Point", value: "21" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-onSurface">Round-robin per pemain</label>
              <p className="text-xs text-muted">Setiap pemain akan bermain sekitar {rounds}x pertandingan.</p>
              <Stepper value={rounds} onChange={setRounds} min={1} max={30} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-onSurface">Biaya Non-Member (opsional)</label>
              <p className="text-xs text-muted">Kosongkan atau 0 jika tidak ada biaya.</p>
              <TextField value={feeText} onChange={(e) => setFeeText(e.target.value)} placeholder="Rp 0" inputMode="numeric" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-onSurface">Harga per Kok (opsional)</label>
              <p className="text-xs text-muted">Pemakaian kok dihitung per pemain x harga ini.</p>
              <TextField value={shuttleText} onChange={(e) => setShuttleText(e.target.value)} placeholder="Rp 0" inputMode="numeric" />
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Buat Sesi
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
