import { createServerFn } from "@tanstack/react-start";

export const fetchConfirmedExport = createServerFn({ method: "POST" })
  .validator((input: { from?: string; to?: string } | undefined) => ({
    from: input?.from?.trim() || "",
    to: input?.to?.trim() || "",
  }))
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { listConfirmedExport } = await import("@/lib/orders.server");
    await requirePanel("dashboard");
    return listConfirmedExport({ from: data.from || null, to: data.to || null });
  });

export const fetchDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePanel } = await import("@/lib/staff.server");
  const { getDashboard } = await import("@/lib/orders.server");
  await requirePanel("dashboard");
  return getDashboard();
});

export const fetchConfirmations = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePanel } = await import("@/lib/staff.server");
  const { listAdminOrders, confirmationMessage } = await import("@/lib/orders.server");
  await requirePanel("konfirmasi");
  const orders = await listAdminOrders();
  return orders.map((order) => ({
    ...order,
    waText: order.status === "confirmed" ? confirmationMessage(order) : "",
  }));
});

export const fetchOrderProof = createServerFn({ method: "POST" })
  .validator((orderId: number) => orderId)
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { getOrderProof } = await import("@/lib/orders.server");
    await requirePanel("konfirmasi");
    return getOrderProof(data);
  });

export const fetchStudentCard = createServerFn({ method: "POST" })
  .validator((orderId: number) => orderId)
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { getStudentCard } = await import("@/lib/orders.server");
    await requirePanel("konfirmasi");
    return getStudentCard(data);
  });

export const placeFastTrack = createServerFn({ method: "POST" })
  .validator((data: {
    email: string;
    fullName: string;
    address: string;
    whatsapp: string;
    referralCode?: string;
    qtyVvip: number;
    qtyVip: number;
    qtyFestival: number;
    qtyCommunity?: number;
  }) => data)
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { createOrder } = await import("@/lib/orders.server");
    await requirePanel("fast-track");
    return createOrder({ ...data, fastTrack: true });
  });

export const fetchOnsiteContext = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePanel } = await import("@/lib/staff.server");
  const { getLiveStage } = await import("@/lib/stages.server");
  await requirePanel("ots");
  const stage = await getLiveStage();
  if (!stage) return null;
  return {
    id: stage.id,
    label: stage.label,
    allowed: stage.allowed,
    price: stage.price,
    remaining: {
      vvip: Math.max(0, stage.quota.vvip > 0 ? stage.quota.vvip - stage.sold.vvip : 999999),
      vip: Math.max(0, stage.quota.vip > 0 ? stage.quota.vip - stage.sold.vip : 999999),
      festival: Math.max(0, stage.quota.festival > 0 ? stage.quota.festival - stage.sold.festival : 999999),
      community: Math.max(0, stage.quota.community > 0 ? stage.quota.community - stage.sold.community : 999999),
    },
  };
});

export const placeOnsiteOrder = createServerFn({ method: "POST" })
  .validator((data: {
    fullName: string;
    whatsapp: string;
    qtyVvip: number;
    qtyVip: number;
    qtyFestival: number;
    qtyCommunity?: number;
    paymentMethod: "qris" | "cash";
  }) => data)
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { createOnsiteOrder } = await import("@/lib/orders.server");
    const staff = await requirePanel("ots");
    return createOnsiteOrder({ ...data, staffId: staff.id });
  });

export const confirmPayment = createServerFn({ method: "POST" })
  .validator((orderId: number) => orderId)
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { confirmOrder, confirmationMessage } = await import("@/lib/orders.server");
    const staff = await requirePanel("konfirmasi");
    const order = await confirmOrder(data, staff.id);
    return { ...order, waText: confirmationMessage(order) };
  });

export const cancelPayment = createServerFn({ method: "POST" })
  .validator((input: { orderId: number }) => ({ orderId: Number(input?.orderId) }))
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { cancelOrder } = await import("@/lib/orders.server");
    const staff = await requirePanel("konfirmasi");
    return cancelOrder(data.orderId, staff.id);
  });

export const fetchAgentSales = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePanel } = await import("@/lib/staff.server");
  const { listAgentOrders } = await import("@/lib/orders.server");
  const staff = await requirePanel("agen");
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
