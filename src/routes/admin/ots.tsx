import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EVENT, TICKET_TYPES, type TicketTypeId } from "@/lib/event";
import { formatRupiah } from "@/lib/format";
import { fetchOnsiteContext, placeOnsiteOrder } from "@/lib/fn/admin";
import { getStaffSession } from "@/lib/fn/staff";

export const Route = createFileRoute("/admin/ots")({
  component: OnsitePage,
});

type Offer = {
  id: string;
  label: string;
  allowed: TicketTypeId[];
  price: Record<TicketTypeId, number>;
  remaining: Record<TicketTypeId, number>;
};

function OnsitePage() {
  const navigate = useNavigate();
  const [allowedAccess, setAllowedAccess] = useState(false);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [payment, setPayment] = useState<"qris" | "cash">("cash");
  const [qty, setQty] = useState<Record<TicketTypeId, number>>({ vvip: 0, vip: 0, festival: 0, community: 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getStaffSession()
      .then((staff) => {
        if (!staff) {
          void navigate({ to: "/login" });
          return;
        }
        if (!staff.panels.includes("ots")) {
          toast.error("Panel OTS tidak dibuka untuk akun ini");
          void navigate({ to: "/admin" });
          return;
        }
        setAllowedAccess(true);
      })
      .catch(() => {
        void navigate({ to: "/login" });
      });
    fetchOnsiteContext()
      .then(setOffer)
      .catch(() => setOffer(null));
  }, [navigate]);

  const types = TICKET_TYPES.filter((type) => offer?.allowed.includes(type.id));
  const base = types.reduce((sum, type) => sum + qty[type.id] * (offer?.price[type.id] ?? 0), 0);
  const total = base;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await placeOnsiteOrder({
        data: {
          fullName,
          whatsapp,
          paymentMethod: payment,
          qtyVvip: qty.vvip,
          qtyVip: qty.vip,
          qtyFestival: qty.festival,
          qtyCommunity: qty.community,
        },
      });
      toast.success("Tiket OTS terkonfirmasi");
      window.location.assign(`/admin/tiketbox?code=${encodeURIComponent(result.ticketCode)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat pesanan");
      setBusy(false);
    }
  }

  if (!allowedAccess) return <p className="text-muted">Memeriksa akses…</p>;

  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Lokasi</p>
          <h1 className="mt-1 font-display text-3xl">OTS</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Pembelian di lokasi. Tiket langsung terkonfirmasi, lalu dibuka di Tiketbox untuk takeout.
            {offer ? ` Harga tahap ${offer.label}.` : ""}
          </p>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="ots-name">Nama</Label>
            <Input id="ots-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ots-wa">Nomor WhatsApp</Label>
            <Input
              id="ots-wa"
              required
              inputMode="tel"
              placeholder="08xxxxxxxxxx"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Pembayaran</legend>
            <div className="flex gap-2">
              {(["qris", "cash"] as const).map((method) => (
                <label
                  key={method}
                  className={`flex h-11 flex-1 cursor-pointer items-center justify-center rounded-md border text-sm ${
                    payment === method ? "border-gold bg-gold/10 text-gold" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    className="sr-only"
                    checked={payment === method}
                    onChange={() => setPayment(method)}
                  />
                  {method === "qris" ? "QRIS" : "Cash"}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="grid gap-3">
          {!offer ? (
            <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
              Tidak ada tahap yang sedang berlangsung. Aktifkan tahap di Tiketing dulu.
            </p>
          ) : types.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
              Belum ada jenis tiket yang dijual pada {offer.label}.
            </p>
          ) : (
            types.map((type) => (
              <label key={type.id} className="grid grid-cols-[1fr_7rem] items-center gap-3 rounded-lg border border-border bg-surface p-3">
                <span>
                  <span className="font-display text-lg">{type.label}</span>
                  <span className="mt-0.5 block font-mono text-xs text-gold">{formatRupiah(offer.price[type.id])}</span>
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
      <aside className="h-fit space-y-4 rounded-xl border border-border bg-surface p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">{EVENT.name}</p>
        <h2 className="font-display text-2xl">Ringkasan</h2>
        <p className="text-sm text-muted">{payment === "qris" ? "QRIS" : "Cash"} · tanpa kode unik</p>
        <p className="font-display text-3xl text-gold">{formatRupiah(total)}</p>
        {payment === "qris" ? (
          <img src={`${EVENT.qris}?v=4`} alt="QRIS" className="w-full rounded-lg border border-border" />
        ) : null}
        <Button type="submit" className="w-full" disabled={busy || !offer || base < 1}>
          {busy ? "Menyimpan…" : "Konfirmasi tiket"}
        </Button>
      </aside>
    </form>
  );
}
