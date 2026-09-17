import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useSaleOffer } from "@/lib/use-sale-offer";
import { cn } from "@/lib/utils";

export function BuyButton({
  className,
  showArrow = true,
}: {
  className?: string;
  showArrow?: boolean;
}) {
  const { open, loading } = useSaleOffer();
  const enabled = open && !loading;
  const cls = cn(
    "inline-flex h-12 items-center justify-center gap-2 rounded-md bg-gold px-7 text-sm font-semibold text-gold-fg",
    !enabled && "cursor-not-allowed opacity-40",
    className,
  );

  if (!enabled) {
    return (
      <span className={cls} aria-disabled="true" title="Penjualan belum dimulai">
        Beli
        {showArrow ? <ArrowRight className="size-4" /> : null}
      </span>
    );
  }

  return (
    <Link to="/beli" className={cls}>
      Beli
      {showArrow ? <ArrowRight className="size-4" /> : null}
    </Link>
  );
}
