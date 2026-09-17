import { a as getCookie, i as deleteCookie$1, o as getRequestHeader, s as setCookie$1 } from "./ssr.mjs";
import { t as getSql } from "./db-CQl-xWwi.mjs";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
//#region node_modules/.nitro/vite/services/ssr/assets/staff.server-DPabvfcS.js
var scrypt$1 = promisify(scrypt);
var COOKIE = "gsf_staff";
async function hashPassword(password) {
	const salt = randomBytes(16);
	const key = await scrypt$1(password, salt, 64);
	return `${salt.toString("hex")}:${key.toString("hex")}`;
}
async function verifyPassword(password, stored) {
	const [saltHex, keyHex] = stored.split(":");
	if (!saltHex || !keyHex) return false;
	const salt = Buffer.from(saltHex, "hex");
	const key = Buffer.from(keyHex, "hex");
	const test = await scrypt$1(password, salt, 64);
	if (test.length !== key.length) return false;
	return timingSafeEqual(test, key);
}
function cookieSecure() {
	return (getRequestHeader("x-forwarded-proto") ?? "").split(",")[0]?.trim() === "https";
}
function mapStaff(row) {
	return {
		id: row.id,
		username: row.username,
		name: row.name,
		role: row.role,
		referralCode: row.referral_code
	};
}
async function ensureAdminSeeded() {
	const sql = await getSql();
	if ((await sql`
    select id from staff_users where username = 'iang' limit 1
  `).length > 0) return;
	await sql`
    insert into staff_users (id, username, password_hash, name, role, referral_code)
    values (${randomBytes(12).toString("hex")}, ${"iang"}, ${await hashPassword("$Golden")}, ${"Iang"}, ${"admin"}, ${"IANG"})
  `;
}
async function loginStaff(username, password) {
	await ensureAdminSeeded();
	const sql = await getSql();
	const row = (await sql`
    select id, username, name, role, referral_code, password_hash
    from staff_users
    where username = ${username.toLowerCase()}
    limit 1
  `)[0];
	if (!row || !await verifyPassword(password, row.password_hash)) throw new Error("Username atau password salah");
	const token = randomBytes(32).toString("hex");
	const expires = new Date(Date.now() + 6048e5);
	await sql`
    insert into staff_sessions (token, staff_id, expires_at)
    values (${token}, ${row.id}, ${expires.toISOString()})
  `;
	setCookie$1(COOKIE, token, {
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		maxAge: 604800,
		secure: cookieSecure()
	});
	return mapStaff(row);
}
async function logoutStaff() {
	const token = getCookie(COOKIE);
	if (token) await (await getSql())`delete from staff_sessions where token = ${token}`;
	deleteCookie$1(COOKIE, { path: "/" });
}
async function getCurrentStaff() {
	await ensureAdminSeeded();
	const token = getCookie(COOKIE);
	if (!token) return null;
	const rows = await (await getSql())`
    select u.id, u.username, u.name, u.role, u.referral_code
    from staff_sessions s
    join staff_users u on u.id = s.staff_id
    where s.token = ${token} and s.expires_at > now()
    limit 1
  `;
	return rows[0] ? mapStaff(rows[0]) : null;
}
async function requireStaff(roles) {
	const staff = await getCurrentStaff();
	if (!staff) throw new Error("Unauthorized");
	if (roles && !roles.includes(staff.role)) throw new Error("Forbidden");
	return staff;
}
function makeReferralCode(username) {
	const base = username.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 8);
	const suffix = randomBytes(2).toString("hex").toUpperCase();
	return `${base || "AGEN"}${suffix}`;
}
async function createStaffAccount(input) {
	const sql = await getSql();
	const username = input.username.trim().toLowerCase();
	if (!/^[a-z0-9._-]{3,24}$/.test(username)) throw new Error("Username 3–24 karakter, huruf/angka/titik/_/-");
	if (input.password.length < 6) throw new Error("Password minimal 6 karakter");
	if ((await sql`
    select id from staff_users where username = ${username} limit 1
  `).length > 0) throw new Error("Username sudah dipakai");
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
		referralCode: referral
	};
}
async function listStaff() {
	return (await (await getSql())`
    select id, username, name, role, referral_code
    from staff_users
    order by created_at desc
  `).map(mapStaff);
}
async function findAgentByCode(code) {
	const rows = await (await getSql())`
    select id, username, name, role, referral_code
    from staff_users
    where referral_code = ${code.toUpperCase()} and role = 'agent'
    limit 1
  `;
	return rows[0] ? mapStaff(rows[0]) : null;
}
//#endregion
export { createStaffAccount, ensureAdminSeeded, findAgentByCode, getCurrentStaff, listStaff, loginStaff, logoutStaff, requireStaff };
