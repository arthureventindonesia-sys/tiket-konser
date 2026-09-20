import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Copy, MessageCircle, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/agent-qr";
import { TICKET_LABEL, TICKET_TYPES, type TicketTypeId } from "@/lib/event";
import { formatDateTime, formatRupiah, waMeUrl } from "@/lib/format";
import { cancelPayment, confirmPayment, fetchConfirmations } from "@/lib/fn/admin";
import type { AdminOrder } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/konfirmasi")({
  component: KonfirmasiPage,
});

const PAGE_SIZE = 20;
type ConfirmFilter = "pending" | "confirmed" | "cancelled";
type TypeFilter = "all" | TicketTypeId;

function hasType(o: AdminOrder, type: TicketTypeId) {
  if (type === "vvip") return o.qtyVvip > 0;
  if (type === "vip") return o.qtyVip > 0;
  return o.qtyFestival > 0;
}

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function matchesQuery(o: AdminOrder, raw: string) {
  const q = raw.trim().toLowerCase();
  if (!q) return true;
  const phoneQ = digits(q);
  const hay = [
    o.fullName,
    o.email,
    o.whatsapp,
    o.address,
    o.publicId,
    o.referralCode ?? "",
    ...o.tickets.map((t) => t.code),
  ]
    .join(" ")
    .toLowerCase();
  if (hay.includes(q)) return true;
  if (phoneQ.length >= 4 && digits(o.whatsapp).includes(phoneQ)) return true;
  return false;
}

function KonfirmasiPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingCancel, setPendingCancel] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConfirmFilter>("pending");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchConfirmations()
      .then(setOrders)
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
  }, []);

  const pendingCount = orders.filter((o) => o.status !== "confirmed" && o.status !== "cancelled").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  const byStatus = useMemo(
    () =>
      orders.filter((o) => {
        if (filter === "confirmed") return o.status === "confirmed";
        if (filter === "cancelled") return o.status === "cancelled";
        return o.status !== "confirmed" && o.status !== "cancelled";
      }),
    [orders, filter],
  );

  const typeCounts = useMemo(
    () => ({
      vvip: byStatus.filter((o) => hasType(o, "vvip")).length,
      vip: byStatus.filter((o) => hasType(o, "vip")).length,
      festival: byStatus.filter((o) => hasType(o, "festival")).length,
    }),
    [byStatus],
  );

  const filtered = useMemo(
    () =>
      (typeFilter === "all" ? byStatus : byStatus.filter((o) => hasType(o, typeFilter))).filter((o) =>
        matchesQuery(o, query),
      ),
    [byStatus, typeFilter, query],
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

  async function onCancel(id: number) {
    if (pendingCancel !== id) {
      setPendingCancel(id);
      return;
    }
    setBusyId(id);
    try {
      const next = await cancelPayment({ data: { orderId: id } });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...next, tickets: [] } : o)));
      setPendingCancel(null);
      toast.success("Tiket dibatalkan, kuota dikembalikan");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal membatalkan");
    } finally {
      setBusyId(null);
    }
  }

  async function copyLink(path: string, label: string) {
    try {
      await copyText(`${window.location.origin}${path}`);
      toast.success(`${label} disalin`);
    } catch {
      toast.error("Gagal menyalin tautan");
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

  function changeType(next: TypeFilter) {
    setTypeFilter(next);
    setPage(1);
  }

  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Konfirmasi</p>
        <h1 className="mt-1 font-display text-3xl">Bukti transfer</h1>
      </div>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Cari nama, email, WhatsApp, atau kode tiket"
          className="pl-10"
          type="search"
        />
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
        <button
          type="button"
          onClick={() => changeFilter("cancelled")}
          className={cn(
            "inline-flex h-10 items-center rounded-md px-4 text-sm",
            filter === "cancelled" ? "bg-gold text-gold-fg" : "border border-border text-muted hover:bg-elevated hover:text-fg",
          )}
        >
          Dibatalkan
          <span className="ml-2 font-mono text-xs tabular-nums">{cancelledCount}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => changeType("all")}
          className={cn(
            "inline-flex h-10 items-center rounded-md px-4 text-sm",
            typeFilter === "all" ? "bg-gold text-gold-fg" : "border border-border text-muted hover:bg-elevated hover:text-fg",
          )}
        >
          Semua jenis
          <span className="ml-2 font-mono text-xs tabular-nums">{byStatus.length}</span>
        </button>
        {TICKET_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => changeType(t.id)}
            className={cn(
              "inline-flex h-10 items-center rounded-md px-4 text-sm",
              typeFilter === t.id ? "bg-gold text-gold-fg" : "border border-border text-muted hover:bg-elevated hover:text-fg",
            )}
          >
            {t.label}
            <span className="ml-2 font-mono text-xs tabular-nums">{typeCounts[t.id]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted">
          {query.trim()
            ? "Tidak ada data yang cocok dengan pencarian."
            : filter === "cancelled"
              ? "Belum ada tiket yang dibatalkan."
              : filter === "confirmed"
                ? "Belum ada pembayaran terkonfirmasi."
                : "Tidak ada pesanan yang menunggu konfirmasi."}
        </p>
      ) : (
        <>
          <ul className="space-y-4">
            {pageRows.map((o) => {
              const confirmed = o.status === "confirmed";
              const cancelled = o.status === "cancelled";
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
                    <Badge tone={cancelled ? "danger" : confirmed ? "success" : o.hasProof ? "gold" : "muted"}>
                      {cancelled ? "Dibatalkan" : confirmed ? "Terkonfirmasi" : o.hasProof ? "Menunggu" : "Belum unggah"}
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void copyLink(`/upload/${o.publicId}`, "Tautan unggah bukti")}
                    >
                      <Copy className="size-3.5" />
                      Salin tautan unggah
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void copyLink(`/tiket/${o.publicId}`, "Tautan status pesanan")}
                    >
                      <Copy className="size-3.5" />
                      Salin tautan status
                    </Button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      variant={confirmed ? "success" : "default"}
                      disabled={confirmed || cancelled || !o.hasProof || busyId === o.id}
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
                    {!cancelled ? (
                      <Button
                        type="button"
                        variant={pendingCancel === o.id ? "danger" : "outline"}
                        disabled={busyId === o.id}
                        onClick={() => void onCancel(o.id)}
                      >
                        {pendingCancel === o.id
                          ? busyId === o.id
                            ? "Membatalkan…"
                            : "Yakin batal?"
                          : "Batalkan tiket"}
                      </Button>
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
          className="fixed inset-0 z-50 flex h-[100dvh] w-[100dvw] items-center justify-center bg-bg/90 p-3 sm:p-6"
          onClick={() => setPreview(null)}
          aria-label="Tutup pratinjau bukti transfer"
        >
          <img
            src={preview}
            alt="Bukti transfer"
            className="max-h-full max-w-full object-contain"
            style={{
              width: "auto",
              height: "auto",
              maxWidth: "calc(100dvw - 1.5rem)",
              maxHeight: "calc(100dvh - 1.5rem)",
            }}
          />
        </button>
      ) : null}
    </div>
  );
}
