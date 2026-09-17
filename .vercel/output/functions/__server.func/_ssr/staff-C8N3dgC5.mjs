import { t as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-C1p7zOu_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/staff-C8N3dgC5.js
var getStaffSession = createServerFn({ method: "GET" }).handler(createSsrRpc("bae26a0c6a6d00de36bb87105dadcc7392e738b1ba3dba2d945be4b7e8af99a1"));
var staffLogin = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("6f2d8210668e05962fb3e19f9aaed5286b63941855caaef93e7331a10a7dff9d"));
var staffLogout = createServerFn({ method: "POST" }).handler(createSsrRpc("4ba9c95bc56dcca9f5b9c3b167b187eb4198e0d98253b353fc1e943f23a27181"));
var listStaffUsers = createServerFn({ method: "GET" }).handler(createSsrRpc("01a2380cdf24f44bce4e342b8d9676ca1bba074648451e252b5f3bb86c900c0e"));
var createStaffUser = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("21b39f6b129019e04b0a4493e8f7bc20cb4e05bcb826e9923e4c5324eea53b0f"));
//#endregion
export { staffLogout as a, staffLogin as i, getStaffSession as n, listStaffUsers as r, createStaffUser as t };
