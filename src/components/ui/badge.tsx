import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "muted",
  ...props
}: React.ComponentProps<"span"> & { tone?: "muted" | "gold" | "success" | "danger" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "muted" && "bg-elevated text-muted",
        tone === "gold" && "bg-gold/15 text-gold",
        tone === "success" && "bg-success/20 text-success",
        tone === "danger" && "bg-danger/15 text-danger",
        className,
      )}
      {...props}
    />
  );
}
