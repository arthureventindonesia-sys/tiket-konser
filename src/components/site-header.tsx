import { Link } from "@tanstack/react-router";
import { BuyButton } from "@/components/buy-button";
import { EVENT, PARTNERS } from "@/lib/event";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={EVENT.logo}
        alt={EVENT.name}
        className={cn("h-10 w-auto max-w-[200px] object-contain object-left md:h-12 md:max-w-[260px]", imgClassName)}
      />
    </span>
  );
}

function PartnerStrip({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5 md:gap-3.5", className)}>
      {PARTNERS.map((p) => (
        <img
          key={p.name}
          src={p.logo}
          alt={p.name}
          className={cn("h-5 w-auto max-w-[70px] object-contain opacity-90 md:h-6 md:max-w-[86px]", imgClassName)}
        />
      ))}
    </div>
  );
}

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 px-5 py-3 md:px-8 md:py-4",
        solid
          ? "border-b border-border bg-bg"
          : "bg-gradient-to-b from-bg/90 to-transparent",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 md:gap-5">
          <Link to="/" className="shrink-0" aria-label={EVENT.name}>
            <BrandLogo />
          </Link>
          <span className="hidden h-7 w-px bg-gold/35 sm:block" aria-hidden />
          <PartnerStrip className="hidden sm:flex" />
        </div>
        <nav className="flex shrink-0 items-center gap-2">
          <BuyButton showArrow={false} className="h-11 px-5" />
        </nav>
      </div>
      <PartnerStrip className="mt-2.5 justify-center sm:hidden" imgClassName="h-5 max-w-[64px]" />
    </header>
  );
}

export function SiteFooter({ showPartners = true }: { showPartners?: boolean }) {
  return (
    <footer className="border-t border-border px-5 py-10 text-center text-sm text-subtle md:px-8">
      <BrandLogo className="justify-center" imgClassName="mx-auto h-14 max-w-[280px] md:h-16" />
      <p className="mt-4">
        {EVENT.dateLabel} · {EVENT.timeLabel}
      </p>
      <p className="mt-1">
        {EVENT.venue}, {EVENT.city}
      </p>
      {showPartners ? (
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-5 opacity-90">
          {PARTNERS.map((p) => (
            <img
              key={p.name}
              src={p.logo}
              alt={p.name}
              className="h-9 w-auto max-w-[120px] object-contain md:h-10 md:max-w-[140px]"
            />
          ))}
        </div>
      ) : null}
      <p className="mt-8">
        <Link to="/login" className="text-subtle underline-offset-4 hover:text-muted hover:underline">
          Panel panitia
        </Link>
      </p>
      <p className="mt-6 text-xs tracking-wide text-subtle/80">Powered By: Arthur</p>
    </footer>
  );
}
