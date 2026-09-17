import { randomBytes } from "node:crypto";
import { getSql } from "@/lib/db";
import {
  EVENT,
  MAX_PER_TYPE,
  MAX_PROOF_BYTES,
  TICKET_LABEL,
  type OrderStatus,
  type TicketTypeId,
} from "@/lib/event";
import { uniqueCodeFromWhatsapp } from "@/lib/format";
import { remainingOf } from "@/lib/stages";
import { getLiveStage } from "@/lib/stages.server";
import { ensureAdminSeeded, findAgentByCode } from "@/lib/staff.server";
import type { AdminOrder, DashboardData, PublicOrder } from "@/lib/types";

export type { AdminOrder, PublicOrder };

type OrderRow = {
  id: number;
  public_id: string;
  email: string;
  full_name: string;
  address: string;
  whatsapp: string;
  referral_code: string | null;
  qty_vvip: number;
  qty_vip: number;
  qty_festival: number;
  base_amount: number;
  unique_code: number;
  total_amount: number;
  status: OrderStatus;
  proof_data: string | null;
  proof_mime: string | null;
  proof_name: string | null;
  confirmed_at: string | null;
  created_at: string;
  stage_id: string | null;
};

function qtyOf(row: Pick<OrderRow, "qty_vvip" | "qty_vip" | "qty_festival">, type: TicketTypeId) {
  if (type === "vvip") return Number(row.qty_vvip);
  if (type === "vip") return Number(row.qty_vip);
  return Number(row.qty_festival);
}

async function toPublic(
  row: OrderRow,
  includeTickets: boolean,
  includeQr = true,
): Promise<PublicOrder> {
  const tickets: PublicOrder["tickets"] = [];
  if (includeTickets && row.status === "confirmed") {
    const sql = await getSql();
    const rows = await sql<{ ticket_type: TicketTypeId; code: string }>`
      select ticket_type, code from tickets where order_id = ${row.id} order by id
    `;
    for (const t of rows) tickets.push({ type: t.ticket_type, code: t.code });
  }
  return {
    publicId: row.public_id,
    email: row.email,
    fullName: row.full_name,
    address: row.address,
    whatsapp: row.whatsapp,
    referralCode: row.referral_code,
    qtyVvip: Number(row.qty_vvip),
    qtyVip: Number(row.qty_vip),
    qtyFestival: Number(row.qty_festival),
    baseAmount: Number(row.base_amount),
    uniqueCode: Number(row.unique_code),
    totalAmount: Number(row.total_amount),
    status: row.status,
    hasProof: Boolean(row.proof_data),
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at,
    tickets,
    qrDataUrl: includeQr ? EVENT.qris : "",
  };
}

function toAdmin(pub: PublicOrder, row: OrderRow): AdminOrder {
  return {
    ...pub,
    id: row.id,
    proofData: row.proof_data,
    proofMime: row.proof_mime,
    proofName: row.proof_name,
  };
}

async function ownedCount(email: string, type: TicketTypeId): Promise<number> {
  const sql = await getSql();
  const col = type === "vvip" ? "qty_vvip" : type === "vip" ? "qty_vip" : "qty_festival";
  const rows = await sql.query<{ total: number }>(
    `select coalesce(sum(${col}), 0)::int as total from orders where lower(email) = lower($1)`,
    [email],
  );
  return Number(rows[0]?.total ?? 0);
}

