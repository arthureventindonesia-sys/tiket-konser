import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TICKET_LABEL } from "@/lib/event";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { fetchAgentSales } from "@/lib/fn/admin";
import { getStaffSession } from "@/lib/fn/staff";
import type { PublicOrder } from "@/lib/types";

export const Route = createFileRoute("/admin/agen")({
  component: AgenPage,
});

type Row = PublicOrder & { agentName?: string; agentUsername?: string };

function AgenPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAgent, setIsAgent] = useState(false);

  useEffect(() => {
    Promise.all([getStaffSession(), fetchAgentSales()])
      .then(([staff, sales]) => {
        setIsAgent(staff?.role === "agent");
        setCode(staff?.referralCode ?? null);
        setRows(sales as Row[]);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-gold">
          {isAgent ? "Transaksi" : "Agen"}
        </p>
        <h1 className="mt-1 font-display text-3xl">
          {isAgent ? "Pembeli dari tautan Anda" : "Transaksi referal terkonfirmasi"}
        </h1>
        {isAgent && code ? (
          <p className="mt-2 break-all font-mono text-sm text-gold">
            {origin}/beli?ref={code}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-subtle">Hanya pesanan yang sudah dikonfirmasi panitia.</p>
      </div>
      {rows.length === 0 ? (
        <p className="text-muted">Belum ada transaksi terkonfirmasi.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Pembeli</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">Tiket</th>
                <th className="px-4 py-3 font-medium">Nominal</th>
                {!isAgent ? <th className="px-4 py-3 font-medium">Agen</th> : null}
                <th className="px-4 py-3 font-medium">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.publicId} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p>{r.fullName}</p>
                    <p className="text-xs text-subtle">{r.email}</p>
                  </td>
                  <td className="px-4 py-3">{r.whatsapp}</td>
                  <td className="px-4 py-3 text-muted">
                    {[
                      r.qtyVvip ? `${r.qtyVvip} ${TICKET_LABEL.vvip}` : null,
                      r.qtyVip ? `${r.qtyVip} ${TICKET_LABEL.vip}` : null,
                      r.qtyFestival ? `${r.qtyFestival} ${TICKET_LABEL.festival}` : null,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums">{formatRupiah(r.totalAmount)}</td>
                  {!isAgent ? (
                    <td className="px-4 py-3">{r.agentName ?? r.referralCode}</td>
                  ) : null}
                  <td className="px-4 py-3 text-subtle">
                    {r.confirmedAt ? formatDateTime(r.confirmedAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
