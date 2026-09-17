import { t as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-C1p7zOu_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DrWwogNh.js
var fetchDashboard = createServerFn({ method: "GET" }).handler(createSsrRpc("d2876169384eb3015335ce86322ec4266ddce7ff17368ead69c9237b7f66e4cc"));
var fetchConfirmations = createServerFn({ method: "GET" }).handler(createSsrRpc("f65411d9026e06df9635d54e58604d383b0eb3d886d9e3a814b98b79d39a0753"));
var confirmPayment = createServerFn({ method: "POST" }).validator((orderId) => orderId).handler(createSsrRpc("737175f2d6b9e65be19e7a0e7cd49bb624d9edb22453ce8d9dbb546ebc668695"));
var fetchAgentSales = createServerFn({ method: "GET" }).handler(createSsrRpc("3769b84d26310e1ddde85dfcaaf7a034d2978e40342ef7189d414f7523ae5a20"));
//#endregion
export { fetchDashboard as i, fetchAgentSales as n, fetchConfirmations as r, confirmPayment as t };
