import type { TicketTypeId } from "@/lib/event";
import { MAX_PER_TYPE } from "@/lib/event";

export const TICKET_STAGES = [
  { id: "early_bird", label: "Early Bird", allowed: ["vip", "festival"] as const },
  { id: "presale_1", label: "Presale 1", allowed: ["vip", "festival"] as const },
  { id: "presale_2", label: "Presale 2", allowed: ["vvip", "vip", "festival"] as const },
  { id: "ots", label: "OTS", allowed: ["vvip", "vip", "festival"] as const },
] as const;

export type StageId = (typeof TICKET_STAGES)[number]["id"];
export type StageStatus = "off" | "scheduled" | "live" | "ended";

export type StageQuota = Record<TicketTypeId, number>;

export type TicketStage = {
  id: StageId;
  label: string;
  sortOrder: number;
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  quota: StageQuota;
  sold: StageQuota;
  price: StageQuota;
  allowed: TicketTypeId[];
  live: boolean;
  status: StageStatus;
};

export type SaleOffer = {
  open: boolean;
  message: string;
  stage: { id: StageId; label: string; startsAt: string | null; endsAt: string | null } | null;
  remaining: StageQuota;
  price: StageQuota;
  allowed: TicketTypeId[];
  maxPerType: number;
};

export function maxPerTypeForStage(id: string | null | undefined): number {
  return id === "early_bird" ? 1 : MAX_PER_TYPE;
}

export function isSingleTicketStage(id: string | null | undefined): boolean {
  return id === "early_bird";
}

export function stageDef(id: string) {
  return TICKET_STAGES.find((s) => s.id === id);
}

export function stageStatus(input: {
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  now?: Date;
}): StageStatus {
  if (!input.enabled) return "off";
  const now = input.now ?? new Date();
  if (input.startsAt && now < new Date(input.startsAt)) return "scheduled";
  if (input.endsAt && now > new Date(input.endsAt)) return "ended";
  return "live";
}

export function remainingOf(quota: number, sold: number): number {
  const q = Math.max(0, Number(quota) || 0);
  const s = Math.max(0, Number(sold) || 0);
  if (q <= 0) return 1_000_000;
  return Math.max(0, q - s);
}
