import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { r as formatRupiah } from "./format-CTnw_oB6.mjs";
import { i as fetchDashboard } from "./admin-DrWwogNh.mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DLLoxdst.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		fetchDashboard().then(setData).catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
	}, []);
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-danger",
		children: error
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Memuat dashboard…"
	});
	const chart = [
		{
			name: "VVIP",
			total: data.tickets.vvip
		},
		{
			name: "VIP",
			total: data.tickets.vip
		},
		{
			name: "Festival",
			total: data.tickets.festival
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.24em] text-gold",
				children: "Dashboard"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl",
				children: "Penjualan tiket"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "VVIP terjual",
						value: String(data.tickets.vvip)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "VIP terjual",
						value: String(data.tickets.vip)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Festival terjual",
						value: String(data.tickets.festival)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Uang masuk",
						value: formatRupiah(data.revenue),
						accent: true
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Menunggu konfirmasi",
					value: String(data.awaitingConfirm)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Pesanan terkonfirmasi",
					value: String(data.confirmedOrders)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "h-64 rounded-xl border border-border bg-surface p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted",
					children: "Tiket terkonfirmasi per jenis"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "90%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: chart,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "name",
								stroke: "var(--color-subtle)",
								fontSize: 12,
								tickLine: false,
								axisLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								stroke: "var(--color-subtle)",
								fontSize: 12,
								allowDecimals: false,
								tickLine: false,
								axisLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								cursor: { fill: "color-mix(in oklab, var(--color-fg) 4%, transparent)" },
								contentStyle: {
									background: "var(--color-elevated)",
									border: "1px solid var(--color-border)",
									color: "var(--color-fg)"
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "total",
								fill: "var(--color-gold)",
								radius: [
									6,
									6,
									0,
									0
								]
							})
						]
					})
				})]
			})
		]
	});
}
function Stat({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-[0.16em] text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `mt-2 font-mono text-2xl tabular-nums ${accent ? "text-gold" : "text-fg"}`,
			children: value
		})]
	});
}
//#endregion
export { DashboardPage as component };
