import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { r as PARTNERS, t as EVENT } from "./event-BfOBuk07.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-header-CdYtn6jd.js
var import_jsx_runtime = require_jsx_runtime();
function BrandLogo({ className, imgClassName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: EVENT.logo,
			alt: EVENT.name,
			className: cn("h-10 w-auto max-w-[200px] object-contain object-left md:h-12 md:max-w-[260px]", imgClassName)
		})
	});
}
function PartnerStrip({ className, imgClassName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex items-center gap-2.5 md:gap-3.5", className),
		children: PARTNERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: p.logo,
			alt: p.name,
			className: cn("h-5 w-auto max-w-[70px] object-contain opacity-90 md:h-6 md:max-w-[86px]", imgClassName)
		}, p.name))
	});
}
function SiteHeader({ solid = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: cn("sticky top-0 z-30 px-5 py-3 md:px-8 md:py-4", solid ? "border-b border-border bg-bg" : "bg-gradient-to-b from-bg/90 to-transparent"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-3 md:gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "shrink-0",
						"aria-label": EVENT.name,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLogo, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden h-7 w-px bg-gold/35 sm:block",
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerStrip, { className: "hidden sm:flex" })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex shrink-0 items-center gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/beli",
					className: "inline-flex h-11 items-center rounded-md bg-gold px-5 text-sm font-semibold text-gold-fg",
					children: "Beli"
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerStrip, {
			className: "mt-2.5 justify-center sm:hidden",
			imgClassName: "h-5 max-w-[64px]"
		})]
	});
}
function SiteFooter({ showPartners = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "border-t border-border px-5 py-10 text-center text-sm text-subtle md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLogo, {
				className: "justify-center",
				imgClassName: "mx-auto h-14 max-w-[280px] md:h-16"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4",
				children: [
					EVENT.dateLabel,
					" · ",
					EVENT.timeLabel
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1",
				children: [
					EVENT.venue,
					", ",
					EVENT.city
				]
			}),
			showPartners ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-5 opacity-90",
				children: PARTNERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: p.logo,
					alt: p.name,
					className: "h-9 w-auto max-w-[120px] object-contain md:h-10 md:max-w-[140px]"
				}, p.name))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "text-subtle underline-offset-4 hover:text-muted hover:underline",
					children: "Panel panitia"
				})
			})
		]
	});
}
//#endregion
export { SiteHeader as n, SiteFooter as t };
