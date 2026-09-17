import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StaffRole } from "@/lib/event";
import { createStaffUser, listStaffUsers } from "@/lib/fn/staff";

export const Route = createFileRoute("/admin/pengguna")({
  component: PenggunaPage,
});

type Staff = {
  id: string;
  username: string;
  name: string;
  role: StaffRole;
  referralCode: string | null;
};

function PenggunaPage() {
  const [users, setUsers] = useState<Staff[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>("crew");
  const [busy, setBusy] = useState(false);

  function load() {
    listStaffUsers()
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"));
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await createStaffUser({ data: { username, password, name, role } });
      toast.success("Akun dibuat");
      setUsername("");
      setPassword("");
      setName("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat akun");
    } finally {
      setBusy(false);
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <form onSubmit={onCreate} className="h-fit space-y-4 rounded-xl border border-border bg-surface p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Pengguna</p>
          <h1 className="mt-1 font-display text-3xl">Buat akun</h1>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="name">Nama</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="role">Level</Label>
          <select
            id="role"
            className="h-11 rounded-md border border-border bg-elevated px-3 text-sm text-fg"
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
          >
            <option value="admin">Admin</option>
            <option value="crew">Crew</option>
            <option value="agent">Agent</option>
          </select>
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Menyimpan…" : "Buat akun"}
        </Button>
        <p className="text-xs text-subtle">
          Admin: semua menu. Crew: dashboard & konfirmasi. Agent: data transaksi tautan referal yang sudah dikonfirmasi.
        </p>
      </form>
      <div>
        <h2 className="font-display text-2xl">Daftar akun</h2>
        <ul className="mt-4 space-y-3">
          {users.map((u) => (
            <li key={u.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-subtle">{u.username}</p>
                </div>
                <Badge tone={u.role === "admin" ? "gold" : "muted"}>{u.role}</Badge>
              </div>
              {u.referralCode ? (
                <p className="mt-2 break-all font-mono text-xs text-gold">
                  {u.referralCode}
                  <span className="mt-1 block text-subtle">
                    {origin}/beli?ref={u.referralCode}
                  </span>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
