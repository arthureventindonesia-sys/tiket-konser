import { randomBytes } from "node:crypto";
import { getCookie, setCookie, getRequestHeader } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import type { TrafficData, TrafficDay } from "@/lib/types";

const VID = "gsf_vid";

let schemaReady = false;
export async function ensureVisitSchema(): Promise<void> {
  if (schemaReady) return;
  const sql = await getSql();
  await sql.query(
    "alter table staff_sessions add column if not exists last_seen_at timestamptz not null default now()",
  );
  await sql.query(`
    create table if not exists site_visits (
      id serial primary key,
      visitor_id text not null,
      path text not null,
      created_at timestamptz not null default now()
    )
  `);
  await sql.query("create index if not exists site_visits_created_idx on site_visits (created_at desc)");
  schemaReady = true;
}

function cookieSecure(): boolean {
  const proto = (getRequestHeader("x-forwarded-proto") ?? "").split(",")[0]?.trim();
  return proto === "https";
}

function normalizePath(raw: string): string | null {
  let path = (raw || "/").split("?")[0].split("#")[0].trim() || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.startsWith("/admin") || path.startsWith("/login") || path.startsWith("/__")) return null;
  return path.slice(0, 180);
}

export async function recordVisit(rawPath: string): Promise<void> {
  const path = normalizePath(rawPath);
  if (!path) return;
  await ensureVisitSchema();
  let visitorId = getCookie(VID);
  if (!visitorId) {
    visitorId = randomBytes(12).toString("hex");
    setCookie(VID, visitorId, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      secure: cookieSecure(),
    });
  }
  const sql = await getSql();
  await sql`insert into site_visits (visitor_id, path) values (${visitorId}, ${path})`;
}

export async function getTraffic(): Promise<TrafficData> {
  await ensureVisitSchema();
  const sql = await getSql();
  const today = await sql<{ views: number; visitors: number }>`
    select
      coalesce(count(*), 0)::int as views,
      coalesce(count(distinct visitor_id), 0)::int as visitors
    from site_visits
    where (created_at at time zone 'Asia/Jakarta')::date
      = (now() at time zone 'Asia/Jakarta')::date
  `;
  const total = await sql<{ views: number; visitors: number }>`
    select
      coalesce(count(*), 0)::int as views,
      coalesce(count(distinct visitor_id), 0)::int as visitors
    from site_visits
  `;
  const days = await sql<{ day: string; views: number; visitors: number }>`
    select
      to_char((created_at at time zone 'Asia/Jakarta')::date, 'YYYY-MM-DD') as day,
      count(*)::int as views,
      count(distinct visitor_id)::int as visitors
    from site_visits
    where created_at >= (now() at time zone 'Asia/Jakarta')::date - interval '6 days'
    group by 1
    order by 1
  `;
  const map = new Map(days.map((d) => [d.day, d]));
  const filled: TrafficDay[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const when = new Date(Date.now() - i * 86_400_000);
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(when);
    const row = map.get(key);
    filled.push({
      day: key.slice(8) + "/" + key.slice(5, 7),
      views: Number(row?.views ?? 0),
      visitors: Number(row?.visitors ?? 0),
    });
  }
  return {
    viewsToday: Number(today[0]?.views ?? 0),
    visitorsToday: Number(today[0]?.visitors ?? 0),
    viewsTotal: Number(total[0]?.views ?? 0),
    visitorsTotal: Number(total[0]?.visitors ?? 0),
    days: filled,
  };
}
