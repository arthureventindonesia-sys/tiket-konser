import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { d as useRouterState, m as Outlet, v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as staffLogout, n as getStaffSession } from "./staff-C8N3dgC5.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { a as Share2, d as LayoutDashboard, i as TicketCheck, r as Ticket, t as Users, u as LogOut } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-CXQbrpj5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminLayout() {
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [staff, setStaff] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		getStaffSession().then((s) => {
			if (!s) {
				navigate({ to: "/login" });
				return;
			}
			setStaff(s);
			if (s.role === "agent" && (pathname === "/admin" || pathname === "/admin/")) navigate({ to: "/admin/agen" });
		}).finally(() => setReady(true));
	}, [navigate, pathname]);
	if (!ready || !staff) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-bg text-muted",
		children: "Memuat panel…"
	});
	const links = [];
	if (staff.role !== "agent") {
		links.push({
			to: "/admin",
			label: "Dashboard",
			icon: LayoutDashboard,
			exact: true
		});
		links.push({
			to: "/admin/konfirmasi",
			label: "Konfirmasi",
			icon: TicketCheck,
			exact: false
		});
	}
	if (staff.role === "admin") {
		links.push({
			to: "/admin/tiketing",
			label: "Tiketing",
			icon: Ticket,
			exact: false
		});
		links.push({
			to: "/admin/pengguna",
			label: "Pengguna",
			icon: Users,
			exact: false
		});
	}
	links.push({
		to: "/admin/agen",
		label: staff.role === "agent" ? "Transaksi" : "Agen",
		icon: Share2,
		exact: false
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg md:grid md:grid-cols-[220px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "border-b border-border md:border-b-0 md:border-r",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 px-4 py-4 md:block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/images/logo-gsf.png",
					alt: "Golden Satya Fair",
					className: "h-8 w-auto max-w-[160px] object-contain"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-subtle md:mt-2",
					children: [
						staff.name,
						" · ",
						staff.role
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:px-3 md:pb-4",
				children: [links.map((l) => {
					const active = l.exact ? pathname === l.to : pathname.startsWith(l.to);
					const Icon = l.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: l.to,
						className: cn("flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm", active ? "bg-elevated text-gold" : "text-muted hover:bg-elevated hover:text-fg"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), l.label]
					}, l.to);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex h-11 items-center gap-2 rounded-md px-3 text-sm text-muted hover:bg-elevated hover:text-fg",
					onClick: () => {
						staffLogout({}).then(() => navigate({ to: "/login" }));
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Keluar"]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-w-0 p-5 md:p-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		})]
	});
}
//#endregion
export { AdminLayout as component };
