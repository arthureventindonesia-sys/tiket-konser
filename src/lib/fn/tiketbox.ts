import { createServerFn } from "@tanstack/react-start";

export const lookupTicket = createServerFn({ method: "POST" })
  .validator((input: { code: string }) => ({ code: String(input?.code ?? "") }))
  .handler(async ({ data }) => {
    const { requireStaff } = await import("@/lib/staff.server");
    const { lookupByTicketCode } = await import("@/lib/orders.server");
    await requireStaff(["admin", "tiketbox"]);
    return lookupByTicketCode(data.code);
  });

export const takeoutTicket = createServerFn({ method: "POST" })
  .validator((input: { orderId: number }) => ({ orderId: Number(input?.orderId) }))
  .handler(async ({ data }) => {
    const { requireStaff } = await import("@/lib/staff.server");
    const { takeoutOrder } = await import("@/lib/orders.server");
    const staff = await requireStaff(["admin", "tiketbox"]);
    return takeoutOrder(data.orderId, staff.username);
  });
