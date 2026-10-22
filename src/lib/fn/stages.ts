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

export const fetchFastTrackContext = createServerFn({ method: "GET" }).handler(async () => {
  const { requireStaff, listStaff } = await import("@/lib/staff.server");
  const { getLiveStage } = await import("@/lib/stages.server");
  await requireStaff(["admin", "crew"]);
  const stage = await getLiveStage();
  const agents = (await listStaff())
    .filter((user) => user.role === "agent" && user.referralCode)
    .map((user) => ({ name: user.name, code: user.referralCode as string }))
    .sort((a, b) => a.name.localeCompare(b.name, "id"));
  return {
    stage: stage
      ? {
          id: stage.id,
          label: stage.label,
          allowed: stage.allowed,
          fastTrackPrice: stage.fastTrackPrice,
        }
      : null,
    agents,
  };
});

export const fetchStages = createServerFn({ method: "GET" }).handler(async () => {
  const { requireStaff } = await import("@/lib/staff.server");
  const { listStages } = await import("@/lib/stages.server");
  await requireStaff(["admin"]);
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
  }) => data)
  .handler(async ({ data }) => {
    const { requireStaff } = await import("@/lib/staff.server");
    const { updateStage } = await import("@/lib/stages.server");
    await requireStaff(["admin"]);
    return updateStage(data);
  });

export const saveFastTrackPrices = createServerFn({ method: "POST" })
  .validator((data: { id: StageId; fastTrackPrice: StageQuota }) => data)
  .handler(async ({ data }) => {
    const { requireStaff } = await import("@/lib/staff.server");
    const { updateFastTrackPrices } = await import("@/lib/stages.server");
    await requireStaff(["admin"]);
    return updateFastTrackPrices(data);
  });

export const saveStudentPrices = createServerFn({ method: "POST" })
  .validator((data: { id: StageId; studentPrice: StageQuota }) => data)
  .handler(async ({ data }) => {
    const { requireStaff } = await import("@/lib/staff.server");
    const { updateStudentPrices } = await import("@/lib/stages.server");
    await requireStaff(["admin"]);
    return updateStudentPrices(data);
  });
