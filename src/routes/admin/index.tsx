import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchDashboard } from "@/lib/fn/admin";
import { formatRupiah } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!data) return <p className="text-muted">Memuat dashboard…</p>;

  const chart = [
    { name: "VVIP", total: data.tickets.vvip },
    { name: "VIP", total: data.tickets.vip },
    { name: "Festival", total: data.tickets.festival },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Dashboard</p>
        <h1 className="mt-1 font-display text-3xl">Penjualan tiket</h1>
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
