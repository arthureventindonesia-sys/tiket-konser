import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/agent-qr";
import { TICKET_LABEL } from "@/lib/event";
import { formatRupiah, waMeUrl } from "@/lib/format";
import { fetchOrder } from "@/lib/fn/orders";
import type { PublicOrder } from "@/lib/types";

const ADMIN_WA = "081548335445";

export const Route = createFileRoute("/tiket/$orderId")({
  component: TiketPage,
});

function TiketPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  async function onCopyLink() {
    const url = window.location.href;
    try {
      await copyText(url);
      setCopied(true);
      toast.success("Tautan disalin");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin tautan");
    }
  }

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

            <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm leading-relaxed text-fg">
              Konfirmasi tiket 1×24 jam. Jika melebihi waktu yang ditentukan silakan hubungi admin di{" "}
              <a
                href={waMeUrl(ADMIN_WA, `Halo admin Golden Satya Fair, saya ingin menanyakan status pesanan ${order.publicId}`)}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-gold underline decoration-gold underline-offset-4"
              >
                {ADMIN_WA}
              </a>
            </div>

            <Button type="button" size="lg" className="w-full text-base font-bold tracking-wide" onClick={() => void onCopyLink()}>
              <Copy className="size-5" />
              {copied ? "TAUTAN TERSALIN" : "SALIN TAUTAN"}
            </Button>

            <div className="text-sm text-subtle">
              <p>Total: {formatRupiah(order.totalAmount)}</p>
              <p className="mt-1 break-all">ID pesanan: {order.publicId}</p>
            </div>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
