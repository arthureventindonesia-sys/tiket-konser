import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStaffSession, staffLogin } from "@/lib/fn/staff";
import { staffHome } from "@/lib/event";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getStaffSession()
      .then((staff) => {
        if (staff) {
          void navigate({ to: staffHome(staff.role) });
        }
      })
      .finally(() => setChecking(false));
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const staff = await staffLogin({ data: { username, password } });
      await navigate({ to: staffHome(staff.role) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal masuk");
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg text-muted">Memuat…</div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg">
      <SiteHeader solid />
      <main className="grid min-h-[calc(100dvh-72px)] place-items-center px-5">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-surface p-6"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gold">Panitia</p>
            <h1 className="mt-1 font-display text-3xl">Masuk panel</h1>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Memeriksa…" : "Masuk"}
          </Button>
        </form>
      </main>
    </div>
  );
}
