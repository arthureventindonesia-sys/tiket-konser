import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { TICKET_LABEL } from "@/lib/event";
import { formatRupiah } from "@/lib/format";
import { fetchOrder } from "@/lib/fn/orders";
import type { PublicOrder } from "@/lib/types";

export const Route = createFileRoute("/tiket/$orderId")({
  component: TiketPage,
});

function TiketPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchOrder({ data: orderId })
        .then((o) => {
          if (!cancelled) setOrder(o);
        })
        .catch((e) => {
          if (!cancelled) setError(e instanceof Error ? e.message : "Tidak ditemukan");
        });
    void load();
    const t = window.setInterval(() => {
      void load();
    }, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [orderId]);

  const confirmed = order?.status === "confirmed";

  return (
    <div className="min-h-dvh bg-bg">
      <SiteHeader solid />
      <main className="mx-auto max-w-lg px-5 py-10">
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Status pesanan</p>
        <h1 className="mt-1 font-display text-3xl">Tiket Anda</h1>
        {error ? <p className="mt-4 text-danger">{error}</p> : null}
        {order ? (
          <div className="mt-8 space-y-5">
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
              <div>
                <p className="font-medium">{order.fullName}</p>
                <p className="text-sm text-subtle">{order.email}</p>
              </div>
              <Badge tone={confirmed ? "success" : order.hasProof ? "gold" : "muted"}>
                {confirmed ? "Terkonfirmasi" : order.hasProof ? "Menunggu panitia" : "Belum bayar"}
              </Badge>
            </div>

            {confirmed && order.tickets.length > 0 ? (
              <ul className="space-y-3">
                {order.tickets.map((t) => (
                  <li
                    key={t.code}
                    className="overflow-hidden rounded-xl border border-gold/30 bg-surface"
                  >
                    <img
                      src="/images/ticket.jpg"
                      alt=""
                      className="h-24 w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
                    />
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-gold">
                        {TICKET_LABEL[t.type]}
                      </p>
                      <p className="mt-1 font-mono text-xl tracking-wide text-fg">{t.code}</p>
                      <p className="mt-2 text-xs text-subtle">Satu kode · satu orang · tunjukkan saat masuk</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-border bg-surface p-5 text-sm text-muted">
                {order.hasProof
                  ? "Bukti transfer sudah diterima. Tiket belum muncul sampai panitia mengonfirmasi pembayaran."
                  : "Selesaikan pembayaran dan unggah bukti transfer."}
                {!order.hasProof ? (
                  <p className="mt-3">
                    <Link
                      to="/bayar/$orderId"
                      params={{ orderId }}
                      className="text-gold underline-offset-4 hover:underline"
                    >
                      Buka QRIS
                    </Link>
                  </p>
                ) : null}
              </div>
            )}

            <div className="text-sm text-subtle">
              <p>Total: {formatRupiah(order.totalAmount)}</p>
              <p className="mt-1 break-all">ID pesanan: {order.publicId}</p>
              <p className="mt-3">Simpan tautan halaman ini untuk mengecek status.</p>
            </div>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
