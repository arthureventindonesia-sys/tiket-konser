import { getSql } from "@/lib/db";
import { TICKET_LABEL, TICKET_PRICE, TICKET_TYPE_IDS, STUDENT_TICKET_IDS, MAX_TOTAL_TICKETS, type TicketTypeId } from "@/lib/event";
import {
  remainingOf,
  stageDef,
  stageStatus,
  maxPerTypeForStage,
  defaultPurchaseLimit,
  type SaleOffer,
  type StageId,
  type StageQuota,
  type StageSales,
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
  ft_price_vvip?: number | null;
  ft_price_vip?: number | null;
  ft_price_festival?: number | null;
  ft_price_community?: number | null;
  st_price_vvip?: number | null;
  st_price_vip?: number | null;
  st_price_festival?: number | null;
  sell_vvip?: boolean | null;
  sell_vip?: boolean | null;
  sell_festival?: boolean | null;
  sell_community?: boolean | null;
  quota_community?: number | null;
  price_community?: number | null;
  purchase_limit?: number | null;
};

function emptyQuota(): StageQuota {
  return { vvip: 0, vip: 0, festival: 0, community: 0 };
}

function quotaFrom(row: StageRow): StageQuota {
  return {
    vvip: Number(row.quota_vvip),
    vip: Number(row.quota_vip),
    festival: Number(row.quota_festival),
    community: Number(row.quota_community ?? 0),
  };
}

function priceFrom(row: StageRow): StageQuota {
  return {
    vvip: Number(row.price_vvip ?? TICKET_PRICE.vvip),
    vip: Number(row.price_vip ?? TICKET_PRICE.vip),
    festival: Number(row.price_festival ?? TICKET_PRICE.festival),
    community: Number(row.price_community ?? 0),
  };
}

function studentPriceFrom(row: StageRow): StageQuota {
  const price = priceFrom(row);
  return {
    vvip: Number(row.st_price_vvip ?? price.vvip),
    vip: Number(row.st_price_vip ?? price.vip),
    festival: Number(row.st_price_festival ?? price.festival),
    community: 0,
  };
}

