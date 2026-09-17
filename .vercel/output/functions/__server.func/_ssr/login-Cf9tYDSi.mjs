import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as staffLogin, n as getStaffSession } from "./staff-C8N3dgC5.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Button } from "./button-BlpB8QLq.mjs";
import { n as SiteHeader } from "./site-header-CdYtn6jd.mjs";
import { n as Label, t as Input } from "./label-DKZ_Vf1M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Cf9tYDSi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const navigate = useNavigate();
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [checking, setChecking] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		getStaffSession().then((staff) => {
			if (staff) {
				const to = staff.role === "agent" ? "/admin/agen" : "/admin";
				navigate({ to });
			}
		}).finally(() => setChecking(false));
	}, [navigate]);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			const to = (await staffLogin({ data: {
				username,
				password
			} })).role === "agent" ? "/admin/agen" : "/admin";
			await navigate({ to });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Gagal masuk");
		} finally {
			setBusy(false);
		}
	}
	if (checking) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-bg text-muted",
		children: "Memuat…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { solid: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "grid min-h-[calc(100dvh-72px)] place-items-center px-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "w-full max-w-sm space-y-4 rounded-xl border border-border bg-surface p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.24em] text-gold",
						children: "Panitia"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl",
						children: "Masuk panel"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "username",
							children: "Username"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "username",
							autoComplete: "username",
							value: username,
							onChange: (e) => setUsername(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "password",
							children: "Password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "password",
							type: "password",
							autoComplete: "current-password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: busy,
						children: busy ? "Memeriksa…" : "Masuk"
					})
				]
			})
		})]
	});
}
//#endregion
export { LoginPage as component };
