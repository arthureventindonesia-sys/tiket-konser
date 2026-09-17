import { useEffect, useMemo, useState } from "react";
import type { SaleOffer } from "@/lib/stages";
import { useSaleOffer } from "@/lib/use-sale-offer";

type Mode =
  | { kind: "starts"; label: string; target: string }
  | { kind: "ends"; label: string; target: string }
  | { kind: "live"; label: string }
  | { kind: "closed"; message: string };

function modeFrom(offer: SaleOffer): Mode {
  const stage = offer.stage;
  if (offer.open && stage) {
    if (stage.endsAt) return { kind: "ends", label: stage.label, target: stage.endsAt };
    return { kind: "live", label: stage.label };
  }
  if (stage?.startsAt) {
    return { kind: "starts", label: stage.label, target: stage.startsAt };
  }
  return { kind: "closed", message: offer.message || "Penjualan tiket sedang ditutup." };
}

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function StageCountdown() {
  const { offer } = useSaleOffer();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  const mode = offer ? modeFrom(offer) : null;
  const target = mode?.kind === "starts" || mode?.kind === "ends" ? mode.target : null;
  const left = useMemo(
    () => (target ? split(new Date(target).getTime() - now) : null),
    [target, now],
  );

  if (!offer || !mode) return null;

  const caption =
    mode.kind === "starts"
      ? `${mode.label} dimulai dalam`
      : mode.kind === "ends"
        ? `${mode.label} berakhir dalam`
        : mode.kind === "live"
          ? `${mode.label} sedang berlangsung`
          : mode.message;

  return (
    <div className="mt-8 max-w-md rounded-xl border border-gold/35 bg-bg/60 px-5 py-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">{caption}</p>
      {left ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          <Unit value={pad(left.days)} label="hari" />
          <Unit value={pad(left.hours)} label="jam" />
          <Unit value={pad(left.minutes)} label="mnt" />
          <Unit value={pad(left.seconds)} label="dtk" />
        </div>
      ) : null}
    </div>
  );
}

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-bg/70 px-1 py-2 text-center">
      <p className="font-mono text-2xl tabular-nums text-fg md:text-3xl">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-subtle">{label}</p>
    </div>
  );
}
