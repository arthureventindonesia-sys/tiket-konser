import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { r as listStaffUsers, t as createStaffUser } from "./staff-C8N3dgC5.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Button } from "./button-BlpB8QLq.mjs";
import { n as Label, t as Input } from "./label-DKZ_Vf1M.mjs";
import { t as Badge } from "./badge-DhzkCt12.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pengguna-DVp1u2iO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PenggunaPage() {
	const [users, setUsers] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("crew");
	const [busy, setBusy] = (0, import_react.useState)(false);
	function load() {
		listStaffUsers().then(setUsers).catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function onCreate(e) {
		e.preventDefault();
		setBusy(true);
		try {
			await createStaffUser({ data: {
				username,
				password,
				name,
				role
			} });
			toast.success("Akun dibuat");
			setUsername("");
			setPassword("");
			setName("");
			load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Gagal membuat akun");
		} finally {
			setBusy(false);
		}
	}
	const origin = typeof window !== "undefined" ? window.location.origin : "";
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-danger",
		children: error
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-8 lg:grid-cols-[1fr_1.1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: onCreate,
			className: "h-fit space-y-4 rounded-xl border border-border bg-surface p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.24em] text-gold",
					children: "Pengguna"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl",
					children: "Buat akun"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "name",
						children: "Nama"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "name",
						value: name,
						onChange: (e) => setName(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "username",
						children: "Username"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "username",
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
						value: password,
						onChange: (e) => setPassword(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "role",
						children: "Level"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "role",
						className: "h-11 rounded-md border border-border bg-elevated px-3 text-sm text-fg",
						value: role,
						onChange: (e) => setRole(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "admin",
								children: "Admin"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "crew",
								children: "Crew"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "agent",
								children: "Agent"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					disabled: busy,
					children: busy ? "Menyimpan…" : "Buat akun"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-subtle",
					children: "Admin: semua menu. Crew: dashboard & konfirmasi. Agent: data transaksi tautan referal yang sudah dikonfirmasi."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl",
			children: "Daftar akun"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-3",
			children: users.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-lg border border-border bg-surface p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: u.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-subtle",
						children: u.username
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: u.role === "admin" ? "gold" : "muted",
						children: u.role
					})]
				}), u.referralCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 break-all font-mono text-xs text-gold",
					children: [u.referralCode, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-1 block text-subtle",
						children: [
							origin,
							"/beli?ref=",
							u.referralCode
						]
					})]
				}) : null]
			}, u.id))
		})] })]
	});
}
//#endregion
export { PenggunaPage as component };
