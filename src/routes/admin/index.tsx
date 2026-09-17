import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { fetchConfirmedExport, fetchDashboard } from "@/lib/fn/admin";
import { formatRupiah } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function csvCell(value: string | number): string {
  const s = String(value ?? "");
  if (/[;"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
  }, []);

  async function downloadConfirmed() {
    setDownloading(true);
    try {
      const rows = await fetchConfirmedExport();
      if (rows.length === 0) {
        toast.error("Belum ada data terkonfirmasi");
        return;
      }
      const header = [
        "Nama",
        "Email",
        "WhatsApp",
        "Alamat",
        "VVIP",
        "VIP",
        "Festival",
        "Kode tiket",
        "Nominal tiket",
        "Kode unik",
        "Total bayar",
        "Referal",
        "Dikonfirmasi",
      ];
      const lines = [
        header.join(";"),
        ...rows.map((r) =>
          [
            r.fullName,
            r.email,
            r.whatsapp,
            r.address,
            r.qtyVvip,
            r.qtyVip,
            r.qtyFestival,
            r.ticketCodes,
            r.baseAmount,
            r.uniqueCode.toString().padStart(3, "0"),
            r.totalAmount,
            r.referralCode,
            r.confirmedAt ? new Date(r.confirmedAt).toLocaleString("id-ID") : "",
          ]
            .map(csvCell)
            .join(";"),
        ),
      ];
      const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const day = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `gsf-terkonfirmasi-${day}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${rows.length} data diunduh`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunduh");
    } finally {
      setDownloading(false);
    }
  }

  if (error) return <p className="text-danger">{error}</p>;
  if (!data) return <p className="text-muted">Memuat dashboard…</p>;

  const chart = [
    { name: "VVIP", total: data.tickets.vvip },
    { name: "VIP", total: data.tickets.vip },
    { name: "Festival", total: data.tickets.festival },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Dashboard</p>
          <h1 className="mt-1 font-display text-3xl">Penjualan tiket</h1>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void downloadConfirmed()}
          disabled={downloading || data.confirmedOrders < 1}
        >
          <Download className="size-4" />
          {downloading ? "Menyiapkan…" : "Unduh data terkonfirmasi"}
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="VVIP terjual" value={String(data.tickets.vvip)} />
        <Stat label="VIP terjual" value={String(data.tickets.vip)} />
        <Stat label="Festival terjual" value={String(data.tickets.festival)} />
        <Stat label="Uang masuk" value={formatRupiah(data.revenue)} accent />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Menunggu konfirmasi" value={String(data.awaitingConfirm)} />
        <Stat label="Pesanan terkonfirmasi" value={String(data.confirmedOrders)} />
      </div>
      <div className="h-64 rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-sm text-muted">Tiket terkonfirmasi per jenis</p>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chart}>
            <XAxis dataKey="name" stroke="var(--color-subtle)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-subtle)" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "color-mix(in oklab, var(--color-fg) 4%, transparent)" }}
              contentStyle={{
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-fg)",
              }}
            />
            <Bar dataKey="total" fill="var(--color-gold)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className={`mt-2 font-mono text-2xl tabular-nums ${accent ? "text-gold" : "text-fg"}`}>
        {value}
      </p>
    </div>
  );
}