function fastTrackPriceFrom(row: StageRow): StageQuota {
  const price = priceFrom(row);
  return {
    vvip: Number(row.ft_price_vvip ?? price.vvip),
    vip: Number(row.ft_price_vip ?? price.vip),
    festival: Number(row.ft_price_festival ?? price.festival),
    community: Number(row.ft_price_community ?? price.community),
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
  await sql.query("alter table ticket_stages add column if not exists sell_vvip boolean");
  await sql.query("alter table ticket_stages add column if not exists sell_vip boolean");
  await sql.query("alter table ticket_stages add column if not exists sell_festival boolean");
  await sql.query(`
    update ticket_stages
    set sell_vvip = case when id in ('early_bird', 'presale_1') then false else true end
    where sell_vvip is null
  `);
  await sql.query("update ticket_stages set sell_vip = true where sell_vip is null");
  await sql.query("update ticket_stages set sell_festival = true where sell_festival is null");
  for (const col of ["sell_vvip", "sell_vip", "sell_festival"]) {
    await sql.query(`alter table ticket_stages alter column ${col} set default true`);
    await sql.query(`alter table ticket_stages alter column ${col} set not null`);
  }
  await sql.query("alter table orders add column if not exists fast_track boolean not null default false");
  await sql.query("alter table ticket_stages add column if not exists ft_price_vvip int");
  await sql.query("alter table ticket_stages add column if not exists ft_price_vip int");
  await sql.query("alter table ticket_stages add column if not exists ft_price_festival int");
  await sql.query("update ticket_stages set ft_price_vvip = price_vvip where ft_price_vvip is null");
  await sql.query("update ticket_stages set ft_price_vip = price_vip where ft_price_vip is null");
  await sql.query("update ticket_stages set ft_price_festival = price_festival where ft_price_festival is null");
  for (const col of ["ft_price_vvip", "ft_price_vip", "ft_price_festival"]) {
    await sql.query(`alter table ticket_stages alter column ${col} set default 0`);
    await sql.query(`alter table ticket_stages alter column ${col} set not null`);
  }
  await sql.query("alter table ticket_stages add column if not exists st_price_vvip int");
  await sql.query("alter table ticket_stages add column if not exists st_price_vip int");
  await sql.query("alter table ticket_stages add column if not exists st_price_festival int");
  await sql.query("update ticket_stages set st_price_vvip = price_vvip where st_price_vvip is null");
  await sql.query("update ticket_stages set st_price_vip = price_vip where st_price_vip is null");
  await sql.query("update ticket_stages set st_price_festival = price_festival where st_price_festival is null");
  for (const col of ["st_price_vvip", "st_price_vip", "st_price_festival"]) {
    await sql.query(`alter table ticket_stages alter column ${col} set default 0`);
    await sql.query(`alter table ticket_stages alter column ${col} set not null`);
  }
  await sql.query("alter table orders add column if not exists student boolean not null default false");
  await sql.query("alter table orders add column if not exists student_card text");
  await sql.query("alter table orders add column if not exists student_card_mime text");
  await sql.query("alter table ticket_stages add column if not exists purchase_limit int");
  await sql.query(`
    update ticket_stages
    set purchase_limit = case when id = 'early_bird' then 1 else 4 end
    where purchase_limit is null
  `);
  await sql.query("alter table ticket_stages alter column purchase_limit set default 4");
  await sql.query("alter table ticket_stages alter column purchase_limit set not null");
  await sql.query("alter table orders add column if not exists qty_community int not null default 0");
  await sql.query("alter table ticket_stages add column if not exists quota_community int not null default 0");
  await sql.query("alter table ticket_stages add column if not exists price_community int not null default 0");
  await sql.query("alter table ticket_stages add column if not exists ft_price_community int not null default 0");
  await sql.query("alter table ticket_stages add column if not exists sell_community boolean not null default false");
  await sql.query("alter table tickets drop constraint if exists tickets_ticket_type_check");
  await sql.query(
    "alter table tickets add constraint tickets_ticket_type_check check (ticket_type in ('vvip', 'vip', 'festival', 'community'))",
  );
  await sql.query(`
    create table if not exists fast_track_sales (
      id int primary key,
      sell_vvip boolean not null default true,
      sell_vip boolean not null default true,
      sell_festival boolean not null default true,
      sell_community boolean not null default false
    )
  `);
  await sql.query("insert into fast_track_sales (id) values (1) on conflict (id) do nothing");
  schemaReady = true;
}

async function soldByStage(stageId: StageId): Promise<StageQuota> {
  const sql = await getSql();
  const rows = await sql<{ vvip: number; vip: number; festival: number; community: number }>`
    select
      coalesce(sum(qty_vvip), 0)::int as vvip,
      coalesce(sum(qty_vip), 0)::int as vip,
      coalesce(sum(qty_festival), 0)::int as festival,
      coalesce(sum(qty_community), 0)::int as community
    from orders
    where stage_id = ${stageId} and status <> ${"cancelled"}
  `;
  const row = rows[0];
  return {
    vvip: Number(row?.vvip ?? 0),
    vip: Number(row?.vip ?? 0),
    festival: Number(row?.festival ?? 0),
    community: Number(row?.community ?? 0),
  };
}

function purchaseLimitFrom(row: StageRow): number {
  if (row.purchase_limit == null) return defaultPurchaseLimit(row.id);
  const n = Math.floor(Number(row.purchase_limit));
  if (!Number.isFinite(n) || n < 0) return defaultPurchaseLimit(row.id);
  return n;
}

function salesFrom(row: StageRow): StageSales {
  const def = stageDef(row.id);
  const fallback = new Set<TicketTypeId>(def?.allowed ?? ["vvip", "vip", "festival"]);
  return {
    vvip: row.sell_vvip == null ? fallback.has("vvip") : Boolean(row.sell_vvip),
    vip: row.sell_vip == null ? fallback.has("vip") : Boolean(row.sell_vip),
    festival: row.sell_festival == null ? fallback.has("festival") : Boolean(row.sell_festival),
    community: Boolean(row.sell_community),
  };
}

function toStage(row: StageRow, sold: StageQuota): TicketStage {
  const def = stageDef(row.id);
  const onSale = salesFrom(row);
  const allowed = TICKET_TYPE_IDS.filter((type) => onSale[type]);
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
    fastTrackPrice: fastTrackPriceFrom(row),
    studentPrice: studentPriceFrom(row),
    onSale,
    allowed,
    purchaseLimit: purchaseLimitFrom(row),
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

export async function getSaleOffer(kind: "public" | "student" = "public"): Promise<SaleOffer> {
  const { expireUnpaidOrders } = await import("@/lib/orders.server");
  await expireUnpaidOrders();
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
      maxPerType: kind === "student" ? MAX_TOTAL_TICKETS : (next?.purchaseLimit ?? maxPerTypeForStage(next?.id)),
    };
  }
  const allowed = kind === "student" ? stage.allowed.filter((type) => type !== "community") : stage.allowed;
  if (kind === "student" && allowed.length === 0) {
    return {
      open: false,
      message: "Tiket pelajar belum tersedia pada tahap ini.",
      stage: { id: stage.id, label: stage.label, startsAt: stage.startsAt, endsAt: stage.endsAt },
      remaining: emptyQuota(),
      price: stage.studentPrice,
      allowed: [],
      maxPerType: MAX_TOTAL_TICKETS,
    };
  }
  const remaining = emptyQuota();
  for (const type of allowed) {
    remaining[type] = remainingOf(stage.quota[type], stage.sold[type]);
  }
  return {
    open: true,
    message: `Tahap ${stage.label}`,
    stage: { id: stage.id, label: stage.label, startsAt: stage.startsAt, endsAt: stage.endsAt },
    remaining,
    price: kind === "student" ? stage.studentPrice : stage.price,
    allowed,
    maxPerType: kind === "student" ? MAX_TOTAL_TICKETS : stage.purchaseLimit,
  };
}

