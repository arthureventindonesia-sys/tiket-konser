import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { o as Plus, s as Minus } from "../_libs/lucide-react.mjs";
import { r as formatRupiah, s as uniqueCodeFromWhatsapp, t as formatDateTime } from "./format-CTnw_oB6.mjs";
import { o as TICKET_TYPES, t as EVENT } from "./event-BfOBuk07.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Route$9 } from "./router-BLZJquPt.mjs";
import { t as Button } from "./button-BlpB8QLq.mjs";
import { n as SiteHeader, t as SiteFooter } from "./site-header-CdYtn6jd.mjs";
import { n as placeOrder } from "./orders-BKsi3FNV.mjs";
import { n as Label, t as Input } from "./label-DKZ_Vf1M.mjs";
import { n as fetchSaleOffer, t as Checkbox } from "./stages-DnynzBaR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/beli-Be62Ga2x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BeliPage() {
	const { ref } = Route$9.useSearch();
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [whatsapp, setWhatsapp] = (0, import_react.useState)("");
	const [referralCode, setReferralCode] = (0, import_react.useState)(ref ?? "");
	const [qty, setQty] = (0, import_react.useState)({
		vvip: 0,
		vip: 0,
		festival: 0
	});
	const [agreed, setAgreed] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [offer, setOffer] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		fetchSaleOffer().then(setOffer).catch(() => setOffer({
			open: false,
			message: "Penjualan tiket sedang ditutup.",
			stage: null,
			remaining: {
				vvip: 0,
				vip: 0,
				festival: 0
			},
			price: {
				vvip: 0,
				vip: 0,
				festival: 0
			},
			allowed: []
		}));
	}, []);
	const uniqueCode = uniqueCodeFromWhatsapp(whatsapp || "000");
	const priceOf = (id) => offer?.price[id] || TICKET_TYPES.find((t) => t.id === id)?.price || 0;
	const baseAmount = (0, import_react.useMemo)(() => TICKET_TYPES.reduce((sum, t) => sum + priceOf(t.id) * qty[t.id], 0), [qty, offer]);
	const totalQty = qty.vvip + qty.vip + qty.festival;
	const total = totalQty > 0 ? baseAmount + uniqueCode : 0;
	function setCount(id, next) {
		const cap = Math.min(4, offer?.remaining[id] ?? 4);
		setQty((prev) => ({
			...prev,
			[id]: Math.min(cap, Math.max(0, next))
		}));
	}
	async function onSubmit(e) {
		e.preventDefault();
		if (!agreed) {
			toast.error("Centang persetujuan sebelum checkout");
			return;
		}
		setBusy(true);
		try {
			const order = await placeOrder({ data: {
				email,
				fullName,
				address,
				whatsapp,
				referralCode: referralCode.trim() || void 0,
				qtyVvip: qty.vvip,
				qtyVip: qty.vip,
				qtyFestival: qty.festival
			} });
			await navigate({
				to: "/bayar/$orderId",
				params: { orderId: order.publicId }
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Gagal membuat pesanan");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { solid: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-5xl gap-10 px-5 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit,
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.24em] text-gold",
								children: offer?.stage ? offer.stage.label : "Data pemesan"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-1 font-display text-3xl",
								children: "Isi sesuai KTP"
							}),
							offer && !offer.open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted",
								children: [offer.message, offer.stage?.startsAt ? ` Mulai ${formatDateTime(offer.stage.startsAt)} WIB.` : ""]
							}) : null
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Email",
									htmlFor: "email",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "email",
										type: "email",
										required: true,
										autoComplete: "email",
										value: email,
										onChange: (e) => setEmail(e.target.value),
										placeholder: "nama@email.com"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Nama asli",
									htmlFor: "fullName",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "fullName",
										required: true,
										autoComplete: "name",
										value: fullName,
										onChange: (e) => setFullName(e.target.value),
										placeholder: "Sesuai KTP"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Alamat sesuai KTP",
									htmlFor: "address",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "address",
										required: true,
										value: address,
										onChange: (e) => setAddress(e.target.value),
										placeholder: "Alamat lengkap"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "WhatsApp",
									htmlFor: "whatsapp",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "whatsapp",
										required: true,
										inputMode: "tel",
										value: whatsapp,
										onChange: (e) => setWhatsapp(e.target.value),
										placeholder: "08xxxxxxxxxx"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Kode referal (opsional)",
									htmlFor: "referral",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "referral",
										value: referralCode,
										onChange: (e) => setReferralCode(e.target.value.toUpperCase()),
										placeholder: "Kode agen"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-muted",
									children: "Jenis tiket"
								}),
								TICKET_TYPES.filter((t) => !offer || offer.allowed.includes(t.id)).map((t) => {
									const sisa = offer?.remaining[t.id] ?? 4;
									const habis = sisa < 1;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-4 rounded-lg border border-border bg-surface p-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: t.image,
												alt: "",
												className: "size-16 shrink-0 rounded-md object-cover outline outline-1 -outline-offset-1 outline-fg/10"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-display text-lg leading-tight",
														children: t.label
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-mono text-xs text-gold",
														children: formatRupiah(priceOf(t.id))
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mt-0.5 text-xs text-subtle",
														children: habis ? "Kuota habis" : `Sisa ${sisa}`
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "grid size-11 place-items-center rounded-md border border-border bg-elevated",
														onClick: () => setCount(t.id, qty[t.id] - 1),
														disabled: !offer?.open,
														"aria-label": `Kurangi ${t.label}`,
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "w-6 text-center font-mono tabular-nums",
														children: qty[t.id]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "grid size-11 place-items-center rounded-md border border-border bg-elevated",
														onClick: () => setCount(t.id, qty[t.id] + 1),
														disabled: !offer?.open || habis,
														"aria-label": `Tambah ${t.label}`,
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
													})
												]
											})
										]
									}, t.id);
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-subtle",
									children: [
										"Maksimal ",
										4,
										" tiket per jenis, per email."
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-sm text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								checked: agreed,
								onCheckedChange: (v) => setAgreed(v === true),
								className: "mt-0.5"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Saya menyatakan data di atas benar, tiket tidak dapat dikembalikan, dan saya setuju membayar nominal yang tertera (harga tiket ditambah kode unik 3 digit terakhir WhatsApp) melalui QRIS statis." })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "lg",
							className: "w-full",
							disabled: busy || !agreed || totalQty < 1 || !offer?.open,
							children: busy ? "Memproses…" : "Checkout"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "h-fit rounded-xl border border-border bg-surface p-5 md:sticky md:top-24",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.2em] text-gold",
							children: EVENT.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-display text-2xl",
							children: "Ringkasan"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-5 space-y-2 text-sm",
							children: TICKET_TYPES.map((t) => qty[t.id] > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between gap-4 text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									t.label,
									" × ",
									qty[t.id]
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono tabular-nums text-fg",
									children: formatRupiah(priceOf(t.id) * qty[t.id])
								})]
							}, t.id) : null)
						}),
						totalQty > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex justify-between text-sm text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kode unik (WA)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono tabular-nums text-gold",
								children: ["+", uniqueCode.toString().padStart(3, "0")]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex justify-between border-t border-border pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total transfer" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-lg tabular-nums text-gold",
								children: formatRupiah(total)
							})]
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 text-sm text-subtle",
							children: "Pilih tiket untuk melihat total."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function Field({ label, htmlFor, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("grid gap-1.5"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor,
			children: label
		}), children]
	});
}
//#endregion
export { BeliPage as component };
