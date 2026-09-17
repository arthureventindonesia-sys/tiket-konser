import "../_runtime.mjs";
import { a as require_jsx_runtime, n as CheckboxIndicator, o as require_react, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-C1p7zOu_.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { h as Check } from "../_libs/lucide-react.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Checkbox({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
		className: cn("grid size-5 shrink-0 place-items-center rounded-xs border border-border bg-elevated data-[state=checked]:border-gold data-[state=checked]:bg-gold data-[state=checked]:text-gold-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			className: "size-3.5",
			strokeWidth: 3
		}) })
	});
}
var fetchSaleOffer = createServerFn({ method: "GET" }).handler(createSsrRpc("0ad7977cb0c8da9f67601616cd82ba4e629e56129e9147544a59ea79fcf091ed"));
var fetchStages = createServerFn({ method: "GET" }).handler(createSsrRpc("724602e050c86bfb49eddff5257a24e8587ab5bf670677b7216758f5fc660248"));
var saveStage = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("080cfdb6e4cdacac578b042bf4c487f826b865b3775dff71e4d4a9ded52830b2"));
//#endregion
export { saveStage as i, fetchSaleOffer as n, fetchStages as r, Checkbox as t };
