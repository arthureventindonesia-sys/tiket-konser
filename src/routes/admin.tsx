import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Ticket, TicketCheck, Users, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getStaffSession, staffLogout } from "@/lib/fn/staff";
import type { StaffRole } from "@/lib/event";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

type Staff = {
  id: string;
  username: string;
  name: string;
  role: StaffRole;
  referralCode: string | null;
};

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [staff, setStaff] = useState<Staff | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getStaffSession()
      .then((s) => {
        if (!s) {
          void navigate({ to: "/login" });
          return;
        }
        setStaff(s);
        if (s.role === "agent" && (pathname === "/admin" || pathname === "/admin/")) {
          void navigate({ to: "/admin/agen" });
        }
      })
      .finally(() => setReady(true));
  }, [navigate, pathname]);

  if (!ready || !staff) {
    return <div className="grid min-h-dvh place-items-center bg-bg text-muted">Memuat panel…</div>;
  }

  const links: {
    to: "/admin" | "/admin/konfirmasi" | "/admin/tiketing" | "/admin/pengguna" | "/admin/agen";
    label: string;
    icon: typeof LayoutDashboard;
    exact: boolean;
  }[] = [];
  if (staff.role !== "agent") {
    links.push({ to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true });
    links.push({ to: "/admin/konfirmasi", label: "Konfirmasi", icon: TicketCheck, exact: false });
  }
  if (staff.role === "admin") {
    links.push({ to: "/admin/tiketing", label: "Tiketing", icon: Ticket, exact: false });
    links.push({ to: "/admin/pengguna", label: "Pengguna", icon: Users, exact: false });
  }
  links.push({
    to: "/admin/agen",
    label: staff.role === "agent" ? "Transaksi" : "Agen",
    icon: Share2,
    exact: false,
  });

  return (
    <div className="min-h-dvh bg-bg md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-border md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-4 md:block">
          <img src="/images/logo-gsf.png" alt="Golden Satya Fair" className="h-8 w-auto max-w-[160px] object-contain" />
          <p className="text-xs text-subtle md:mt-2">
            {staff.name} · {staff.role}
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:px-3 md:pb-4">
          {links.map((l) => {
            const active = l.exact ? pathname === l.to : pathname.startsWith(l.to);
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm",
                  active ? "bg-elevated text-gold" : "text-muted hover:bg-elevated hover:text-fg",
                )}
              >
                <Icon className="size-4" />
                {l.label}
              </Link>
            );
          })}
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-md px-3 text-sm text-muted hover:bg-elevated hover:text-fg"
            onClick={() => {
              void staffLogout({}).then(() => navigate({ to: "/login" }));
            }}
          >
            <LogOut className="size-4" />
            Keluar
          </button>
        </nav>
      </aside>
      <div className="min-w-0 p-5 md:p-8">
        <Outlet />
      </div>
    </div>
  );
}
