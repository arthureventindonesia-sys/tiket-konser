import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as formatRupiah } from "./format-CTnw_oB6.mjs";
import { i as TICKET_LABEL, t as EVENT } from "./event-BfOBuk07.mjs";
import { i as Route$2 } from "./router-BLZJquPt.mjs";
import { t as Button } from "./button-BlpB8QLq.mjs";
import { n as SiteHeader } from "./site-header-CdYtn6jd.mjs";
import { t as fetchOrder } from "./orders-BKsi3FNV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bayar._orderId-DuJ07ub3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BayarPage() {
	const { orderId } = Route$2.useParams();
	const navigate = useNavigate();
	const [order, setOrder] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		fetchOrder({ data: orderId }).then((o) => {
			if (cancelled) return;
			if (o.status === "confirmed" || o.status === "awaiting_confirm") {
				navigate({
					to: "/tiket/$orderId",
					params: { orderId }
				});
				return;
			}
			setOrder(o);
		}).catch((e) => {
			if (!cancelled) setError(e instanceof Error ? e.message : "Tidak ditemukan");
		});
		return () => {
			cancelled = true;
		};
	}, [orderId, navigate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { solid: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "grid min-h-[calc(100dvh-72px)] place-items-center px-4 py-10",
			children: [
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-danger",
					children: error
				}) : null,
				!error && !order ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "Menyiapkan QRIS…"
				}) : null,
				order ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-fg p-5 text-gold-fg shadow-[var(--shadow-elevated)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-subtle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "QRIS Statis" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: EVENT.shortName })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-3 text-center font-display text-2xl text-bg",
							children: EVENT.merchantName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-center text-xs text-subtle",
							children: ["NMID ", EVENT.nmid]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto mt-4 overflow-hidden rounded-lg bg-bg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: EVENT.qris,
								alt: "QRIS statis Golden Satya Fair",
								className: "w-full"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-center text-xs text-subtle",
							children: "Nominal transfer (termasuk kode unik)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center font-mono text-2xl tabular-nums text-bg",
							children: formatRupiah(order.totalAmount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-center text-xs text-subtle",
							children: [
								"Harga ",
								formatRupiah(order.baseAmount),
								" + kode ",
								order.uniqueCode.toString().padStart(3, "0")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-4 space-y-1 border-t border-border pt-3 text-xs text-subtle",
							children: [
								order.qtyVvip > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									TICKET_LABEL.vvip,
									" × ",
									order.qtyVvip
								] }) : null,
								order.qtyVip > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									TICKET_LABEL.vip,
									" × ",
									order.qtyVip
								] }) : null,
								order.qtyFestival > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									TICKET_LABEL.festival,
									" × ",
									order.qtyFestival
								] }) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-5 w-full",
							size: "lg",
							onClick: () => navigate({
								to: "/upload/$orderId",
								params: { orderId }
							}),
							children: "KONFIRMASI PEMBAYARAN"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-center text-[11px] text-subtle",
							children: "Scan dengan e-wallet, transfer sesuai nominal, lalu konfirmasi."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-center text-[11px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "text-subtle underline-offset-4 hover:underline",
								children: "Kembali ke beranda"
							})
						})
					]
				}) : null
			]
		})]
	});
}
//#endregion
export { BayarPage as component };
