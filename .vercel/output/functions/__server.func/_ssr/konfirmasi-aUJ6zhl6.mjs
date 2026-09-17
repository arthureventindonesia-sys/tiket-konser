import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { c as MessageCircle, h as Check, m as ChevronLeft, p as ChevronRight } from "../_libs/lucide-react.mjs";
import { c as waMeUrl, r as formatRupiah, t as formatDateTime } from "./format-CTnw_oB6.mjs";
import { r as fetchConfirmations, t as confirmPayment } from "./admin-DrWwogNh.mjs";
import { i as TICKET_LABEL } from "./event-BfOBuk07.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Button } from "./button-BlpB8QLq.mjs";
import { t as Badge } from "./badge-DhzkCt12.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/konfirmasi-aUJ6zhl6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZE = 20;
function KonfirmasiPage() {
	const [orders, setOrders] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	const [busyId, setBusyId] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [filter, setFilter] = (0, import_react.useState)("pending");
	const [page, setPage] = (0, import_react.useState)(1);
	(0, import_react.useEffect)(() => {
		fetchConfirmations().then(setOrders).catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
	}, []);
	const pendingCount = orders.filter((o) => o.status !== "confirmed").length;
	const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
	const filtered = (0, import_react.useMemo)(() => orders.filter((o) => filter === "confirmed" ? o.status === "confirmed" : o.status !== "confirmed"), [orders, filter]);
	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
	const from = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
	const to = Math.min(safePage * PAGE_SIZE, filtered.length);
	async function onConfirm(id) {
		setBusyId(id);
		try {
			const next = await confirmPayment({ data: id });
			setOrders((prev) => prev.map((o) => o.id === id ? {
				...o,
				...next
			} : o));
			toast.success("Pembayaran dikonfirmasi");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Gagal konfirmasi");
		} finally {
			setBusyId(null);
		}
	}
	function ticketSummary(o) {
		const parts = [];
		if (o.qtyVvip) parts.push(`${o.qtyVvip} ${TICKET_LABEL.vvip}`);
		if (o.qtyVip) parts.push(`${o.qtyVip} ${TICKET_LABEL.vip}`);
		if (o.qtyFestival) parts.push(`${o.qtyFestival} ${TICKET_LABEL.festival}`);
		return parts.join(" · ");
	}
	function changeFilter(next) {
		setFilter(next);
		setPage(1);
	}
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-danger",
		children: error
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.24em] text-gold",
				children: "Konfirmasi"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl",
				children: "Bukti transfer"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => changeFilter("pending"),
					className: cn("inline-flex h-10 items-center rounded-md px-4 text-sm", filter === "pending" ? "bg-gold text-gold-fg" : "border border-border text-muted hover:bg-elevated hover:text-fg"),
					children: ["Belum konfirmasi", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 font-mono text-xs tabular-nums",
						children: pendingCount
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => changeFilter("confirmed"),
					className: cn("inline-flex h-10 items-center rounded-md px-4 text-sm", filter === "confirmed" ? "bg-gold text-gold-fg" : "border border-border text-muted hover:bg-elevated hover:text-fg"),
					children: ["Terkonfirmasi", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 font-mono text-xs tabular-nums",
						children: confirmedCount
					})]
				})]
			}),
			filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: filter === "confirmed" ? "Belum ada pembayaran terkonfirmasi." : "Tidak ada pesanan yang menunggu konfirmasi."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-4",
				children: pageRows.map((o) => {
					const confirmed = o.status === "confirmed";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-border bg-surface p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: o.fullName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-subtle",
										children: [
											o.email,
											" · ",
											o.whatsapp
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: ticketSummary(o)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-sm tabular-nums text-gold",
										children: formatRupiah(o.totalAmount)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-subtle",
										children: formatDateTime(o.createdAt)
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: confirmed ? "success" : o.hasProof ? "gold" : "muted",
									children: confirmed ? "Terkonfirmasi" : o.hasProof ? "Menunggu" : "Belum unggah"
								})]
							}),
							o.proofData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mt-3 overflow-hidden rounded-md",
								onClick: () => setPreview(o.proofData),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: o.proofData,
									alt: `Bukti ${o.fullName}`,
									className: "h-28 w-auto max-w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-subtle",
								children: "Bukti transfer belum diunggah."
							}),
							confirmed && o.tickets.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 font-mono text-xs text-muted",
								children: o.tickets.map((t) => t.code).join(" · ")
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: confirmed ? "success" : "default",
									disabled: confirmed || !o.hasProof || busyId === o.id,
									onClick: () => onConfirm(o.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), confirmed ? "Terkonfirmasi" : busyId === o.id ? "Memproses…" : "Konfirmasi"]
								}), confirmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: waMeUrl(o.whatsapp, o.waText ?? ""),
									target: "_blank",
									rel: "noreferrer",
									className: "inline-flex size-11 items-center justify-center rounded-md bg-whatsapp text-fg",
									"aria-label": "Kirim WhatsApp",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5" })
								}) : null]
							})
						]
					}, o.id);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-subtle",
					children: [
						from,
						"–",
						to,
						" dari ",
						filtered.length
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							disabled: safePage <= 1,
							onClick: () => setPage((p) => Math.max(1, p - 1)),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), "Sebelumnya"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-xs tabular-nums text-muted",
							children: [
								safePage,
								" / ",
								totalPages
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							disabled: safePage >= totalPages,
							onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
							children: ["Berikutnya", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
						})
					]
				})]
			})] }),
			preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed inset-0 z-50 grid place-items-center bg-bg/80 p-6",
				onClick: () => setPreview(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: preview,
					alt: "Bukti transfer",
					className: "max-h-full max-w-full rounded-lg"
				})
			}) : null
		]
	});
}
//#endregion
export { KonfirmasiPage as component };
