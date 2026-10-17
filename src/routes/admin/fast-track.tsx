import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EVENT, TICKET_TYPES, type TicketTypeId } from "@/lib/event";
import { formatRupiah, uniqueCodeFromWhatsapp } from "@/lib/format";
import { placeFastTrack } from "@/lib/fn/admin";
import { getStaffSession } from "@/lib/fn/staff";
import { fetchFastTrackContext } from "@/lib/fn/stages";
import type { TicketStage } from "@/lib/stages";

export const Route = createFileRoute("/admin/fast-track")({
  component: FastTrackPage,
});

function FastTrackPage() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [stage, setStage] = useState<Pick<TicketStage, "id" | "label" | "allowed" | "fastTrackPrice"> | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agents, setAgents] = useState<{ name: string; code: string }[]>([]);
  const [qty, setQty] = useState<Record<TicketTypeId, number>>({ vvip: 0, vip: 0, festival: 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getStaffSession()
      .then((staff) => {
        if (!staff) {
          void navigate({ to: "/login" });
          return;
        }
        if (staff.role !== "admin" && staff.role !== "crew") {
          toast.error("Fast Track hanya untuk admin dan crew");
          void navigate({ to: "/admin" });
          return;
        }
        setAllowed(true);
      })
      .catch(() => {
        void navigate({ to: "/login" });
      });
    fetchFastTrackContext()
      .then((context) => {
        setStage(context.stage);
        setAgents(context.agents);
      })
      .catch(() => {
        setStage(null);
        setAgents([]);
      });
  }, [navigate]);

  const activeTypes = TICKET_TYPES.filter((type) => stage?.allowed.includes(type.id));
  const priceOf = (type: TicketTypeId) => stage?.fastTrackPrice[type] ?? 0;
  const totalQty = qty.vvip + qty.vip + qty.festival;
  const base = qty.vvip * priceOf("vvip") + qty.vip * priceOf("vip") + qty.festival * priceOf("festival");
  const unique = whatsapp.replace(/\D/g, "").length >= 3 ? uniqueCodeFromWhatsapp(whatsapp) : 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const order = await placeFastTrack({
        data: {
          email,
          fullName,
          address,
          whatsapp,
          referralCode: referralCode.trim() || undefined,
          qtyVvip: qty.vvip,
          qtyVip: qty.vip,
          qtyFestival: qty.festival,
        },
      });
      toast.success("Pesanan Fast Track dibuat");
      await navigate({ to: "/bayar/$orderId", params: { orderId: order.publicId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat pesanan");
    } finally {
      setBusy(false);
    }
  }

  if (!allowed) return <p className="text-muted">Memeriksa akses…</p>;

  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Admin</p>
          <h1 className="mt-1 font-display text-3xl">Fast Track</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Pesan tiket tanpa batas jumlah maupun email dan WhatsApp. Harga memakai panel Harga Fast Track
            untuk jenis yang sedang aktif. Pesanan tetap mengurangi kuota dan tidak dibatalkan otomatis.
          </p>
        </div>
        <div className="grid gap-4">
          <Field label="Email" htmlFor="ft-email">
            <Input id="ft-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Nama sesuai KTP" htmlFor="ft-name">
            <Input id="ft-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Alamat sesuai KTP" htmlFor="ft-address">
            <Input id="ft-address" required value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
          <Field label="WhatsApp" htmlFor="ft-wa">
            <Input
              id="ft-wa"
              required
              inputMode="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="08xxxxxxxxxx"
            />
          </Field>
          <Field label="Kode referal agen" htmlFor="ft-ref">
            <select
              id="ft-ref"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="flex h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Tanpa agen</option>
              {agents.map((agent) => (
                <option key={agent.code} value={agent.code}>
                  {agent.name} · {agent.code}
                </option>
              ))}
            </select>
            {agents.length === 0 ? (
              <p className="text-xs text-subtle">Belum ada akun agen terdaftar.</p>
            ) : null}
          </Field>
        </div>
        <div className="grid gap-3">
          {!stage ? (
            <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
              Tidak ada tahap yang sedang berlangsung. Aktifkan tahap di Tiketing dulu.
            </p>
          ) : activeTypes.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
              Belum ada jenis tiket yang aktif pada {stage.label}.
            </p>
          ) : (
            activeTypes.map((type) => (
              <label key={type.id} className="grid grid-cols-[1fr_7rem] items-center gap-3 rounded-lg border border-border bg-surface p-3">
                <span>
                  <span className="font-display text-lg">{type.label}</span>
                  <span className="mt-0.5 block font-mono text-xs text-gold">{formatRupiah(priceOf(type.id))}</span>
                </span>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={qty[type.id]}
                  onChange={(e) =>
                    setQty((prev) => ({ ...prev, [type.id]: Math.max(0, Math.floor(Number(e.target.value) || 0)) }))
                  }
                />
              </label>
            ))
          )}
        </div>
      </div>
      <aside className="h-fit rounded-xl border border-border bg-surface p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">{EVENT.name}</p>
        <h2 className="mt-1 font-display text-2xl">Ringkasan</h2>
        <p className="mt-1 text-xs text-subtle">{stage ? `Harga Fast Track ${stage.label}` : "Tahap belum aktif"}</p>
        <ul className="mt-5 space-y-2 text-sm">
          {activeTypes.map((type) =>
            qty[type.id] > 0 ? (
              <li key={type.id} className="flex justify-between gap-4 text-muted">
                <span>
                  {type.label} × {qty[type.id]}
                </span>
                <span className="font-mono tabular-nums text-fg">{formatRupiah(priceOf(type.id) * qty[type.id])}</span>
              </li>
            ) : null,
          )}
        </ul>
        {totalQty > 0 ? (
          <>
            <div className="mt-4 flex justify-between text-sm text-muted">
              <span>Kode unik (WA)</span>
              <span className="font-mono tabular-nums text-gold">+{unique.toString().padStart(3, "0")}</span>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <span>Total transfer</span>
              <span className="font-mono text-lg tabular-nums text-gold">{formatRupiah(base + unique)}</span>
            </div>
          </>
        ) : (
          <p className="mt-6 text-sm text-subtle">Isi jumlah tiket.</p>
        )}
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy || !stage || activeTypes.length === 0 || totalQty < 1}>
          {busy ? "Memproses…" : "Buat pesanan"}
        </Button>
      </aside>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
