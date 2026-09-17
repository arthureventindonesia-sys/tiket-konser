import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TICKET_LABEL, type TicketTypeId } from "@/lib/event";
import { formatGroupedId, fromDatetimeLocalWib, parseGroupedId, toDatetimeLocalWib } from "@/lib/format";
import { fetchStages, saveStage } from "@/lib/fn/stages";
import { remainingOf, type StageQuota, type TicketStage } from "@/lib/stages";

export const Route = createFileRoute("/admin/tiketing")({
  component: TiketingPage,
});

const STATUS_LABEL = {
  off: "Nonaktif",
  scheduled: "Terjadwal",
  live: "Berlangsung",
  ended: "Selesai",
} as const;

function TiketingPage() {
  const [stages, setStages] = useState<TicketStage[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetchStages()
      .then(setStages)
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
  }

  useEffect(() => {
    load();
  }, []);

  const liveCount = stages.filter((s) => s.live).length;
  if (error) return <p className="text-danger">{error}</p>;
  if (stages.length === 0) return <p className="text-muted">Memuat tiketing…</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Tiketing</p>
        <h1 className="mt-1 font-display text-3xl">Tahap penjualan</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Atur kuota, harga, waktu, dan status tiap tahap. Early Bird hanya VIP dan Festival. Pembeli
          otomatis masuk ke tahap yang sedang berlangsung.
        </p>
      </div>
      {liveCount > 1 ? (
        <p className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
          Lebih dari satu tahap aktif. Sistem memakai tahap paling awal (urutan Early Bird → OTS).
        </p>
      ) : null}
      {liveCount === 0 ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
          Tidak ada tahap yang berlangsung. Halaman beli akan tertutup sampai satu tahap diaktifkan
          dan masuk jangka waktunya.
        </p>
      ) : null}
      <div className="grid gap-5">
        {stages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            onSaved={(next) => setStages((prev) => prev.map((s) => (s.id === next.id ? next : s)))}
          />
        ))}
      </div>
    </div>
  );
}

function StageCard({
  stage,
  onSaved,
}: {
  stage: TicketStage;
  onSaved: (stage: TicketStage) => void;
}) {
  const [enabled, setEnabled] = useState(stage.enabled);
  const [startsAt, setStartsAt] = useState(toDatetimeLocalWib(stage.startsAt));
  const [endsAt, setEndsAt] = useState(toDatetimeLocalWib(stage.endsAt));
  const [quota, setQuota] = useState<StageQuota>(stage.quota);
  const [price, setPrice] = useState<StageQuota>(stage.price);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEnabled(stage.enabled);
    setStartsAt(toDatetimeLocalWib(stage.startsAt));
    setEndsAt(toDatetimeLocalWib(stage.endsAt));
    setQuota(stage.quota);
    setPrice(stage.price);
  }, [stage]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const next = await saveStage({
        data: {
          id: stage.id,
          enabled,
          startsAt: fromDatetimeLocalWib(startsAt),
          endsAt: fromDatetimeLocalWib(endsAt),
          quota,
          price,
        },
      });
      onSaved(next);
      toast.success(`${stage.label} disimpan`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  }

  const tone =
    stage.status === "live" ? "success" : stage.status === "scheduled" ? "gold" : stage.status === "ended" ? "danger" : "muted";

  return (
    <form onSubmit={onSave} className="space-y-5 rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">{stage.label}</h2>
          <p className="mt-1 text-sm text-subtle">
            {stage.allowed.map((t) => TICKET_LABEL[t]).join(" · ")}
          </p>
        </div>
        <Badge tone={tone}>{STATUS_LABEL[stage.status]}</Badge>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <Checkbox checked={enabled} onCheckedChange={(v) => setEnabled(v === true)} />
        Aktifkan tahap ini
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor={`${stage.id}-start`}>Mulai (WIB)</Label>
          <Input
            id={`${stage.id}-start`}
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${stage.id}-end`}>Selesai (WIB)</Label>
          <Input
            id={`${stage.id}-end`}
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </div>
      </div>
      <p className="text-xs text-subtle">Kosongkan tanggal jika tahap berlaku selama diaktifkan, tanpa batas waktu.</p>

      <div className="grid gap-3 sm:grid-cols-3">
        {(["vvip", "vip", "festival"] as TicketTypeId[]).map((type) => {
          const allowed = stage.allowed.includes(type);
          const sold = stage.sold[type];
          const sisa = remainingOf(quota[type], sold);
          return (
            <div
              key={type}
              className={`rounded-lg border border-border p-3 ${allowed ? "bg-bg" : "opacity-50"}`}
            >
              <p className="text-xs uppercase tracking-[0.16em] text-subtle">{TICKET_LABEL[type]}</p>
              <Label htmlFor={`${stage.id}-p-${type}`} className="mt-2 block text-xs text-muted">
                Harga
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-subtle">
                  Rp
                </span>
                <Input
                  id={`${stage.id}-p-${type}`}
                  inputMode="numeric"
                  disabled={!allowed}
                  className="pl-9 font-mono tabular-nums"
                  value={allowed ? formatGroupedId(price[type]) : ""}
                  onChange={(e) =>
                    setPrice((prev) => ({ ...prev, [type]: parseGroupedId(e.target.value) }))
                  }
                  placeholder="0"
                />
              </div>
              <Label htmlFor={`${stage.id}-q-${type}`} className="mt-2 block text-xs text-muted">
                Kuota
              </Label>
              <Input
                id={`${stage.id}-q-${type}`}
                type="number"
                min={0}
                step={1}
                disabled={!allowed}
                value={allowed ? quota[type] : 0}
                onChange={(e) =>
                  setQuota((prev) => ({ ...prev, [type]: Number(e.target.value) }))
                }
              />
              <p className="mt-2 font-mono text-xs tabular-nums text-muted">
                Terjual {sold} · Sisa {allowed ? sisa : 0}
              </p>
            </div>
          );
        })}
      </div>

      <Button type="submit" disabled={busy}>
        {busy ? "Menyimpan…" : "Simpan tahap"}
      </Button>
    </form>
  );
}
