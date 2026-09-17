export const EVENT = {
  name: "Golden Satya Fair",
  shortName: "GSF",
  tagline: "Sal Priadi · Bilal Indrajaya",
  dateLabel: "Senin, 9 November 2026",
  timeLabel: "19.00 WIB",
  venue: "Perumahan Golden Star Lumina",
  city: "Bumiayu",
  merchantName: "GOLDEN SATYA FAIR",
  nmid: "ID1026497312623",
  logo: "/images/logo-gsf.png",
  layout: "/images/layout-konser.jpg",
  qris: "/images/qris-statis.jpg",
} as const;

export const GUESTS = [
  { name: "Sal Priadi", logo: "/images/logo-sal.png", photo: "/images/guest-sal.jpg" },
  { name: "Bilal Indrajaya", logo: "/images/logo-bilal.png", photo: "/images/guest-bilal.jpg" },
] as const;

export const PARTNERS = [
  { name: "Banyu Anget Project", logo: "/images/logo-bap.png" },
  { name: "Karang Taruna Bergerak", logo: "/images/logo-karang-taruna.png" },
  { name: "Grand Satya", logo: "/images/logo-grand-satya.png" },
  { name: "Golden Star Lumina", logo: "/images/logo-golden-star-lumina.png" },
] as const;

export const TICKET_TYPES = [
  {
    id: "vvip",
    label: "VVIP",
    price: 1_500_000,
    image: "/images/vvip.jpg",
    perks: [
      "Area terdepan menghadap panggung",
      "Lounge eksklusif & welcome drink",
      "Pintu masuk khusus",
      "Merchandise pack",
    ],
  },
  {
    id: "vip",
    label: "VIP",
    price: 750_000,
    image: "/images/vip.jpg",
    perks: [
      "Tribune VIP dengan pandangan bebas",
      "Bar khusus pemegang VIP",
      "Jalur masuk prioritas",
    ],
  },
  {
    id: "festival",
    label: "FESTIVAL",
    price: 350_000,
    image: "/images/festival.jpg",
    perks: ["Area standing festival", "Akses penuh ke panggung utama"],
  },
] as const;

export type TicketTypeId = (typeof TICKET_TYPES)[number]["id"];

export const MAX_PER_TYPE = 4;
export const MAX_PROOF_BYTES = 1_000_000;

export const TICKET_PRICE: Record<TicketTypeId, number> = {
  vvip: 1_500_000,
  vip: 750_000,
  festival: 350_000,
};

export const TICKET_LABEL: Record<TicketTypeId, string> = {
  vvip: "VVIP",
  vip: "VIP",
  festival: "FESTIVAL",
};

export type OrderStatus = "awaiting_payment" | "awaiting_confirm" | "confirmed";
export type StaffRole = "admin" | "crew" | "agent" | "tiketbox";

export function staffHome(role: StaffRole): "/admin" | "/admin/agen" | "/admin/tiketbox" {
  if (role === "agent") return "/admin/agen";
  if (role === "tiketbox") return "/admin/tiketbox";
  return "/admin";
}

export function qtyKey(type: TicketTypeId): "qty_vvip" | "qty_vip" | "qty_festival" {
  if (type === "vvip") return "qty_vvip";
  if (type === "vip") return "qty_vip";
  return "qty_festival";
}
