import { ADMIN_CONTACTS } from "@/lib/event";
import { waMeUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AdminContacts({
  note,
  message = "saya butuh bantuan tiket Golden Satya Fair",
  className,
}: {
  note?: string;
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm", className)}>
      {note ? <p className="leading-relaxed text-fg">{note}</p> : (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Hubungi admin</p>
      )}
      <div className={cn("flex flex-wrap gap-x-5 gap-y-1", note ? "mt-2" : "mt-2")}>
        {ADMIN_CONTACTS.map((c) => (
          <a
            key={c.wa}
            href={waMeUrl(c.wa, `Halo ${c.name}, ${message}`)}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-gold underline decoration-gold underline-offset-4"
          >
            {c.wa} ({c.name})
          </a>
        ))}
      </div>
    </div>
  );
}
