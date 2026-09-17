//#region node_modules/.nitro/vite/services/ssr/assets/db-CQl-xWwi.js
var _0001_ticketing_default = "create table if not exists staff_users (\n  id text primary key,\n  username text not null unique,\n  password_hash text not null,\n  name text not null,\n  role text not null check (role in ('admin', 'crew', 'agent')),\n  referral_code text unique,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists staff_sessions (\n  token text primary key,\n  staff_id text not null references staff_users(id) on delete cascade,\n  expires_at timestamptz not null,\n  created_at timestamptz not null default now()\n);\ncreate index if not exists staff_sessions_staff_id_idx on staff_sessions (staff_id);\n\ncreate table if not exists orders (\n  id serial primary key,\n  public_id text not null unique,\n  email text not null,\n  full_name text not null,\n  address text not null,\n  whatsapp text not null,\n  referral_code text,\n  qty_vvip int not null default 0,\n  qty_vip int not null default 0,\n  qty_festival int not null default 0,\n  base_amount int not null,\n  unique_code int not null,\n  total_amount int not null,\n  status text not null default 'awaiting_payment'\n    check (status in ('awaiting_payment', 'awaiting_confirm', 'confirmed')),\n  proof_data text,\n  proof_mime text,\n  proof_name text,\n  confirmed_at timestamptz,\n  confirmed_by text,\n  created_at timestamptz not null default now()\n);\ncreate index if not exists orders_email_idx on orders (email);\ncreate index if not exists orders_status_idx on orders (status);\ncreate index if not exists orders_referral_idx on orders (referral_code);\ncreate index if not exists orders_created_idx on orders (created_at desc);\n\ncreate table if not exists tickets (\n  id serial primary key,\n  order_id int not null references orders(id) on delete cascade,\n  ticket_type text not null check (ticket_type in ('vvip', 'vip', 'festival')),\n  code text not null unique,\n  created_at timestamptz not null default now()\n);\ncreate index if not exists tickets_order_id_idx on tickets (order_id);\n";
var _0002_ticket_stages_default = "create table if not exists ticket_stages (\n  id text primary key,\n  label text not null,\n  sort_order int not null,\n  enabled boolean not null default false,\n  starts_at timestamptz,\n  ends_at timestamptz,\n  quota_vvip int not null default 0,\n  quota_vip int not null default 0,\n  quota_festival int not null default 0\n);\n\ninsert into ticket_stages (id, label, sort_order, enabled, quota_vvip, quota_vip, quota_festival)\nvalues\n  ('early_bird', 'Early Bird', 1, true, 0, 200, 500),\n  ('presale_1', 'Presale 1', 2, false, 50, 200, 500),\n  ('presale_2', 'Presale 2', 3, false, 50, 200, 500),\n  ('ots', 'OTS', 4, false, 50, 200, 500)\non conflict (id) do nothing;\n\nalter table orders add column if not exists stage_id text references ticket_stages(id);\ncreate index if not exists orders_stage_idx on orders (stage_id);\n";
var _0003_stage_prices_default = "alter table ticket_stages add column if not exists price_vvip int not null default 1500000;\nalter table ticket_stages add column if not exists price_vip int not null default 750000;\nalter table ticket_stages add column if not exists price_festival int not null default 350000;\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0001_ticketing.sql": _0001_ticketing_default,
			"/migrations/0002_ticket_stages.sql": _0002_ticket_stages_default,
			"/migrations/0003_stage_prices.sql": _0003_stage_prices_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
//#endregion
export { getSql as t };
