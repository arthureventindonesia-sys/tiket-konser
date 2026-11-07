import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TICKET_LABEL, TICKET_TYPE_IDS } from "@/lib/event";
import { formatGroupedId, parseGroupedId } from "@/lib/format";
import { getStaffSession } from "@/lib/fn/staff";
import { fetchFastTrackSales, fetchStages, saveFastTrackPrices, saveFastTrackSales } from "@/lib/fn/stages";
import type { StageQuota, StageSales, TicketStage } from "@/lib/stages";

export const Route = createFileRoute("/admin/harga-fast-track")({
  component: HargaFastTrackPage,
});

function HargaFastTrackPage() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [stages, setStages] = useState<TicketStage[]>([]);
  const [sales, setSales] = useState<StageSales | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStaffSession()
      .then((staff) => {
        if (!staff) {
          void navigate({ to: "/login" });
          return;
        }
        if (!staff.panels.includes("harga-fast-track")) {
          toast.error("Panel Harga Fast Track tidak dibuka untuk akun ini");
          void navigate({ to: "/admin" });
          return;
        }
        setAllowed(true);
      })
      .catch(() => {
        void navigate({ to: "/login" });
      });
    fetchStages()
      .then(setStages)
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
    fetchFastTrackSales()
      .then(setSales)
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
  }, [navigate]);

  if (!allowed) return <p className="text-muted">Memeriksa akses…</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (stages.length === 0) return <p className="text-muted">Memuat harga Fast Track…</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Harga Fast Track</p>
        <h1 className="mt-1 font-display text-3xl">Harga khusus Fast Track</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Jenis tiket Fast Track diatur di sini dan tidak mengikuti tahap yang sedang berlangsung. Harga tetap
          per tahap: pesanan memakai harga tahap yang aktif.
        </p>
      </div>
      {sales ? <SalesCard sales={sales} onSaved={setSales} /> : null}
      <div className="grid gap-5">
        {stages.map((stage) => (
          <PriceCard
            key={stage.id}
            stage={stage}
            onSaved={(next) => setStages((prev) => prev.map((item) => (item.id === next.id ? next : item)))}
          />
        ))}
      </div>
    </div>
  );
}

function SalesCard({ sales, onSaved }: { sales: StageSales; onSaved: (sales: StageSales) => void }) {
  const [onSale, setOnSale] = useState<StageSales>(sales);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setOnSale(sales);
  }, [sales]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const next = await saveFastTrackSales({ data: onSale });
      onSaved(next);
      toast.success("Jenis tiket Fast Track disimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <div>
        <h2 className="font-display text-2xl">Jenis tiket Fast Track</h2>
        <p className="mt-1 text-sm text-subtle">Berlaku untuk semua tahap. Tidak mengubah penjualan umum atau pelajar.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TICKET_TYPE_IDS.map((type) => (
          <label key={type} className="flex items-center gap-2 rounded-lg border border-border bg-bg p-3 text-sm">
            <Checkbox
              checked={onSale[type]}
              onCheckedChange={(v) => setOnSale((prev) => ({ ...prev, [type]: v === true }))}
            />
            {TICKET_LABEL[type]}
          </label>
        ))}
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Menyimpan…" : "Simpan jenis Fast Track"}
      </Button>
    </form>
  );
}

function PriceCard({ stage, onSaved }: { stage: TicketStage; onSaved: (stage: TicketStage) => void }) {
  const [price, setPrice] = useState<StageQuota>(stage.fastTrackPrice);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPrice(stage.fastTrackPrice);
  }, [stage]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const next = await saveFastTrackPrices({ data: { id: stage.id, fastTrackPrice: price } });
      onSaved(next);
      toast.success(`Harga Fast Track ${stage.label} disimpan`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">{stage.label}</h2>
          <p className="mt-1 text-sm text-subtle">Dipakai saat tahap ini sedang berlangsung.</p>
        </div>
        {stage.live ? <Badge tone="success">Berlangsung</Badge> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TICKET_TYPE_IDS.map((type) => (
          <div key={type} className="rounded-lg border border-border bg-bg p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-subtle">{TICKET_LABEL[type]}</p>
              <Label htmlFor={`${stage.id}-ft-${type}`} className="mt-3 block text-xs text-muted">
                Harga Fast Track
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-subtle">
                  Rp
                </span>
                <Input
                  id={`${stage.id}-ft-${type}`}
                  inputMode="numeric"
                  className="pl-9 font-mono tabular-nums"
                  value={formatGroupedId(price[type])}
                  onChange={(e) => setPrice((prev) => ({ ...prev, [type]: parseGroupedId(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
        ))}
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Menyimpan…" : "Simpan harga Fast Track"}
      </Button>
    </form>
  );
}
