import { createServerFn } from "@tanstack/react-start";
import type { StageId, StageQuota } from "@/lib/stages";

export const fetchSaleOffer = createServerFn({ method: "GET" }).handler(async () => {
  const { getSaleOffer } = await import("@/lib/stages.server");
  return getSaleOffer();
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
  }) => data)
  .handler(async ({ data }) => {
    const { requireStaff } = await import("@/lib/staff.server");
    const { updateStage } = await import("@/lib/stages.server");
    await requireStaff(["admin"]);
    return updateStage(data);
  });
