import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import {
  deleteCookie,
  getCookie,
  getRequestHeader,
  setCookie,
} from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import type { StaffRole } from "@/lib/event";
import type { ActiveStaffSession } from "@/lib/types";

const scrypt = promisify(scryptCb);
const COOKIE = "gsf_staff";
const SESSION_DAYS = 7;

export type StaffUser = {
  id: string;
  username: string;
  name: string;
  role: StaffRole;
  referralCode: string | null;
};

type StaffRow = {
  id: string;
  username: string;
  name: string;
  role: StaffRole;
  referral_code: string | null;
};

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const key = Buffer.from(keyHex, "hex");
  const test = (await scrypt(password, salt, 64)) as Buffer;
  if (test.length !== key.length) return false;
  return timingSafeEqual(test, key);
}

function cookieSecure(): boolean {
  const proto = (getRequestHeader("x-forwarded-proto") ?? "").split(",")[0]?.trim();
  return proto === "https";
}

function mapStaff(row: StaffRow): StaffUser {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role,
    referralCode: row.referral_code,
  };
}

let roleSchemaReady = false;
export async function ensureTiketboxSchema(): Promise<void> {
  if (roleSchemaReady) return;
  const sql = await getSql();
  await sql.query("alter table orders add column if not exists taken_at timestamptz");
  await sql.query("alter table orders add column if not exists taken_by text");
  try {
    await sql.query("alter table staff_users drop constraint if exists staff_users_role_check");
    await sql.query(
      "alter table staff_users add constraint staff_users_role_check check (role in ('admin', 'crew', 'agent', 'tiketbox'))",
    );
  } catch {
    // constraint already matches
  }
  roleSchemaReady = true;
}

export async function ensureAdminSeeded(): Promise<void> {
  await ensureTiketboxSchema();
  const sql = await getSql();
  const existing = await sql<{ id: string }>`
    select id from staff_users where username = 'iang' limit 1
  `;
  if (existing.length > 0) return;
  const id = randomBytes(12).toString("hex");
  const passwordHash = await hashPassword("$Golden");
  await sql`
    insert into staff_users (id, username, password_hash, name, role, referral_code)
    values (${id}, ${"iang"}, ${passwordHash}, ${"Iang"}, ${"admin"}, ${"IANG"})
  `;
}

export async function loginStaff(username: string, password: string): Promise<StaffUser> {
  await ensureAdminSeeded();
  const { ensureVisitSchema } = await import("@/lib/visits.server");
  await ensureVisitSchema();
  const sql = await getSql();
  const rows = await sql<StaffRow & { password_hash: string }>`
    select id, username, name, role, referral_code, password_hash
    from staff_users
    where username = ${username.toLowerCase()}
    limit 1
  `;
  const row = rows[0];
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    throw new Error("Username atau password salah");
  }
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sql`
    insert into staff_sessions (token, staff_id, expires_at, last_seen_at)
    values (${token}, ${row.id}, ${expires.toISOString()}, now())
  `;
  setCookie(COOKIE, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    secure: cookieSecure(),
  });
  return mapStaff(row);
}

export async function logoutStaff(): Promise<void> {
  const token = getCookie(COOKIE);
  if (token) {
    const sql = await getSql();
    await sql`delete from staff_sessions where token = ${token}`;
  }
  deleteCookie(COOKIE, { path: "/" });
}

export async function getCurrentStaff(): Promise<StaffUser | null> {
  await ensureAdminSeeded();
  const { ensureVisitSchema } = await import("@/lib/visits.server");
  await ensureVisitSchema();
  const token = getCookie(COOKIE);
  if (!token) return null;
  const sql = await getSql();
  const rows = await sql<StaffRow>`
    select u.id, u.username, u.name, u.role, u.referral_code
    from staff_sessions s
    join staff_users u on u.id = s.staff_id
    where s.token = ${token} and s.expires_at > now()
    limit 1
  `;
  if (rows[0]) {
    await sql`update staff_sessions set last_seen_at = now() where token = ${token}`;
  }
  return rows[0] ? mapStaff(rows[0]) : null;
}

