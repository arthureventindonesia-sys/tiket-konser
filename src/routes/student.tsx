import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AdminContacts } from "@/components/admin-contacts";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EVENT, MAX_PROOF_BYTES, MAX_TOTAL_TICKETS, TICKET_TYPES } from "@/lib/event";
import { formatDateTime, formatRupiah, uniqueCodeFromWhatsapp } from "@/lib/format";
import { placeStudentOrder } from "@/lib/fn/orders";
import { fetchStudentOffer } from "@/lib/fn/stages";
import type { SaleOffer } from "@/lib/stages";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student")({
  validateSearch: (search: Record<string, unknown>): { ref?: string } => {
    if (typeof search.ref === "string" && search.ref.length > 0) return { ref: search.ref };
    return {};
  },
  component: StudentPage,
});

function StudentPage() {
  const { ref } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const lockedRef = Boolean(ref?.trim());
  const [referralCode, setReferralCode] = useState((ref ?? "").toUpperCase());
  const [qty, setQty] = useState({ vvip: 0, vip: 0, festival: 0 });
  const [card, setCard] = useState<{ dataUrl: string; mime: string; name: string } | null>(null);
  const cardInput = useRef<HTMLInputElement>(null);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [offer, setOffer] = useState<SaleOffer | null>(null);

  useEffect(() => {
    fetchStudentOffer()
      .then(setOffer)
      .catch(() =>
        setOffer({
          open: false,
          message: "Penjualan tiket sedang ditutup.",
          stage: null,
          remaining: { vvip: 0, vip: 0, festival: 0 },
          price: { vvip: 0, vip: 0, festival: 0 },
          allowed: [],
          maxPerType: MAX_TOTAL_TICKETS,
        }),
      );
  }, []);

  const uniqueCode = uniqueCodeFromWhatsapp(whatsapp || "000");
  const priceOf = (id: (typeof TICKET_TYPES)[number]["id"]) => offer?.price[id] || 0;
  const baseAmount = useMemo(
    () => TICKET_TYPES.reduce((sum, t) => sum + priceOf(t.id) * qty[t.id], 0),
    [qty, offer],
  );
  const totalQty = qty.vvip + qty.vip + qty.festival;
  const total = totalQty > 0 ? baseAmount + uniqueCode : 0;

  function setCount(id: keyof typeof qty, next: number) {
    const cap = offer?.remaining[id] ?? MAX_TOTAL_TICKETS;
    setQty((prev) => {
      const others = prev.vvip + prev.vip + prev.festival - prev[id];
      const n = Math.min(cap, MAX_TOTAL_TICKETS - others, Math.max(0, next));
      return { ...prev, [id]: n };
    });
  }

  useEffect(() => {
    if (!offer?.open) return;
    setQty((prev) => {
      const next = { vvip: 0, vip: 0, festival: 0 };
      let left = MAX_TOTAL_TICKETS;
      for (const type of ["vvip", "vip", "festival"] as const) {
        if (!offer.allowed.includes(type)) continue;
        const n = Math.min(prev[type], offer.remaining[type], left);
        next[type] = Math.max(0, n);
        left -= next[type];
      }
      return next;
    });
  }, [offer]);

  function rejectCard(message: string) {
    toast.error(message);
    setCard(null);
    if (cardInput.current) cardInput.current.value = "";
  }

  function onCard(file: File | undefined) {
    if (!file) {
      setCard(null);
      return;
    }
    if (file.size > MAX_PROOF_BYTES) {
      rejectCard("Kartu pelajar maksimal 1 MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      rejectCard("Kartu pelajar: JPG, PNG, atau WEBP");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) {
        rejectCard("Kartu pelajar tidak bisa dibaca");
        return;
      }
      setCard({ dataUrl, mime: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!card) {
      toast.error("Unggah kartu pelajar");
      return;
    }
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
      const order = await placeStudentOrder({
        data: {
          email,
          fullName,
          address,
          whatsapp,
          referralCode: (lockedRef ? (ref ?? "") : referralCode).trim() || undefined,
          qtyVvip: qty.vvip,
          qtyVip: qty.vip,
          qtyFestival: qty.festival,
          studentCardDataUrl: card.dataUrl,
          studentCardMime: card.mime,
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
      <main className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <form onSubmit={onSubmit} className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gold">Tiket pelajar</p>
              <h1 className="mt-1 font-display text-3xl">Khusus pelajar</h1>
              <p className="mt-2 text-sm text-muted">
                {offer?.stage ? offer.stage.label : "Harga pelajar"} · maksimal {MAX_TOTAL_TICKETS} tiket, boleh campur jenis.
              </p>
              {offer && !offer.open ? (
                <p className="mt-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
                  {offer.message}
                  {offer.stage?.startsAt ? ` Mulai ${formatDateTime(offer.stage.startsAt)} WIB.` : ""}
                </p>
              ) : null}
            </div>
            <div className="grid gap-4">
              <Field label="Email" htmlFor="email">
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="Nama asli" htmlFor="fullName">
                <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </Field>
              <Field label="Alamat sesuai KTP" htmlFor="address">
                <Input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} />
              </Field>
              <Field label="WhatsApp" htmlFor="whatsapp">
                <Input id="whatsapp" required inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="08xxxxxxxxxx" />
              </Field>
              <Field label={lockedRef ? "Kode referal agen" : "Kode referal (opsional) BOLEH DI KOSONGKAN"} htmlFor="referral">
                <Input
                  id="referral"
                  value={referralCode}
                  readOnly={lockedRef}
                  onChange={(e) => {
                    if (!lockedRef) setReferralCode(e.target.value.toUpperCase());
                  }}
                  className={lockedRef ? "cursor-not-allowed bg-elevated/60 text-gold" : undefined}
                />
              </Field>
              <Field label="Kartu pelajar" htmlFor="student-card">
                <Input
                  ref={cardInput}
                  id="student-card"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={(e) => onCard(e.target.files?.[0])}
                />
                <p className="text-xs text-subtle">JPG, PNG, atau WEBP. Maksimal 1 MB.</p>
                {card ? (
                  <img src={card.dataUrl} alt="Pratinjau kartu pelajar" className="mt-2 max-h-40 rounded-md border border-border object-contain" />
                ) : null}
              </Field>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted">Jenis tiket</p>
              {offer ? (
                TICKET_TYPES.filter((t) => offer.allowed.includes(t.id)).map((t) => {
                const sisa = offer?.remaining[t.id] ?? MAX_TOTAL_TICKETS;
                const habis = Boolean(offer?.open) && sisa < 1;
                return (
                  <div key={t.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg leading-tight">{t.label}</p>
                      <p className="font-mono text-xs text-gold">{formatRupiah(priceOf(t.id))}</p>
                      {habis ? <p className="mt-0.5 text-xs text-danger">Kuota habis</p> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="grid size-11 place-items-center rounded-md border border-border bg-elevated" onClick={() => setCount(t.id, qty[t.id] - 1)} disabled={!offer?.open} aria-label={`Kurangi ${t.label}`}>
                        <Minus className="size-4" />
                      </button>
                      <span className="w-6 text-center font-mono tabular-nums">{qty[t.id]}</span>
                      <button type="button" className="grid size-11 place-items-center rounded-md border border-border bg-elevated" onClick={() => setCount(t.id, qty[t.id] + 1)} disabled={!offer?.open || habis || totalQty >= MAX_TOTAL_TICKETS} aria-label={`Tambah ${t.label}`}>
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })
              ) : (
                <p className="text-sm text-muted">Memuat harga pelajar…</p>
              )}
              <div className="rounded-lg border-2 border-gold bg-gold/15 px-4 py-3 text-sm font-semibold leading-relaxed text-fg">
                Maksimal {MAX_TOTAL_TICKETS} tiket per pembelian, boleh campur jenis. Kartu pelajar wajib diunggah.
                Email dan WhatsApp hanya bisa dipakai satu kali pembelian.
              </div>
            </div>
            <label className="flex items-start gap-3 rounded-lg border border-black/20 bg-white p-4 text-sm text-black">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-0.5 border-black/40 bg-white data-[state=checked]:border-gold data-[state=checked]:bg-gold data-[state=checked]:text-gold-fg"
              />
              <ol className="list-decimal space-y-1 pl-4">
                <li>Pastikan Email dan WhatsApp sudah benar dan AKTIF</li>
                <li>Kesalahan dalam input data bukan tanggung jawab panitia</li>
                <li>Refund tidak berlaku jika salah memasukkan nominal</li>
                <li>Tiket yang sudah dibeli tidak dapat di-refund</li>
              </ol>
            </label>
            <AdminContacts />
          </div>
          <aside className="h-fit rounded-xl border border-border bg-surface p-5 md:sticky md:top-24">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">{EVENT.name}</p>
            <h2 className="mt-1 font-display text-2xl">Ringkasan Harga Pelajar</h2>
            <ul className="mt-5 space-y-2 text-sm">
              {TICKET_TYPES.map((t) =>
                qty[t.id] > 0 ? (
                  <li key={t.id} className="flex justify-between gap-4 text-muted">
                    <span>{t.label} × {qty[t.id]}</span>
                    <span className="font-mono tabular-nums text-fg">{formatRupiah(priceOf(t.id) * qty[t.id])}</span>
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
            <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy || !agreed || !card || totalQty < 1 || !offer?.open}>
              {busy ? "Memproses…" : "Checkout"}
            </Button>
          </aside>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid gap-1.5")}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
