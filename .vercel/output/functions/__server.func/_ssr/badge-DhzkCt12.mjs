import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-DhzkCt12.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "muted", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tone === "muted" && "bg-elevated text-muted", tone === "gold" && "bg-gold/15 text-gold", tone === "success" && "bg-success/20 text-success", tone === "danger" && "bg-danger/15 text-danger", className),
		...props
	});
}
//#endregion
export { Badge as t };
