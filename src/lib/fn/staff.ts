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

export const deleteStaffUser = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => {
    if (!input?.id) throw new Error("Akun tidak valid");
    return { id: String(input.id) };
  })
  .handler(async ({ data }) => {
    const { requireStaff, deleteStaffAccount } = await import("@/lib/staff.server");
    const staff = await requireStaff(["admin"]);
    await deleteStaffAccount(data.id, staff.id);
    return { ok: true as const };
  });
