import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/staff-C7WGyQGf.js
var getStaffSession_createServerFn_handler = createServerRpc({
	id: "bae26a0c6a6d00de36bb87105dadcc7392e738b1ba3dba2d945be4b7e8af99a1",
	name: "getStaffSession",
	filename: "src/lib/fn/staff.ts"
}, (opts) => getStaffSession.__executeServer(opts));
var getStaffSession = createServerFn({ method: "GET" }).handler(getStaffSession_createServerFn_handler, async () => {
	const { getCurrentStaff } = await import("./staff.server-DPabvfcS.mjs");
	return getCurrentStaff();
});
var staffLogin_createServerFn_handler = createServerRpc({
	id: "6f2d8210668e05962fb3e19f9aaed5286b63941855caaef93e7331a10a7dff9d",
	name: "staffLogin",
	filename: "src/lib/fn/staff.ts"
}, (opts) => staffLogin.__executeServer(opts));
var staffLogin = createServerFn({ method: "POST" }).validator((data) => data).handler(staffLogin_createServerFn_handler, async ({ data }) => {
	const { loginStaff } = await import("./staff.server-DPabvfcS.mjs");
	return loginStaff(data.username, data.password);
});
var staffLogout_createServerFn_handler = createServerRpc({
	id: "4ba9c95bc56dcca9f5b9c3b167b187eb4198e0d98253b353fc1e943f23a27181",
	name: "staffLogout",
	filename: "src/lib/fn/staff.ts"
}, (opts) => staffLogout.__executeServer(opts));
var staffLogout = createServerFn({ method: "POST" }).handler(staffLogout_createServerFn_handler, async () => {
	const { logoutStaff } = await import("./staff.server-DPabvfcS.mjs");
	await logoutStaff();
	return { ok: true };
});
var listStaffUsers_createServerFn_handler = createServerRpc({
	id: "01a2380cdf24f44bce4e342b8d9676ca1bba074648451e252b5f3bb86c900c0e",
	name: "listStaffUsers",
	filename: "src/lib/fn/staff.ts"
}, (opts) => listStaffUsers.__executeServer(opts));
var listStaffUsers = createServerFn({ method: "GET" }).handler(listStaffUsers_createServerFn_handler, async () => {
	const { requireStaff, listStaff } = await import("./staff.server-DPabvfcS.mjs");
	await requireStaff(["admin"]);
	return listStaff();
});
var createStaffUser_createServerFn_handler = createServerRpc({
	id: "21b39f6b129019e04b0a4493e8f7bc20cb4e05bcb826e9923e4c5324eea53b0f",
	name: "createStaffUser",
	filename: "src/lib/fn/staff.ts"
}, (opts) => createStaffUser.__executeServer(opts));
var createStaffUser = createServerFn({ method: "POST" }).validator((data) => data).handler(createStaffUser_createServerFn_handler, async ({ data }) => {
	const { requireStaff, createStaffAccount } = await import("./staff.server-DPabvfcS.mjs");
	await requireStaff(["admin"]);
	return createStaffAccount(data);
});
//#endregion
export { createStaffUser_createServerFn_handler, getStaffSession_createServerFn_handler, listStaffUsers_createServerFn_handler, staffLogin_createServerFn_handler, staffLogout_createServerFn_handler };
