import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-CyGXT9EX.js
var fetchDashboard_createServerFn_handler = createServerRpc({
	id: "d2876169384eb3015335ce86322ec4266ddce7ff17368ead69c9237b7f66e4cc",
	name: "fetchDashboard",
	filename: "src/lib/fn/admin.ts"
}, (opts) => fetchDashboard.__executeServer(opts));
var fetchDashboard = createServerFn({ method: "GET" }).handler(fetchDashboard_createServerFn_handler, async () => {
	const { requireStaff } = await import("./staff.server-DPabvfcS.mjs");
	const { getDashboard } = await import("./orders.server-CX8Qok4a.mjs");
	await requireStaff(["admin", "crew"]);
	return getDashboard();
});
var fetchConfirmations_createServerFn_handler = createServerRpc({
	id: "f65411d9026e06df9635d54e58604d383b0eb3d886d9e3a814b98b79d39a0753",
	name: "fetchConfirmations",
	filename: "src/lib/fn/admin.ts"
}, (opts) => fetchConfirmations.__executeServer(opts));
var fetchConfirmations = createServerFn({ method: "GET" }).handler(fetchConfirmations_createServerFn_handler, async () => {
	const { requireStaff } = await import("./staff.server-DPabvfcS.mjs");
	const { listAdminOrders, confirmationMessage } = await import("./orders.server-CX8Qok4a.mjs");
	await requireStaff(["admin", "crew"]);
	return (await listAdminOrders()).map((order) => ({
		...order,
		waText: order.status === "confirmed" ? confirmationMessage(order) : ""
	}));
});
var confirmPayment_createServerFn_handler = createServerRpc({
	id: "737175f2d6b9e65be19e7a0e7cd49bb624d9edb22453ce8d9dbb546ebc668695",
	name: "confirmPayment",
	filename: "src/lib/fn/admin.ts"
}, (opts) => confirmPayment.__executeServer(opts));
var confirmPayment = createServerFn({ method: "POST" }).validator((orderId) => orderId).handler(confirmPayment_createServerFn_handler, async ({ data }) => {
	const { requireStaff } = await import("./staff.server-DPabvfcS.mjs");
	const { confirmOrder, confirmationMessage } = await import("./orders.server-CX8Qok4a.mjs");
	const order = await confirmOrder(data, (await requireStaff(["admin", "crew"])).id);
	return {
		...order,
		waText: confirmationMessage(order)
	};
});
var fetchAgentSales_createServerFn_handler = createServerRpc({
	id: "3769b84d26310e1ddde85dfcaaf7a034d2978e40342ef7189d414f7523ae5a20",
	name: "fetchAgentSales",
	filename: "src/lib/fn/admin.ts"
}, (opts) => fetchAgentSales.__executeServer(opts));
var fetchAgentSales = createServerFn({ method: "GET" }).handler(fetchAgentSales_createServerFn_handler, async () => {
	const { requireStaff } = await import("./staff.server-DPabvfcS.mjs");
	const { listAgentOrders } = await import("./orders.server-CX8Qok4a.mjs");
	const staff = await requireStaff([
		"admin",
		"crew",
		"agent"
	]);
	if (staff.role === "agent") {
		if (!staff.referralCode) return [];
		return listAgentOrders(staff.referralCode);
	}
	const { listStaff } = await import("./staff.server-DPabvfcS.mjs");
	const agents = (await listStaff()).filter((s) => s.role === "agent" && s.referralCode);
	const all = [];
	for (const agent of agents) {
		const orders = await listAgentOrders(agent.referralCode);
		all.push(...orders.map((o) => ({
			...o,
			agentName: agent.name,
			agentUsername: agent.username
		})));
	}
	return all;
});
//#endregion
export { confirmPayment_createServerFn_handler, fetchAgentSales_createServerFn_handler, fetchConfirmations_createServerFn_handler, fetchDashboard_createServerFn_handler };
