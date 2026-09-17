export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatGroupedId(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.floor(amount));
}

export function parseGroupedId(value: string): number {
  const digits = digitsOnly(value);
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
}

export function uniqueCodeFromWhatsapp(whatsapp: string): number {
  const digits = digitsOnly(whatsapp);
  const slice = digits.slice(-3).padStart(3, "0");
  return Number.parseInt(slice, 10);
}

export function toWaNumber(whatsapp: string): string {
  let n = digitsOnly(whatsapp);
  if (n.startsWith("0")) n = `62${n.slice(1)}`;
  if (!n.startsWith("62")) n = `62${n}`;
  return n;
}

export function waMeUrl(whatsapp: string, text: string): string {
  return `https://wa.me/${toWaNumber(whatsapp)}?text=${encodeURIComponent(text)}`;
}

export function formatDateTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

export function toDatetimeLocalWib(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function fromDatetimeLocalWib(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  const d = new Date(`${v}:00+07:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
