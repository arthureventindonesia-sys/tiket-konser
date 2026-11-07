import { createFileRoute } from "@tanstack/react-router";
import { Printer, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EVENT, TICKET_LABEL, TICKET_TYPE_IDS, type TicketTypeId } from "@/lib/event";
import { formatRupiah, formatTakeoutStamp } from "@/lib/format";
import { lookupTicket, takeoutTicket, upgradeTicketCode } from "@/lib/fn/tiketbox";
import type { TicketboxRecord, TicketCode } from "@/lib/types";

export const Route = createFileRoute("/admin/tiketbox")({
  component: TiketboxPage,
});

function TiketboxPage() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [taking, setTaking] = useState(false);
  const [record, setRecord] = useState<TicketboxRecord | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    const preset = new URLSearchParams(window.location.search).get("code")?.trim();
    if (!preset) return;
    setCode(preset);
    lookupTicket({ data: { code: preset } })
      .then((next) => {
        setRecord(next);
        setPending(null);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Kode tidak ditemukan");
      });
  }, []);

  async function onCheck(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const next = await lookupTicket({ data: { code } });
      setRecord(next);
      setPending(null);
    } catch (err) {
      setRecord(null);
      toast.error(err instanceof Error ? err.message : "Kode tidak ditemukan");
    } finally {
      setBusy(false);
    }
  }

  async function onUpgrade(ticket: TicketCode, toType: TicketTypeId) {
    const key = `${ticket.code}:${toType}`;
    if (pending !== key) {
      setPending(key);
      return;
    }
    setUpgrading(key);
    try {
      const next = await upgradeTicketCode({ data: { code: ticket.code, toType } });
      setRecord(next);
      setCode(next.queriedCode);
      setPending(null);
      toast.success(`Tiket di-upgrade. Kode baru ${next.queriedCode}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal upgrade");
    } finally {
      setUpgrading(null);
    }
  }

  async function onTakeout() {
    if (!record) return;
    setTaking(true);
    try {
      const next = await takeoutTicket({ data: { orderId: record.orderId } });
      setRecord({ ...next, queriedCode: record.queriedCode });
      toast.success("Tiket ditandai sudah diambil");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal takeout");
    } finally {
      setTaking(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onCheck} className="no-print max-w-xl space-y-4 rounded-xl border border-border bg-surface p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Tiketbox</p>
          <h1 className="mt-1 font-display text-3xl">Cek kode tiket</h1>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="code">Kode tiket</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="GSF-VIP-XXXXXX"
            autoComplete="off"
            required
          />
        </div>
        <Button type="submit" disabled={busy}>
          <Search className="size-4" />
          {busy ? "Mencari…" : "Cek kode"}
        </Button>
      </form>

      {record ? (
        <div className="print-sheet space-y-5 rounded-xl border border-border bg-surface p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gold">Cetak tiket</p>
              <h2 className="mt-1 font-display text-3xl">{EVENT.name}</h2>
              <p className="mt-1 text-sm text-muted">
                {EVENT.dateLabel} · {EVENT.timeLabel} · {EVENT.venue}, {EVENT.city}
              </p>
            </div>
            <img src={EVENT.logo} alt="" className="h-12 w-auto object-contain" />
          </div>

          <dl className="grid gap-3 border-y border-border py-4 text-sm sm:grid-cols-2">
            <Item label="Nama" value={record.fullName} />
            <Item label="Email" value={record.email} />
            <Item label="WhatsApp" value={record.whatsapp} />
            <Item label="Alamat" value={record.address} />
          </dl>

          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-subtle">Tiket dibeli</p>
            <ul className="mt-3 space-y-3">
              {record.tickets.map((t) => {
                const paid = t.unitPrice ?? record.ticketPrice[t.type];
                const choices = upgradeChoices(record, t);
                return (
                  <li
                    key={t.code}
                    className={`rounded-lg border px-3 py-3 ${
                      t.code === record.queriedCode ? "border-gold bg-gold/10" : "border-border"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>
                        <span className="font-medium">{TICKET_LABEL[t.type]}</span>
                        <span className="mt-1 block text-xs text-muted">
                          Harga tiket {paid != null ? formatRupiah(paid) : "tidak tercatat"}
                          {" · "}
                          Tahap {record.stageLabel ?? "tidak tercatat"}
                          {record.student ? " · Pelajar" : record.fastTrack ? " · Fast Track" : ""}
                        </span>
                      </span>
                      <span className="font-mono text-sm text-gold">{t.code}</span>
                    </div>
                    <div className="no-print mt-3 border-t border-border pt-3">
                      {!record.liveStage ? (
                        <p className="text-xs text-subtle">Tidak ada tahap berlangsung, upgrade tidak bisa dihitung.</p>
                      ) : choices.length === 0 ? (
                        <p className="text-xs text-subtle">Tidak ada upgrade. Harga tahap berlangsung tidak lebih tinggi.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {choices.map((choice) => {
                            const key = `${t.code}:${choice.target}`;
                            const armed = pending === key;
                            return (
                              <Button
                                key={choice.target}
                                type="button"
                                variant={armed ? "default" : "outline"}
                                size="sm"
                                disabled={upgrading !== null}
                                onClick={() => void onUpgrade(t, choice.target)}
                              >
                                {upgrading === key
                                  ? "Meng-upgrade…"
                                  : armed
                                    ? `Yakin? Bayar ${formatRupiah(choice.selisih)}`
                                    : `Upgrade ke ${TICKET_LABEL[choice.target]} · ${formatRupiah(choice.selisih)}`}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                      {record.liveStage ? (
                        <p className="mt-2 text-[11px] text-subtle">
                          Bayar = harga jenis baru pada {record.liveStage.label} dikurangi harga awal. Harga tiket menjadi
                          harga tahap itu. Kode diganti.
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-subtle">
              VVIP {record.qtyVvip} · VIP {record.qtyVip} · Festival {record.qtyFestival} · Community {record.qtyCommunity}
            </p>
          </div>

          {record.takenAt ? (
            <div className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm">
              <p>
                Tiket sudah diambil pada:{" "}
                <span className="font-medium text-gold">{formatTakeoutStamp(record.takenAt)}</span>
              </p>
              <p className="mt-1">
                Petugas take out = <span className="font-medium text-gold">{record.takenBy}</span>
              </p>
            </div>
          ) : null}

          <div className="no-print flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" />
              Cetak
            </Button>
            {!record.takenAt ? (
              <Button type="button" onClick={() => void onTakeout()} disabled={taking}>
                {taking ? "Menyimpan…" : "Takeout"}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function upgradeChoices(record: TicketboxRecord, ticket: TicketCode) {
  const stage = record.liveStage;
  const awal = ticket.unitPrice ?? record.ticketPrice[ticket.type];
  if (!stage || awal == null || awal < 1) return [];
  return TICKET_TYPE_IDS.flatMap((target) => {
    if (target === ticket.type) return [];
    const toPrice = stage.price[target];
    if (toPrice < 1) return [];
    const selisih = toPrice - awal;
    if (selisih < 1) return [];
    return [{ target, selisih, hargaBaru: awal + selisih }];
  });
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-subtle">{label}</dt>
      <dd className="mt-0.5 text-fg">{value}</dd>
    </div>
  );
}
