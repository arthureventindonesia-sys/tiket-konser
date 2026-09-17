import { createServerFn } from "@tanstack/react-start";

export const placeOrder = createServerFn({ method: "POST" })
  .validator((data: {
    email: string;
    fullName: string;
    address: string;
    whatsapp: string;
    referralCode?: string;
    qtyVvip: number;
    qtyVip: number;
    qtyFestival: number;
  }) => data)
  .handler(async ({ data }) => {
    const { createOrder } = await import("@/lib/orders.server");
    return createOrder(data);
  });

export const fetchOrder = createServerFn({ method: "GET" })
  .validator((publicId: string) => publicId)
  .handler(async ({ data }) => {
    const { getPublicOrder } = await import("@/lib/orders.server");
    return getPublicOrder(data);
  });

export const uploadProof = createServerFn({ method: "POST" })
  .validator((data: { publicId: string; dataUrl: string; mime: string; name: string }) => data)
  .handler(async ({ data }) => {
    const { saveProof } = await import("@/lib/orders.server");
    return saveProof(data);
  });
