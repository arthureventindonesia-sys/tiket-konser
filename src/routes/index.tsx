import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, MapPin } from "lucide-react";
import { BuyButton } from "@/components/buy-button";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { StageCountdown } from "@/components/stage-countdown";
import { EVENT, GUESTS, PARTNERS } from "@/lib/event";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="min-h-dvh bg-bg">
      <SiteHeader />
      <section className="relative isolate min-h-[88dvh] overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt="Sal Priadi di atas panggung"
          className="absolute inset-0 size-full object-cover object-[center_32%] outline outline-1 -outline-offset-1 outline-fg/10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg from-[12%] via-bg/35 via-[48%] to-black/20" />
        <div className="relative mx-auto flex min-h-[88dvh] max-w-5xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24">
          <p className="text-xs uppercase tracking-[0.28em] text-gold">Official Ticketing</p>
          <h1 className="mt-5 max-w-xl">
            <img
              src={EVENT.logo}
              alt={EVENT.name}
              className="h-auto w-full max-w-[420px] object-contain object-left md:max-w-[520px]"
            />
          </h1>
          <p className="mt-5 max-w-md text-base text-muted md:text-lg">{EVENT.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg">
            <span className="inline-flex items-center gap-2">
              <Calendar className="size-4 shrink-0 text-gold" />
              {EVENT.dateLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-gold" />
              {EVENT.timeLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-gold" />
              {EVENT.venue}, {EVENT.city}
            </span>
          </div>
          <StageCountdown />
          <div className="mt-10">
            <BuyButton />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20">
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Guest star</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">Satu malam, dua panggung suara</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {GUESTS.map((g) => (
              <article
                key={g.name}
                className="relative isolate min-h-[420px] overflow-hidden rounded-xl border border-border md:min-h-[520px]"
              >
                <img
                  src={g.photo}
                  alt=""
                  className="absolute inset-0 size-full object-cover object-[center_18%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-transparent" />
                <div className="relative z-10 flex min-h-[420px] items-end justify-center px-8 pb-8 md:min-h-[520px]">
                  <img
                    src={g.logo}
                    alt={g.name}
                    className="h-12 w-full max-w-[240px] object-contain drop-shadow md:h-14"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20">
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Layout konser</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">Posisi VVIP, VIP, dan Festival</h2>
          <a
            href={EVENT.layout}
            target="_blank"
            rel="noreferrer"
            className="mt-8 block overflow-hidden rounded-xl border border-border bg-bg"
          >
            <img
              src={EVENT.layout}
              alt="Layout konser Golden Satya Fair: Stage, VVIP, VIP, Festival, FOH, tenant, dan gate"
              className="w-full object-contain outline outline-1 -outline-offset-1 outline-fg/10"
            />
          </a>
          <p className="mt-3 text-sm text-subtle">Ketuk gambar untuk memperbesar.</p>
          <div className="mt-8">
            <BuyButton />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-bg">
        <div className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-16">
          <p className="text-center text-xs uppercase tracking-[0.24em] text-gold">Didukung oleh</p>
          <div className="mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-10 md:grid-cols-4 md:gap-x-10">
            {PARTNERS.map((p) => (
              <div key={p.name} className="grid h-24 place-items-center">
                <img
                  src={p.logo}
                  alt={p.name}
                  className="max-h-20 w-full max-w-[180px] object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter showPartners={false} />
    </div>
  );
}