export async function listActiveStaff(): Promise<ActiveStaffSession[]> {
  const { ensureVisitSchema } = await import("@/lib/visits.server");
  await ensureVisitSchema();
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    username: string;
    name: string;
    role: StaffRole;
    last_seen_at: string;
  }>`
    select u.id, u.username, u.name, u.role, max(s.last_seen_at) as last_seen_at
    from staff_sessions s
    join staff_users u on u.id = s.staff_id
    where s.expires_at > now()
      and s.last_seen_at > now() - interval '30 minutes'
    group by u.id, u.username, u.name, u.role
    order by max(s.last_seen_at) desc
  `;
  return rows.map((r) => ({
    id: r.id,
    username: r.username,
    name: r.name,
    role: r.role,
    lastSeenAt: r.last_seen_at,
  }));
}

export async function requireStaff(roles?: StaffRole[]): Promise<StaffUser> {
  const staff = await getCurrentStaff();
  if (!staff) throw new Error("Unauthorized");
  if (roles && !roles.includes(staff.role)) throw new Error("Forbidden");
  return staff;
}

export async function requireAdminPassword(password: string): Promise<StaffUser> {
  const staff = await requireStaff(["admin"]);
  if (!password.trim()) throw new Error("Password admin wajib diisi");
  const sql = await getSql();
  const rows = await sql<{ password_hash: string }>`
    select password_hash from staff_users where id = ${staff.id} limit 1
  `;
  const hash = rows[0]?.password_hash;
  if (!hash || !(await verifyPassword(password, hash))) {
    throw new Error("Password admin salah");
  }
  return staff;
}

function makeReferralCode(username: string): string {
  const base = username.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 8);
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `${base || "AGEN"}${suffix}`;
}

export async function createStaffAccount(input: {
  username: string;
  password: string;
  name: string;
  role: StaffRole;
}): Promise<StaffUser> {
  await ensureTiketboxSchema();
  const sql = await getSql();
  const username = input.username.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,24}$/.test(username)) {
    throw new Error("Username 3–24 karakter, huruf/angka/titik/_/-");
  }
  if (input.password.length < 6) throw new Error("Password minimal 6 karakter");
  const taken = await sql<{ id: string }>`
    select id from staff_users where username = ${username} limit 1
  `;
  if (taken.length > 0) throw new Error("Username sudah dipakai");
  const id = randomBytes(12).toString("hex");
  const passwordHash = await hashPassword(input.password);
  const referral = input.role === "agent" ? makeReferralCode(username) : null;
  await sql`
    insert into staff_users (id, username, password_hash, name, role, referral_code)
    values (${id}, ${username}, ${passwordHash}, ${input.name.trim()}, ${input.role}, ${referral})
  `;
  return {
    id,
    username,
    name: input.name.trim(),
    role: input.role,
    referralCode: referral,
  };
}

export async function listStaff(): Promise<StaffUser[]> {
  const sql = await getSql();
  const rows = await sql<StaffRow>`
    select id, username, name, role, referral_code
    from staff_users
    order by created_at desc
  `;
  return rows.map(mapStaff);
}

export async function findAgentByCode(code: string): Promise<StaffUser | null> {
  const sql = await getSql();
  const rows = await sql<StaffRow>`
    select id, username, name, role, referral_code
    from staff_users
    where referral_code = ${code.toUpperCase()} and role = 'agent'
    limit 1
  `;
  return rows[0] ? mapStaff(rows[0]) : null;
}

export async function deleteStaffAccount(id: string, actorId: string): Promise<void> {
  const staffId = String(id || "").trim();
  if (!staffId) throw new Error("Akun tidak ditemukan");
  if (staffId === actorId) throw new Error("Tidak bisa menghapus akun sendiri");
  const sql = await getSql();
  const rows = await sql<StaffRow>`
    select id, username, name, role, referral_code
    from staff_users where id = ${staffId} limit 1
  `;
  const target = rows[0];
  if (!target) throw new Error("Akun tidak ditemukan");
  if (target.username === "iang") throw new Error("Akun utama tidak dapat dihapus");
  if (target.role === "admin") {
    const admins = await sql<{ n: number }>`
      select count(*)::int as n from staff_users where role = 'admin'
    `;
    if (Number(admins[0]?.n ?? 0) <= 1) {
      throw new Error("Tidak bisa menghapus admin terakhir");
    }
  }
  await sql.query("delete from staff_sessions where staff_id = $1", [staffId]);
  await sql.query("delete from staff_users where id = $1", [staffId]);
}
