import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TICKET_LABEL } from "@/lib/event";
import { formatDateTime, formatRupiah, waMeUrl } from "@/lib/format";
import { confirmPayment, fetchConfirmations } from "@/lib/fn/admin";
import type { AdminOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/konfirmasi")({
  component: KonfirmasiPage,
});

const PAGE_SIZE = 20;
type ConfirmFilter = "pending" | "confirmed";

function KonfirmasiPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConfirmFilter>("pending");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchConfirmations()
      .then(setOrders)
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
  }, []);

  const pendingCount = orders.filter((o) => o.status !== "confirmed").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;

  const filtered = useMemo(
    () =>
      orders.filter((o) =>
        filter === "confirmed" ? o.status === "confirmed" : o.status !== "confirmed",
      ),
    [orders, filter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filtered.length);

  async function onConfirm(id: number) {
    setBusyId(id);
    try {
      const next = await confirmPayment({ data: id });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...next } : o)));
      toast.success("Pembayaran dikonfirmasi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal konfirmasi");
    } finally {
      setBusyId(null);
    }
  }

  function ticketSummary(o: AdminOrder) {
    const parts = [];
    if (o.qtyVvip) parts.push(`${o.qtyVvip} ${TICKET_LABEL.vvip}`);
    if (o.qtyVip) parts.push(`${o.qtyVip} ${TICKET_LABEL.vip}`);
    if (o.qtyFestival) parts.push(`${o.qtyFestival} ${TICKET_LABEL.festival}`);
    return parts.join(" · ");
  }

  function changeFilter(next: ConfirmFilter) {
    setFilter(next);
    setPage(1);
  }

  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Konfirmasi</p>
        <h1 className="mt-1 font-display text-3xl">Bukti transfer</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => changeFilter("pending")}
          className={cn(
            "inline-flex h-10 items-center rounded-md px-4 text-sm",
            filter === "pending" ? "bg-gold text-gold-fg" : "border border-border text-muted hover:bg-elevated hover:text-fg",
          )}
        >
          Belum konfirmasi
          <span className="ml-2 font-mono text-xs tabular-nums">{pendingCount}</span>
        </button>
        <button
          type="button"
          onClick={() => changeFilter("confirmed")}
          className={cn(
            "inline-flex h-10 items-center rounded-md px-4 text-sm",
            filter === "confirmed" ? "bg-gold text-gold-fg" : "border border-border text-muted hover:bg-elevated hover:text-fg",
          )}
        >
          Terkonfirmasi
          <span className="ml-2 font-mono text-xs tabular-nums">{confirmedCount}</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted">
          {filter === "confirmed" ? "Belum ada pembayaran terkonfirmasi." : "Tidak ada pesanan yang menunggu konfirmasi."}
        </p>
      ) : (
        <>
          <ul className="space-y-4">
            {pageRows.map((o) => {
              const confirmed = o.status === "confirmed";
              return (
                <li key={o.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{o.fullName}</p>
                      <p className="text-sm text-subtle">{o.email} · {o.whatsapp}</p>
                      <p className="mt-1 text-sm text-muted">{ticketSummary(o)}</p>
                      <p className="font-mono text-sm tabular-nums text-gold">
                        {formatRupiah(o.totalAmount)}
                      </p>
                      <p className="mt-1 text-xs text-subtle">{formatDateTime(o.createdAt)}</p>
                    </div>
                    <Badge tone={confirmed ? "success" : o.hasProof ? "gold" : "muted"}>
                      {confirmed ? "Terkonfirmasi" : o.hasProof ? "Menunggu" : "Belum unggah"}
                    </Badge>
                  </div>
                  {o.proofData ? (
                    <button
                      type="button"
                      className="mt-3 overflow-hidden rounded-md"
                      onClick={() => setPreview(o.proofData)}
                    >
                      <img
                        src={o.proofData}
                        alt={`Bukti ${o.fullName}`}
                        className="h-28 w-auto max-w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
                      />
                    </button>
                  ) : (
                    <p className="mt-3 text-sm text-subtle">Bukti transfer belum diunggah.</p>
                  )}
                  {confirmed && o.tickets.length > 0 ? (
                    <p className="mt-3 font-mono text-xs text-muted">
                      {o.tickets.map((t) => t.code).join(" · ")}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      variant={confirmed ? "success" : "default"}
                      disabled={confirmed || !o.hasProof || busyId === o.id}
                      onClick={() => onConfirm(o.id)}
                    >
                      <Check className="size-4" />
                      {confirmed ? "Terkonfirmasi" : busyId === o.id ? "Memproses…" : "Konfirmasi"}
                    </Button>
                    {confirmed ? (
                      <a
                        href={waMeUrl(o.whatsapp, o.waText ?? "")}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex size-11 items-center justify-center rounded-md bg-whatsapp text-fg"
                        aria-label="Kirim WhatsApp"
                      >
                        <MessageCircle className="size-5" />
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm text-subtle">
              {from}–{to} dari {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
                Sebelumnya
              </Button>
              <span className="font-mono text-xs tabular-nums text-muted">
                {safePage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Berikutnya
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
      {preview ? (
        <button
          type="button"
          className="fixed inset-0 z-50 grid place-items-center bg-bg/80 p-6"
          onClick={() => setPreview(null)}
        >
          <img src={preview} alt="Bukti transfer" className="max-h-full max-w-full rounded-lg" />
        </button>
      ) : null}
    </div>
  );
}
