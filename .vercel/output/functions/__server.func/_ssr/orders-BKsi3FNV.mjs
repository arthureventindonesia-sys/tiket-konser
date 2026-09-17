import { t as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-C1p7zOu_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-BKsi3FNV.js
var placeOrder = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("c025dfa0e15d0c73fd40d5cfb8ed26c6c8530be10f98839a2dc2b206bf49c83e"));
var fetchOrder = createServerFn({ method: "GET" }).validator((publicId) => publicId).handler(createSsrRpc("2f976cfc1f5f613c8402ab8665028a3d40da63f5b031fe01e6c42281a2d9755b"));
var uploadProof = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("6c5a5c9f289f3894cc2c5946381d6b37c927a2373f7d566d28ba6cc25291e349"));
//#endregion
export { placeOrder as n, uploadProof as r, fetchOrder as t };
