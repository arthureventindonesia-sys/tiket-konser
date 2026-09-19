import { createServerFn } from "@tanstack/react-start";

export const pingVisit = createServerFn({ method: "POST" })
  .validator((input: { path: string }) => ({ path: String(input?.path ?? "/") }))
  .handler(async ({ data }) => {
    const { recordVisit } = await import("@/lib/visits.server");
    await recordVisit(data.path);
    return { ok: true as const };
  });

export const fetchAdminMonitor = createServerFn({ method: "GET" }).handler(async () => {
  const { requireStaff, listActiveStaff } = await import("@/lib/staff.server");
  const { getTraffic } = await import("@/lib/visits.server");
  await requireStaff(["admin"]);
  const [online, traffic] = await Promise.all([listActiveStaff(), getTraffic()]);
  return { online, traffic };
});
