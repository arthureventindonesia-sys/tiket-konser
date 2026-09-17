import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as getStaffSession } from "./staff-C8N3dgC5.mjs";
import { r as formatRupiah, t as formatDateTime } from "./format-CTnw_oB6.mjs";
import { n as fetchAgentSales } from "./admin-DrWwogNh.mjs";
import { i as TICKET_LABEL } from "./event-BfOBuk07.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agen-COSkSuVx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AgenPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [code, setCode] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [isAgent, setIsAgent] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		Promise.all([getStaffSession(), fetchAgentSales()]).then(([staff, sales]) => {
			setIsAgent(staff?.role === "agent");
			setCode(staff?.referralCode ?? null);
			setRows(sales);
		}).catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
	}, []);
	const origin = typeof window !== "undefined" ? window.location.origin : "";
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-danger",
		children: error
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.24em] text-gold",
				children: isAgent ? "Transaksi" : "Agen"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl",
				children: isAgent ? "Pembeli dari tautan Anda" : "Transaksi referal terkonfirmasi"
			}),
			isAgent && code ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 break-all font-mono text-sm text-gold",
				children: [
					origin,
					"/beli?ref=",
					code
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-subtle",
				children: "Hanya pesanan yang sudah dikonfirmasi panitia."
			})
		] }), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: "Belum ada transaksi terkonfirmasi."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-xl border border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[640px] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-surface text-xs uppercase tracking-wide text-subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Pembeli"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "WhatsApp"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Tiket"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Nominal"
						}),
						!isAgent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Agen"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Waktu"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: r.fullName }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: r.email
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: r.whatsapp
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted",
							children: [
								r.qtyVvip ? `${r.qtyVvip} ${TICKET_LABEL.vvip}` : null,
								r.qtyVip ? `${r.qtyVip} ${TICKET_LABEL.vip}` : null,
								r.qtyFestival ? `${r.qtyFestival} ${TICKET_LABEL.festival}` : null
							].filter(Boolean).join(", ")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-mono tabular-nums",
							children: formatRupiah(r.totalAmount)
						}),
						!isAgent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: r.agentName ?? r.referralCode
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-subtle",
							children: r.confirmedAt ? formatDateTime(r.confirmedAt) : "—"
						})
					]
				}, r.publicId)) })]
			})
		})]
	});
}
//#endregion
export { AgenPage as component };