export async function createOrder(input: {
  email: string;
  fullName: string;
  address: string;
  whatsapp: string;
  referralCode?: string;
  qtyVvip: number;
  qtyVip: number;
  qtyFestival: number;
}): Promise<PublicOrder> {
  await ensureAdminSeeded();
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const address = input.address.trim();
  const whatsapp = input.whatsapp.trim();
  const qty = {
    vvip: Math.max(0, Math.floor(input.qtyVvip)),
    vip: Math.max(0, Math.floor(input.qtyVip)),
    festival: Math.max(0, Math.floor(input.qtyFestival)),
  };
  if (!email.includes("@")) throw new Error("Email tidak valid");
  if (fullName.length < 3) throw new Error("Nama sesuai KTP wajib diisi");
  if (address.length < 8) throw new Error("Alamat sesuai KTP wajib diisi");
  const waDigits = whatsapp.replace(/\D/g, "");
  if (waDigits.length < 10 || waDigits.length > 15) {
    throw new Error("Nomor WhatsApp tidak valid");
  }
  const totalQty = qty.vvip + qty.vip + qty.festival;
  if (totalQty < 1) throw new Error("Pilih minimal satu tiket");

  const stage = await getLiveStage();
  if (!stage) throw new Error("Penjualan tiket sedang ditutup");

  for (const type of ["vvip", "vip", "festival"] as const) {
    if (qty[type] < 1) continue;
    if (!stage.allowed.includes(type)) {
      throw new Error(`${TICKET_LABEL[type]} tidak dijual pada tahap ${stage.label}`);
    }
    const sisa = remainingOf(stage.quota[type], stage.sold[type]);
    if (qty[type] > sisa) {
      throw new Error(
        sisa < 1
          ? `Kuota ${TICKET_LABEL[type]} ${stage.label} habis`
          : `Sisa kuota ${TICKET_LABEL[type]} tahap ${stage.label}: ${sisa}`,
      );
    }
  }

  for (const type of ["vvip", "vip", "festival"] as const) {
    if (qty[type] > MAX_PER_TYPE) {
      throw new Error(`Maksimal ${MAX_PER_TYPE} tiket ${TICKET_LABEL[type]} per akun`);
    }
    const already = await ownedCount(email, type);
    if (already + qty[type] > MAX_PER_TYPE) {
      const sisa = Math.max(0, MAX_PER_TYPE - already);
      throw new Error(
        `Akun ini sudah memiliki ${already} tiket ${TICKET_LABEL[type]}. Sisa kuota: ${sisa}.`,
      );
    }
  }

  let referral: string | null = null;
  const rawRef = input.referralCode?.trim();
  if (rawRef) {
    const agent = await findAgentByCode(rawRef);
    if (!agent) throw new Error("Kode referal tidak ditemukan");
    referral = agent.referralCode;
  }

  const baseAmount =
    qty.vvip * stage.price.vvip +
    qty.vip * stage.price.vip +
    qty.festival * stage.price.festival;
  const uniqueCode = uniqueCodeFromWhatsapp(whatsapp);
  const totalAmount = baseAmount + uniqueCode;
  const publicId = randomBytes(9).toString("base64url");

  const sql = await getSql();
  const inserted = await sql<OrderRow>`
    insert into orders (
      public_id, email, full_name, address, whatsapp, referral_code,
      qty_vvip, qty_vip, qty_festival, base_amount, unique_code, total_amount, status, stage_id
    ) values (
      ${publicId}, ${email}, ${fullName}, ${address}, ${whatsapp}, ${referral},
      ${qty.vvip}, ${qty.vip}, ${qty.festival}, ${baseAmount}, ${uniqueCode}, ${totalAmount},
      ${"awaiting_payment"}, ${stage.id}
    )
    returning *
  `;
  const row = inserted[0];
  if (!row) throw new Error("Gagal membuat pesanan");
  return toPublic(row, false);
}

export async function getPublicOrder(publicId: string): Promise<PublicOrder> {
  const sql = await getSql();
  const rows = await sql<OrderRow>`select * from orders where public_id = ${publicId} limit 1`;
  const row = rows[0];
  if (!row) throw new Error("Pesanan tidak ditemukan");
  return toPublic(row, true);
}

export async function saveProof(input: {
  publicId: string;
  dataUrl: string;
  mime: string;
  name: string;
}): Promise<PublicOrder> {
  if (!input.dataUrl.startsWith("data:image/")) {
    throw new Error("File harus berupa gambar");
  }
  const comma = input.dataUrl.indexOf(",");
  const b64 = comma >= 0 ? input.dataUrl.slice(comma + 1) : "";
  const bytes = Math.floor((b64.length * 3) / 4);
  if (bytes > MAX_PROOF_BYTES) throw new Error("Ukuran gambar maksimal 1 MB");
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowed.includes(input.mime)) throw new Error("Format gambar: JPG, PNG, atau WEBP");

  const sql = await getSql();
  const rows = await sql<OrderRow>`select * from orders where public_id = ${input.publicId} limit 1`;
  const row = rows[0];
  if (!row) throw new Error("Pesanan tidak ditemukan");
  if (row.status === "confirmed") throw new Error("Pesanan sudah dikonfirmasi");

  const updated = await sql<OrderRow>`
    update orders
    set proof_data = ${input.dataUrl},
        proof_mime = ${input.mime},
        proof_name = ${input.name},
        status = ${"awaiting_confirm"}
    where public_id = ${input.publicId}
    returning *
  `;
  return toPublic(updated[0]!, false);
}

