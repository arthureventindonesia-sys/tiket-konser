import { createFileRoute } from "@tanstack/react-router";
import { Copy, Download, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { agentQrDataUrl, agentQrPoster, copyText, downloadDataUrl } from "@/lib/agent-qr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StaffRole } from "@/lib/event";
import { createStaffUser, deleteStaffUser, listStaffUsers } from "@/lib/fn/staff";

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
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  async function onDelete(user: Staff) {
    if (user.username === "iang") {
      toast.error("Akun utama tidak dapat dihapus");
      return;
    }
    if (pendingDelete !== user.id) {
      setPendingDelete(user.id);
      return;
    }
    setDeleting(true);
    try {
      await deleteStaffUser({ data: { id: user.id } });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setPendingDelete(null);
      toast.success(`Akun ${user.name} dihapus`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setDeleting(false);
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
            <option value="tiketbox">Tiketbox</option>
          </select>
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Menyimpan…" : "Buat akun"}
        </Button>
        <p className="text-xs text-subtle">
          Admin: semua menu. Crew: dashboard & konfirmasi. Agent: data transaksi tautan referal yang
          sudah dikonfirmasi. Tiketbox: cek kode, cetak tiket, dan takeout.
        </p>
      </form>
      <div>
        <h2 className="font-display text-2xl">Daftar akun</h2>
        <ul className="mt-4 space-y-3">
          {users.map((u) => (
            <li key={u.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-subtle">{u.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={u.role === "admin" ? "gold" : "muted"}>{u.role}</Badge>
                  {u.username !== "iang" ? (
                    <Button
                      type="button"
                      variant={pendingDelete === u.id ? "danger" : "outline"}
                      size="sm"
                      disabled={deleting}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void onDelete(u);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      {pendingDelete === u.id ? (deleting ? "Menghapus…" : "Yakin hapus?") : "Hapus"}
                    </Button>
                  ) : null}
                </div>
              </div>
              {u.role === "agent" && u.referralCode ? (
                <AgentLink
                  name={u.name}
                  code={u.referralCode}
                  href={`${origin}/beli?ref=${u.referralCode}`}
                />
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AgentLink({ name, code, href }: { name: string; code: string; href: string }) {
  const [qr, setQr] = useState<string>("");
  const [busy, setBusy] = useState<"copy" | "dl" | null>(null);

  useEffect(() => {
    if (!href.startsWith("http")) return;
    agentQrDataUrl(href).then(setQr).catch(() => undefined);
  }, [href]);

  async function onCopy() {
    setBusy("copy");
    try {
      await copyText(href);
      toast.success("Tautan disalin");
    } catch {
      toast.error("Gagal menyalin");
    } finally {
      setBusy(null);
    }
  }

  async function onDownload() {
    setBusy("dl");
    try {
      const poster = await agentQrPoster(href, name);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || code.toLowerCase();
      downloadDataUrl(poster, `qr-agen-${slug}.png`);
      toast.success("QR diunduh");
    } catch {
      toast.error("Gagal mengunduh QR");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="mx-auto w-40 shrink-0 text-center sm:mx-0">
        <div className="overflow-hidden rounded-lg bg-bg p-2">
          {qr ? (
            <img src={qr} alt={`QR ${name}`} className="size-full" />
          ) : (
            <div className="grid aspect-square place-items-center text-xs text-subtle">QR…</div>
          )}
        </div>
        <p className="mt-2 text-sm font-medium text-gold">{name}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs text-gold">{code}</p>
        <p className="mt-1 break-all font-mono text-[11px] text-subtle">{href}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void onCopy()} disabled={busy !== null}>
            <Copy className="size-3.5" />
            {busy === "copy" ? "Menyalin…" : "Salin tautan"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void onDownload()} disabled={busy !== null}>
            <Download className="size-3.5" />
            {busy === "dl" ? "Menyiapkan…" : "Unduh QR"}
          </Button>
        </div>
      </div>
    </div>
  );
}
