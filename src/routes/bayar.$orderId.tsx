import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { ProofDeadlineBanner } from "@/components/proof-deadline";
import { Button } from "@/components/ui/button";
import { EVENT, TICKET_LABEL } from "@/lib/event";
import { formatRupiah } from "@/lib/format";
import { fetchOrder } from "@/lib/fn/orders";
import type { PublicOrder } from "@/lib/types";

export const Route = createFileRoute("/bayar/$orderId")({
  component: BayarPage,
});

function BayarPage() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchOrder({ data: orderId })
      .then((o) => {
        if (cancelled) return;
        if (o.status === "confirmed" || o.status === "awaiting_confirm" || o.status === "cancelled") {
          void navigate({ to: "/tiket/$orderId", params: { orderId } });
          return;
        }
        setOrder(o);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Tidak ditemukan");
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, navigate]);

  async function copyNominal(amount: number) {
    const text = String(amount);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    toast.success("Nominal disalin");
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-dvh bg-bg">
      <SiteHeader solid />
      <main className="grid min-h-[calc(100dvh-72px)] place-items-center px-4 py-10">
        {error ? <p className="text-danger">{error}</p> : null}
        {!error && !order ? <p className="text-muted">Menyiapkan QRIS…</p> : null}
        {order ? (
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-fg p-5 text-gold-fg shadow-[var(--shadow-elevated)]">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-subtle">
              <span>QRIS Statis</span>
              <span>{EVENT.shortName}</span>
            </div>
            <h1 className="mt-3 text-center font-display text-2xl text-bg">{EVENT.merchantName}</h1>
            <p className="text-center text-xs text-subtle">NMID {EVENT.nmid}</p>
            <div className="mx-auto mt-4 overflow-hidden rounded-lg bg-bg">
              <img src={EVENT.qris} alt="QRIS statis Golden Satya Fair" className="w-full" />
            </div>
            <p className="mt-4 text-center text-xs text-subtle">Nominal transfer (termasuk kode unik)</p>
            <p className="text-center font-mono text-2xl tabular-nums text-bg">
              {formatRupiah(order.totalAmount)}
            </p>
            <p className="mt-1 text-center text-xs text-subtle">
              Harga {formatRupiah(order.baseAmount)} + kode {order.uniqueCode.toString().padStart(3, "0")}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mx-auto mt-3 flex border-gold/40 bg-transparent text-bg hover:bg-bg/10"
              onClick={() => void copyNominal(order.totalAmount)}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Tersalin" : "Salin nominal"}
            </Button>
            <p className="mt-4 rounded-lg border border-gold/50 bg-gold/15 px-3 py-2 text-center text-xs font-medium leading-relaxed text-bg">
              Pastikan nominal sesuai dengan tagihan di sistem.
            </p>
            <div className="mt-4">
              <ProofDeadlineBanner
                createdAt={order.createdAt}
                compact
                onLight
                onExpired={() => {
                  void navigate({ to: "/tiket/$orderId", params: { orderId } });
                }}
              />
            </div>
            <ul className="mt-4 space-y-1 border-t border-border pt-3 text-xs text-subtle">
              {order.qtyVvip > 0 ? (
                <li>
                  {TICKET_LABEL.vvip} × {order.qtyVvip}
                </li>
              ) : null}
              {order.qtyVip > 0 ? (
                <li>
                  {TICKET_LABEL.vip} × {order.qtyVip}
                </li>
              ) : null}
              {order.qtyFestival > 0 ? (
                <li>
                  {TICKET_LABEL.festival} × {order.qtyFestival}
                </li>
              ) : null}
            </ul>
            <Button
              className="mt-5 w-full"
              size="lg"
              onClick={() => navigate({ to: "/upload/$orderId", params: { orderId } })}
            >
              KONFIRMASI PEMBAYARAN
            </Button>
            <p className="mt-3 text-center text-[11px] text-subtle">
              Scan dengan e-wallet, transfer sesuai nominal, lalu konfirmasi.
            </p>
            <p className="mt-2 text-center text-[11px]">
              <Link to="/" className="text-subtle underline-offset-4 hover:underline">
                Kembali ke beranda
              </Link>
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