function makeTicketCode(type: TicketTypeId): string {
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `GSF-${TICKET_LABEL[type]}-${rand}`;
}

export async function confirmOrder(orderId: number, staffId: string): Promise<AdminOrder> {
  const sql = await getSql();
  const rows = await sql<OrderRow>`select * from orders where id = ${orderId} limit 1`;
  const row = rows[0];
  if (!row) throw new Error("Pesanan tidak ditemukan");
  if (!row.proof_data) throw new Error("Belum ada bukti transfer");
  if (row.status === "confirmed") {
    const pub = await toPublic(row, true);
    return toAdmin(pub, row);
  }

  const types: TicketTypeId[] = [];
  for (const t of ["vvip", "vip", "festival"] as const) {
    for (let i = 0; i < qtyOf(row, t); i += 1) types.push(t);
  }

  for (const type of types) {
    let code = makeTicketCode(type);
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const clash = await sql<{ id: number }>`select id from tickets where code = ${code} limit 1`;
      if (clash.length === 0) break;
      code = makeTicketCode(type);
    }
    await sql`
      insert into tickets (order_id, ticket_type, code)
      values (${row.id}, ${type}, ${code})
    `;
  }

  const updated = await sql<OrderRow>`
    update orders
    set status = ${"confirmed"},
        confirmed_at = now(),
        confirmed_by = ${staffId}
    where id = ${row.id}
    returning *
  `;
  const next = updated[0]!;
  const pub = await toPublic(next, true);
  return toAdmin(pub, next);
}

export async function listAdminOrders(): Promise<AdminOrder[]> {
  const sql = await getSql();
  const rows = await sql<OrderRow>`
    select * from orders
    order by
      case status
        when 'awaiting_confirm' then 0
        when 'awaiting_payment' then 1
        else 2
      end,
      created_at desc
  `;
  const out: AdminOrder[] = [];
  for (const row of rows) {
    const pub = await toPublic(row, true, false);
    out.push(toAdmin(pub, row));
  }
  return out;
}

export async function listAgentOrders(referralCode: string): Promise<PublicOrder[]> {
  const sql = await getSql();
  const rows = await sql<OrderRow>`
    select * from orders
    where referral_code = ${referralCode} and status = 'confirmed'
    order by confirmed_at desc
  `;
  const out: PublicOrder[] = [];
  for (const row of rows) out.push(await toPublic(row, true, false));
  return out;
}

export async function getDashboard(): Promise<DashboardData> {
  const sql = await getSql();
  const sold = await sql<{
    vvip: number;
    vip: number;
    festival: number;
    revenue: number;
    confirmed_orders: number;
  }>`
    select
      coalesce(sum(qty_vvip), 0)::int as vvip,
      coalesce(sum(qty_vip), 0)::int as vip,
      coalesce(sum(qty_festival), 0)::int as festival,
      coalesce(sum(total_amount), 0)::int as revenue,
      coalesce(count(*), 0)::int as confirmed_orders
    from orders
    where status = 'confirmed'
  `;
  const pendingConfirm = await sql<{ n: number }>`
    select coalesce(count(*), 0)::int as n from orders where status = 'awaiting_confirm'
  `;
  const pendingPay = await sql<{ n: number }>`
    select coalesce(count(*), 0)::int as n from orders where status = 'awaiting_payment'
  `;
  const row = sold[0]!;
  return {
    tickets: {
      vvip: Number(row.vvip),
      vip: Number(row.vip),
      festival: Number(row.festival),
    },
    revenue: Number(row.revenue),
    confirmedOrders: Number(row.confirmed_orders),
    awaitingConfirm: Number(pendingConfirm[0]?.n ?? 0),
    awaitingPayment: Number(pendingPay[0]?.n ?? 0),
  };
}

export function confirmationMessage(order: PublicOrder): string {
  const lines = order.tickets.map((t, i) => `${i + 1}. ${t.code} (${TICKET_LABEL[t.type]})`);
  return [
    `Halo ${order.fullName},`,
    "",
    "Pembayaran tiket Golden Satya Fair Anda telah dikonfirmasi.",
    "",
    "Kode tiket:",
    ...lines,
    "",
    "Satu kode berlaku untuk satu orang. Tunjukkan kode ini saat masuk.",
    "Sampai jumpa di panggung emas.",
  ].join("\n");
}
