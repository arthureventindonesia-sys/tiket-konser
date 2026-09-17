import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stages-C5FX-Z6i.js
var fetchSaleOffer_createServerFn_handler = createServerRpc({
	id: "0ad7977cb0c8da9f67601616cd82ba4e629e56129e9147544a59ea79fcf091ed",
	name: "fetchSaleOffer",
	filename: "src/lib/fn/stages.ts"
}, (opts) => fetchSaleOffer.__executeServer(opts));
var fetchSaleOffer = createServerFn({ method: "GET" }).handler(fetchSaleOffer_createServerFn_handler, async () => {
	const { getSaleOffer } = await import("./stages.server-CCWMd8HH.mjs");
	return getSaleOffer();
});
var fetchStages_createServerFn_handler = createServerRpc({
	id: "724602e050c86bfb49eddff5257a24e8587ab5bf670677b7216758f5fc660248",
	name: "fetchStages",
	filename: "src/lib/fn/stages.ts"
}, (opts) => fetchStages.__executeServer(opts));
var fetchStages = createServerFn({ method: "GET" }).handler(fetchStages_createServerFn_handler, async () => {
	const { requireStaff } = await import("./staff.server-DPabvfcS.mjs");
	const { listStages } = await import("./stages.server-CCWMd8HH.mjs");
	await requireStaff(["admin"]);
	return listStages();
});
var saveStage_createServerFn_handler = createServerRpc({
	id: "080cfdb6e4cdacac578b042bf4c487f826b865b3775dff71e4d4a9ded52830b2",
	name: "saveStage",
	filename: "src/lib/fn/stages.ts"
}, (opts) => saveStage.__executeServer(opts));
var saveStage = createServerFn({ method: "POST" }).validator((data) => data).handler(saveStage_createServerFn_handler, async ({ data }) => {
	const { requireStaff } = await import("./staff.server-DPabvfcS.mjs");
	const { updateStage } = await import("./stages.server-CCWMd8HH.mjs");
	await requireStaff(["admin"]);
	return updateStage(data);
});
//#endregion
export { fetchSaleOffer_createServerFn_handler, fetchStages_createServerFn_handler, saveStage_createServerFn_handler };
