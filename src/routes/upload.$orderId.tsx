import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { MAX_PROOF_BYTES } from "@/lib/event";
import { formatRupiah } from "@/lib/format";
import { fetchOrder, uploadProof } from "@/lib/fn/orders";
import type { PublicOrder } from "@/lib/types";

export const Route = createFileRoute("/upload/$orderId")({
  component: UploadPage,
});

function UploadPage() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<{ mime: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchOrder({ data: orderId })
      .then((o) => {
        if (cancelled) return;
        if (o.status === "confirmed") {
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

  function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > MAX_PROOF_BYTES) {
      toast.error("Ukuran gambar maksimal 1 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(typeof reader.result === "string" ? reader.result : null);
      setFileMeta({ mime: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!preview || !fileMeta) {
      toast.error("Pilih gambar bukti transfer");
      return;
    }
    setBusy(true);
    try {
      await uploadProof({
        data: {
          publicId: orderId,
          dataUrl: preview,
          mime: fileMeta.mime,
          name: fileMeta.name,
        },
      });
      await navigate({ to: "/tiket/$orderId", params: { orderId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg">
      <SiteHeader solid />
      <main className="mx-auto max-w-lg px-5 py-10">
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Bukti transfer</p>
        <h1 className="mt-1 font-display text-3xl">Unggah bukti pembayaran</h1>
        {error ? <p className="mt-4 text-danger">{error}</p> : null}
        {order ? (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="rounded-lg border border-border bg-surface p-4 text-sm">
              <p className="text-muted">{order.fullName}</p>
              <p className="mt-1 font-mono text-lg tabular-nums text-gold">
                {formatRupiah(order.totalAmount)}
              </p>
              <p className="mt-1 text-xs text-subtle">
                Pastikan nominal di bukti sama dengan total transfer.
              </p>
            </div>
            <label className="grid min-h-44 cursor-pointer place-items-center rounded-xl border border-dashed border-border bg-surface p-4 text-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              {preview ? (
                <img
                  src={preview}
                  alt="Pratinjau bukti"
                  className="max-h-64 rounded-md object-contain outline outline-1 -outline-offset-1 outline-fg/10"
                />
              ) : (
                <span className="text-sm text-muted">
                  Pilih gambar JPG / PNG / WEBP
                  <br />
                  Maksimal 1 MB
                </span>
              )}
            </label>
            <Button type="submit" className="w-full" size="lg" disabled={busy || !preview}>
              {busy ? "Mengunggah…" : "Kirim bukti transfer"}
            </Button>
          </form>
        ) : null}
      </main>
    </div>
  );
}
