import { createServerFn } from "@tanstack/react-start";
import type { StageId, StageQuota, StageSales } from "@/lib/stages";

export const fetchSaleOffer = createServerFn({ method: "GET" }).handler(async () => {
  const { getSaleOffer } = await import("@/lib/stages.server");
  return getSaleOffer();
});

export const fetchStudentOffer = createServerFn({ method: "GET" }).handler(async () => {
  const { getSaleOffer } = await import("@/lib/stages.server");
  return getSaleOffer("student");
});

export const fetchReferralAgents = createServerFn({ method: "GET" }).handler(async () => {
  const { listStaff } = await import("@/lib/staff.server");
  return (await listStaff())
    .filter((user) => user.role === "agent" && user.referralCode)
    .map((user) => ({ name: user.name, code: user.referralCode as string }))
    .sort((a, b) => a.name.localeCompare(b.name, "id"));
});

export const fetchFastTrackContext = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePanel, listStaff } = await import("@/lib/staff.server");
  const { getFastTrackSales, getLiveStage } = await import("@/lib/stages.server");
  await requirePanel("fast-track");
  const stage = await getLiveStage();
  const fastTrackOnSale = await getFastTrackSales();
  const agents = (await listStaff())
    .filter((user) => user.role === "agent" && user.referralCode)
    .map((user) => ({ name: user.name, code: user.referralCode as string }))
    .sort((a, b) => a.name.localeCompare(b.name, "id"));
  return {
    stage: stage
      ? {
          id: stage.id,
          label: stage.label,
          fastTrackPrice: stage.fastTrackPrice,
        }
      : null,
    fastTrackOnSale,
    agents,
  };
});

export const fetchFastTrackSales = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePanel } = await import("@/lib/staff.server");
  const { getFastTrackSales } = await import("@/lib/stages.server");
  await requirePanel("harga-fast-track");
  return getFastTrackSales();
});

export const saveFastTrackSales = createServerFn({ method: "POST" })
  .validator((data: StageSales) => data)
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { updateFastTrackSales } = await import("@/lib/stages.server");
    await requirePanel("harga-fast-track");
    return updateFastTrackSales(data);
  });

export const fetchStages = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePanel } = await import("@/lib/staff.server");
  const { listStages } = await import("@/lib/stages.server");
  await requirePanel("tiketing", "harga-fast-track", "harga-pelajar");
  return listStages();
});

export const saveStage = createServerFn({ method: "POST" })
  .validator((data: {
    id: StageId;
    enabled: boolean;
    startsAt: string | null;
    endsAt: string | null;
    quota: StageQuota;
    price: StageQuota;
    onSale: StageSales;
    purchaseLimit: number;
  }) => data)
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { updateStage } = await import("@/lib/stages.server");
    await requirePanel("tiketing");
    return updateStage(data);
  });

export const saveFastTrackPrices = createServerFn({ method: "POST" })
  .validator((data: { id: StageId; fastTrackPrice: StageQuota }) => data)
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { updateFastTrackPrices } = await import("@/lib/stages.server");
    await requirePanel("harga-fast-track");
    return updateFastTrackPrices(data);
  });

export const saveStudentPrices = createServerFn({ method: "POST" })
  .validator((data: { id: StageId; studentPrice: StageQuota }) => data)
  .handler(async ({ data }) => {
    const { requirePanel } = await import("@/lib/staff.server");
    const { updateStudentPrices } = await import("@/lib/stages.server");
    await requirePanel("harga-pelajar");
    return updateStudentPrices(data);
  });
