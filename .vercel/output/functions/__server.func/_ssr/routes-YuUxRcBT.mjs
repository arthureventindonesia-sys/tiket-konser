import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as ArrowRight, f as Clock, g as Calendar, l as MapPin } from "../_libs/lucide-react.mjs";
import { n as GUESTS, r as PARTNERS, t as EVENT } from "./event-BfOBuk07.mjs";
import { n as SiteHeader, t as SiteFooter } from "./site-header-CdYtn6jd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-YuUxRcBT.js
var import_jsx_runtime = require_jsx_runtime();
function BuyButton({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/beli",
		className: className ?? "inline-flex h-12 items-center gap-2 rounded-md bg-gold px-7 text-sm font-semibold text-gold-fg",
		children: ["Beli", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative isolate min-h-[88dvh] overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/images/hero.jpg",
						alt: "Sal Priadi di atas panggung",
						className: "absolute inset-0 size-full object-cover object-[center_32%] outline outline-1 -outline-offset-1 outline-fg/10"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-bg from-[12%] via-bg/35 via-[48%] to-black/20" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto flex min-h-[88dvh] max-w-5xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.28em] text-gold",
								children: "Official Ticketing"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-5 max-w-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: EVENT.logo,
									alt: EVENT.name,
									className: "h-auto w-full max-w-[420px] object-contain object-left md:max-w-[520px]"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 max-w-md text-base text-muted md:text-lg",
								children: EVENT.tagline
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-4 shrink-0 text-gold" }), EVENT.dateLabel]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 shrink-0 text-gold" }), EVENT.timeLabel]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4 shrink-0 text-gold" }),
											EVENT.venue,
											", ",
											EVENT.city
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuyButton, {})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-t border-border bg-surface",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.24em] text-gold",
							children: "Guest star"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-3xl md:text-4xl",
							children: "Satu malam, dua panggung suara"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-10 grid gap-5 md:grid-cols-2",
							children: GUESTS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "relative isolate min-h-[420px] overflow-hidden rounded-xl border border-border md:min-h-[520px]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: g.photo,
										alt: "",
										className: "absolute inset-0 size-full object-cover object-[center_18%]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-transparent" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "relative z-10 flex min-h-[420px] items-end justify-center px-8 pb-8 md:min-h-[520px]",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: g.logo,
											alt: g.name,
											className: "h-12 w-full max-w-[240px] object-contain drop-shadow md:h-14"
										})
									})
								]
							}, g.name))
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-t border-border bg-surface",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.24em] text-gold",
							children: "Layout konser"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-3xl md:text-4xl",
							children: "Posisi VVIP, VIP, dan Festival"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: EVENT.layout,
							target: "_blank",
							rel: "noreferrer",
							className: "mt-8 block overflow-hidden rounded-xl border border-border bg-bg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: EVENT.layout,
								alt: "Layout konser Golden Satya Fair: Stage, VVIP, VIP, Festival, FOH, tenant, dan gate",
								className: "w-full object-contain outline outline-1 -outline-offset-1 outline-fg/10"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-subtle",
							children: "Ketuk gambar untuk memperbesar."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuyButton, {})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-t border-border bg-bg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-16",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-xs uppercase tracking-[0.24em] text-gold",
						children: "Didukung oleh"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-10 md:grid-cols-4 md:gap-x-10",
						children: PARTNERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-24 place-items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: p.logo,
								alt: p.name,
								className: "max-h-20 w-full max-w-[180px] object-contain"
							})
						}, p.name))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, { showPartners: false })
		]
	});
}
//#endregion
export { Home as component };
