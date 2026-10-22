import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TICKET_LABEL, type TicketTypeId } from "@/lib/event";
import { formatGroupedId, parseGroupedId } from "@/lib/format";
import { copyText } from "@/lib/agent-qr";
import { getStaffSession } from "@/lib/fn/staff";
import { fetchStages, saveStudentPrices } from "@/lib/fn/stages";
import type { StageQuota, TicketStage } from "@/lib/stages";

export const Route = createFileRoute("/admin/harga-pelajar")({
  component: HargaPelajarPage,
});

function HargaPelajarPage() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [stages, setStages] = useState<TicketStage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState("/student");

  useEffect(() => {
    setLink(`${window.location.origin}/student`);
    getStaffSession()
      .then((staff) => {
        if (!staff) {
          void navigate({ to: "/login" });
          return;
        }
        if (staff.role !== "admin") {
          toast.error("Harga pelajar hanya untuk admin");
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
  }, [navigate]);

  if (!allowed) return <p className="text-muted">Memeriksa akses…</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (stages.length === 0) return <p className="text-muted">Memuat harga pelajar…</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Harga pelajar</p>
        <h1 className="mt-1 font-display text-3xl">Harga khusus pelajar</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Harga ini hanya dipakai di tautan pelajar dan tidak mengubah harga umum maupun Fast Track. Pembeli tetap
          dibatasi maksimal 4 tiket campur.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <code className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-gold">{link}</code>
          <Button type="button" variant="outline" size="sm" onClick={() => void copyText(link).then(() => toast.success("Tautan pelajar disalin"))}>
            Salin tautan
          </Button>
        </div>
      </div>
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

function PriceCard({ stage, onSaved }: { stage: TicketStage; onSaved: (stage: TicketStage) => void }) {
  const [price, setPrice] = useState<StageQuota>(stage.studentPrice);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPrice(stage.studentPrice);
  }, [stage]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const next = await saveStudentPrices({ data: { id: stage.id, studentPrice: price } });
      onSaved(next);
      toast.success(`Harga pelajar ${stage.label} disimpan`);
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
          <p className="mt-1 text-sm text-subtle">
            {stage.allowed.length > 0
              ? `Aktif: ${stage.allowed.map((type) => TICKET_LABEL[type]).join(" · ")}`
              : "Tidak ada jenis yang aktif"}
          </p>
        </div>
        {stage.live ? <Badge tone="success">Berlangsung</Badge> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {(["vvip", "vip", "festival"] as TicketTypeId[]).map((type) => {
          const active = stage.onSale[type];
          return (
            <div key={type} className={`rounded-lg border border-border p-3 ${active ? "bg-bg" : "opacity-60"}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.16em] text-subtle">{TICKET_LABEL[type]}</p>
                <Badge tone={active ? "success" : "muted"}>{active ? "Aktif" : "Nonaktif"}</Badge>
              </div>
              <Label htmlFor={`${stage.id}-st-${type}`} className="mt-3 block text-xs text-muted">
                Harga pelajar
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-subtle">Rp</span>
                <Input
                  id={`${stage.id}-st-${type}`}
                  inputMode="numeric"
                  className="pl-9 font-mono tabular-nums"
                  value={formatGroupedId(price[type])}
                  onChange={(e) => setPrice((prev) => ({ ...prev, [type]: parseGroupedId(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
          );
        })}
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Menyimpan…" : "Simpan harga pelajar"}
      </Button>
    </form>
  );
}
