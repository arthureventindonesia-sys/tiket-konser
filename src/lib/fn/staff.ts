import { createServerFn } from "@tanstack/react-start";
import type { StaffRole } from "@/lib/event";

export const getStaffSession = createServerFn({ method: "GET" }).handler(async () => {
  const { getCurrentStaff } = await import("@/lib/staff.server");
  return getCurrentStaff();
});

export const staffLogin = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { loginStaff } = await import("@/lib/staff.server");
    return loginStaff(data.username, data.password);
  });

export const staffLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { logoutStaff } = await import("@/lib/staff.server");
  await logoutStaff();
  return { ok: true as const };
});

export const listStaffUsers = createServerFn({ method: "GET" }).handler(async () => {
  const { requireStaff, listStaff } = await import("@/lib/staff.server");
  await requireStaff(["admin"]);
  return listStaff();
});

export const createStaffUser = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string; name: string; role: StaffRole }) => data)
  .handler(async ({ data }) => {
    const { requireStaff, createStaffAccount } = await import("@/lib/staff.server");
    await requireStaff(["admin"]);
    return createStaffAccount(data);
  });
