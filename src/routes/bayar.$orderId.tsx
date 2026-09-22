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

  const tickets = [
    order?.qtyVvip ? `${TICKET_LABEL.vvip} × ${order.qtyVvip}` : "",
    order?.qtyVip ? `${TICKET_LABEL.vip} × ${order.qtyVip}` : "",
    order?.qtyFestival ? `${TICKET_LABEL.festival} × ${order.qtyFestival}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <SiteHeader solid compact />
      <main className="flex flex-1 items-stretch justify-center sm:items-center sm:px-4 sm:py-4">
        {error ? <p className="p-4 text-danger">{error}</p> : null}
        {!error && !order ? <p className="p-4 text-muted">Menyiapkan QRIS…</p> : null}
        {order ? (
          <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col bg-fg px-4 py-3 text-gold-fg sm:flex-none sm:rounded-2xl sm:border sm:border-border sm:p-4 sm:shadow-[var(--shadow-elevated)]">
            <div className="grid min-h-0 flex-1 grid-rows-[minmax(120px,1fr)_auto] gap-3">
              <div className="grid min-h-0 place-items-center overflow-hidden rounded-xl bg-white p-2">
                <img
                  src={`${EVENT.qris}?v=3`}
                  alt="QRIS Golden Satya Fair"
                  className="max-h-full max-w-full object-contain object-center"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-bg">
                    Nominal transfer (termasuk kode unik)
                  </p>
                  <p className="mt-1 font-mono text-[1.7rem] font-bold leading-none tabular-nums text-bg">
                    {formatRupiah(order.totalAmount)}
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-bg">
                    Harga {formatRupiah(order.baseAmount)} + kode {order.uniqueCode.toString().padStart(3, "0")}
                  </p>
                </div>
                <Button
                  type="button"
                  className="h-11 w-full text-sm font-bold tracking-wide"
                  onClick={() => void copyNominal(order.totalAmount)}
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "NOMINAL TERSALIN" : "SALIN NOMINAL"}
                </Button>
                <p className="rounded-md border border-gold/50 bg-gold/15 px-2 py-1.5 text-center text-[11px] font-semibold text-bg">
                  Pastikan nominal sesuai dengan tagihan di sistem.
                </p>
                <ProofDeadlineBanner
                  createdAt={order.createdAt}
                  dense
                  onLight
                  onExpired={() => {
                    void navigate({ to: "/tiket/$orderId", params: { orderId } });
                  }}
                />
                {tickets ? <p className="text-center text-[11px] font-medium text-subtle">{tickets}</p> : null}
                <Button
                  className="h-11 w-full text-sm font-bold"
                  onClick={() => navigate({ to: "/upload/$orderId", params: { orderId } })}
                >
                  KONFIRMASI PEMBAYARAN
                </Button>
                <p className="text-center text-[10px] text-subtle">
                  Scan, transfer sesuai nominal, lalu konfirmasi.{" "}
                  <Link to="/" className="underline-offset-2 hover:underline">
                    Beranda
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
