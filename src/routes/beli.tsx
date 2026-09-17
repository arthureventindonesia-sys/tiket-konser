import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EVENT, MAX_PER_TYPE, TICKET_TYPES } from "@/lib/event";
import { formatDateTime, formatRupiah, uniqueCodeFromWhatsapp } from "@/lib/format";
import { placeOrder } from "@/lib/fn/orders";
import { fetchSaleOffer } from "@/lib/fn/stages";
import type { SaleOffer } from "@/lib/stages";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/beli")({
  validateSearch: (search: Record<string, unknown>): { ref?: string } => {
    if (typeof search.ref === "string" && search.ref.length > 0) {
      return { ref: search.ref };
    }
    return {};
  },
  component: BeliPage,
});

function BeliPage() {
  const { ref } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const lockedRef = Boolean(ref?.trim());
  const [referralCode, setReferralCode] = useState((ref ?? "").toUpperCase());
  const [qty, setQty] = useState({ vvip: 0, vip: 0, festival: 0 });
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [offer, setOffer] = useState<SaleOffer | null>(null);

  useEffect(() => {
    fetchSaleOffer()
      .then(setOffer)
      .catch(() =>
        setOffer({
          open: false,
          message: "Penjualan tiket sedang ditutup.",
          stage: null,
          remaining: { vvip: 0, vip: 0, festival: 0 },
          price: { vvip: 0, vip: 0, festival: 0 },
          allowed: [],
          maxPerType: MAX_PER_TYPE,
        }),
      );
  }, []);

  const uniqueCode = uniqueCodeFromWhatsapp(whatsapp || "000");
  const maxPerType = offer?.maxPerType ?? MAX_PER_TYPE;
  const priceOf = (id: (typeof TICKET_TYPES)[number]["id"]) =>
    offer?.price[id] || TICKET_TYPES.find((t) => t.id === id)?.price || 0;
  const baseAmount = useMemo(
    () => TICKET_TYPES.reduce((sum, t) => sum + priceOf(t.id) * qty[t.id], 0),
    [qty, offer],
  );
  const totalQty = qty.vvip + qty.vip + qty.festival;
  const total = totalQty > 0 ? baseAmount + uniqueCode : 0;

  function setCount(id: keyof typeof qty, next: number) {
    const cap = Math.min(maxPerType, offer?.remaining[id] ?? maxPerType);
    setQty((prev) => ({ ...prev, [id]: Math.min(cap, Math.max(0, next)) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      toast.error("Centang persetujuan sebelum checkout");
      return;
    }
    if (!offer?.open) {
      toast.error(offer?.message ?? "Penjualan tiket belum dimulai");
      return;
    }
    setBusy(true);
    try {
      const order = await placeOrder({
        data: {
          email,
          fullName,
          address,
          whatsapp,
          referralCode: (lockedRef ? (ref ?? "") : referralCode).trim() || undefined,
          qtyVvip: qty.vvip,
          qtyVip: qty.vip,
          qtyFestival: qty.festival,
        },
      });
      await navigate({ to: "/bayar/$orderId", params: { orderId: order.publicId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat pesanan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg">
      <SiteHeader solid />
      <main className="mx-auto grid max-w-5xl gap-10 px-5 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gold">
              {offer?.stage ? offer.stage.label : "Data pemesan"}
            </p>
            <h1 className="mt-1 font-display text-3xl">Isi sesuai KTP</h1>
            {offer && !offer.open ? (
              <p className="mt-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
                {offer.message}
                {offer.stage?.startsAt ? ` Mulai ${formatDateTime(offer.stage.startsAt)} WIB.` : ""}
              </p>
            ) : null}
          </div>
          <div className="grid gap-4">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
              />
            </Field>
            <Field label="Nama asli" htmlFor="fullName">
              <Input
                id="fullName"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sesuai KTP"
              />
            </Field>
            <Field label="Alamat sesuai KTP" htmlFor="address">
              <Input
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat lengkap"
              />
            </Field>
            <Field label="WhatsApp" htmlFor="whatsapp">
              <Input
                id="whatsapp"
                required
                inputMode="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </Field>
            <Field label={lockedRef ? "Kode referal agen" : "Kode referal (opsional)"} htmlFor="referral">
              <Input
                id="referral"
                value={referralCode}
                readOnly={lockedRef}
                onChange={(e) => {
                  if (lockedRef) return;
                  setReferralCode(e.target.value.toUpperCase());
                }}
                placeholder="Kode agen"
                className={lockedRef ? "cursor-not-allowed bg-elevated/60 text-gold" : undefined}
              />
              {lockedRef ? (
                <p className="mt-1 text-xs text-gold">Kode referal terkunci dari tautan agen.</p>
              ) : null}
            </Field>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted">Jenis tiket</p>
            {TICKET_TYPES.filter((t) => !offer || offer.allowed.includes(t.id)).map((t) => {
              const sisa = offer?.remaining[t.id] ?? MAX_PER_TYPE;
              const habis = sisa < 1;
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-surface p-3"
                >
                  <img
                    src={t.image}
                    alt=""
                    className="size-16 shrink-0 rounded-md object-cover outline outline-1 -outline-offset-1 outline-fg/10"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg leading-tight">{t.label}</p>
                    <p className="font-mono text-xs text-gold">{formatRupiah(priceOf(t.id))}</p>
                    <p className="mt-0.5 text-xs text-subtle">
                      {habis ? "Kuota habis" : `Sisa ${sisa}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="grid size-11 place-items-center rounded-md border border-border bg-elevated"
                      onClick={() => setCount(t.id, qty[t.id] - 1)}
                      disabled={!offer?.open}
                      aria-label={`Kurangi ${t.label}`}
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-6 text-center font-mono tabular-nums">{qty[t.id]}</span>
                    <button
                      type="button"
                      className="grid size-11 place-items-center rounded-md border border-border bg-elevated"
                      onClick={() => setCount(t.id, qty[t.id] + 1)}
                      disabled={!offer?.open || habis}
                      aria-label={`Tambah ${t.label}`}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-subtle">
              Maksimal {maxPerType} tiket per jenis
              {offer?.stage?.id === "early_bird" ? " pada Early Bird" : ""}. Email dan WhatsApp hanya
              bisa dipakai satu kali pembelian.
            </p>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-sm text-muted">
            <Checkbox
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5"
            />
            <ol className="list-decimal space-y-1 pl-4">
              <li>Pastikan Email dan WhatsApp sudah benar dan AKTIF</li>
              <li>Kesalahan dalam input data bukan tanggung jawab panitia</li>
              <li>Refund tidak berlaku jika salah memasukkan nominal</li>
              <li>Tiket yang sudah dibeli tidak dapat di-refund</li>
            </ol>
          </label>

          <Button type="submit" size="lg" className="w-full" disabled={busy || !agreed || totalQty < 1 || !offer?.open}>
            {busy ? "Memproses…" : "Checkout"}
          </Button>
        </form>

        <aside className="h-fit rounded-xl border border-border bg-surface p-5 md:sticky md:top-24">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">{EVENT.name}</p>
          <h2 className="mt-1 font-display text-2xl">Ringkasan</h2>
          <ul className="mt-5 space-y-2 text-sm">
            {TICKET_TYPES.map((t) =>
              qty[t.id] > 0 ? (
                <li key={t.id} className="flex justify-between gap-4 text-muted">
                  <span>
                    {t.label} × {qty[t.id]}
                  </span>
                  <span className="font-mono tabular-nums text-fg">
                    {formatRupiah(priceOf(t.id) * qty[t.id])}
                  </span>
                </li>
              ) : null,
            )}
          </ul>
          {totalQty > 0 ? (
            <>
              <div className="mt-4 flex justify-between text-sm text-muted">
                <span>Kode unik (WA)</span>
                <span className="font-mono tabular-nums text-gold">+{uniqueCode.toString().padStart(3, "0")}</span>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4">
                <span>Total transfer</span>
                <span className="font-mono text-lg tabular-nums text-gold">{formatRupiah(total)}</span>
              </div>
            </>
          ) : (
            <p className="mt-6 text-sm text-subtle">Pilih tiket untuk melihat total.</p>
          )}
        </aside>
      </main>
      <SiteFooter />
    </div>
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
    <div className={cn("grid gap-1.5")}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
