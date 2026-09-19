import { createServerFn } from "@tanstack/react-start";

export const fetchConfirmedExport = createServerFn({ method: "GET" }).handler(async () => {
  const { requireStaff } = await import("@/lib/staff.server");
  const { listConfirmedExport } = await import("@/lib/orders.server");
  await requireStaff(["admin", "crew"]);
  return listConfirmedExport();
});

export const fetchDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const { requireStaff } = await import("@/lib/staff.server");
  const { getDashboard } = await import("@/lib/orders.server");
  await requireStaff(["admin", "crew"]);
  return getDashboard();
});

export const fetchConfirmations = createServerFn({ method: "GET" }).handler(async () => {
  const { requireStaff } = await import("@/lib/staff.server");
  const { listAdminOrders, confirmationMessage } = await import("@/lib/orders.server");
  await requireStaff(["admin", "crew"]);
  const orders = await listAdminOrders();
  return orders.map((order) => ({
    ...order,
    waText: order.status === "confirmed" ? confirmationMessage(order) : "",
  }));
});

export const confirmPayment = createServerFn({ method: "POST" })
  .validator((orderId: number) => orderId)
  .handler(async ({ data }) => {
    const { requireStaff } = await import("@/lib/staff.server");
    const { confirmOrder, confirmationMessage } = await import("@/lib/orders.server");
    const staff = await requireStaff(["admin", "crew"]);
    const order = await confirmOrder(data, staff.id);
    return { ...order, waText: confirmationMessage(order) };
  });

export const cancelPayment = createServerFn({ method: "POST" })
  .validator((input: { orderId: number }) => ({ orderId: Number(input?.orderId) }))
  .handler(async ({ data }) => {
    const { requireStaff } = await import("@/lib/staff.server");
    const { cancelOrder } = await import("@/lib/orders.server");
    const staff = await requireStaff(["admin", "crew"]);
    return cancelOrder(data.orderId, staff.id);
  });

export const fetchAgentSales = createServerFn({ method: "GET" }).handler(async () => {
  const { requireStaff } = await import("@/lib/staff.server");
  const { listAgentOrders } = await import("@/lib/orders.server");
  const staff = await requireStaff(["admin", "crew", "agent"]);
  if (staff.role === "agent") {
    if (!staff.referralCode) return [];
    return listAgentOrders(staff.referralCode);
  }
  const { listStaff } = await import("@/lib/staff.server");
  const agents = (await listStaff()).filter((s) => s.role === "agent" && s.referralCode);
  const all = [];
  for (const agent of agents) {
    const orders = await listAgentOrders(agent.referralCode!);
    all.push(...orders.map((o) => ({ ...o, agentName: agent.name, agentUsername: agent.username })));
  }
  return all;
});

export const resetSales = createServerFn({ method: "POST" })
  .validator((input: { password: string }) => ({ password: String(input?.password ?? "") }))
  .handler(async ({ data }) => {
    const { requireAdminPassword } = await import("@/lib/staff.server");
    const { resetAllSales } = await import("@/lib/orders.server");
    await requireAdminPassword(data.password);
    return resetAllSales();
  });
