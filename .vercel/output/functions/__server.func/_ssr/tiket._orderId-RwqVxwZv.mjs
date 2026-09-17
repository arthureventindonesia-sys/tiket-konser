import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as formatRupiah } from "./format-CTnw_oB6.mjs";
import { i as TICKET_LABEL } from "./event-BfOBuk07.mjs";
import { r as Route$1 } from "./router-BLZJquPt.mjs";
import { n as SiteHeader, t as SiteFooter } from "./site-header-CdYtn6jd.mjs";
import { t as fetchOrder } from "./orders-BKsi3FNV.mjs";
import { t as Badge } from "./badge-DhzkCt12.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tiket._orderId-RwqVxwZv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TiketPage() {
	const { orderId } = Route$1.useParams();
	const [order, setOrder] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const load = () => fetchOrder({ data: orderId }).then((o) => {
			if (!cancelled) setOrder(o);
		}).catch((e) => {
			if (!cancelled) setError(e instanceof Error ? e.message : "Tidak ditemukan");
		});
		load();
		const t = window.setInterval(() => {
			load();
		}, 8e3);
		return () => {
			cancelled = true;
			window.clearInterval(t);
		};
	}, [orderId]);
	const confirmed = order?.status === "confirmed";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { solid: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-lg px-5 py-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.24em] text-gold",
						children: "Status pesanan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl",
						children: "Tiket Anda"
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-danger",
						children: error
					}) : null,
					order ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 space-y-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between rounded-lg border border-border bg-surface p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: order.fullName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-subtle",
									children: order.email
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: confirmed ? "success" : order.hasProof ? "gold" : "muted",
									children: confirmed ? "Terkonfirmasi" : order.hasProof ? "Menunggu panitia" : "Belum bayar"
								})]
							}),
							confirmed && order.tickets.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-3",
								children: order.tickets.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "overflow-hidden rounded-xl border border-gold/30 bg-surface",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: "/images/ticket.jpg",
										alt: "",
										className: "h-24 w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs uppercase tracking-[0.18em] text-gold",
												children: TICKET_LABEL[t.type]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 font-mono text-xl tracking-wide text-fg",
												children: t.code
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-xs text-subtle",
												children: "Satu kode · satu orang · tunjukkan saat masuk"
											})
										]
									})]
								}, t.code))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border bg-surface p-5 text-sm text-muted",
								children: [order.hasProof ? "Bukti transfer sudah diterima. Tiket belum muncul sampai panitia mengonfirmasi pembayaran." : "Selesaikan pembayaran dan unggah bukti transfer.", !order.hasProof ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/bayar/$orderId",
										params: { orderId },
										className: "text-gold underline-offset-4 hover:underline",
										children: "Buka QRIS"
									})
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm text-subtle",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Total: ", formatRupiah(order.totalAmount)] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 break-all",
										children: ["ID pesanan: ", order.publicId]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3",
										children: "Simpan tautan halaman ini untuk mengecek status."
									})
								]
							})
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { TiketPage as component };
