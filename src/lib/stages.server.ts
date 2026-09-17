import { getSql } from "@/lib/db";
import { TICKET_LABEL, TICKET_PRICE, type TicketTypeId } from "@/lib/event";
import {
  remainingOf,
  stageDef,
  stageStatus,
  maxPerTypeForStage,
  type SaleOffer,
  type StageId,
  type StageQuota,
  type TicketStage,
} from "@/lib/stages";

type StageRow = {
  id: StageId;
  label: string;
  sort_order: number;
  enabled: boolean;
  starts_at: string | null;
  ends_at: string | null;
  quota_vvip: number;
  quota_vip: number;
  quota_festival: number;
  price_vvip: number;
  price_vip: number;
  price_festival: number;
};

function emptyQuota(): StageQuota {
  return { vvip: 0, vip: 0, festival: 0 };
}

function quotaFrom(row: StageRow): StageQuota {
  return {
    vvip: Number(row.quota_vvip),
    vip: Number(row.quota_vip),
    festival: Number(row.quota_festival),
  };
}

function priceFrom(row: StageRow): StageQuota {
  return {
    vvip: Number(row.price_vvip ?? TICKET_PRICE.vvip),
    vip: Number(row.price_vip ?? TICKET_PRICE.vip),
    festival: Number(row.price_festival ?? TICKET_PRICE.festival),
  };
}

let schemaReady = false;
async function ensureStagePrices(): Promise<void> {
  if (schemaReady) return;
  const sql = await getSql();
  await sql.query(
    "alter table ticket_stages add column if not exists price_vvip int not null default 1500000",
  );
  await sql.query(
    "alter table ticket_stages add column if not exists price_vip int not null default 750000",
  );
  await sql.query(
    "alter table ticket_stages add column if not exists price_festival int not null default 350000",
  );
  schemaReady = true;
}

async function soldByStage(stageId: StageId): Promise<StageQuota> {
  const sql = await getSql();
  const rows = await sql<{ vvip: number; vip: number; festival: number }>`
    select
      coalesce(sum(qty_vvip), 0)::int as vvip,
      coalesce(sum(qty_vip), 0)::int as vip,
      coalesce(sum(qty_festival), 0)::int as festival
    from orders
    where stage_id = ${stageId}
  `;
  const row = rows[0];
  return {
    vvip: Number(row?.vvip ?? 0),
    vip: Number(row?.vip ?? 0),
    festival: Number(row?.festival ?? 0),
  };
}

function toStage(row: StageRow, sold: StageQuota): TicketStage {
  const def = stageDef(row.id);
  const allowed = [...(def?.allowed ?? ["vvip", "vip", "festival"])] as TicketTypeId[];
  const enabled = Boolean(row.enabled);
  const startsAt = row.starts_at;
  const endsAt = row.ends_at;
  const status = stageStatus({ enabled, startsAt, endsAt });
  return {
    id: row.id,
    label: def?.label ?? row.label,
    sortOrder: Number(row.sort_order),
    enabled,
    startsAt,
    endsAt,
    quota: quotaFrom(row),
    sold,
    price: priceFrom(row),
    allowed,
    live: status === "live",
    status,
  };
}

export async function listStages(): Promise<TicketStage[]> {
  await ensureStagePrices();
  const sql = await getSql();
  const rows = await sql<StageRow>`select * from ticket_stages order by sort_order`;
  const out: TicketStage[] = [];
  for (const row of rows) {
    out.push(toStage(row, await soldByStage(row.id)));
  }
  return out;
}

export async function getLiveStage(): Promise<TicketStage | null> {
  const stages = await listStages();
  return stages.find((s) => s.live) ?? null;
}

export async function getSaleOffer(): Promise<SaleOffer> {
  const stage = await getLiveStage();
  if (!stage) {
    const stages = await listStages();
    const next = stages.find((s) => s.status === "scheduled");
    return {
      open: false,
      message: next
        ? `Penjualan ${next.label} belum dibuka.`
        : "Penjualan tiket sedang ditutup.",
      stage: next
        ? { id: next.id, label: next.label, startsAt: next.startsAt, endsAt: next.endsAt }
        : null,
      remaining: emptyQuota(),
      price: emptyQuota(),
      allowed: [],
      maxPerType: maxPerTypeForStage(next?.id),
    };
  }
  const remaining = emptyQuota();
  for (const type of stage.allowed) {
    remaining[type] = remainingOf(stage.quota[type], stage.sold[type]);
  }
  return {
    open: true,
    message: `Tahap ${stage.label}`,
    stage: { id: stage.id, label: stage.label, startsAt: stage.startsAt, endsAt: stage.endsAt },
    remaining,
    price: stage.price,
    allowed: stage.allowed,
    maxPerType: maxPerTypeForStage(stage.id),
  };
}

export async function updateStage(input: {
  id: StageId;
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  quota: StageQuota;
  price: StageQuota;
}): Promise<TicketStage> {
  await ensureStagePrices();
  const def = stageDef(input.id);
  if (!def) throw new Error("Tahap tidak ditemukan");
  if (input.startsAt && input.endsAt && new Date(input.startsAt) >= new Date(input.endsAt)) {
    throw new Error("Waktu mulai harus sebelum waktu selesai");
  }
  const allowed = def.allowed as readonly TicketTypeId[];
  const quota = { ...input.quota };
  const price = { ...input.price };
  for (const type of ["vvip", "vip", "festival"] as const) {
    quota[type] = Math.max(0, Math.floor(Number(quota[type]) || 0));
    price[type] = Math.max(0, Math.floor(Number(price[type]) || 0));
    if (!allowed.includes(type)) {
      quota[type] = 0;
      price[type] = 0;
    } else if (price[type] < 1) {
      throw new Error(`Harga ${TICKET_LABEL[type]} wajib diisi`);
    }
  }
  const sql = await getSql();
  const updated = await sql<StageRow>`
    update ticket_stages
    set enabled = ${input.enabled},
        starts_at = ${input.startsAt},
        ends_at = ${input.endsAt},
        quota_vvip = ${quota.vvip},
        quota_vip = ${quota.vip},
        quota_festival = ${quota.festival},
        price_vvip = ${price.vvip},
        price_vip = ${price.vip},
        price_festival = ${price.festival}
    where id = ${input.id}
    returning *
  `;
  const row = updated[0];
  if (!row) throw new Error("Tahap tidak ditemukan");
  return toStage(row, await soldByStage(row.id));
}
