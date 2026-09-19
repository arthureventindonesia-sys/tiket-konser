import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { pingVisit } from "@/lib/fn/visits";

export function VisitBeacon() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/login")) return;
    const key = `gsf-visit:${pathname}`;
    const last = sessionStorage.getItem(key);
    if (last && Date.now() - Number(last) < 30_000) return;
    sessionStorage.setItem(key, String(Date.now()));
    void pingVisit({ data: { path: pathname } }).catch(() => undefined);
  }, [pathname]);

  return null;
}
