import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-Cz5X6sTc.js
var placeOrder_createServerFn_handler = createServerRpc({
	id: "c025dfa0e15d0c73fd40d5cfb8ed26c6c8530be10f98839a2dc2b206bf49c83e",
	name: "placeOrder",
	filename: "src/lib/fn/orders.ts"
}, (opts) => placeOrder.__executeServer(opts));
var placeOrder = createServerFn({ method: "POST" }).validator((data) => data).handler(placeOrder_createServerFn_handler, async ({ data }) => {
	const { createOrder } = await import("./orders.server-CX8Qok4a.mjs");
	return createOrder(data);
});
var fetchOrder_createServerFn_handler = createServerRpc({
	id: "2f976cfc1f5f613c8402ab8665028a3d40da63f5b031fe01e6c42281a2d9755b",
	name: "fetchOrder",
	filename: "src/lib/fn/orders.ts"
}, (opts) => fetchOrder.__executeServer(opts));
var fetchOrder = createServerFn({ method: "GET" }).validator((publicId) => publicId).handler(fetchOrder_createServerFn_handler, async ({ data }) => {
	const { getPublicOrder } = await import("./orders.server-CX8Qok4a.mjs");
	return getPublicOrder(data);
});
var uploadProof_createServerFn_handler = createServerRpc({
	id: "6c5a5c9f289f3894cc2c5946381d6b37c927a2373f7d566d28ba6cc25291e349",
	name: "uploadProof",
	filename: "src/lib/fn/orders.ts"
}, (opts) => uploadProof.__executeServer(opts));
var uploadProof = createServerFn({ method: "POST" }).validator((data) => data).handler(uploadProof_createServerFn_handler, async ({ data }) => {
	const { saveProof } = await import("./orders.server-CX8Qok4a.mjs");
	return saveProof(data);
});
//#endregion
export { fetchOrder_createServerFn_handler, placeOrder_createServerFn_handler, uploadProof_createServerFn_handler };
