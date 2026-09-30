import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { adminApprove, adminList, adminSignIn } from "@/lib/admin.functions";
import { formatNaira } from "@/lib/tools";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — Eminent Clicks" },
      { name: "description", content: "Review and approve Eminent Clicks payment submissions." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin console — Eminent Clicks" },
      { property: "og:description", content: "Internal approval queue for Eminent Clicks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const STORE_KEY = "ec_admin_email";

function AdminPage() {
  const navigate = useNavigate();
  const signIn = useServerFn(adminSignIn);
  const list = useServerFn(adminList);
  const approve = useServerFn(adminApprove);

  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"pending" | "approved" | "all">("pending");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORE_KEY);
    if (saved) setAdminEmail(saved);
  }, []);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["admin", adminEmail, search, status],
    enabled: !!adminEmail,
    queryFn: () => list({ data: { email: adminEmail!, search, status } }),
  });

  async function handleSignIn() {
    setBusy(true);
    try {
      const res = await signIn({ data: { email: emailInput } });
      window.localStorage.setItem(STORE_KEY, res.email);
      setAdminEmail(res.email);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Access denied");
    } finally {
      setBusy(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await approve({ data: { email: adminEmail!, id } });
      toast.success("Tool activated for that user");
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not approve");
    }
  }

  if (!adminEmail) {
    return (
      <div className="min-h-screen bg-ink px-4 py-12">
        <div className="diagonal mx-auto max-w-sm rounded-3xl p-4 ring-1 ring-border">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-primary">
            Admin entrance
          </p>
          <h1 className="mt-1 font-display text-xl font-semibold tracking-tight">
            Enter your admin email
          </h1>
          <input
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            inputMode="email"
            placeholder="admin@eminentclicks.ng"
            className="mt-4 w-full rounded-xl bg-ink-2 px-3 py-3 text-[14px] ring-1 ring-border outline-none placeholder:text-mute focus:ring-primary/50"
          />
          <button
            onClick={() => void handleSignIn()}
            disabled={busy}
            className="mt-3 w-full rounded-xl bg-primary py-3.5 font-display text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Checking…" : "Enter console"}
          </button>
          <button
            onClick={() => void navigate({ to: "/" })}
            className="mt-3 w-full font-mono text-[11px] text-cool"
          >
            Back to app
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats ?? { total: 0, pending: 0, approved: 0 };
  const rows = data?.submissions ?? [];

  return (
    <div className="min-h-screen bg-ink font-body text-foreground antialiased">
      <header className="diagonal flex items-center justify-between px-4 pt-4 pb-3 ring-1 ring-border">
        <div className="leading-none">
          <p className="font-display text-[15px] font-semibold tracking-tight">Admin Console</p>
          <p className="mt-1 font-mono text-[10px] text-mute">{adminEmail}</p>
        </div>
        <button
          onClick={() => {
            window.localStorage.removeItem(STORE_KEY);
            setAdminEmail(null);
          }}
          className="rounded-lg px-3 py-2 font-mono text-[11px] text-cool ring-1 ring-border"
        >
          Exit
        </button>
      </header>

      <div className="space-y-4 px-4 py-4">
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Approval Queue</h2>
            <span className="font-mono text-[10px] text-mute">
              {isFetching ? "refreshing…" : "live"}
            </span>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="glass rounded-2xl p-3 ring-1 ring-border">
              <p className="font-mono text-[9px] tracking-wider uppercase text-mute">Total</p>
              <p className="mt-1.5 font-display text-2xl leading-none font-semibold">{stats.total}</p>
            </div>
            <div className="glass rounded-2xl p-3 ring-1 ring-clay/30">
              <p className="font-mono text-[9px] tracking-wider uppercase text-clay">Pending</p>
              <p className="mt-1.5 font-display text-2xl leading-none font-semibold text-clay">
                {stats.pending}
              </p>
            </div>
            <div className="glass rounded-2xl p-3 ring-1 ring-primary/30">
              <p className="font-mono text-[9px] tracking-wider uppercase text-primary">Approved</p>
              <p className="mt-1.5 font-display text-2xl leading-none font-semibold text-primary">
                {stats.approved}
              </p>
            </div>
          </div>

          <div className="mb-3 flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email, code, WhatsApp…"
              className="min-w-0 flex-1 rounded-xl bg-ink-2 px-3 py-2.5 text-[13px] ring-1 ring-border outline-none placeholder:text-mute focus:ring-primary/50"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="shrink-0 rounded-xl bg-ink-2 px-3 py-2.5 font-mono text-[12px] text-cool ring-1 ring-border outline-none"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="space-y-2">
            {rows.length === 0 && (
              <p className="py-8 text-center font-mono text-[11px] text-mute">Nothing here yet.</p>
            )}
            {rows.map((row) => (
              <div
                key={row.id}
                className={
                  row.status === "approved"
                    ? "glasscool rounded-2xl p-3 ring-1 ring-primary/40"
                    : "glass rounded-2xl p-3 ring-1 ring-border"
                }
              >
                <div className="flex items-center gap-3">
                  {row.receipt_url ? (
                    <a href={row.receipt_url} target="_blank" rel="noreferrer" className="shrink-0">
                      <img
                        src={row.receipt_url}
                        alt="Receipt"
                        className="size-12 rounded-[10px] object-cover ring-1 ring-border"
                      />
                    </a>
                  ) : (
                    <div className="grid size-12 shrink-0 place-items-center rounded-[10px] bg-steel-2 ring-1 ring-border">
                      <span className="text-[8px] tracking-[0.15em] uppercase text-mute">Img</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-foreground">{row.email}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-mute">
                      {row.whatsapp} · {row.tool_name} · {formatNaira(row.amount)}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-mute">{row.tracking_code}</p>
                  </div>
                  {row.status === "approved" ? (
                    <span className="stamp shrink-0 rounded bg-primary/15 px-2 py-1 font-mono text-[10px] font-semibold tracking-wider uppercase text-primary ring-1 ring-primary/40">
                      Approved
                    </span>
                  ) : (
                    <button
                      onClick={() => void handleApprove(row.id)}
                      className="shrink-0 rounded-lg bg-primary py-2 pr-3 pl-2 font-display text-sm font-semibold text-primary-foreground ring-1 ring-primary"
                    >
                      ✓ Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
