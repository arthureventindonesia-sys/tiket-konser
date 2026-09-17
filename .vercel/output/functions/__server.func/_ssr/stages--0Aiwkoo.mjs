//#region node_modules/.nitro/vite/services/ssr/assets/stages--0Aiwkoo.js
var TICKET_STAGES = [
	{
		id: "early_bird",
		label: "Early Bird",
		allowed: ["vip", "festival"]
	},
	{
		id: "presale_1",
		label: "Presale 1",
		allowed: [
			"vvip",
			"vip",
			"festival"
		]
	},
	{
		id: "presale_2",
		label: "Presale 2",
		allowed: [
			"vvip",
			"vip",
			"festival"
		]
	},
	{
		id: "ots",
		label: "OTS",
		allowed: [
			"vvip",
			"vip",
			"festival"
		]
	}
];
function stageDef(id) {
	return TICKET_STAGES.find((s) => s.id === id);
}
function stageStatus(input) {
	if (!input.enabled) return "off";
	const now = input.now ?? /* @__PURE__ */ new Date();
	if (input.startsAt && now < new Date(input.startsAt)) return "scheduled";
	if (input.endsAt && now > new Date(input.endsAt)) return "ended";
	return "live";
}
function remainingOf(quota, sold) {
	return Math.max(0, quota - sold);
}
//#endregion
export { stageDef as n, stageStatus as r, remainingOf as t };
