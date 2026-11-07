import { createServerFn } from "@tanstack/react-start";
import type { TicketTypeId } from "@/lib/event";

export const lookupTicket = createServerFn({ method: "POST" })
  .validator((input: { code: string }) => ({ code: String(input?.code ?? "") }))
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { lookupByTicketCode } = await import("@/lib/orders.server");
    await requirePanel("tiketbox");
    return lookupByTicketCode(data.code);
  });

export const upgradeTicketCode = createServerFn({ method: "POST" })
  .validator((input: { code: string; toType: TicketTypeId }) => ({
    code: String(input?.code ?? ""),
    toType: input.toType,
  }))
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { upgradeTicket } = await import("@/lib/orders.server");
    await requirePanel("tiketbox");
    return upgradeTicket(data.code, data.toType);
  });

export const takeoutTicket = createServerFn({ method: "POST" })
  .validator((input: { orderId: number }) => ({ orderId: Number(input?.orderId) }))
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { takeoutOrder } = await import("@/lib/orders.server");
    const staff = await requirePanel("tiketbox");
    return takeoutOrder(data.orderId, staff.username);
  });
