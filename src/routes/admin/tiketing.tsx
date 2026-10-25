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
import { isUnlimitedPurchase, remainingOf, type StageQuota, type StageSales, type TicketStage } from "@/lib/stages";

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
          Atur kuota, harga, waktu, limit pembelian, dan jenis tiket yang dijual di tiap tahap. Pembeli
          otomatis masuk ke tahap yang sedang berlangsung. Harga Fast Track dan pelajar diatur di panel terpisah.
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
  const [onSale, setOnSale] = useState<StageSales>(stage.onSale);
  const [purchaseLimit, setPurchaseLimit] = useState(stage.purchaseLimit);
  const [limitDraft, setLimitDraft] = useState(stage.purchaseLimit > 0 ? stage.purchaseLimit : 4);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEnabled(stage.enabled);
    setStartsAt(toDatetimeLocalWib(stage.startsAt));
    setEndsAt(toDatetimeLocalWib(stage.endsAt));
    setQuota(stage.quota);
    setPrice(stage.price);
    setOnSale(stage.onSale);
    setPurchaseLimit(stage.purchaseLimit);
    if (stage.purchaseLimit > 0) setLimitDraft(stage.purchaseLimit);
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
          onSale,
          purchaseLimit,
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
            {stage.allowed.length > 0
              ? stage.allowed.map((t) => TICKET_LABEL[t]).join(" · ")
              : "Tidak ada jenis tiket yang dijual"}
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

      <div className="grid max-w-xs gap-1.5">
        <Label htmlFor={`${stage.id}-limit`}>Limit pembelian</Label>
        <Input
          id={`${stage.id}-limit`}
          type="number"
          min={1}
          max={20}
          step={1}
          disabled={isUnlimitedPurchase(purchaseLimit)}
          value={isUnlimitedPurchase(purchaseLimit) ? "" : purchaseLimit}
          placeholder={isUnlimitedPurchase(purchaseLimit) ? "Unlimited" : "1–20"}
          onChange={(e) => {
            const n = Math.floor(Number(e.target.value));
            if (!Number.isFinite(n) || n < 1) return;
            setPurchaseLimit(n);
            setLimitDraft(n);
          }}
        />
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={isUnlimitedPurchase(purchaseLimit)}
            onCheckedChange={(v) => setPurchaseLimit(v === true ? 0 : limitDraft || 4)}
          />
          Unlimited
        </label>
        <p className="text-xs text-subtle">
          {isUnlimitedPurchase(purchaseLimit)
            ? "Pembeli umum tidak dibatasi jumlah tiket, boleh campur jenis. Tetap mengikuti kuota."
            : purchaseLimit <= 1
              ? "Pembeli umum hanya boleh 1 tiket, 1 jenis."
              : `Pembeli umum maksimal ${purchaseLimit} tiket, boleh campur jenis.`}
          {" "}Fast Track tidak kena limit ini. Pelajar tetap maksimal 4.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(["vvip", "vip", "festival"] as TicketTypeId[]).map((type) => {
          const selling = onSale[type];
          const sold = stage.sold[type];
          const sisa = remainingOf(quota[type], sold);
          return (
            <div
              key={type}
              className={`rounded-lg border border-border p-3 ${selling ? "bg-bg" : "opacity-60"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.16em] text-subtle">{TICKET_LABEL[type]}</p>
                <Badge tone={selling ? "success" : "muted"}>{selling ? "Aktif" : "Nonaktif"}</Badge>
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selling}
                  onCheckedChange={(v) => setOnSale((prev) => ({ ...prev, [type]: v === true }))}
                />
                Jual jenis ini
              </label>
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
                  disabled={!selling}
                  className="pl-9 font-mono tabular-nums"
                  value={formatGroupedId(price[type])}
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
                disabled={!selling}
                value={quota[type]}
                onChange={(e) =>
                  setQuota((prev) => ({ ...prev, [type]: Number(e.target.value) }))
                }
              />
              <p className="mt-2 font-mono text-xs tabular-nums text-muted">
                Terjual {sold} · Sisa {selling ? (quota[type] > 0 ? sisa : "tak terbatas") : "—"}
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
