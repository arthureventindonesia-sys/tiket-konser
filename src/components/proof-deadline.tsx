import { AUTO_CANCEL_MINUTES, proofExpiresAt } from "@/lib/event";
import { useEffect, useRef, useState } from "react";

export function ProofDeadlineBanner({
  createdAt,
  onExpired,
  compact = false,
  onLight = false,
  dense = false,
}: {
  createdAt: string;
  onExpired?: () => void;
  compact?: boolean;
  onLight?: boolean;
  dense?: boolean;
}) {
  const [left, setLeft] = useState(() => proofExpiresAt(createdAt) - Date.now());
  const fired = useRef(false);

  useEffect(() => {
    fired.current = false;
    const tick = () => {
      const ms = proofExpiresAt(createdAt) - Date.now();
      setLeft(ms);
      if (ms <= 0 && !fired.current) {
        fired.current = true;
        onExpired?.();
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [createdAt, onExpired]);

  const expired = left <= 0;
  const total = Math.max(0, Math.ceil(left / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");

  const box = dense
    ? "rounded-md border-2 border-danger bg-danger px-2 py-2 text-center text-fg"
    : onLight
      ? "rounded-lg border-2 border-danger bg-danger px-3 py-3 text-center text-fg"
      : compact
        ? "rounded-lg border-2 border-danger bg-danger/20 px-3 py-3 text-center"
        : "rounded-xl border-2 border-danger bg-danger/15 px-4 py-4 text-center";

  return (
    <div className={box}>
      <p className={`font-bold uppercase tracking-[0.14em] ${dense ? "text-[10px]" : "text-[11px]"} ${onLight || dense ? "text-fg" : "text-danger"}`}>
        Batas waktu unggah
      </p>
      <p className={`mt-0.5 font-mono font-bold tabular-nums ${dense ? "text-xl" : compact || onLight ? "text-2xl" : "text-3xl"}`}>
        {expired ? "00:00" : `${mm}:${ss}`}
      </p>
      <p className={`mt-1 font-semibold leading-snug ${dense ? "text-[11px]" : compact || onLight ? "text-sm" : "text-base"}`}>
        {expired
          ? "Tiket otomatis dibatalkan karena belum transaksi dan upload bukti transfer."
          : `Tiket otomatis dibatalkan dalam ${AUTO_CANCEL_MINUTES} menit jika belum melakukan transaksi dan upload bukti transfer.`}
      </p>
    </div>
  );
}
