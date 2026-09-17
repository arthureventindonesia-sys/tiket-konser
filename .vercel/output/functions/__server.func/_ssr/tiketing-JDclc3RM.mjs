import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { a as parseGroupedId, i as fromDatetimeLocalWib, n as formatGroupedId, o as toDatetimeLocalWib } from "./format-CTnw_oB6.mjs";
import { i as TICKET_LABEL } from "./event-BfOBuk07.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Button } from "./button-BlpB8QLq.mjs";
import { n as Label, t as Input } from "./label-DKZ_Vf1M.mjs";
import { i as saveStage, r as fetchStages, t as Checkbox } from "./stages-DnynzBaR.mjs";
import { t as Badge } from "./badge-DhzkCt12.mjs";
import { t as remainingOf } from "./stages--0Aiwkoo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tiketing-JDclc3RM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_LABEL = {
	off: "Nonaktif",
	scheduled: "Terjadwal",
	live: "Berlangsung",
	ended: "Selesai"
};
function TiketingPage() {
	const [stages, setStages] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	function load() {
		fetchStages().then(setStages).catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const liveCount = stages.filter((s) => s.live).length;
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-danger",
		children: error
	});
	if (stages.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Memuat tiketing…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.24em] text-gold",
					children: "Tiketing"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl",
					children: "Tahap penjualan"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: "Atur kuota, harga, waktu, dan status tiap tahap. Early Bird hanya VIP dan Festival. Pembeli otomatis masuk ke tahap yang sedang berlangsung."
				})
			] }),
			liveCount > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold",
				children: "Lebih dari satu tahap aktif. Sistem memakai tahap paling awal (urutan Early Bird → OTS)."
			}) : null,
			liveCount === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted",
				children: "Tidak ada tahap yang berlangsung. Halaman beli akan tertutup sampai satu tahap diaktifkan dan masuk jangka waktunya."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-5",
				children: stages.map((stage) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageCard, {
					stage,
					onSaved: (next) => setStages((prev) => prev.map((s) => s.id === next.id ? next : s))
				}, stage.id))
			})
		]
	});
}
function StageCard({ stage, onSaved }) {
	const [enabled, setEnabled] = (0, import_react.useState)(stage.enabled);
	const [startsAt, setStartsAt] = (0, import_react.useState)(toDatetimeLocalWib(stage.startsAt));
	const [endsAt, setEndsAt] = (0, import_react.useState)(toDatetimeLocalWib(stage.endsAt));
	const [quota, setQuota] = (0, import_react.useState)(stage.quota);
	const [price, setPrice] = (0, import_react.useState)(stage.price);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setEnabled(stage.enabled);
		setStartsAt(toDatetimeLocalWib(stage.startsAt));
		setEndsAt(toDatetimeLocalWib(stage.endsAt));
		setQuota(stage.quota);
		setPrice(stage.price);
	}, [stage]);
	async function onSave(e) {
		e.preventDefault();
		setBusy(true);
		try {
			onSaved(await saveStage({ data: {
				id: stage.id,
				enabled,
				startsAt: fromDatetimeLocalWib(startsAt),
				endsAt: fromDatetimeLocalWib(endsAt),
				quota,
				price
			} }));
			toast.success(`${stage.label} disimpan`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
		} finally {
			setBusy(false);
		}
	}
	const tone = stage.status === "live" ? "success" : stage.status === "scheduled" ? "gold" : stage.status === "ended" ? "danger" : "muted";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: onSave,
		className: "space-y-5 rounded-xl border border-border bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: stage.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-subtle",
					children: stage.allowed.map((t) => TICKET_LABEL[t]).join(" · ")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone,
					children: STATUS_LABEL[stage.status]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
					checked: enabled,
					onCheckedChange: (v) => setEnabled(v === true)
				}), "Aktifkan tahap ini"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: `${stage.id}-start`,
						children: "Mulai (WIB)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: `${stage.id}-start`,
						type: "datetime-local",
						value: startsAt,
						onChange: (e) => setStartsAt(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: `${stage.id}-end`,
						children: "Selesai (WIB)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: `${stage.id}-end`,
						type: "datetime-local",
						value: endsAt,
						onChange: (e) => setEndsAt(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: "Kosongkan tanggal jika tahap berlaku selama diaktifkan, tanpa batas waktu."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					"vvip",
					"vip",
					"festival"
				].map((type) => {
					const allowed = stage.allowed.includes(type);
					const sold = stage.sold[type];
					const sisa = remainingOf(quota[type], sold);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `rounded-lg border border-border p-3 ${allowed ? "bg-bg" : "opacity-50"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.16em] text-subtle",
								children: TICKET_LABEL[type]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `${stage.id}-p-${type}`,
								className: "mt-2 block text-xs text-muted",
								children: "Harga"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-subtle",
									children: "Rp"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: `${stage.id}-p-${type}`,
									inputMode: "numeric",
									disabled: !allowed,
									className: "pl-9 font-mono tabular-nums",
									value: allowed ? formatGroupedId(price[type]) : "",
									onChange: (e) => setPrice((prev) => ({
										...prev,
										[type]: parseGroupedId(e.target.value)
									})),
									placeholder: "0"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `${stage.id}-q-${type}`,
								className: "mt-2 block text-xs text-muted",
								children: "Kuota"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: `${stage.id}-q-${type}`,
								type: "number",
								min: 0,
								step: 1,
								disabled: !allowed,
								value: allowed ? quota[type] : 0,
								onChange: (e) => setQuota((prev) => ({
									...prev,
									[type]: Number(e.target.value)
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 font-mono text-xs tabular-nums text-muted",
								children: [
									"Terjual ",
									sold,
									" · Sisa ",
									allowed ? sisa : 0
								]
							})
						]
					}, type);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: busy,
				children: busy ? "Menyimpan…" : "Simpan tahap"
			})
		]
	});
}
//#endregion
export { TiketingPage as component };
