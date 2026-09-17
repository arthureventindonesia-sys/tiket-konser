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

export async function ensureAdminSeeded(): Promise<void> {
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
    insert into staff_sessions (token, staff_id, expires_at)
    values (${token}, ${row.id}, ${expires.toISOString()})
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
  return rows[0] ? mapStaff(rows[0]) : null;
}

export async function requireStaff(roles?: StaffRole[]): Promise<StaffUser> {
  const staff = await getCurrentStaff();
  if (!staff) throw new Error("Unauthorized");
  if (roles && !roles.includes(staff.role)) throw new Error("Forbidden");
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
