import { useEffect, useRef, useState } from "react";
import { fetchSaleOffer } from "@/lib/fn/stages";
import type { SaleOffer } from "@/lib/stages";

const closed: SaleOffer = {
  open: false,
  message: "Penjualan tiket sedang ditutup.",
  stage: null,
  remaining: { vvip: 0, vip: 0, festival: 0 },
  price: { vvip: 0, vip: 0, festival: 0 },
  allowed: [],
};

let cached: SaleOffer | null = null;
const listeners = new Set<(offer: SaleOffer) => void>();

function broadcast(offer: SaleOffer) {
  cached = offer;
  for (const fn of listeners) fn(offer);
}

function load() {
  return fetchSaleOffer()
    .then(broadcast)
    .catch(() => broadcast(closed));
}

export function useSaleOffer() {
  const [offer, setOffer] = useState<SaleOffer | null>(cached);
  const armed = useRef("");

  useEffect(() => {
    listeners.add(setOffer);
    if (cached) setOffer(cached);
    else void load();
    const poll = window.setInterval(() => void load(), 30_000);
    return () => {
      listeners.delete(setOffer);
      window.clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (!offer) return;
    const targets: string[] = [];
    if (!offer.open && offer.stage?.startsAt) targets.push(offer.stage.startsAt);
    if (offer.open && offer.stage?.endsAt) targets.push(offer.stage.endsAt);
    if (targets.length === 0) return;
    const wait = Math.min(...targets.map((t) => new Date(t).getTime() - Date.now() + 400));
    const key = targets.join("|");
    if (wait <= 0) {
      if (armed.current === key) return;
      armed.current = key;
      void load();
      return;
    }
    const timer = window.setTimeout(() => void load(), wait);
    return () => window.clearTimeout(timer);
  }, [offer]);

  return {
    offer,
    open: Boolean(offer?.open),
    loading: offer === null,
  };
}
