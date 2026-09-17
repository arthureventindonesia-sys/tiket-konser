//#region node_modules/.nitro/vite/services/ssr/assets/format-CTnw_oB6.js
function formatRupiah(amount) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0
	}).format(amount);
}
function digitsOnly(value) {
	return value.replace(/\D/g, "");
}
function formatGroupedId(amount) {
	if (!Number.isFinite(amount) || amount <= 0) return "";
	return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.floor(amount));
}
function parseGroupedId(value) {
	const digits = digitsOnly(value);
	if (!digits) return 0;
	return Number.parseInt(digits, 10);
}
function uniqueCodeFromWhatsapp(whatsapp) {
	const slice = digitsOnly(whatsapp).slice(-3).padStart(3, "0");
	return Number.parseInt(slice, 10);
}
function toWaNumber(whatsapp) {
	let n = digitsOnly(whatsapp);
	if (n.startsWith("0")) n = `62${n.slice(1)}`;
	if (!n.startsWith("62")) n = `62${n}`;
	return n;
}
function waMeUrl(whatsapp, text) {
	return `https://wa.me/${toWaNumber(whatsapp)}?text=${encodeURIComponent(text)}`;
}
function formatDateTime(value) {
	const d = typeof value === "string" ? new Date(value) : value;
	return new Intl.DateTimeFormat("id-ID", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "Asia/Jakarta"
	}).format(d);
}
function toDatetimeLocalWib(iso) {
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
		hour12: false
	}).formatToParts(d);
	const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
	return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
function fromDatetimeLocalWib(value) {
	const v = value.trim();
	if (!v) return null;
	const d = /* @__PURE__ */ new Date(`${v}:00+07:00`);
	if (Number.isNaN(d.getTime())) return null;
	return d.toISOString();
}
//#endregion
export { parseGroupedId as a, waMeUrl as c, fromDatetimeLocalWib as i, formatGroupedId as n, toDatetimeLocalWib as o, formatRupiah as r, uniqueCodeFromWhatsapp as s, formatDateTime as t };