export async function updateStage(input: {
  id: StageId;
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  quota: StageQuota;
  price: StageQuota;
  onSale: StageSales;
  purchaseLimit: number;
}): Promise<TicketStage> {
  await ensureStagePrices();
  const def = stageDef(input.id);
  if (!def) throw new Error("Tahap tidak ditemukan");
  if (input.startsAt && input.endsAt && new Date(input.startsAt) >= new Date(input.endsAt)) {
    throw new Error("Waktu mulai harus sebelum waktu selesai");
  }
  const quota = { ...input.quota };
  const price = { ...input.price };
  for (const type of TICKET_TYPE_IDS) {
    quota[type] = Math.max(0, Math.floor(Number(quota[type]) || 0));
    price[type] = Math.max(0, Math.floor(Number(price[type]) || 0));
    if (input.onSale[type] && price[type] < 1) {
      throw new Error(`Harga ${TICKET_LABEL[type]} wajib diisi`);
    }
  }
  if (!Object.values(input.onSale).some(Boolean)) {
    throw new Error("Aktifkan minimal satu jenis tiket");
  }
  const purchaseLimit = Math.floor(Number(input.purchaseLimit));
  if (purchaseLimit !== 0 && (!Number.isFinite(purchaseLimit) || purchaseLimit < 1 || purchaseLimit > 20)) {
    throw new Error("Limit pembelian harus antara 1 dan 20, atau unlimited");
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
        quota_community = ${quota.community},
        price_vvip = ${price.vvip},
        price_vip = ${price.vip},
        price_festival = ${price.festival},
        price_community = ${price.community},
        sell_vvip = ${input.onSale.vvip},
        sell_vip = ${input.onSale.vip},
        sell_festival = ${input.onSale.festival},
        sell_community = ${input.onSale.community},
        purchase_limit = ${purchaseLimit}
    where id = ${input.id}
    returning *
  `;
  const row = updated[0];
  if (!row) throw new Error("Tahap tidak ditemukan");
  return toStage(row, await soldByStage(row.id));
}

export async function getFastTrackSales(): Promise<StageSales> {
  await ensureStagePrices();
  const sql = await getSql();
  const rows = await sql<{
    sell_vvip: boolean;
    sell_vip: boolean;
    sell_festival: boolean;
    sell_community: boolean;
  }>`select sell_vvip, sell_vip, sell_festival, sell_community from fast_track_sales where id = 1`;
  const row = rows[0];
  if (!row) return { vvip: true, vip: true, festival: true, community: false };
  return {
    vvip: Boolean(row.sell_vvip),
    vip: Boolean(row.sell_vip),
    festival: Boolean(row.sell_festival),
    community: Boolean(row.sell_community),
  };
}

export async function updateFastTrackSales(input: StageSales): Promise<StageSales> {
  await ensureStagePrices();
  const sales: StageSales = {
    vvip: Boolean(input.vvip),
    vip: Boolean(input.vip),
    festival: Boolean(input.festival),
    community: Boolean(input.community),
  };
  if (!Object.values(sales).some(Boolean)) {
    throw new Error("Aktifkan minimal satu jenis tiket Fast Track");
  }
  const sql = await getSql();
  await sql`
    update fast_track_sales
    set sell_vvip = ${sales.vvip},
        sell_vip = ${sales.vip},
        sell_festival = ${sales.festival},
        sell_community = ${sales.community}
    where id = 1
  `;
  return sales;
}

export async function updateFastTrackPrices(input: {
  id: StageId;
  fastTrackPrice: StageQuota;
}): Promise<TicketStage> {
  await ensureStagePrices();
  const def = stageDef(input.id);
  if (!def) throw new Error("Tahap tidak ditemukan");
  const price = { ...input.fastTrackPrice };
  for (const type of TICKET_TYPE_IDS) {
    price[type] = Math.max(0, Math.floor(Number(price[type]) || 0));
  }
  const sql = await getSql();
  const updated = await sql<StageRow>`
    update ticket_stages
    set ft_price_vvip = ${price.vvip},
        ft_price_vip = ${price.vip},
        ft_price_festival = ${price.festival},
        ft_price_community = ${price.community}
    where id = ${input.id}
    returning *
  `;
  const row = updated[0];
  if (!row) throw new Error("Tahap tidak ditemukan");
  return toStage(row, await soldByStage(row.id));
}

export async function updateStudentPrices(input: {
  id: StageId;
  studentPrice: StageQuota;
}): Promise<TicketStage> {
  await ensureStagePrices();
  const def = stageDef(input.id);
  if (!def) throw new Error("Tahap tidak ditemukan");
  const price = { ...input.studentPrice };
  const sql = await getSql();
  const current = await sql<StageRow>`select * from ticket_stages where id = ${input.id} limit 1`;
  const rowNow = current[0];
  if (!rowNow) throw new Error("Tahap tidak ditemukan");
  const onSale = salesFrom(rowNow);
  for (const type of STUDENT_TICKET_IDS) {
    price[type] = Math.max(0, Math.floor(Number(price[type]) || 0));
    if (onSale[type] && price[type] < 1) {
      throw new Error(`Harga pelajar ${TICKET_LABEL[type]} wajib diisi`);
    }
  }
  price.community = 0;
  const updated = await sql<StageRow>`
    update ticket_stages
    set st_price_vvip = ${price.vvip},
        st_price_vip = ${price.vip},
        st_price_festival = ${price.festival}
    where id = ${input.id}
    returning *
  `;
  const saved = updated[0];
  if (!saved) throw new Error("Tahap tidak ditemukan");
  return toStage(saved, await soldByStage(saved.id));
}
