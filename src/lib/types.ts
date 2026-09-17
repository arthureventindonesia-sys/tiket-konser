import type { OrderStatus, TicketTypeId } from "@/lib/event";

export type TicketCode = { type: TicketTypeId; code: string };

export type PublicOrder = {
  publicId: string;
  email: string;
  fullName: string;
  address: string;
  whatsapp: string;
  referralCode: string | null;
  qtyVvip: number;
  qtyVip: number;
  qtyFestival: number;
  baseAmount: number;
  uniqueCode: number;
  totalAmount: number;
  status: OrderStatus;
  hasProof: boolean;
  createdAt: string;
  confirmedAt: string | null;
  tickets: TicketCode[];
  qrDataUrl: string;
};

export type AdminOrder = PublicOrder & {
  id: number;
  proofData: string | null;
  proofMime: string | null;
  proofName: string | null;
  waText?: string;
};

export type DashboardData = {
  tickets: { vvip: number; vip: number; festival: number };
  revenue: number;
  confirmedOrders: number;
  awaitingConfirm: number;
  awaitingPayment: number;
};
